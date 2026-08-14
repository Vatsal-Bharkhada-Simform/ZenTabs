"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { BookmarkModal } from "./BookmarkModal";

export function AddBookmarkButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus size={16} weight="bold" />
        <span className="hidden sm:inline">Add Bookmark</span>
        <span className="sm:hidden">Add</span>
      </Button>
      
      {isOpen && (
        <BookmarkModal isOpen={true} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
