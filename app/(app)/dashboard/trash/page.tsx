import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TrashList } from "@/components/features/trash/TrashList";
import { EmptyTrashButton } from "@/components/features/trash/EmptyTrashButton";

export const metadata: Metadata = {
  title: "Trash",
};

export default async function TrashPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: session.user.id,
      deletedAt: { not: null },
    },
    include: {
      tags: {
        include: { tag: true },
      },
    },
    orderBy: { deletedAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-6 bg-canvas">
        <div>
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">
            Trash
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {bookmarks.length > 0
              ? `${bookmarks.length} deleted ${bookmarks.length === 1 ? "bookmark" : "bookmarks"} — items are permanently removed after 60 days.`
              : "Deleted bookmarks will appear here."}
          </p>
        </div>

        <EmptyTrashButton count={bookmarks.length} />
      </div>

      <TrashList bookmarks={bookmarks as Parameters<typeof TrashList>[0]["bookmarks"]} />
    </div>
  );
}
