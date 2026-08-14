"use client";

import { useTransition, useState, useEffect } from "react";
import { TrashSimple, Warning } from "@phosphor-icons/react";
import { emptyTrash } from "@/lib/actions/bookmarks";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface EmptyTrashButtonProps {
  count: number;
}

export function EmptyTrashButton({ count }: EmptyTrashButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);

  // Escape key closes modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    if (modalOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [modalOpen]);

  if (count === 0) return null;

  const handleConfirm = () => {
    startTransition(async () => {
      const res = await emptyTrash();
      setModalOpen(false);
      if (res.success) {
        toast.success("Trash emptied");
      } else {
        toast.error(res.error || "Failed to empty trash");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-accent-red-text bg-accent-red-bg border border-accent-red-bg rounded-md hover:brightness-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red-text/30"
      >
        <TrashSimple size={14} weight="bold" />
        Empty Trash
      </button>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="empty-trash-title"
            className="w-full max-w-sm bg-canvas border border-border-strong rounded-xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 flex items-center justify-center bg-accent-red-bg rounded-lg mt-0.5">
                  <Warning size={18} weight="fill" className="text-accent-red-text" />
                </div>
                <div>
                  <h2
                    id="empty-trash-title"
                    className="text-base font-semibold text-text-primary leading-tight"
                  >
                    Empty trash?
                  </h2>
                  <p className="text-sm text-text-secondary mt-1 leading-snug">
                    This will permanently delete{" "}
                    <span className="font-medium text-text-primary">
                      {count} {count === 1 ? "bookmark" : "bookmarks"}
                    </span>
                    . This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border-strong bg-surface-alt">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-accent-red-text bg-accent-red-bg border border-accent-red-bg rounded-md hover:brightness-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red-text/30 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPending ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border-2 border-accent-red-text border-t-transparent animate-spin" />
                    Emptying...
                  </span>
                ) : (
                  <>
                    <TrashSimple size={14} weight="bold" />
                    Empty trash
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
