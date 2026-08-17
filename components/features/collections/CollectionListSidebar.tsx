"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FolderOpen } from "@phosphor-icons/react";
import { CreateCollectionModal } from "./CreateCollectionModal";

interface Collection {
  id: number;
  name: string;
  count: number;
}

interface CollectionListSidebarProps {
  collections: Collection[];
  activeId: number | null;
}

export function CollectionListSidebar({ collections, activeId }: CollectionListSidebarProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col h-full bg-surface-alt border-r border-border-strong w-full md:w-72 shrink-0">
        <div className="flex items-center justify-between px-4 py-4 md:py-6 border-b border-border-strong shrink-0">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-text-primary tracking-tight">
              Collections
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {collections.length} {collections.length === 1 ? "collection" : "collections"}
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border-strong rounded-md transition-all"
            aria-label="New collection"
            title="New collection"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {collections.length === 0 ? (
            <div className="min-h-full text-center py-10 px-4">
              <p className="text-sm text-text-muted mb-4">No collections yet.</p>
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-primary bg-canvas border border-border-strong rounded-md hover:bg-surface transition-colors"
              >
                <Plus size={12} weight="bold" />
                Create one
              </button>
            </div>
          ) : (
            collections.map((collection) => {
              const isActive = collection.id === activeId;

              return (
                <Link
                  key={collection.id}
                  href={`/dashboard/collections?c=${collection.id}`}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors border ${
                    isActive
                      ? "bg-canvas text-text-primary border-border-strong shadow-sm"
                      : "text-text-secondary border-transparent hover:text-text-primary hover:bg-canvas/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FolderOpen size={16} weight={isActive ? "fill" : "regular"} className="shrink-0" />
                    <span className="text-sm font-medium truncate">{collection.name}</span>
                  </div>
                  <span className={`shrink-0 text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                    isActive ? "bg-surface text-text-secondary border border-border-strong" : "text-text-muted"
                  }`}>
                    {collection.count}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <CreateCollectionModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
