"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowSquareOut, PencilSimple, Trash, Warning } from "@phosphor-icons/react";
import { deleteProfile } from "@/lib/actions/profiles";
import { openProfileUrls } from "@/lib/openProfile";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { CreateProfileModal } from "./CreateProfileModal";

interface ProfileCardProps {
  profile: {
    id: number;
    name: string;
    count: number;
    urls: string[];
  };
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePending, startDelete] = useTransition();


  const handleDelete = () => {
    startDelete(async () => {
      const res = await deleteProfile(profile.id);
      setDeleteModalOpen(false);
      if (res.success) {
        toast.success("Profile deleted");
      } else {
        toast.error(res.error || "Failed to delete profile");
      }
    });
  };

  return (
    <>
      <div className="group flex flex-col gap-4 p-5 bg-canvas border border-border-strong rounded-xl hover:bg-surface-alt transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/dashboard/profiles/${profile.id}`}
              className="text-base font-semibold text-text-primary hover:underline underline-offset-4 truncate block"
            >
              {profile.name}
            </Link>
            <p className="text-xs text-text-muted mt-0.5 font-mono">
              {profile.count} {profile.count === 1 ? "bookmark" : "bookmarks"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
            <button
              onClick={() => setEditOpen(true)}
              title="Rename profile"
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border-strong rounded-md transition-all"
            >
              <PencilSimple size={14} />
            </button>
            <button
              onClick={() => setDeleteModalOpen(true)}
              title="Delete profile"
              className="p-1.5 text-text-muted hover:text-accent-red-text hover:bg-accent-red-bg border border-transparent hover:border-accent-red-bg rounded-md transition-all"
            >
              <Trash size={14} />
            </button>
          </div>
        </div>

        {/* Open All CTA */}
        <button
          onClick={() => openProfileUrls(profile.urls)}
          disabled={profile.count === 0}
          className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-text-primary bg-surface border border-border-strong rounded-lg hover:bg-canvas-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowSquareOut size={15} weight="bold" />
          Open all
          {profile.count > 0 && (
            <span className="text-text-muted font-mono text-xs">({profile.count})</span>
          )}
        </button>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <CreateProfileModal
          isOpen={true}
          onClose={() => setEditOpen(false)}
          profile={{ id: profile.id, name: profile.name }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteModalOpen(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-profile-title"
            className="w-full max-w-sm bg-canvas border border-border-strong rounded-xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-200"
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 flex items-center justify-center bg-accent-red-bg rounded-lg mt-0.5">
                  <Warning size={18} weight="fill" className="text-accent-red-text" />
                </div>
                <div>
                  <h2 id="delete-profile-title" className="text-base font-semibold text-text-primary leading-tight">
                    Delete profile?
                  </h2>
                  <p className="text-sm text-text-secondary mt-1 leading-snug">
                    <span className="font-medium text-text-primary">&ldquo;{profile.name}&rdquo;</span> will be deleted.
                    Your bookmarks will not be affected — they remain in your library.
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
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-accent-red-text bg-accent-red-bg border border-accent-red-bg rounded-md hover:brightness-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red-text/30 disabled:opacity-50 disabled:pointer-events-none"
              >
                {deletePending ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border-2 border-accent-red-text border-t-transparent animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  <>
                    <Trash size={14} weight="bold" />
                    Delete profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
