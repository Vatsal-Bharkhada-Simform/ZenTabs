"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowSquareOut } from "@phosphor-icons/react";

function OpenProfileLauncher() {
  const searchParams = useSearchParams();
  const [blocked, setBlocked] = useState(false);
  const [urlsToOpen, setUrlsToOpen] = useState<string[]>([]);

  useEffect(() => {
    const key = searchParams.get("key");
    const fallbackUrls = searchParams.get("urls");

    let urls: string[] = [];

    if (key) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          urls = JSON.parse(stored);
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.error("Failed to read from localStorage", e);
      }
    }

    if ((!urls || urls.length === 0) && fallbackUrls) {
      try {
        urls = JSON.parse(fallbackUrls);
      } catch (e) {
        console.error("Failed to parse fallback URLs", e);
      }
    }

    if (!urls || urls.length === 0) return;

    setUrlsToOpen(urls);

    // Open subsequent URLs as new tabs inside THIS new browser window
    let hadBlocked = false;
    for (let i = 1; i < urls.length; i++) {
      const tab = window.open(urls[i], "_blank");
      if (!tab) {
        hadBlocked = true;
      }
    }

    if (hadBlocked) {
      setBlocked(true);
    } else {
      // Navigate this primary window tab to the first URL
      window.location.replace(urls[0]);
    }
  }, [searchParams]);

  const handleManualOpen = () => {
    if (urlsToOpen.length === 0) return;
    for (let i = 1; i < urlsToOpen.length; i++) {
      window.open(urlsToOpen[i], "_blank");
    }
    window.location.replace(urlsToOpen[0]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-canvas px-4 text-center">
      {blocked ? (
        <div className="max-w-md p-6 bg-surface border border-border-strong rounded-xl shadow-sm animate-in fade-in duration-200">
          <h2 className="text-base font-semibold text-text-primary mb-2">
            Popups need permission
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Your browser prevented secondary tabs from opening automatically. Click below to open all {urlsToOpen.length} tabs in this window.
          </p>
          <button
            onClick={handleManualOpen}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-cta-text bg-cta-bg hover:bg-cta-bg-hover rounded-lg transition-colors"
          >
            <ArrowSquareOut size={16} weight="bold" />
            Open All Tabs
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 text-sm font-mono text-text-secondary">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-text-secondary border-t-transparent animate-spin" />
          <span>Opening profile window...</span>
        </div>
      )}
    </div>
  );
}

export default function OpenProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-canvas text-sm font-mono text-text-secondary">
          Loading...
        </div>
      }
    >
      <OpenProfileLauncher />
    </Suspense>
  );
}
