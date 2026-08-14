"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkSimple, SquaresFour, Hash, Trash } from "@phosphor-icons/react";

const NAVIGATION = [
  { name: "Dash", href: "/dashboard", icon: SquaresFour },
  { name: "Collect", href: "/dashboard/collections", icon: BookmarkSimple },
  { name: "Tags", href: "/dashboard/tags", icon: Hash },
  { name: "Trash", href: "/dashboard/trash", icon: Trash },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-canvas/90 backdrop-blur-md border-t border-border-strong pb-safe">
      {NAVIGATION.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon size={20} weight={isActive ? "fill" : "regular"} aria-hidden="true" />
            <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
