import type { Metadata } from "next";
import { manrope, spaceMono } from "@/lib/fonts";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ZenTabs",
    template: "%s — ZenTabs",
  },
  description:
    "ZenTabs is a personal bookmark manager with profiles, collections, and tag-based organization.",
  metadataBase: new URL(
    process.env.AUTH_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body
        style={{ fontFamily: "var(--font-sans)" }}
        className="min-h-dvh flex flex-col bg-canvas text-text-primary"
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
