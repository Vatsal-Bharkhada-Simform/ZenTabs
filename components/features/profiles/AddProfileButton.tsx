"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { CreateProfileModal } from "./CreateProfileModal";

export function AddProfileButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-primary bg-surface border border-border-strong rounded-md hover:bg-surface-alt transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <Plus size={14} weight="bold" />
        New profile
      </button>

      <CreateProfileModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
