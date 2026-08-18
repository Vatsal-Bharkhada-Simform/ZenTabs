import { toast } from "sonner";
import { recordBatchBookmarkVisits } from "@/lib/actions/bookmarks";

/**
 * Opens all URLs of a profile collectively in a NEW browser window.
 *
 * It creates a dedicated browser window running the launcher route,
 * which opens subsequent tabs inside that new window and navigates
 * the primary tab to the first URL.
 */
export function openProfileUrls(urls: string[], bookmarkIds?: number[]): void {
  if (!urls || urls.length === 0) {
    toast.error("This profile has no URLs to open.");
    return;
  }

  // Record batch visits if bookmarkIds are provided
  if (bookmarkIds && bookmarkIds.length > 0) {
    recordBatchBookmarkVisits(bookmarkIds);
  }

  // Generate single-use launch key to pass URLs safely across windows
  const launchKey = `profile_launch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    localStorage.setItem(launchKey, JSON.stringify(urls));
  } catch (e) {
    console.error("localStorage setItem failed", e);
  }

  const encodedKey = encodeURIComponent(launchKey);
  const fallbackParam = encodeURIComponent(JSON.stringify(urls.slice(0, 10)));
  const launcherUrl = `/open-profile?key=${encodedKey}&urls=${fallbackParam}`;

  // Specifying window dimensions and features instructs the browser to spawn a NEW window
  const width = Math.min(window.screen.availWidth || 1440, 1920);
  const height = Math.min(window.screen.availHeight || 900, 1080);
  const features = `width=${width},height=${height},left=0,top=0,menubar=yes,toolbar=yes,location=yes,status=yes,resizable=yes,scrollbars=yes`;

  const newWindow = window.open(launcherUrl, "_blank", features);

  if (!newWindow) {
    toast.error(
      "Popups are blocked. Please allow popups for this site in your browser to open profile windows.",
      { duration: 7000 }
    );
  }
}
