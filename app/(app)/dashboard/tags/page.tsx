import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCachedTags } from "@/lib/data/cached";
import { TagsClient } from "@/components/features/tags/TagsClient";

export const metadata: Metadata = {
  title: "Tags",
};

export default async function TagsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const searchParams = await props.searchParams;
  const activeTag = typeof searchParams.tag === "string" ? searchParams.tag : "";

  const tags = await getCachedTags(session.user.id);

  // If a tag is selected, fetch its bookmarks
  let activeBookmarks: any[] = [];
  let allTagsForRow: { id: number; name: string }[] = tags.map((t: any) => ({
    id: t.id,
    name: t.name,
  }));

  if (activeTag) {
    const [rawBookmarks, profilesRaw, collectionsRaw] = await Promise.all([
      prisma.bookmark.findMany({
        where: {
          userId: session.user.id,
          deletedAt: null,
          tags: { some: { tag: { name: activeTag } } },
        },
        include: { tags: { include: { tag: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.profile.findMany({
        where: { userId: session.user.id, deletedAt: null },
        include: { bookmarks: { select: { bookmarkId: true } } },
      }),
      prisma.collection.findMany({
        where: { userId: session.user.id },
        include: { bookmarks: { select: { bookmarkId: true } } },
      }),
    ]);

    activeBookmarks = rawBookmarks.map((b) => ({
      ...b,
      _profiles: profilesRaw.map((p) => ({
        id: p.id,
        name: p.name,
        bookmarkIds: p.bookmarks.map((pb) => pb.bookmarkId),
      })),
      _collections: collectionsRaw.map((c) => ({
        id: c.id,
        name: c.name,
        bookmarkIds: c.bookmarks.map((bc) => bc.bookmarkId),
      })),
    }));
  }

  return (
    <TagsClient
      tags={tags}
      activeTag={activeTag}
      activeBookmarks={activeBookmarks}
      allTagsForRow={allTagsForRow}
    />
  );
}
