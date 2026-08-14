"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Utility to get the user's default profile (first active profile)
async function getDefaultProfile(userId: string) {
  const profile = await prisma.profile.findFirst({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });
  if (!profile) throw new Error("No active profile found");
  return profile;
}

// Utility to fetch favicon
function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (e) {
    return null;
  }
}

export async function createBookmark(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const url = formData.get("url") as string;
  let title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!url) return { error: "URL is required" };

  try {
    // Basic URL validation
    new URL(url);
  } catch (e) {
    return { error: "Invalid URL format" };
  }

  try {
    const profile = await getDefaultProfile(session.user.id);
    const faviconUrl = getFaviconUrl(url);

    // If no title provided, extract domain as a fallback
    if (!title) {
      title = new URL(url).hostname;
    }

    await prisma.bookmark.create({
      data: {
        profileId: profile.id,
        url,
        title,
        description: description || null,
        faviconUrl,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to create bookmark:", error);
    return { error: "Failed to create bookmark" };
  }
}

export async function updateBookmark(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const idString = formData.get("id") as string;
  const id = parseInt(idString, 10);
  const url = formData.get("url") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (isNaN(id) || !url || !title) return { error: "Missing required fields" };

  try {
    // Basic URL validation
    new URL(url);
  } catch (e) {
    return { error: "Invalid URL format" };
  }

  try {
    // Ensure bookmark belongs to a profile owned by the user
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        profile: { userId: session.user.id },
      },
    });

    if (!bookmark) return { error: "Bookmark not found or unauthorized" };

    const faviconUrl = url !== bookmark.url ? getFaviconUrl(url) : bookmark.faviconUrl;

    await prisma.bookmark.update({
      where: { id },
      data: {
        url,
        title,
        description: description || null,
        faviconUrl,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update bookmark:", error);
    return { error: "Failed to update bookmark" };
  }
}

export async function deleteBookmark(id: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        profile: { userId: session.user.id },
      },
    });

    if (!bookmark) return { error: "Bookmark not found or unauthorized" };

    // Soft delete
    await prisma.bookmark.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete bookmark:", error);
    return { error: "Failed to delete bookmark" };
  }
}
