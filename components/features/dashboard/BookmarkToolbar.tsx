"use client";

import { useTransition, useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MagnifyingGlass, SortAscending, Tag, X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/Input";

export function BookmarkToolbar({ activeTag = "" }: { activeTag?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialSearch = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const currentSort = searchParams.get("sort") || "date-desc";

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm === (searchParams.get("q") || "")) return;
      
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }
      
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]);

  const clearTag = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("tag");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Handle Sort
  const handleSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams);
    if (sortValue !== "date-desc") {
      params.set("sort", sortValue);
    } else {
      params.delete("sort");
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
    setSortOpen(false);
  };

  // Close sort menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortOptions = [
    { value: "date-desc", label: "Date Added (Newest)" },
    { value: "date-asc", label: "Date Added (Oldest)" },
    { value: "name-asc", label: "Title (A-Z)" },
    { value: "visits-desc", label: "Most Visited" },
  ];

  return (
    <div className="sticky top-16 z-30 flex flex-wrap items-center gap-2 py-3 px-4 md:px-8 bg-canvas/80 backdrop-blur-md border-b border-border-strong">
      <div className="relative flex-1 max-w-md min-w-40">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlass size={18} className="text-text-secondary" />
        </div>
        <input
          type="text"
          placeholder="Search bookmarks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-1.5 text-sm bg-surface-alt border border-border-strong rounded-md text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-border-strong focus:bg-canvas transition-colors"
        />
        {isPending && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="w-3 h-3 rounded-full border-2 border-text-secondary border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* Active tag filter pill */}
      {activeTag && (
        <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium text-text-primary bg-surface-alt border border-border-strong rounded-full whitespace-nowrap">
          <Tag size={10} weight="bold" className="text-text-secondary" />
          {activeTag}
          <button
            onClick={clearTag}
            className="ml-0.5 p-0.5 rounded-full text-text-muted hover:text-text-primary hover:bg-border-strong transition-colors"
            aria-label="Clear tag filter"
          >
            <X size={10} weight="bold" />
          </button>
        </span>
      )}

      <div className="relative ml-auto" ref={sortRef}>
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary bg-surface-alt border border-border-strong rounded-md hover:text-text-primary hover:bg-surface transition-colors focus:outline-none"
        >
          <SortAscending size={16} />
          <span className="hidden sm:inline">Sort</span>
        </button>

        {sortOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-canvas border border-border-strong rounded-lg shadow-sm overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-100">
            <div className="p-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${
                    currentSort === opt.value
                      ? "bg-surface text-text-primary font-medium"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
