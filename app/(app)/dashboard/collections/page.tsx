import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCachedCollectionsForRows, getCachedProfilesForRows, getCachedTags, getCachedActiveCollection } from "@/lib/data/cached";
import { CollectionListSidebar } from "@/components/features/collections/CollectionListSidebar";
import { CollectionDetail, CollectionDetailEmpty } from "@/components/features/collections/CollectionDetail";

export const metadata: Metadata = {
  title: "Collections",
};

export default async function CollectionsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const searchParams = await props.searchParams;
  const activeId = typeof searchParams.c === "string" ? parseInt(searchParams.c, 10) : null;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "date-desc";

  // Build orderBy for bookmarks
  let orderBy: any = { createdAt: "desc" };
  if (sort === "date-asc") orderBy = { createdAt: "asc" };
  else if (sort === "name-asc") orderBy = { title: "asc" };
  else if (sort === "visits-desc") orderBy = { visitCount: "desc" };

  // Fetch all collections for the sidebar, and global profiles/collections for BookmarkRow menus
  const [allCollections, allProfiles, allTags] = await Promise.all([
    getCachedCollectionsForRows(session.user.id),
    getCachedProfilesForRows(session.user.id),
    getCachedTags(session.user.id),
  ]);

  const collectionsForSidebar = allCollections.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.bookmarkIds.length,
  }));

  // Fetch active collection data if selected
  let activeCollectionData = null;
  if (activeId && !isNaN(activeId)) {
    activeCollectionData = await getCachedActiveCollection(session.user.id, activeId, q);
  }

  const activeCollection = activeCollectionData
    ? {
        id: activeCollectionData.id,
        name: activeCollectionData.name,
        description: activeCollectionData.description,
      }
    : null;

  // Extract actual bookmarks from join table and sort them
  let bookmarks = activeCollectionData
    ? activeCollectionData.bookmarks.map((bc) => bc.bookmark)
    : [];

  // Apply sorting in memory since sorting a related model dynamically in Prisma is complex
  if (sort === "date-desc") bookmarks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  if (sort === "date-asc") bookmarks.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  if (sort === "name-asc") bookmarks.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "visits-desc") bookmarks.sort((a, b) => b.visitCount - a.visitCount);

  // Mobile layout state
  const isMobileDetailView = !!activeId;

  return (
    <div className="flex h-[calc(100dvh-4rem)] md:h-full w-full overflow-hidden">
      {/* Sidebar / Master pane */}
      <div className={`h-full ${isMobileDetailView ? "hidden md:block" : "w-full md:w-auto"}`}>
        <CollectionListSidebar collections={collectionsForSidebar} activeId={activeId} />
      </div>

      {/* Detail pane */}
      <div className={`h-full flex-1 min-w-0 ${isMobileDetailView ? "block" : "hidden md:block"}`}>
        {activeCollection ? (
          <CollectionDetail
            collection={activeCollection}
            bookmarks={bookmarks}
            allProfiles={allProfiles}
            allCollections={allCollections}
            allTags={allTags}
          />
        ) : (
          <CollectionDetailEmpty />
        )}
      </div>
    </div>
  );
}
