"use client";

import Link from "next/link";
import { Tag, ArrowLeft } from "@phosphor-icons/react";
import { BookmarkRow } from "@/components/features/dashboard/BookmarkRow";
import { getTagColor } from "@/lib/tagColor";
import { useSyncState } from "@/components/features/dashboard/SyncContext";

interface TagItem {
  id: number;
  name: string;
  count: number;
}

interface TagsClientProps {
  tags: TagItem[];
  activeTag: string;
  activeBookmarks: any[];
  allTagsForRow: { id: number; name: string }[];
}

export function TagsClient({ tags, activeTag, activeBookmarks, allTagsForRow }: TagsClientProps) {
  const { isSyncing } = useSyncState();

  // Compute font-size scale: larger count → larger text (min 0.7rem, max 1.4rem)
  const counts = tags.map((t) => t.count);
  const minCount = Math.min(...counts, 1);
  const maxCount = Math.max(...counts, 1);

  const getSize = (count: number) => {
    if (maxCount === minCount) return 1;
    return 0.75 + ((count - minCount) / (maxCount - minCount)) * 0.75;
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-6 bg-canvas">
        <div>
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">Tags</h2>
          <p className="text-sm text-text-secondary mt-1">
            {tags.length} {tags.length === 1 ? "tag" : "tags"} across your bookmarks
          </p>
        </div>
      </div>

      {tags.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-surface-alt border border-border-strong rounded-2xl mb-6">
            <Tag size={28} className="text-text-secondary" weight="duotone" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-2">No tags yet</h3>
          <p className="text-sm text-text-secondary max-w-sm">
            Add tags to your bookmarks from the dashboard to organize them by topic or context.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-primary bg-canvas border border-border-strong rounded-md hover:bg-surface-alt transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div
          className={`flex-1 flex flex-col transition-opacity duration-200 ${
            isSyncing ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
        >
          {/* Tag cloud — colored pills */}
          <div className="px-4 md:px-8 pb-6">
            <div className="border border-border-strong rounded-xl bg-surface p-6 md:p-8">
              <div className="flex flex-wrap gap-2 items-center">
                {tags.map((tag) => {
                  const isActive = tag.name === activeTag;
                  const color = getTagColor(tag.name);
                  const rem = getSize(tag.count);
                  return (
                    <Link
                      key={tag.id}
                      href={isActive ? "/dashboard/tags" : `/dashboard/tags?tag=${encodeURIComponent(tag.name)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider transition-all duration-150 hover:opacity-80"
                      style={{
                        fontSize: `${Math.max(0.7, rem * 0.75)}rem`,
                        backgroundColor: isActive ? color.text : color.bg,
                        color: isActive ? color.bg : color.text,
                        border: `1px solid ${color.border}`,
                        boxShadow: isActive ? `0 0 0 2px ${color.text}33` : "none",
                      }}
                    >
                      {tag.name}
                      <span
                        className="font-mono tabular-nums opacity-70"
                        style={{ fontSize: "0.6rem" }}
                      >
                        {tag.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active tag bookmark list — matches standard dashboard full-width list style */}
          {activeTag && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between px-4 md:px-8 py-3 bg-canvas/80 backdrop-blur-md border-y border-border-strong">
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/dashboard/tags"
                    className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-alt border border-transparent hover:border-border-strong rounded-md transition-all"
                    aria-label="Back to all tags"
                  >
                    <ArrowLeft size={14} />
                  </Link>
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-text-secondary" />
                    <h3 className="text-sm font-semibold text-text-primary">{activeTag}</h3>
                    <span className="text-xs font-mono text-text-muted tabular-nums">
                      ({activeBookmarks.length})
                    </span>
                  </div>
                </div>
              </div>

              {activeBookmarks.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-sm text-text-secondary">No active bookmarks with this tag.</p>
                </div>
              ) : (
                <div className="flex flex-col bg-canvas pb-24">
                  {activeBookmarks.map((b) => (
                    <BookmarkRow
                      key={b.id}
                      bookmark={b}
                      profiles={b._profiles}
                      collections={b._collections}
                      allTags={allTagsForRow}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
