"use client";

import { BookmarkRow } from "./BookmarkRow";
import { BookmarkSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { BookmarkModal } from "./BookmarkModal";
import { useSyncState } from "./SyncContext";

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

interface BookmarkListProps {
  bookmarks: any[];
  collections?: Collection[];
  profiles?: Profile[];
  contextType?: "profile" | "collection";
  contextId?: number;
  onAddExisting?: () => void;
  allTags?: { id: number; name: string }[];
}

export function BookmarkList({
  bookmarks,
  profiles = [],
  collections = [],
  contextType,
  contextId,
  onAddExisting,
  allTags = [],
}: BookmarkListProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { isSyncing } = useSyncState();

  return (
    <div
      className={`border-t border-border-strong transition-opacity duration-200 ${
        isSyncing ? "opacity-60 pointer-events-none" : "opacity-100"
      }`}
    >
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 flex items-center justify-center bg-surface-alt border border-border-strong rounded-2xl mb-6">
            <BookmarkSimple size={28} className="text-text-secondary" weight="duotone" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-2">No bookmarks found</h3>
          <p className="text-sm text-text-secondary max-w-sm mb-6">
            You haven&apos;t saved any bookmarks here yet, or none match your current search criteria.
          </p>
          <div className="flex gap-3 mt-4">
            {onAddExisting && (
              <Button variant="secondary" onClick={onAddExisting}>
                Add existing
              </Button>
            )}
            <Button onClick={() => setAddModalOpen(true)}>
              {onAddExisting ? "Create new" : "Add your first bookmark"}
            </Button>
          </div>

          {addModalOpen && (
            <BookmarkModal
              isOpen={true}
              onClose={() => setAddModalOpen(false)}
              contextType={contextType}
              contextId={contextId}
              allTags={allTags}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col bg-canvas">
          {bookmarks.map((b) => (
            <BookmarkRow key={b.id} bookmark={b} profiles={profiles} collections={collections} allTags={allTags} />
          ))}
        </div>
      )}
    </div>
  );
}
