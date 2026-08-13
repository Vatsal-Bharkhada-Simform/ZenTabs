import { Manrope, Space_Mono } from "next/font/google";

/**
 * Primary sans-serif — used for all body text, UI labels, buttons, and headings.
 * Manrope's geometric forms and tight tracking give a premium, editorial feel
 * without relying on a serif face.
 */
export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Monospace — used for code snippets, keyboard shortcuts, metadata labels,
 * and any data-dense UI (URLs, timestamps).
 */
export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});
