"use client";

import { BookmarkRow } from "./BookmarkRow";
import { BookmarkSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { BookmarkModal } from "./BookmarkModal";

interface BookmarkListProps {
  bookmarks: any[]; // Defined broadly here for simplicity, typically inferred from Prisma
}

export function BookmarkList({ bookmarks }: BookmarkListProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 flex items-center justify-center bg-surface-alt border border-border-strong rounded-2xl mb-6">
          <BookmarkSimple size={28} className="text-text-secondary" weight="duotone" />
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-2">No bookmarks found</h3>
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          You haven't saved any bookmarks here yet, or none match your current search criteria.
        </p>
        <Button onClick={() => setAddModalOpen(true)}>
          Add your first bookmark
        </Button>

        {addModalOpen && (
          <BookmarkModal isOpen={true} onClose={() => setAddModalOpen(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col border-t border-border-strong bg-canvas">
      {bookmarks.map((b) => (
        <BookmarkRow key={b.id} bookmark={b} />
      ))}
    </div>
  );
}
