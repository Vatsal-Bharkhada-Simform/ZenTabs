"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowSquareOut, ArrowLeft, X, Warning } from "@phosphor-icons/react";
import { removeBookmarkFromProfile } from "@/lib/actions/profiles";
import { recordBookmarkVisit } from "@/lib/actions/bookmarks";
import { openProfileUrls } from "@/lib/openProfile";
import { getTagColor } from "@/lib/tagColor";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { BookmarkPickerModal } from "@/components/features/dashboard/BookmarkPickerModal";
import { BookmarkModal } from "@/components/features/dashboard/BookmarkModal";
import { useSyncState } from "@/components/features/dashboard/SyncContext";

interface Bookmark {
  id: number;
  url: string;
  title: string;
  description: string | null;
  faviconUrl: string | null;
  visitCount: number;
  deletedAt: Date | null;
  createdAt: Date;
  tags: { tag: { name: string } }[];
}

interface ProfileDetailClientProps {
  profile: { id: number; name: string };
  bookmarks: Bookmark[];
  urls: string[];
}

function ProfileBookmarkRow({
  bookmark,
  profileId,
}: {
  bookmark: Bookmark;
  profileId: number;
}) {
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removePending, startRemove] = useTransition();
  const { startSync } = useSyncState();

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, "");
    } catch {
      return bookmark.url;
    }
  })();

  const handleRemove = () => {
    startRemove(async () => {
      await startSync(async () => {
        const res = await removeBookmarkFromProfile(profileId, bookmark.id);
        setRemoveModalOpen(false);
        if (res.success) {
          toast.success("Removed from profile");
        } else {
          toast.error(res.error || "Failed to remove bookmark");
        }
      });
    });
  };

  const handleLinkClick = () => {
    recordBookmarkVisit(bookmark.id);
  };

  return (
    <>
      <div
        className={`group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 py-3 px-4 md:px-8 border-b border-border-strong transition-colors ${removePending ? "opacity-50 pointer-events-none" : "hover:bg-surface-alt"
          }`}
      >
        {/* Left: Favicon & Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="shrink-0 w-8 h-8 flex items-center justify-center bg-surface border border-border-strong rounded-md overflow-hidden hover:border-border-focus transition-colors"
            title={`Visit ${bookmark.title}`}
          >
            {bookmark.faviconUrl ? (
              <img src={bookmark.faviconUrl} alt="" className="w-4 h-4" loading="lazy" />
            ) : (
              <div className="w-4 h-4 bg-border-strong rounded-sm" />
            )}
          </a>
          <div className="min-w-0">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="block text-sm font-medium text-text-primary truncate hover:underline underline-offset-4"
              title={bookmark.title}
            >
              {bookmark.title}
            </a>
            <p className="text-xs text-text-secondary truncate mt-0.5">{domain}</p>
          </div>
        </div>

        {/* Middle: Tags */}
        <div className="hidden sm:flex items-center gap-1.5 w-72 shrink-0">
          {bookmark.tags.length > 0 ? (
            bookmark.tags.slice(0, 3).map((t) => {
              const color = getTagColor(t.tag.name);
              return (
                <span
                  key={t.tag.name}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded whitespace-nowrap"
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
            <span className="text-xs text-text-secondary/50 italic">—</span>
          )}
        </div>

        {/* Right: Remove action */}
        <div className="flex items-center justify-end w-full sm:w-auto shrink-0">
          <button
            onClick={() => setRemoveModalOpen(true)}
            title="Remove from profile"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-muted hover:text-accent-red-text hover:bg-accent-red-bg border border-transparent hover:border-accent-red-bg rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <X size={13} weight="bold" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {removeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setRemoveModalOpen(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm bg-canvas border border-border-strong rounded-xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-200"
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 flex items-center justify-center bg-accent-red-bg rounded-lg mt-0.5">
                  <Warning size={18} weight="fill" className="text-accent-red-text" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-text-primary leading-tight">
                    Remove from profile?
                  </h2>
                  <p className="text-sm text-text-secondary mt-1 leading-snug">
                    <span className="font-medium text-text-primary">&ldquo;{bookmark.title}&rdquo;</span>{" "}
                    will be unpinned. It stays in your bookmark library.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border-strong bg-surface-alt">
              <Button variant="ghost" type="button" onClick={() => setRemoveModalOpen(false)} disabled={removePending}>
                Cancel
              </Button>
              <button
                onClick={handleRemove}
                disabled={removePending}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-accent-red-text bg-accent-red-bg border border-accent-red-text/20 rounded-md hover:brightness-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {removePending ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border-2 border-accent-red-text border-t-transparent animate-spin" />
                    Removing...
                  </span>
                ) : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ProfileDetailClient({ profile, bookmarks, urls }: ProfileDetailClientProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { isSyncing } = useSyncState();
  const activeBookmarks = bookmarks.filter((b) => !b.deletedAt);

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-6 bg-canvas">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/profiles"
            className="shrink-0 p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border-strong rounded-md transition-all"
            aria-label="Back to profiles"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-text-primary tracking-tight truncate">
              {profile.name}
            </h2>
            <p className="text-sm text-text-secondary mt-0.5">
              {activeBookmarks.length} {activeBookmarks.length === 1 ? "bookmark" : "bookmarks"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-primary bg-text-secondary/10 border border-transparent rounded-md hover:bg-text-secondary/20 transition-colors"
          >
            Add existing
          </button>
          <button
            onClick={() => openProfileUrls(urls, activeBookmarks.map((b) => b.id))}
            disabled={activeBookmarks.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-surface border border-border-strong rounded-lg hover:bg-surface-alt transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowSquareOut size={15} weight="bold" />
            Open all
          </button>
        </div>
      </div>

      {/* Bookmark list */}
      <div
        className={`border-t border-border-strong transition-opacity duration-200 ${isSyncing ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
      >
        {activeBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center animate-in fade-in duration-500">
            <h3 className="text-base font-semibold text-text-primary mb-2">No bookmarks in this profile</h3>
            <p className="text-sm text-text-secondary max-w-sm mb-6">
              You haven't added any bookmarks to this profile yet.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setPickerOpen(true)}>
                Add existing
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                Create new
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col bg-canvas">
            {activeBookmarks.map((b) => (
              <ProfileBookmarkRow key={b.id} bookmark={b} profileId={profile.id} />
            ))}
          </div>
        )}
      </div>

      <BookmarkPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        contextType="profile"
        contextId={profile.id}
        initialSelectedIds={activeBookmarks.map((b) => b.id)}
      />

      {createOpen && (
        <BookmarkModal
          isOpen={true}
          onClose={() => setCreateOpen(false)}
          contextType="profile"
          contextId={profile.id}
        />
      )}
    </div>
  );
}
