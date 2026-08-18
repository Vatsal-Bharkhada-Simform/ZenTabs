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
  const contextType = formData.get("contextType") as string | null;
  const contextIdStr = formData.get("contextId") as string | null;
  const contextId = contextIdStr ? parseInt(contextIdStr, 10) : null;
  const tagNames = formData.getAll("tags").map((t) => String(t).trim().toLowerCase()).filter(Boolean);

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

    const bookmarkData = {
      userId: session.user.id,
      url,
      title,
      description: description || null,
      faviconUrl,
    };

    if (contextType === "collection" && contextId) {
      await prisma.$transaction(async (tx) => {
        const bm = await tx.bookmark.create({ data: bookmarkData });
        await tx.bookmarkCollection.create({
          data: { bookmarkId: bm.id, collectionId: contextId },
        });
        if (tagNames.length > 0) {
          for (const name of tagNames) {
            const tag = await tx.tag.upsert({ where: { name }, create: { name }, update: {} });
            await tx.bookmarkTag.upsert({
              where: { bookmarkId_tagId: { bookmarkId: bm.id, tagId: tag.id } },
              create: { bookmarkId: bm.id, tagId: tag.id },
              update: {},
            });
          }
        }
      });
    } else if (contextType === "profile" && contextId) {
      await prisma.$transaction(async (tx) => {
        const bm = await tx.bookmark.create({ data: bookmarkData });
        await tx.profileBookmark.create({
          data: { bookmarkId: bm.id, profileId: contextId },
        });
        if (tagNames.length > 0) {
          for (const name of tagNames) {
            const tag = await tx.tag.upsert({ where: { name }, create: { name }, update: {} });
            await tx.bookmarkTag.upsert({
              where: { bookmarkId_tagId: { bookmarkId: bm.id, tagId: tag.id } },
              create: { bookmarkId: bm.id, tagId: tag.id },
              update: {},
            });
          }
        }
      });
    } else {
      await prisma.$transaction(async (tx) => {
        const bm = await tx.bookmark.create({ data: bookmarkData });
        if (tagNames.length > 0) {
          for (const name of tagNames) {
            const tag = await tx.tag.upsert({ where: { name }, create: { name }, update: {} });
            await tx.bookmarkTag.upsert({
              where: { bookmarkId_tagId: { bookmarkId: bm.id, tagId: tag.id } },
              create: { bookmarkId: bm.id, tagId: tag.id },
              update: {},
            });
          }
        }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard/profiles");
    revalidatePath("/dashboard/tags");
    revalidatePath("/dashboard/trash");
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
  const syncTags = formData.get("syncTags") === "true";
  const tagNames = formData.getAll("tags").map((t) => String(t).trim().toLowerCase()).filter(Boolean);

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

    await prisma.$transaction(async (tx) => {
      await tx.bookmark.update({
        where: { id },
        data: {
          url,
          title,
          description: description || null,
          faviconUrl,
        },
      });

      // Synchronize tags atomically if syncTags flag is present
      if (syncTags) {
        const currentRelations = await tx.bookmarkTag.findMany({
          where: { bookmarkId: id },
          include: { tag: true },
        });
        const currentTagNames = new Set(currentRelations.map((r) => r.tag.name));
        const targetTagNames = new Set(tagNames);

        // Delete removed tags
        const relationsToDelete = currentRelations.filter((r) => !targetTagNames.has(r.tag.name));
        if (relationsToDelete.length > 0) {
          await tx.bookmarkTag.deleteMany({
            where: {
              bookmarkId: id,
              tagId: { in: relationsToDelete.map((r) => r.tagId) },
            },
          });
        }

        // Add new tags
        for (const name of tagNames) {
          if (!currentTagNames.has(name)) {
            const tag = await tx.tag.upsert({
              where: { name },
              create: { name },
              update: {},
            });
            await tx.bookmarkTag.upsert({
              where: { bookmarkId_tagId: { bookmarkId: id, tagId: tag.id } },
              create: { bookmarkId: id, tagId: tag.id },
              update: {},
            });
          }
        }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard/profiles");
    revalidatePath("/dashboard/tags");
    revalidatePath("/dashboard/trash");
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
    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard/profiles");
    revalidatePath("/dashboard/tags");
    revalidatePath("/dashboard/trash");
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
    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard/profiles");
    revalidatePath("/dashboard/tags");
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

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard/profiles");
    revalidatePath("/dashboard/tags");
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

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to empty trash:", error);
    return { error: "Failed to empty trash" };
  }
}

export async function getSimpleLibrary() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", bookmarks: [] };

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id, deletedAt: null },
      select: {
        id: true,
        title: true,
        url: true,
        faviconUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, bookmarks };
  } catch (error) {
    console.error("Failed to fetch library:", error);
    return { error: "Failed to fetch library", bookmarks: [] };
  }
}

export async function syncContextBookmarks(
  contextType: "collection" | "profile",
  contextId: number,
  bookmarkIds: number[]
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      if (contextType === "collection") {
        // Clear existing
        await tx.bookmarkCollection.deleteMany({
          where: { collectionId: contextId },
        });
        // Insert new
        if (bookmarkIds.length > 0) {
          await tx.bookmarkCollection.createMany({
            data: bookmarkIds.map((id) => ({
              collectionId: contextId,
              bookmarkId: id,
            })),
            skipDuplicates: true,
          });
        }
      } else if (contextType === "profile") {
        // Clear existing
        await tx.profileBookmark.deleteMany({
          where: { profileId: contextId },
        });
        // Insert new
        if (bookmarkIds.length > 0) {
          await tx.profileBookmark.createMany({
            data: bookmarkIds.map((id) => ({
              profileId: contextId,
              bookmarkId: id,
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard/profiles");
    return { success: true };
  } catch (error) {
    console.error("Failed to sync context bookmarks:", error);
    return { error: "Failed to sync bookmarks" };
  }
}

export async function recordBookmarkVisit(bookmarkId: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id, deletedAt: null },
    });

    if (!bookmark) return { error: "Bookmark not found" };

    await prisma.$transaction(async (tx) => {
      await tx.bookmarkVisit.create({
        data: {
          bookmarkId,
          visitedAt: new Date(),
        },
      });

      await tx.bookmark.update({
        where: { id: bookmarkId },
        data: {
          visitCount: { increment: 1 },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard/tags");
    return { success: true };
  } catch (error) {
    console.error("Failed to record bookmark visit:", error);
    return { error: "Failed to record visit" };
  }
}

export async function recordBatchBookmarkVisits(bookmarkIds: number[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (!bookmarkIds || bookmarkIds.length === 0) return { success: true };

  try {
    const validBookmarks = await prisma.bookmark.findMany({
      where: {
        id: { in: bookmarkIds },
        userId: session.user.id,
        deletedAt: null,
      },
      select: { id: true },
    });

    const validIds = validBookmarks.map((b) => b.id);
    if (validIds.length === 0) return { success: true };

    await prisma.$transaction(async (tx) => {
      await tx.bookmarkVisit.createMany({
        data: validIds.map((id) => ({
          bookmarkId: id,
          visitedAt: new Date(),
        })),
      });

      await tx.bookmark.updateMany({
        where: { id: { in: validIds } },
        data: {
          visitCount: { increment: 1 },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard/tags");
    return { success: true };
  } catch (error) {
    console.error("Failed to record batch bookmark visits:", error);
    return { error: "Failed to record visits" };
  }
}
