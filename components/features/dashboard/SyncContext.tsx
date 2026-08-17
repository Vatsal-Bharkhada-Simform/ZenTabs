"use client";

import React, { createContext, useContext, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SyncContextValue {
  isSyncing: boolean;
  startSync: (action: () => Promise<any>) => Promise<any>;
  setSyncing: (syncing: boolean) => void;
}

const SyncContext = createContext<SyncContextValue>({
  isSyncing: false,
  startSync: async () => {},
  setSyncing: () => {},
});

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isSyncing = isManualSyncing || isPending;

  const startSync = useCallback(
    async (action: () => Promise<any>) => {
      setIsManualSyncing(true);
      try {
        const result = await action();
        startTransition(() => {
          router.refresh();
        });
        return result;
      } finally {
        setIsManualSyncing(false);
      }
    },
    [router]
  );

  return (
    <SyncContext.Provider value={{ isSyncing, startSync, setSyncing: setIsManualSyncing }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncState() {
  return useContext(SyncContext);
}

/**
 * Hairline progress bar that appears when data is synchronizing.
 * 2px height, full-width indeterminate animation using transform.
 */
export function SyncIndicator({ className = "" }: { className?: string }) {
  const { isSyncing } = useSyncState();

  if (!isSyncing) return null;

  return (
    <div
      className={`relative w-full h-[2px] overflow-hidden bg-border-strong ${className}`}
      role="progressbar"
      aria-label="Updating data..."
    >
      <div className="absolute inset-0 w-full h-full bg-text-primary/70 animate-sync-line origin-left" />
    </div>
  );
}
