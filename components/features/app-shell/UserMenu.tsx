"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SignOut, Gear } from "@phosphor-icons/react";
import { signOut, useSession } from "next-auth/react";

export function UserMenu() {
  const { data: session } = useSession();
  const user = session?.user;

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "??";

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-alt border border-border-strong text-xs font-mono font-medium text-text-primary hover:bg-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas overflow-hidden"
      >
        {user?.image ? (
          <img src={user.image} alt={user.name || "Avatar"} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-canvas border border-border-strong rounded-lg shadow-sm overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-border-strong">
            <p className="text-sm font-medium text-text-primary truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-text-secondary truncate mt-0.5">
              {user?.email}
            </p>
          </div>
          
          <div className="p-1">
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-text-secondary rounded hover:text-text-primary hover:bg-surface-alt transition-colors"
            >
              <Gear size={16} />
              Settings
            </Link>
          </div>

          <div className="p-1 border-t border-border-strong">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-text-secondary rounded hover:text-text-primary hover:bg-surface-alt transition-colors text-left"
            >
              <SignOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
