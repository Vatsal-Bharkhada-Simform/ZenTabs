"use client";

import { useActionState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import { createCollection, updateCollection } from "@/lib/actions/collections";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pass an existing collection to switch to edit mode */
  collection?: { id: number; name: string; description: string | null } | null;
}

export function CreateCollectionModal({ isOpen, onClose, collection }: CreateCollectionModalProps) {
  const action = collection ? updateCollection : createCollection;
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(collection ? "Collection updated" : "Collection created");
      onClose();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onClose, collection]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md text-left bg-canvas border border-border-strong rounded-xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-strong bg-surface-alt">
          <h2 id="collection-modal-title" className="text-base font-semibold text-text-primary">
            {collection ? "Edit Collection" : "New Collection"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form action={formAction} className="p-6 space-y-5">
          {collection && <input type="hidden" name="id" value={collection.id} />}

          <Input
            id="collection-name"
            name="name"
            label="Collection name"
            type="text"
            placeholder="e.g. Design Inspiration, Recipes"
            defaultValue={collection?.name}
            required
          />

          <div className="space-y-1.5">
            <label htmlFor="collection-description" className="block text-sm font-medium text-text-primary">
              Description <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="collection-description"
              name="description"
              placeholder="What goes in here?"
              defaultValue={collection?.description || ""}
              rows={3}
              className="w-full px-3 py-2 text-sm text-text-primary bg-surface border border-border-strong rounded-md placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-shadow resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : collection ? "Save changes" : "Create collection"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
