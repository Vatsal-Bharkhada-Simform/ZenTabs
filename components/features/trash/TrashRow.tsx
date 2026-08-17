"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { ArrowCounterClockwise, TrashSimple } from "@phosphor-icons/react";
import { restoreBookmark, hardDeleteBookmark } from "@/lib/actions/bookmarks";
import { getTagColor } from "@/lib/tagColor";
import { useSyncState } from "@/components/features/dashboard/SyncContext";
import { toast } from "sonner";

interface TrashRowProps {
  bookmark: {
    id: number;
    url: string;
    title: string;
    description: string | null;
    faviconUrl: string | null;
    deletedAt: Date;
    tags: { tag: { name: string } }[];
  };
}

export function TrashRow({ bookmark }: TrashRowProps) {
  const [restorePending, startRestore] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const { startSync } = useSyncState();

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, "");
    } catch {
      return bookmark.url;
    }
  })();

  const deletedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(bookmark.deletedAt));

  const handleRestore = () => {
    startRestore(async () => {
      await startSync(async () => {
        const res = await restoreBookmark(bookmark.id);
        if (res.success) {
          toast.success("Bookmark restored");
        } else {
          toast.error(res.error || "Failed to restore bookmark");
        }
      });
    });
  };

  const handleHardDelete = () => {
    startDelete(async () => {
      await startSync(async () => {
        const res = await hardDeleteBookmark(bookmark.id);
        if (res.success) {
          toast.success("Bookmark permanently deleted");
        } else {
          toast.error(res.error || "Failed to delete bookmark");
        }
      });
    });
  };

  const isPending = restorePending || deletePending;

  return (
    <div
      className={`group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 py-3 px-4 md:px-8 border-b border-border-strong transition-colors ${
        isPending ? "opacity-50 pointer-events-none" : "hover:bg-surface-alt"
      }`}
    >
      {/* Left: Favicon & Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
        <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-surface border border-border-strong rounded-md overflow-hidden opacity-60">
          {bookmark.faviconUrl ? (
            <img src={bookmark.faviconUrl} alt="" className="w-4 h-4" loading="lazy" />
          ) : (
            <div className="w-4 h-4 bg-border-strong rounded-sm" />
          )}
        </div>
        <div className="min-w-0">
          <p
            className="block text-sm font-medium text-text-secondary truncate line-through decoration-text-muted underline-offset-4"
            title={bookmark.title}
          >
            {bookmark.title}
          </p>
          <p className="text-xs text-text-muted truncate mt-0.5">{domain}</p>
        </div>
      </div>

      {/* Middle: Tags (Desktop) */}
      <div className="hidden sm:flex items-center gap-1.5 w-72 shrink-0">
        {bookmark.tags.length > 0 ? (
          bookmark.tags.slice(0, 3).map((t) => {
            const color = getTagColor(t.tag.name);
            return (
              <span
                key={t.tag.name}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded whitespace-nowrap opacity-50"
                style={{
                  backgroundColor: color.bg,
                  color: color.text,
                  border: `1px solid ${color.border}`,
                }}
              >
                {t.tag.name}
              </span>
            );
          })
        ) : (
          <span className="text-xs text-text-muted/50 italic">—</span>
        )}
      </div>

      {/* Right: Deleted Date & Actions */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0">
        <span className="text-xs text-text-muted font-mono whitespace-nowrap">
          Deleted {deletedDate}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Restore */}
          <button
            onClick={handleRestore}
            disabled={isPending}
            title="Restore bookmark"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary bg-surface border border-border-strong rounded-md hover:text-text-primary hover:bg-canvas transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <ArrowCounterClockwise size={13} weight="bold" />
            <span className="hidden sm:inline">Restore</span>
          </button>

          {/* Delete Forever */}
          <button
            onClick={handleHardDelete}
            disabled={isPending}
            title="Delete forever"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-accent-red-text bg-accent-red-bg border border-accent-red-text/20 rounded-md hover:brightness-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red-text/30"
          >
            <TrashSimple size={13} weight="bold" />
            <span className="hidden sm:inline">Delete forever</span>
          </button>
        </div>
      </div>
    </div>
  );
}
