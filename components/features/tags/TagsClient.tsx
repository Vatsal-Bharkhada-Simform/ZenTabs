"use client";

import Link from "next/link";
import { Tag, ArrowLeft } from "@phosphor-icons/react";
import { BookmarkList } from "@/components/features/dashboard/BookmarkList";
import { getTagColor } from "@/lib/tagColor";
import { useSyncState } from "@/components/features/dashboard/SyncContext";
import {
  computeTagTiers,
  tierSpanClasses,
  tierNameClasses,
  tierEyebrowClasses,
  tierTruncateClasses,
} from "@/lib/tagTiers";

interface TagItem {
  id: number;
  name: string;
  count: number;
}

interface Profile {
  id: number;
  name: string;
  bookmarkIds: number[];
}

interface Collection {
  id: number;
  name: string;
  bookmarkIds: number[];
}

interface TagsClientProps {
  tags: TagItem[];
  activeTag: string;
  bookmarks: any[];
  profiles: Profile[];
  collections: Collection[];
  allTagsForRow: { id: number; name: string }[];
}

export function TagsClient({
  tags,
  activeTag,
  bookmarks,
  profiles,
  collections,
  allTagsForRow,
}: TagsClientProps) {
  const { isSyncing } = useSyncState();
  const tieredTags = computeTagTiers(tags);

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
          {/* Tag grid — bento treemap, tile size ranked by usage */}
          <div className="px-4 md:px-8 pb-6">
            <div className="grid grid-cols-4 md:grid-cols-6 grid-flow-dense auto-rows-[84px] md:auto-rows-[96px] gap-3 md:gap-4">
              {tieredTags.map((tag, index) => {
                const isActive = tag.name === activeTag;
                const color = getTagColor(tag.name);
                const dimmed = Boolean(activeTag) && !isActive;

                return (
                  <Link
                    key={tag.id}
                    href={isActive ? "/dashboard/tags" : `/dashboard/tags?tag=${encodeURIComponent(tag.name)}`}
                    title={tag.name}
                    className={[
                      "group block bezel-outer h-full",
                      tierSpanClasses[tag.tier],
                      "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 duration-300",
                      "transition-transform duration-150 ease-[var(--ease-spring)]",
                      "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                      dimmed ? "opacity-60" : "opacity-100",
                    ].join(" ")}
                    style={{
                      animationDelay: `${Math.min(index * 25, 400)}ms`,
                      boxShadow: isActive ? `0 0 0 2px ${color.text}` : undefined,
                    }}
                  >
                    <div
                      className="bezel-inner h-full flex flex-col justify-between p-3 md:p-4 transition-shadow duration-150 hover:shadow-card-hover"
                      style={{ backgroundColor: isActive ? color.border : color.bg }}
                    >
                      <span
                        className={`font-mono uppercase tracking-wide ${tierEyebrowClasses[tag.tier]}`}
                        style={{ color: color.text, opacity: 0.75 }}
                      >
                        {tag.tier === "small"
                          ? tag.count
                          : `${tag.count} ${tag.count === 1 ? "bookmark" : "bookmarks"}`}
                      </span>
                      <span
                        className={[tierNameClasses[tag.tier], tierTruncateClasses[tag.tier]].join(" ")}
                        style={{ color: color.text }}
                      >
                        {tag.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Active tag bookmark list — matches standard dashboard full-width list style */}
          {activeTag && (
            <div className="flex-1 flex flex-col">
              <div className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 py-3 bg-canvas/90 backdrop-blur-md border-y border-border-strong">
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
                      ({bookmarks.length})
                    </span>
                  </div>
                </div>
              </div>

              <BookmarkList
                bookmarks={bookmarks}
                profiles={profiles}
                collections={collections}
                allTags={allTagsForRow}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
