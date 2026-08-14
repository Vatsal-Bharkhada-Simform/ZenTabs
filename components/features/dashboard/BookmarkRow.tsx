"use client";

import { useState, useRef, useEffect } from "react";
import { DotsThree, PencilSimple, Trash } from "@phosphor-icons/react";
import { deleteBookmark } from "@/lib/actions/bookmarks";
import { toast } from "sonner";
import { BookmarkModal } from "./BookmarkModal";

interface BookmarkRowProps {
  bookmark: {
    id: number;
    url: string;
    title: string;
    description: string | null;
    faviconUrl: string | null;
    visitCount: number;
    createdAt: Date;
    tags: { tag: { name: string } }[];
  };
}

export function BookmarkRow({ bookmark }: BookmarkRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${bookmark.title}"?`)) return;
    setMenuOpen(false);
    
    const res = await deleteBookmark(bookmark.id);
    if (res.success) {
      toast.success("Bookmark deleted");
    } else {
      toast.error(res.error || "Failed to delete bookmark");
    }
  };

  const domain = new URL(bookmark.url).hostname.replace(/^www\./, "");
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(bookmark.createdAt));

  return (
    <>
      <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 py-3 px-4 md:px-8 border-b border-border-strong hover:bg-surface-alt transition-colors">
        
        {/* Left: Favicon & Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
          <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-surface border border-border-strong rounded-md overflow-hidden">
            {bookmark.faviconUrl ? (
              <img src={bookmark.faviconUrl} alt="" className="w-4 h-4" loading="lazy" />
            ) : (
              <div className="w-4 h-4 bg-border-strong rounded-sm" />
            )}
          </div>
          <div className="min-w-0">
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm font-medium text-text-primary truncate hover:underline underline-offset-4"
              title={bookmark.title}
            >
              {bookmark.title}
            </a>
            <p className="text-xs text-text-secondary truncate mt-0.5">
              {domain}
            </p>
          </div>
        </div>

        {/* Middle: Tags (Desktop mainly) */}
        <div className="hidden sm:flex items-center gap-1.5 w-48 shrink-0 overflow-x-auto no-scrollbar">
          {bookmark.tags.length > 0 ? (
            bookmark.tags.slice(0, 3).map((t) => (
              <span key={t.tag.name} className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary bg-surface border border-border-strong rounded-sm whitespace-nowrap">
                {t.tag.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-text-secondary/50 italic">—</span>
          )}
        </div>

        {/* Right: Meta & Actions */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0">
          <div className="flex items-center gap-4 text-xs text-text-secondary font-mono">
            <span title="Visits">{bookmark.visitCount} views</span>
            <span className="hidden sm:inline">{formattedDate}</span>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border-strong rounded-md transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
              aria-label="Bookmark actions"
            >
              <DotsThree size={18} weight="bold" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-canvas border border-border-strong rounded-lg shadow-sm z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-1 flex flex-col">
                  <button
                    onClick={() => {
                      setEditModalOpen(true);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-text-secondary rounded hover:text-text-primary hover:bg-surface transition-colors text-left"
                  >
                    <PencilSimple size={14} />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 rounded hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                  >
                    <Trash size={14} />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {editModalOpen && (
        <BookmarkModal 
          isOpen={true} 
          onClose={() => setEditModalOpen(false)} 
          bookmark={bookmark} 
        />
      )}
    </>
  );
}
