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
    const profileId = parseInt(id, 10);

    const profile = await prisma.profile.findFirst({
      where: { id: profileId, userId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: "Not Found or Access Denied" }, { status: 404 });
    }

    return NextResponse.json(profile);
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
    const profileId = parseInt(id, 10);

    // Verify ownership
    const existing = await prisma.profile.findFirst({
      where: { id: profileId, userId: session.user.id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Not Found or Access Denied" }, { status: 404 });
    }

    const body = await request.json();
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.deletedAt !== undefined) data.deletedAt = body.deletedAt ? new Date() : null;

    const profile = await prisma.profile.update({
      where: { id: profileId },
      data,
    });

    return NextResponse.json(profile);
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
    const profileId = parseInt(id, 10);

    // Verify ownership
    const existing = await prisma.profile.findFirst({
      where: { id: profileId, userId: session.user.id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Not Found or Access Denied" }, { status: 404 });
    }

    await prisma.profile.delete({
      where: { id: profileId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
