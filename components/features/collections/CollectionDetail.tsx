"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, PencilSimple, Trash, Warning, FolderOpen } from "@phosphor-icons/react";
import { deleteCollection } from "@/lib/actions/collections";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { CreateCollectionModal } from "./CreateCollectionModal";
import { BookmarkList } from "@/components/features/dashboard/BookmarkList";
import { BookmarkToolbar } from "@/components/features/dashboard/BookmarkToolbar";
import { BookmarkPickerModal } from "@/components/features/dashboard/BookmarkPickerModal";
import { useRouter } from "next/navigation";

interface CollectionDetailProps {
  collection: {
    id: number;
    name: string;
    description: string | null;
  };
  bookmarks: any[]; // Matches the shape BookmarkList expects
  allProfiles: any[];
  allCollections: any[];
}

export function CollectionDetail({ collection, bookmarks, allProfiles, allCollections }: CollectionDetailProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePending, startDelete] = useTransition();

  const handleDelete = () => {
    startDelete(async () => {
      const res = await deleteCollection(collection.id);
      setDeleteModalOpen(false);
      if (res.success) {
        toast.success("Collection deleted");
        router.push("/dashboard/collections"); // Drop the ?c param
      } else {
        toast.error(res.error || "Failed to delete collection");
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-canvas min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 px-4 md:px-8 py-4 md:py-6 shrink-0">
        <div className="flex items-start gap-3 min-w-0">
          <Link
            href="/dashboard/collections"
            className="md:hidden shrink-0 mt-0.5 p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border-strong rounded-md transition-all"
            aria-label="Back to collections"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-text-primary tracking-tight truncate">
              {collection.name}
            </h2>
            {collection.description && (
              <p className="text-sm text-text-secondary mt-1 max-w-2xl">
                {collection.description}
              </p>
            )}
            <p className="text-xs text-text-muted mt-2 font-mono">
              {bookmarks.length} {bookmarks.length === 1 ? "bookmark" : "bookmarks"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-primary bg-text-secondary/10 border border-transparent rounded-md hover:bg-text-secondary/20 transition-colors"
          >
            Add existing
          </button>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary bg-surface border border-border-strong rounded-md hover:text-text-primary hover:bg-surface-alt transition-colors"
          >
            <PencilSimple size={14} />
            Edit
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-red-text bg-accent-red-bg border border-accent-red-bg rounded-md hover:brightness-95 transition-all"
          >
            <Trash size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Toolbar for sorting/searching within the collection */}
      <BookmarkToolbar />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <BookmarkList
          bookmarks={bookmarks}
          profiles={allProfiles}
          collections={allCollections}
          contextType="collection"
          contextId={collection.id}
          onAddExisting={() => setPickerOpen(true)}
        />
      </div>

      {/* Picker Modal */}
      <BookmarkPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        contextType="collection"
        contextId={collection.id}
        initialSelectedIds={bookmarks.map(b => b.id)}
      />

      {/* Edit Modal */}
      {editOpen && (
        <CreateCollectionModal
          isOpen={true}
          onClose={() => setEditOpen(false)}
          collection={collection}
        />
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteModalOpen(false); }}
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
                    Delete collection?
                  </h2>
                  <p className="text-sm text-text-secondary mt-1 leading-snug">
                    <span className="font-medium text-text-primary">&ldquo;{collection.name}&rdquo;</span>{" "}
                    will be deleted. Your bookmarks inside it will not be deleted.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border-strong bg-surface-alt">
              <Button variant="ghost" type="button" onClick={() => setDeleteModalOpen(false)} disabled={deletePending}>
                Cancel
              </Button>
              <button
                onClick={handleDelete}
                disabled={deletePending}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-accent-red-text bg-accent-red-bg border border-accent-red-bg rounded-md hover:brightness-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {deletePending ? "Deleting..." : "Delete collection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CollectionDetailEmpty() {
  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center h-full bg-canvas text-center p-8">
      <div className="w-16 h-16 flex items-center justify-center bg-surface-alt border border-border-strong rounded-2xl mb-6">
        <FolderOpen size={28} className="text-text-secondary" weight="duotone" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-2">No collection selected</h3>
      <p className="text-sm text-text-secondary max-w-sm">
        Select a collection from the sidebar to view its bookmarks, or create a new one.
      </p>
    </div>
  );
}
