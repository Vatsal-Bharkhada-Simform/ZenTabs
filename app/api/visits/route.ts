import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { bookmarkId, bookmarkIds } = body;

    const ids: number[] = [];
    if (typeof bookmarkId === "number" && !isNaN(bookmarkId)) {
      ids.push(bookmarkId);
    }
    if (Array.isArray(bookmarkIds)) {
      for (const id of bookmarkIds) {
        if (typeof id === "number" && !isNaN(id)) {
          ids.push(id);
        }
      }
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: "Missing valid bookmarkId or bookmarkIds" }, { status: 400 });
    }

    // Verify ownership of bookmarks
    const validBookmarks = await prisma.bookmark.findMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
        deletedAt: null,
      },
      select: { id: true, url: true },
    });

    const validIds = validBookmarks.map((b) => b.id);
    if (validIds.length === 0) {
      return NextResponse.json({ error: "No matching bookmarks found" }, { status: 404 });
    }

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

    return NextResponse.json({
      success: true,
      loggedCount: validIds.length,
      url: validBookmarks.length === 1 ? validBookmarks[0].url : undefined,
    });
  } catch (error) {
    console.error("Failed to log visit:", error);
    return NextResponse.json({ error: "Failed to record visit" }, { status: 500 });
  }
}
