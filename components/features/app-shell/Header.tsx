"use client";

import { UserMenu } from "./UserMenu";
import Link from "next/link";
import { usePathname } from "next/navigation";

// A small utility to convert pathnames to human-readable titles for the header
function getPageTitle(pathname: string) {
  if (pathname === "/dashboard") return "All Bookmarks";
  if (pathname.startsWith("/dashboard/collections")) return "Collections";
  if (pathname.startsWith("/dashboard/tags")) return "Tags";
  if (pathname.startsWith("/dashboard/trash")) return "Trash";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  return "Dashboard";
}



export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:px-8 bg-canvas/80 backdrop-blur-md border-b border-border-strong">
      <div className="flex items-center gap-3">
        {/* Mobile-only brand identifier since sidebar is hidden */}
        <Link href="/dashboard" className="md:hidden text-sm font-bold tracking-tight text-text-primary">
          ZenTabs
        </Link>
        <span className="md:hidden text-border-strong" aria-hidden="true">/</span>
        
        <h1 className="text-sm font-medium text-text-primary">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Future spot for ProfileSwitcher */}
        <UserMenu />
      </div>
    </header>
  );
}
