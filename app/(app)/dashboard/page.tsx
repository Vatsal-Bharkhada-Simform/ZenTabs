import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCachedBookmarks, getCachedProfilesForRows, getCachedCollectionsForRows, getCachedTags } from "@/lib/data/cached";
import { BookmarkToolbar } from "@/components/features/dashboard/BookmarkToolbar";
import { BookmarkList } from "@/components/features/dashboard/BookmarkList";
import { AddBookmarkButton } from "@/components/features/dashboard/AddBookmarkButton";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const searchParams = await props.searchParams;

  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "date-desc";
  const activeTag = typeof searchParams.tag === "string" ? searchParams.tag : "";

  // Build orderBy
  let orderBy: any = { createdAt: "desc" };
  if (sort === "date-asc") orderBy = { createdAt: "asc" };
  else if (sort === "name-asc") orderBy = { title: "asc" };
  else if (sort === "visits-desc") orderBy = { visitCount: "desc" };

  // Fetch bookmarks, profiles, collections, and all tags in parallel using the cached layer
  const [bookmarks, profilesForRow, collectionsForRow, allTags] = await Promise.all([
    getCachedBookmarks(session.user.id, q, sort, activeTag),
    getCachedProfilesForRows(session.user.id),
    getCachedCollectionsForRows(session.user.id),
    getCachedTags(session.user.id),
  ]);



  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between px-4 md:px-8 py-6 bg-canvas">
        <div>
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">Bookmarks</h2>
          <p className="text-sm text-text-secondary mt-1">Manage your saved links and articles.</p>
        </div>
        <AddBookmarkButton allTags={allTags} />
      </div>

      <BookmarkToolbar activeTag={activeTag} />
      <BookmarkList
        bookmarks={bookmarks}
        profiles={profilesForRow}
        collections={collectionsForRow}
        allTags={allTags}
      />
    </div>
  );
}
