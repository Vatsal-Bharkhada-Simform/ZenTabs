"use client";

import { TrashRow } from "./TrashRow";
import { Trash } from "@phosphor-icons/react";
import Link from "next/link";

interface TrashListProps {
  bookmarks: {
    id: number;
    url: string;
    title: string;
    description: string | null;
    faviconUrl: string | null;
    deletedAt: Date;
    tags: { tag: { name: string } }[];
  }[];
}

export function TrashList({ bookmarks }: TrashListProps) {
  return (
    // Outer wrapper always renders the border-t so it never flickers during
    // the empty-state fade-in animation (opacity:0 on the inner content
    // would still cause a visible border flash if border were on the animated element).
    <div className="border-t border-border-strong">
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 flex items-center justify-center bg-surface-alt border border-border-strong rounded-2xl mb-6">
            <Trash size={28} className="text-text-muted" weight="duotone" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-2">
            Your trash is empty
          </h3>
          <p className="text-sm text-text-secondary max-w-sm mb-6">
            Deleted bookmarks will appear here. They stay for 60 days before being permanently removed.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-primary bg-surface border border-border-strong rounded-md hover:bg-surface-alt transition-colors"
          >
            Back to bookmarks
          </Link>
        </div>
      ) : (
        <div className="flex flex-col bg-canvas">
          {bookmarks.map((b) => (
            <TrashRow key={b.id} bookmark={b} />
          ))}
        </div>
      )}
    </div>
  );
}
