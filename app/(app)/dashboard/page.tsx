import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
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

  // Build orderBy
  let orderBy: any = { createdAt: "desc" };
  if (sort === "date-asc") orderBy = { createdAt: "asc" };
  else if (sort === "name-asc") orderBy = { title: "asc" };
  else if (sort === "visits-desc") orderBy = { visitCount: "desc" };

  // Fetch bookmarks and profiles in parallel
  const [bookmarks, profiles] = await Promise.all([
    prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
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
      include: {
        tags: { include: { tag: true } },
      },
      orderBy,
    }),
    prisma.profile.findMany({
      where: { userId: session.user.id, deletedAt: null },
      include: {
        bookmarks: { select: { bookmarkId: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Shape profiles for BookmarkRow's "Add to Profile" menu
  const profilesForRow = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    bookmarkIds: p.bookmarks.map((pb) => pb.bookmarkId),
  }));

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between px-4 md:px-8 py-6 bg-canvas">
        <div>
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">Bookmarks</h2>
          <p className="text-sm text-text-secondary mt-1">Manage your saved links and articles.</p>
        </div>
        <AddBookmarkButton />
      </div>

      <BookmarkToolbar />
      <BookmarkList bookmarks={bookmarks} profiles={profilesForRow} />
    </div>
  );
}
