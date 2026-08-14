"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProfile(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Profile name is required" };

  try {
    const existing = await prisma.profile.findFirst({
      where: { userId: session.user.id, name, deletedAt: null },
    });
    if (existing) return { error: "A profile with that name already exists" };

    const profile = await prisma.profile.create({
      data: { userId: session.user.id, name },
    });

    revalidatePath("/dashboard/profiles");
    return { success: true, profileId: profile.id };
  } catch (error) {
    console.error("Failed to create profile:", error);
    return { error: "Failed to create profile" };
  }
}

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const idStr = formData.get("id") as string;
  const id = parseInt(idStr, 10);
  const name = (formData.get("name") as string)?.trim();

  if (isNaN(id) || !name) return { error: "Missing required fields" };

  try {
    const profile = await prisma.profile.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    });
    if (!profile) return { error: "Profile not found or unauthorized" };

    const conflict = await prisma.profile.findFirst({
      where: { userId: session.user.id, name, deletedAt: null, NOT: { id } },
    });
    if (conflict) return { error: "A profile with that name already exists" };

    await prisma.profile.update({ where: { id }, data: { name } });

    revalidatePath("/dashboard/profiles");
    revalidatePath(`/dashboard/profiles/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { error: "Failed to update profile" };
  }
}

export async function deleteProfile(id: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const profile = await prisma.profile.findFirst({
      where: { id, userId: session.user.id, deletedAt: null },
    });
    if (!profile) return { error: "Profile not found or unauthorized" };

    // Soft-delete — ProfileBookmark rows remain but profile is hidden.
    // Bookmarks themselves stay in the user's library.
    await prisma.profile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/dashboard/profiles");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete profile:", error);
    return { error: "Failed to delete profile" };
  }
}

export async function addBookmarkToProfile(profileId: number, bookmarkId: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Verify both profile and bookmark belong to user
    const [profile, bookmark] = await Promise.all([
      prisma.profile.findFirst({
        where: { id: profileId, userId: session.user.id, deletedAt: null },
      }),
      prisma.bookmark.findFirst({
        where: { id: bookmarkId, userId: session.user.id },
      }),
    ]);

    if (!profile) return { error: "Profile not found or unauthorized" };
    if (!bookmark) return { error: "Bookmark not found or unauthorized" };

    await prisma.profileBookmark.upsert({
      where: { profileId_bookmarkId: { profileId, bookmarkId } },
      create: { profileId, bookmarkId },
      update: {}, // already exists — no-op
    });

    revalidatePath(`/dashboard/profiles/${profileId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to add bookmark to profile:", error);
    return { error: "Failed to add bookmark to profile" };
  }
}

export async function removeBookmarkFromProfile(profileId: number, bookmarkId: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const profile = await prisma.profile.findFirst({
      where: { id: profileId, userId: session.user.id },
    });
    if (!profile) return { error: "Profile not found or unauthorized" };

    await prisma.profileBookmark.delete({
      where: { profileId_bookmarkId: { profileId, bookmarkId } },
    });

    revalidatePath(`/dashboard/profiles/${profileId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to remove bookmark from profile:", error);
    return { error: "Failed to remove bookmark from profile" };
  }
}
