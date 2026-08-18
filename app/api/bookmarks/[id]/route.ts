import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bookmarkId = parseInt(id, 10);

    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
      include: {
        tags: { include: { tag: true } },
        collections: { include: { collection: true } }
      }
    });

    if (!bookmark) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bookmarkId = parseInt(id, 10);

    const body = await request.json();
    
    // Allow updating basic fields or soft-delete/restore
    const data: any = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.url !== undefined) data.url = body.url;
    if (body.description !== undefined) data.description = body.description;
    if (body.deletedAt !== undefined) data.deletedAt = body.deletedAt ? new Date() : null;

    const bookmark = await prisma.bookmark.update({
      where: { id: bookmarkId },
      data,
    });

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bookmarkId = parseInt(id, 10);

    await prisma.bookmark.delete({
      where: { id: bookmarkId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
