"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
  DotsThree,
  PencilSimple,
  Trash,
  Warning,
  BookmarkSimple,
  Check,
  Tag,
  Plus,
  X,
} from "@phosphor-icons/react";
import { deleteBookmark } from "@/lib/actions/bookmarks";
import { addBookmarkToProfile, removeBookmarkFromProfile } from "@/lib/actions/profiles";
import { addBookmarkToCollection, removeBookmarkFromCollection } from "@/lib/actions/collections";
import { addTagToBookmark } from "@/lib/actions/tags";
import { getTagColor } from "@/lib/tagColor";
import { toast } from "sonner";
import { BookmarkModal } from "./BookmarkModal";
import { Button } from "@/components/ui/Button";
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

interface TagItem {
  id: number;
  name: string;
}

interface BookmarkRowProps {
  bookmark: {
    id: number;
    url: string;
    title: string;
    description: string | null;
    faviconUrl: string | null;
    visitCount: number;
    createdAt: Date;
    tags: { tag: { id: number; name: string } }[];
  };
  profiles?: Profile[];
  collections?: Collection[];
  allTags?: TagItem[];
}

export function BookmarkRow({ bookmark, profiles = [], collections = [], allTags = [] }: BookmarkRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [collectionMenuOpen, setCollectionMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagHighlightIndex, setTagHighlightIndex] = useState<number>(-1);
  const [localVisits, setLocalVisits] = useState(bookmark.visitCount);
  const [deletePending, startDelete] = useTransition();
  const [profilePending, startProfile] = useTransition();
  const [tagPending, startTag] = useTransition();
  const { startSync } = useSyncState();

  useEffect(() => {
    setLocalVisits(bookmark.visitCount);
  }, [bookmark.visitCount]);

  const handleLinkClick = () => {
    setLocalVisits((prev) => prev + 1);
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookmarkId: bookmark.id }),
      keepalive: true,
    }).catch(console.error);
  };
  const menuRef = useRef<HTMLDivElement>(null);
  const tagPopoverRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setProfileMenuOpen(false);
        setCollectionMenuOpen(false);
      }
      if (tagPopoverRef.current && !tagPopoverRef.current.contains(event.target as Node)) {
        setTagPopoverOpen(false);
        setTagInput("");
        setTagHighlightIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close delete modal on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeleteModalOpen(false);
    };
    if (deleteModalOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [deleteModalOpen]);

  const handleDelete = () => {
    startDelete(async () => {
      await startSync(async () => {
        const res = await deleteBookmark(bookmark.id);
        setDeleteModalOpen(false);
        if (res.success) {
          toast.success("Bookmark deleted");
        } else {
          toast.error(res.error || "Failed to delete bookmark");
        }
      });
    });
  };

  const handleToggleProfile = (profile: Profile) => {
    const alreadyIn = profile.bookmarkIds.includes(bookmark.id);
    startProfile(async () => {
      await startSync(async () => {
        const res = alreadyIn
          ? await removeBookmarkFromProfile(profile.id, bookmark.id)
          : await addBookmarkToProfile(profile.id, bookmark.id);

        if (res.success) {
          toast.success(alreadyIn ? `Removed from "${profile.name}"` : `Added to "${profile.name}"`);
        } else {
          toast.error(res.error || "Failed to update profile");
        }
      });
    });
  };

  const handleToggleCollection = (collection: Collection) => {
    const alreadyIn = collection.bookmarkIds.includes(bookmark.id);
    startProfile(async () => {
      await startSync(async () => {
        const res = alreadyIn
          ? await removeBookmarkFromCollection(collection.id, bookmark.id)
          : await addBookmarkToCollection(collection.id, bookmark.id);

        if (res.success) {
          toast.success(alreadyIn ? `Removed from "${collection.name}"` : `Added to "${collection.name}"`);
        } else {
          toast.error(res.error || "Failed to update collection");
        }
      });
    });
  };

  const filteredInlineSuggestions = allTags
    .filter(
      (t) =>
        tagInput.trim().length > 0 &&
        t.name.includes(tagInput.toLowerCase().trim()) &&
        !bookmark.tags.find((bt) => bt.tag.name === t.name)
    )
    .slice(0, 4);

  const handleAddTagInline = (name: string) => {
    const normalized = name.trim().toLowerCase().replace(/,/g, "");
    if (!normalized) return;
    const alreadyHas = bookmark.tags.find((bt) => bt.tag.name === normalized);
    if (alreadyHas) {
      setTagInput("");
      setTagHighlightIndex(-1);
      return;
    }
    startTag(async () => {
      await startSync(async () => {
        const res = await addTagToBookmark(bookmark.id, normalized);
        if (res.success) {
          toast.success(`Tag "${normalized}" added`);
          setTagInput("");
          setTagPopoverOpen(false);
          setTagHighlightIndex(-1);
        } else {
          toast.error(res.error || "Failed to add tag");
        }
      });
    });
  };

  const handleInlineTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredInlineSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setTagHighlightIndex((prev) => (prev + 1) % filteredInlineSuggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setTagHighlightIndex((prev) =>
          prev <= 0 ? filteredInlineSuggestions.length - 1 : prev - 1
        );
        return;
      }
    }

    if (e.key === "Enter" || e.key === "," || (e.key === "Tab" && tagHighlightIndex >= 0)) {
      e.preventDefault();
      if (tagHighlightIndex >= 0 && tagHighlightIndex < filteredInlineSuggestions.length) {
        handleAddTagInline(filteredInlineSuggestions[tagHighlightIndex].name);
      } else if (tagInput.trim()) {
        handleAddTagInline(tagInput);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTagPopoverOpen(false);
      setTagInput("");
      setTagHighlightIndex(-1);
    }
  };

  const domain = new URL(bookmark.url).hostname.replace(/^www\./, "");
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(bookmark.createdAt));

  return (
    <>
      <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 py-3 px-4 md:px-8 border-b border-border-strong hover:bg-surface-alt transition-colors">

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

        {/* Middle: Tags (Desktop) — no overflow so popover can escape */}
        <div className="hidden sm:flex items-center gap-1.5 w-72 shrink-0">
          {bookmark.tags.slice(0, 3).map((t) => {
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
          })}

          {/* Inline + tag chip — sits at same flex level, outside any overflow container */}
          <div className="relative" ref={tagPopoverRef}>
            <button
              type="button"
              onClick={() => {
                setTagPopoverOpen((prev) => !prev);
                setTagHighlightIndex(-1);
                setTimeout(() => tagInputRef.current?.focus(), 50);
              }}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-text-muted hover:text-text-secondary hover:bg-surface border border-dashed border-border-strong rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Add tag"
            >
              <Plus size={9} weight="bold" />
              tag
            </button>

            {tagPopoverOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-50 w-48 bg-canvas border border-border-strong rounded-lg shadow-sm animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2">
                  <input
                    ref={tagInputRef}
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={filteredInlineSuggestions.length > 0}
                    aria-controls={`inline-tag-list-${bookmark.id}`}
                    aria-activedescendant={
                      tagHighlightIndex >= 0 && filteredInlineSuggestions[tagHighlightIndex]
                        ? `inline-tag-opt-${bookmark.id}-${filteredInlineSuggestions[tagHighlightIndex].id}`
                        : undefined
                    }
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setTagHighlightIndex(-1);
                    }}
                    onKeyDown={handleInlineTagKeyDown}
                    placeholder="tag name..."
                    disabled={tagPending}
                    className="w-full px-2 py-1.5 text-xs bg-surface border border-border-strong rounded text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-border-focus disabled:opacity-50"
                  />
                  {/* Suggestions */}
                  {filteredInlineSuggestions.length > 0 && (
                    <div
                      id={`inline-tag-list-${bookmark.id}`}
                      role="listbox"
                      aria-label="Tag suggestions"
                      className="mt-1 flex flex-col gap-0.5"
                    >
                      {filteredInlineSuggestions.map((t, idx) => {
                        const color = getTagColor(t.name);
                        const isHighlighted = idx === tagHighlightIndex;
                        return (
                          <button
                            key={t.id}
                            id={`inline-tag-opt-${bookmark.id}-${t.id}`}
                            role="option"
                            aria-selected={isHighlighted}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleAddTagInline(t.name);
                            }}
                            className={`flex items-center justify-between gap-1.5 px-2 py-1 text-xs rounded transition-all text-left ${isHighlighted
                                ? "bg-surface text-text-primary font-semibold ring-1 ring-border-focus shadow-xs"
                                : "text-text-secondary hover:text-text-primary hover:bg-surface-alt/70"
                              }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: color.text }}
                              />
                              <span className="truncate">{t.name}</span>
                            </div>
                            {isHighlighted && (
                              <span className="text-[9px] font-mono text-text-muted shrink-0">↵</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Meta & Actions */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0">
          <div className="flex items-center gap-4 text-xs text-text-secondary font-mono">
            <span title="Visits">{localVisits} {localVisits === 1 ? "view" : "views"}</span>
            <span className="hidden sm:inline">{formattedDate}</span>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                setMenuOpen(!menuOpen);
                setProfileMenuOpen(false);
                setCollectionMenuOpen(false);
              }}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border-strong rounded-md transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
              aria-label="Bookmark actions"
            >
              <DotsThree size={18} weight="bold" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-canvas border border-border-strong rounded-lg shadow-sm z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-1 flex flex-col">
                  <button
                    onClick={() => { setEditModalOpen(true); setMenuOpen(false); }}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-text-secondary rounded hover:text-text-primary hover:bg-surface-alt transition-colors text-left"
                  >
                    <PencilSimple size={14} />
                    Edit
                  </button>

                  {/* Add to Profile submenu trigger */}
                  {profiles.length > 0 && (
                    <button
                      onClick={() => {
                        setProfileMenuOpen(!profileMenuOpen);
                        setCollectionMenuOpen(false);
                      }}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm text-text-secondary rounded hover:text-text-primary hover:bg-surface-alt transition-colors text-left w-full"
                    >
                      <span className="flex items-center gap-2">
                        <BookmarkSimple size={14} />
                        Add to profile
                      </span>
                      <span className="text-text-muted text-xs">›</span>
                    </button>
                  )}

                  {/* Add to Collection submenu trigger */}
                  {collections.length > 0 && (
                    <button
                      onClick={() => {
                        setCollectionMenuOpen(!collectionMenuOpen);
                        setProfileMenuOpen(false);
                      }}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm text-text-secondary rounded hover:text-text-primary hover:bg-surface-alt transition-colors text-left w-full"
                    >
                      <span className="flex items-center gap-2">
                        <BookmarkSimple size={14} weight="duotone" />
                        Add to collection
                      </span>
                      <span className="text-text-muted text-xs">›</span>
                    </button>
                  )}

                  <div className="my-1 h-px bg-border-strong" />

                  <button
                    onClick={() => { setDeleteModalOpen(true); setMenuOpen(false); }}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-accent-red-text rounded hover:bg-accent-red-bg transition-colors text-left"
                  >
                    <Trash size={14} />
                    Delete
                  </button>
                </div>

                {/* Profile submenu */}
                {profileMenuOpen && profiles.length > 0 && (
                  <div className="absolute right-full top-0 mr-1 w-44 bg-canvas border border-border-strong rounded-lg shadow-sm z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1 flex flex-col">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                        Profiles
                      </p>
                      {profiles.map((profile) => {
                        const isIn = profile.bookmarkIds.includes(bookmark.id);
                        return (
                          <button
                            key={profile.id}
                            onClick={() => handleToggleProfile(profile)}
                            disabled={profilePending}
                            className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm text-text-secondary rounded hover:text-text-primary hover:bg-surface-alt transition-colors text-left w-full disabled:opacity-50"
                          >
                            <span className="truncate">{profile.name}</span>
                            {isIn && <Check size={13} weight="bold" className="shrink-0 text-text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Collection submenu */}
                {collectionMenuOpen && collections.length > 0 && (
                  <div className="absolute right-full top-0 mr-1 w-44 bg-canvas border border-border-strong rounded-lg shadow-sm z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1 flex flex-col">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                        Collections
                      </p>
                      {collections.map((collection) => {
                        const isIn = collection.bookmarkIds.includes(bookmark.id);
                        return (
                          <button
                            key={collection.id}
                            onClick={() => handleToggleCollection(collection)}
                            disabled={profilePending}
                            className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm text-text-secondary rounded hover:text-text-primary hover:bg-surface-alt transition-colors text-left w-full disabled:opacity-50"
                          >
                            <span className="truncate">{collection.name}</span>
                            {isIn && <Check size={13} weight="bold" className="shrink-0 text-text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <BookmarkModal
          isOpen={true}
          onClose={() => setEditModalOpen(false)}
          bookmark={bookmark}
          allTags={allTags}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteModalOpen(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-bookmark-title"
            className="w-full max-w-sm bg-canvas border border-border-strong rounded-xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-200"
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 flex items-center justify-center bg-accent-red-bg rounded-lg mt-0.5">
                  <Warning size={18} weight="fill" className="text-accent-red-text" />
                </div>
                <div>
                  <h2 id="delete-bookmark-title" className="text-base font-semibold text-text-primary leading-tight">
                    Delete bookmark?
                  </h2>
                  <p className="text-sm text-text-secondary mt-1 leading-snug">
                    <span className="font-medium text-text-primary">&ldquo;{bookmark.title}&rdquo;</span>{" "}
                    will be moved to Trash. You can restore it within 60 days.
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
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-accent-red-text bg-accent-red-bg border border-accent-red-text/20 rounded-md hover:brightness-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {deletePending ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border-2 border-accent-red-text border-t-transparent animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  <><Trash size={14} weight="bold" /> Move to Trash</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
