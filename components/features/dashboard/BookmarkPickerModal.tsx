"use client";

import { useState, useEffect, useTransition } from "react";
import { X, MagnifyingGlass, Check } from "@phosphor-icons/react";
import { getSimpleLibrary, syncContextBookmarks } from "@/lib/actions/bookmarks";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import Image from "next/image";

interface BookmarkPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextType: "profile" | "collection";
  contextId: number;
  initialSelectedIds: number[];
}

export function BookmarkPickerModal({
  isOpen,
  onClose,
  contextType,
  contextId,
  initialSelectedIds,
}: BookmarkPickerModalProps) {
  const [library, setLibrary] = useState<{ id: number; title: string; url: string; faviconUrl: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(initialSelectedIds));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(initialSelectedIds));
      setLoading(true);
      getSimpleLibrary().then((res) => {
        if (res.success && res.bookmarks) {
          setLibrary(res.bookmarks);
        }
        setLoading(false);
      });
    }
  }, [isOpen, initialSelectedIds]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLibrary = library.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.url.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await syncContextBookmarks(contextType, contextId, Array.from(selectedIds));
      if (res.success) {
        toast.success("Bookmarks updated");
        onClose();
      } else {
        toast.error(res.error || "Failed to update bookmarks");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl text-left bg-canvas border border-border-strong rounded-xl overflow-hidden shadow-sm flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
      >
        {/* Header */}
        <div className="flex flex-col gap-3 px-4 py-4 border-b border-border-strong bg-surface-alt shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="picker-title" className="text-base font-semibold text-text-primary">
                Add existing bookmarks
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Select bookmarks from your library to add to this {contextType}.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-canvas border border-border-strong rounded-md text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-text-muted transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-text-muted animate-pulse">Loading library...</div>
            </div>
          ) : filteredLibrary.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-text-muted">
              No bookmarks found.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLibrary.map((b) => {
                const isSelected = selectedIds.has(b.id);
                return (
                  <button
                    key={b.id}
                    onClick={() => toggleSelection(b.id)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {b.faviconUrl ? (
                        <Image
                          src={b.faviconUrl}
                          alt=""
                          width={16}
                          height={16}
                          className="w-4 h-4 rounded-sm shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="w-4 h-4 bg-border-strong rounded-sm shrink-0" />
                      )}
                      <div className="min-w-0 flex flex-col">
                        <span className="text-sm font-medium text-text-primary truncate">{b.title}</span>
                        <span className="text-xs text-text-muted truncate">{b.url}</span>
                      </div>
                    </div>
                    <div
                      className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected
                          ? "bg-text-primary border-text-primary text-canvas"
                          : "bg-canvas border-border-strong text-transparent group-hover:border-text-muted"
                      }`}
                    >
                      <Check size={12} weight="bold" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-strong bg-surface-alt shrink-0">
          <span className="text-sm font-medium text-text-secondary">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending || loading}>
              {isPending ? "Saving..." : "Save Selection"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
