import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/features/app-shell/Sidebar";
import { Header } from "@/components/features/app-shell/Header";
import { BottomNav } from "@/components/features/app-shell/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-dvh bg-canvas overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

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
