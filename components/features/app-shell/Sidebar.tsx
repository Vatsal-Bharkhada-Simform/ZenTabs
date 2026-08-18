"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkSimple, SquaresFour, Tag, Trash, Plus, ArrowSquareOut } from "@phosphor-icons/react";
import { openProfileUrls } from "@/lib/openProfile";

interface SidebarProfile {
  id: number;
  name: string;
  count: number;
  urls: string[];
  bookmarkIds?: number[];
}

interface SidebarProps {
  profiles: SidebarProfile[];
}

const NAVIGATION = [
  { name: "Dashboard", href: "/dashboard", icon: SquaresFour, exact: true },
  { name: "Collections", href: "/dashboard/collections", icon: BookmarkSimple },
  { name: "Tags", href: "/dashboard/tags", icon: Tag },
  { name: "Trash", href: "/dashboard/trash", icon: Trash },
];

export function Sidebar({ profiles }: SidebarProps) {
  const pathname = usePathname();


  return (
    <aside className="hidden md:flex flex-col w-64 h-dvh bg-surface-alt border-r border-border-strong sticky top-0 shrink-0">
      {/* Brand area */}
      <div className="flex items-center h-16 px-6 border-b border-border-strong shrink-0">
        <Link
          href="/dashboard"
          className="text-base font-bold tracking-tight text-text-primary hover:opacity-70 transition-opacity"
        >
          ZenTabs
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col">
        {/* Main nav items */}
        <div className="px-4 space-y-1">
          {NAVIGATION.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
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
        </div>

        {/* Profiles panel */}
        <div className="mt-6 px-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Profiles
            </span>
            <Link
              href="/dashboard/profiles"
              title="Manage profiles"
              className="p-0.5 text-text-muted hover:text-text-primary rounded transition-colors"
              aria-label="Manage profiles"
            >
              <Plus size={14} weight="bold" />
            </Link>
          </div>

          {profiles.length === 0 ? (
            <p className="px-1 text-xs text-text-muted italic">No profiles yet.</p>
          ) : (
            <div className="space-y-0.5">
              {profiles.map((profile) => {
                const isProfileActive =
                  pathname === `/dashboard/profiles/${profile.id}` ||
                  pathname.startsWith(`/dashboard/profiles/${profile.id}/`);

                return (
                  <div
                    key={profile.id}
                    className={`group flex items-center gap-1 rounded-md pr-1 transition-colors ${
                      isProfileActive ? "bg-surface border border-border-strong" : "hover:bg-surface/50 border border-transparent"
                    }`}
                  >
                    {/* Name + count — navigates to profile detail */}
                    <Link
                      href={`/dashboard/profiles/${profile.id}`}
                      prefetch={true}
                      className="flex-1 flex items-center gap-2 px-3 py-2 min-w-0"
                    >
                      <span
                        className={`text-sm font-medium truncate ${
                          isProfileActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
                        }`}
                      >
                        {profile.name}
                      </span>
                      <span className="shrink-0 text-[10px] font-mono text-text-muted tabular-nums">
                        {profile.count}
                      </span>
                    </Link>

                    {/* Open All button — diagonal arrow */}
                    <button
                      onClick={() => openProfileUrls(profile.urls, profile.bookmarkIds)}
                      disabled={profile.count === 0}
                      title={
                        profile.count === 0
                          ? "No bookmarks in this profile"
                          : `Open all ${profile.count} bookmark${profile.count === 1 ? "" : "s"}`
                      }
                      className="shrink-0 p-1.5 text-text-muted hover:text-text-primary rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:pointer-events-none disabled:opacity-20"
                      aria-label={`Open all bookmarks in ${profile.name}`}
                    >
                      <ArrowSquareOut size={14} weight="bold" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Link to profile management */}
          <Link
            href="/dashboard/profiles"
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
          >
            + New profile
          </Link>
        </div>
      </nav>
    </aside>
  );
}
