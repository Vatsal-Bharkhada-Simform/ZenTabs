"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkSimple, SquaresFour, Hash, Trash } from "@phosphor-icons/react";

const NAVIGATION = [
  { name: "Dashboard", href: "/dashboard", icon: SquaresFour },
  { name: "Collections", href: "/dashboard/collections", icon: BookmarkSimple },
  { name: "Tags", href: "/dashboard/tags", icon: Hash },
  { name: "Trash", href: "/dashboard/trash", icon: Trash },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-dvh bg-surface-alt border-r border-border-strong sticky top-0 shrink-0">
      {/* Brand area */}
      <div className="flex items-center h-16 px-6 border-b border-border-strong">
        <Link href="/dashboard" className="text-sm md:text-xl font-bold tracking-tight text-text-primary hover:opacity-70 transition-opacity">
          ZenTabs
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {NAVIGATION.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-surface text-text-primary shadow-sm border border-border-strong"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface/50 border border-transparent"
              }`}
            >
              <Icon size={18} weight={isActive ? "fill" : "regular"} aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
