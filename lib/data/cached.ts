import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

export async function getCachedSidebarProfiles(userId: string) {
  'use cache';
  cacheLife("minutes");
  cacheTag(`profiles-${userId}`, `bookmarks-${userId}`);

  const profiles = await prisma.profile.findMany({
    where: { userId, deletedAt: null },
    include: {
      bookmarks: {
        include: {
          bookmark: { select: { id: true, url: true } },
        },
        orderBy: { addedAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return profiles.map((p) => ({
    id: p.id,
    name: p.name,
    count: p.bookmarks.length,
    urls: p.bookmarks.map((pb) => pb.bookmark.url),
    bookmarkIds: p.bookmarks.map((pb) => pb.bookmark.id),
  }));
}

export async function getCachedBookmarks(userId: string, q: string, sort: string, activeTag: string) {
  'use cache';
  cacheLife("minutes");
  cacheTag(`bookmarks-${userId}`, `tags-${userId}`);

  let orderBy: any = { createdAt: "desc" };
  if (sort === "date-asc") orderBy = { createdAt: "asc" };
  else if (sort === "name-asc") orderBy = { title: "asc" };
  else if (sort === "visits-desc") orderBy = { visitCount: "desc" };

  return prisma.bookmark.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { url: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(activeTag
        ? {
            tags: {
              some: { tag: { name: activeTag } },
            },
          }
        : {}),
    },
    include: {
      tags: { include: { tag: true } },
    },
    orderBy,
  });
}

export async function getCachedProfilesForRows(userId: string) {
  'use cache';
  cacheLife("minutes");
  cacheTag(`profiles-${userId}`);

  const profiles = await prisma.profile.findMany({
    where: { userId, deletedAt: null },
    include: { bookmarks: { select: { bookmarkId: true } } },
    orderBy: { createdAt: "asc" },
  });

  return profiles.map((p) => ({
    id: p.id,
    name: p.name,
    bookmarkIds: p.bookmarks.map((pb) => pb.bookmarkId),
  }));
}

export async function getCachedCollectionsForRows(userId: string) {
  'use cache';
  cacheLife("minutes");
  cacheTag(`collections-${userId}`);

  const collections = await prisma.collection.findMany({
    where: { userId },
    include: { bookmarks: { select: { bookmarkId: true } } },
    orderBy: { name: "asc" },
  });

  return collections.map((c) => ({
    id: c.id,
    name: c.name,
    bookmarkIds: c.bookmarks.map((bc) => bc.bookmarkId),
  }));
}

export async function getCachedTags(userId: string) {
  'use cache';
  cacheLife("minutes");
  cacheTag(`tags-${userId}`, `bookmarks-${userId}`); // Tags depend on bookmarks because we filter by tags that have bookmarks for this user

  const allTagsRaw = await prisma.tag.findMany({
    where: {
      bookmarks: {
        some: { bookmark: { userId, deletedAt: null } },
      },
    },
    include: {
      _count: { select: { bookmarks: true } },
    },
    orderBy: { name: "asc" },
  });

  return allTagsRaw.map((t) => ({ id: t.id, name: t.name, count: t._count.bookmarks }));
}

export async function getCachedTrashBookmarks(userId: string) {
  'use cache';
  cacheLife("minutes");
  cacheTag(`bookmarks-${userId}`);

  return prisma.bookmark.findMany({
    where: {
      userId,
      deletedAt: { not: null },
    },
    include: {
      tags: { include: { tag: true } },
      collections: { include: { collection: true } },
      profiles: { include: { profile: true } },
    },
    orderBy: { deletedAt: "desc" },
  });
}

export async function getCachedCollectionsWithCounts(userId: string) {
  'use cache';
  cacheLife("minutes");
  cacheTag(`collections-${userId}`);

  return prisma.collection.findMany({
    where: { userId },
    include: {
      _count: { select: { bookmarks: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCachedActiveCollection(userId: string, activeId: number, q: string) {
  'use cache';
  cacheLife("minutes");
  cacheTag(`collections-${userId}`, `bookmarks-${userId}`);

  return prisma.collection.findUnique({
    where: { id: activeId, userId },
    include: {
      bookmarks: {
        where: {
          bookmark: {
            deletedAt: null,
            ...(q
              ? {
                  OR: [
                    { title: { contains: q, mode: "insensitive" } },
                    { url: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
        },
        include: {
          bookmark: {
            include: {
              tags: { include: { tag: true } },
            },
          },
        },
      },
    },
  });
}
