"use client";

import { useActionState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import { createProfile, updateProfile } from "@/lib/actions/profiles";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pass an existing profile to switch to edit mode */
  profile?: { id: number; name: string } | null;
}

export function CreateProfileModal({ isOpen, onClose, profile }: CreateProfileModalProps) {
  const action = profile ? updateProfile : createProfile;
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(profile ? "Profile updated" : "Profile created");
      onClose();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onClose, profile]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md bg-canvas border border-border-strong rounded-xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-strong bg-surface-alt">
          <h2 id="profile-modal-title" className="text-base font-semibold text-text-primary">
            {profile ? "Rename Profile" : "New Profile"}
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
          {profile && <input type="hidden" name="id" value={profile.id} />}

          <Input
            id="profile-name"
            name="name"
            label="Profile name"
            type="text"
            placeholder="e.g. Morning reads, Research, Work"
            defaultValue={profile?.name}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : profile ? "Save changes" : "Create profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
