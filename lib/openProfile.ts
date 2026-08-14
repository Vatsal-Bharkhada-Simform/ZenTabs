import { toast } from "sonner";

/**
 * Opens all URLs in new tabs.
 *
 * MUST be called synchronously from a user gesture (click handler) — browsers
 * block window.open() calls that happen after an await.
 *
 * If the browser blocks the first popup, we show a toast guiding the user to
 * allow popups for this site, then abort — no point trying the rest.
 */
export function openProfileUrls(urls: string[]): void {
  if (urls.length === 0) return;

  // window.open without a features string → new TAB (not a popup window).
  // Passing any features string (even "noopener") instructs the browser to
  // open a popup window, which is more aggressively blocked and ignores _blank.
  const firstTab = window.open(urls[0], "_blank");

  if (!firstTab) {
    // null return = browser blocked the popup. Inform the user.
    toast.error(
      "Popups are blocked. Allow popups for this site in your browser's address bar, then try again.",
      { duration: 7000 }
    );
    return;
  }

  // Security: clear opener reference on the first tab
  firstTab.opener = null;

  for (let i = 1; i < urls.length; i++) {
    const tab = window.open(urls[i], "_blank");
    if (tab) tab.opener = null;
  }
}
