import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bookmarkSchema = z.object({
  url: z.string().url("Invalid URL"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "date-desc";

    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "date-asc": orderBy = { createdAt: "asc" }; break;
      case "title-asc": orderBy = { title: "asc" }; break;
      case "title-desc": orderBy = { title: "desc" }; break;
      case "visits-desc": orderBy = { visitCount: "desc" }; break;
      default: orderBy = { createdAt: "desc" };
    }

    const whereClause: any = { deletedAt: null };
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { url: { contains: search, mode: "insensitive" } },
      ];
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: whereClause,
      orderBy,
      include: {
        tags: { include: { tag: true } },
        collections: { include: { collection: true } }
      }
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bookmarkSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { url, title, description } = parsed.data;

    // Fetch favicon server-side (simple implementation)
    let faviconUrl = null;
    try {
      const urlObj = new URL(url);
      faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch (e) {
      // ignore
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        title,
        description,
        faviconUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
