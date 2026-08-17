"use client";

import { useActionState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import { createBookmark, updateBookmark } from "@/lib/actions/bookmarks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark?: {
    id: number;
    url: string;
    title: string;
    description: string | null;
  } | null;
  contextType?: "profile" | "collection";
  contextId?: number;
}

export function BookmarkModal({ isOpen, onClose, bookmark, contextType, contextId }: BookmarkModalProps) {
  // Use update action if bookmark exists, otherwise create
  const action = bookmark ? updateBookmark : createBookmark;
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(bookmark ? "Bookmark updated" : "Bookmark added");
      onClose();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onClose, bookmark]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md text-left bg-canvas border border-border-strong rounded-xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-strong bg-surface-alt">
          <h2 id="modal-title" className="text-base font-semibold text-text-primary">
            {bookmark ? "Edit Bookmark" : "Add Bookmark"}
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
          {bookmark && <input type="hidden" name="id" value={bookmark.id} />}
          {contextType && <input type="hidden" name="contextType" value={contextType} />}
          {contextId && <input type="hidden" name="contextId" value={contextId} />}
          
          <Input 
            id="url"
            name="url"
            label="URL"
            type="url"
            placeholder="https://example.com"
            defaultValue={bookmark?.url}
            required
          />

          <Input 
            id="title"
            name="title"
            label="Title (optional)"
            type="text"
            placeholder="Example Website"
            defaultValue={bookmark?.title}
          />

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-text-primary">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="A short note about this link..."
              defaultValue={bookmark?.description || ""}
              className="block w-full px-3 py-2 text-sm bg-surface border border-border-strong rounded-md text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-border-strong focus:border-border-strong transition-shadow resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Bookmark"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
