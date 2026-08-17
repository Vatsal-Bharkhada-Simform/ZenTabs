"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { X, Tag } from "@phosphor-icons/react";
import { createBookmark, updateBookmark } from "@/lib/actions/bookmarks";
import { addTagToBookmark, removeTagFromBookmark } from "@/lib/actions/tags";
import { getTagColor } from "@/lib/tagColor";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSyncState } from "./SyncContext";
import { toast } from "sonner";

interface TagItem {
  id: number;
  name: string;
}

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark?: {
    id: number;
    url: string;
    title: string;
    description: string | null;
    tags?: { tag: { id: number; name: string } }[];
  } | null;
  contextType?: "profile" | "collection";
  contextId?: number;
  /** All tags in the system for autocomplete */
  allTags?: TagItem[];
}

export function BookmarkModal({
  isOpen,
  onClose,
  bookmark,
  contextType,
  contextId,
  allTags = [],
}: BookmarkModalProps) {
  const initialTags: TagItem[] = bookmark?.tags?.map((bt) => bt.tag) ?? [];

  const [selectedTags, setSelectedTags] = useState<TagItem[]>(initialTags);
  const [tagInput, setTagInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { startSync } = useSyncState();
  const tagInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset state when the modal opens/closes or the bookmark changes
  useEffect(() => {
    setSelectedTags(bookmark?.tags?.map((bt) => bt.tag) ?? []);
    setTagInput("");
    setShowSuggestions(false);
  }, [bookmark, isOpen]);

  // Escape to close / Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        tagInputRef.current &&
        !tagInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = allTags.filter(
    (t) =>
      tagInput.trim().length > 0 &&
      t.name.includes(tagInput.toLowerCase().trim()) &&
      !selectedTags.find((s) => s.id === t.id)
  );

  const addTag = useCallback(
    (name: string) => {
      const normalized = name.trim().toLowerCase().replace(/,/g, "");
      if (!normalized || normalized.length > 32) return;
      if (selectedTags.find((t) => t.name === normalized)) return;

      const existing = allTags.find((t) => t.name === normalized);
      setSelectedTags((prev) => [
        ...prev,
        existing ?? { id: -Date.now(), name: normalized },
      ]);
      setTagInput("");
      setShowSuggestions(false);
    },
    [selectedTags, allTags]
  );

  const removeTag = (name: string) => {
    setSelectedTags((prev) => prev.filter((t) => t.name !== name));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInput.trim()) addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && selectedTags.length > 0) {
      setSelectedTags((prev) => prev.slice(0, -1));
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      await startSync(async () => {
        const action = bookmark ? updateBookmark : createBookmark;
        const result = await action(null, formData);

        if (!result?.success) {
          toast.error(result?.error || "Failed to save bookmark");
          return;
        }

        toast.success(bookmark ? "Bookmark updated" : "Bookmark added");
        onClose();
      });
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
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

        <form ref={formRef} onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {bookmark && <input type="hidden" name="id" value={bookmark.id} />}
          {bookmark && <input type="hidden" name="syncTags" value="true" />}
          {contextType && <input type="hidden" name="contextType" value={contextType} />}
          {contextId && <input type="hidden" name="contextId" value={contextId} />}
          {/* Pass tag names */}
          {selectedTags.map((t) => (
            <input key={t.name} type="hidden" name="tags" value={t.name} />
          ))}

          <Input
            id="bm-url"
            name="url"
            label="URL"
            type="url"
            placeholder="https://example.com"
            defaultValue={bookmark?.url}
            required
          />

          <Input
            id="bm-title"
            name="title"
            label="Title (optional)"
            type="text"
            placeholder="Example Website"
            defaultValue={bookmark?.title}
          />

          <div className="space-y-1.5">
            <label htmlFor="bm-description" className="block text-sm font-medium text-text-primary">
              Description{" "}
              <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="bm-description"
              name="description"
              rows={2}
              placeholder="A short note about this link..."
              defaultValue={bookmark?.description || ""}
              className="block w-full px-3 py-2 text-sm bg-surface border border-border-strong rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-shadow resize-none"
            />
          </div>

          {/* ── Tag input ── */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">
              Tags{" "}
              <span className="text-text-muted font-normal">(optional)</span>
            </label>

            <div
              className="relative flex flex-wrap items-center gap-1.5 min-h-[38px] px-2.5 py-2 bg-surface border border-border-strong rounded-md focus-within:ring-2 focus-within:ring-border-focus focus-within:border-transparent transition-shadow cursor-text"
              onClick={() => tagInputRef.current?.focus()}
            >
              {selectedTags.map((tag) => {
                const color = getTagColor(tag.name);
                return (
                  <span
                    key={tag.name}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded"
                    style={{
                      backgroundColor: color.bg,
                      color: color.text,
                      border: `1px solid ${color.border}`,
                    }}
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTag(tag.name);
                      }}
                      className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                      aria-label={`Remove tag ${tag.name}`}
                    >
                      <X size={9} weight="bold" />
                    </button>
                  </span>
                );
              })}

              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleTagKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder={selectedTags.length === 0 ? "Add tags..." : ""}
                className="flex-1 min-w-[80px] text-sm bg-transparent text-text-primary placeholder:text-text-muted outline-none"
                aria-label="Add tag"
              />
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="bg-canvas border border-border-strong rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="p-1 flex flex-col max-h-32 overflow-y-auto">
                  {filteredSuggestions.slice(0, 6).map((tag) => {
                    const color = getTagColor(tag.name);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addTag(tag.name);
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-text-secondary rounded hover:text-text-primary hover:bg-surface-alt transition-colors text-left"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color.text }}
                        />
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-[11px] text-text-muted">
              Enter or comma to add a tag · Backspace to remove last · Ctrl+Enter to save
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
