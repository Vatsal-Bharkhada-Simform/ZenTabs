import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/features/app-shell/Sidebar";
import { Header } from "@/components/features/app-shell/Header";
import { BottomNav } from "@/components/features/app-shell/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch profiles with their bookmark URLs for the sidebar "Open All" feature.
  // URLs must be in the component at render time — window.open() must be called
  // synchronously from a user gesture, not after an async fetch.
  const profiles = await prisma.profile.findMany({
    where: { userId: session.user.id!, deletedAt: null },
    include: {
      bookmarks: {
        include: {
          bookmark: { select: { url: true } },
        },
        orderBy: { addedAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Flatten to a sidebar-friendly shape
  const sidebarProfiles = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    count: p.bookmarks.length,
    urls: p.bookmarks.map((pb) => pb.bookmark.url),
  }));

  return (
    <div className="flex h-dvh bg-canvas overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar profiles={sidebarProfiles} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={session.user} />

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
