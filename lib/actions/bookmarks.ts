"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    new URL(url);
  } catch (e) {
    return { error: "Invalid URL format" };
  }

  try {
    const faviconUrl = getFaviconUrl(url);

    if (!title) {
      title = new URL(url).hostname;
    }

    await prisma.bookmark.create({
      data: {
        userId: session.user.id,
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
    new URL(url);
  } catch (e) {
    return { error: "Invalid URL format" };
  }

  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: { id, userId: session.user.id },
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
      where: { id, userId: session.user.id },
    });

    if (!bookmark) return { error: "Bookmark not found or unauthorized" };

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

export async function restoreBookmark(id: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!bookmark) return { error: "Bookmark not found or unauthorized" };

    await prisma.bookmark.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to restore bookmark:", error);
    return { error: "Failed to restore bookmark" };
  }
}

export async function hardDeleteBookmark(id: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!bookmark) return { error: "Bookmark not found or unauthorized" };

    await prisma.bookmark.delete({ where: { id } });

    revalidatePath("/dashboard/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to permanently delete bookmark:", error);
    return { error: "Failed to permanently delete bookmark" };
  }
}

export async function emptyTrash() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.bookmark.deleteMany({
      where: {
        userId: session.user.id,
        deletedAt: { not: null },
      },
    });

    revalidatePath("/dashboard/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to empty trash:", error);
    return { error: "Failed to empty trash" };
  }
}
