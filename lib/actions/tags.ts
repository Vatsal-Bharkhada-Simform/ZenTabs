"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, updateTag } from "next/cache";

function invalidateCache(userId: string) {
  updateTag(`bookmarks-${userId}`);
  updateTag(`collections-${userId}`);
  updateTag(`profiles-${userId}`);
  updateTag(`tags-${userId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/collections");
  revalidatePath("/dashboard/profiles");
  revalidatePath("/dashboard/tags");
  revalidatePath("/dashboard/trash");
}

/**
 * Fetch all tags that belong to the current user's bookmarks,
 * along with a usage count.
 */
export async function getAllTags() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", tags: [] };

  try {
    const tags = await prisma.tag.findMany({
      where: {
        bookmarks: {
          some: {
            bookmark: {
              userId: session.user.id,
              deletedAt: null,
            },
          },
        },
      },
      include: {
        _count: { select: { bookmarks: true } },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      tags: tags.map((t) => ({
        id: t.id,
        name: t.name,
        count: t._count.bookmarks,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return { error: "Failed to fetch tags", tags: [] };
  }
}

/**
 * Find-or-create a tag by name, then attach it to the bookmark.
 * Silently ignores if the tag is already attached.
 */
export async function addTagToBookmark(bookmarkId: number, tagName: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const name = tagName.trim().toLowerCase();
  if (!name) return { error: "Tag name is required" };
  if (name.length > 32) return { error: "Tag name must be 32 characters or fewer" };

  try {
    // Verify the bookmark belongs to this user
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id, deletedAt: null },
    });
    if (!bookmark) return { error: "Bookmark not found" };

    await prisma.$transaction(async (tx) => {
      // Find-or-create the tag
      const tag = await tx.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      });

      // Attach to bookmark — skip if already exists
      await tx.bookmarkTag.upsert({
        where: { bookmarkId_tagId: { bookmarkId, tagId: tag.id } },
        create: { bookmarkId, tagId: tag.id },
        update: {},
      });
    });

    invalidateCache(session.user.id);
    return { success: true };
  } catch (error) {
    console.error("Failed to add tag:", error);
    return { error: "Failed to add tag" };
  }
}

/**
 * Remove a tag from a bookmark (detach only; does not delete the Tag record).
 */
export async function removeTagFromBookmark(bookmarkId: number, tagId: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Verify ownership
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: session.user.id },
    });
    if (!bookmark) return { error: "Bookmark not found" };

    await prisma.bookmarkTag.delete({
      where: { bookmarkId_tagId: { bookmarkId, tagId } },
    });

    invalidateCache(session.user.id);
    return { success: true };
  } catch (error) {
    console.error("Failed to remove tag:", error);
    return { error: "Failed to remove tag" };
  }
}
