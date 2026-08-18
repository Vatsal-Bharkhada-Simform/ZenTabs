import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/features/app-shell/Sidebar";
import { Header } from "@/components/features/app-shell/Header";
import { BottomNav } from "@/components/features/app-shell/BottomNav";
import { SyncProvider, SyncIndicator } from "@/components/features/dashboard/SyncContext";
import { SessionProvider } from "next-auth/react";
import { getCachedSidebarProfiles } from "@/lib/data/cached";

export const instant = false;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch cached profiles with their bookmark URLs for the sidebar "Open All" feature.
  const sidebarProfiles = await getCachedSidebarProfiles(session.user.id!);

  return (
    <SessionProvider>
      <SyncProvider>
      <div className="flex h-dvh bg-canvas overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar profiles={sidebarProfiles} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <SyncIndicator />

          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </div>
      </div>
      </SyncProvider>
    </SessionProvider>
  );
}
