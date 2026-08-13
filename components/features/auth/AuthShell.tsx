"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "@phosphor-icons/react";

// ─── Mini bookmark card (mirrors the hero product preview) ───────────────────

type BookmarkItem = { title: string; url: string; tag: string };

const BOOKMARKS: BookmarkItem[] = [
  { title: "Next.js App Router — Official Docs", url: "nextjs.org/docs/app", tag: "Dev" },
  { title: "Tailwind CSS v4 — What's new", url: "tailwindcss.com/blog", tag: "CSS" },
  { title: "Linear — Issue Tracker", url: "linear.app", tag: "Tools" },
  { title: "Phosphor Icons — React", url: "phosphoricons.com", tag: "Design" },
];

function MiniBookmarkCard({
  title,
  url,
  tag,
  delay,
  reduce,
}: BookmarkItem & { delay: number; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 px-4 py-3 bg-surface border border-border-strong rounded-lg"
    >
      <div className="mt-0.5 w-5 h-5 rounded-sm bg-surface-alt border border-border-strong shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{title}</p>
        <p className="text-xs text-text-muted truncate mt-0.5">{url}</p>
      </div>
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full bg-surface-alt text-text-secondary border border-border-strong">
        {tag}
      </span>
    </motion.div>
  );
}

// ─── Right ambient panel ─────────────────────────────────────────────────────

function RightPanel({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:flex flex-1 relative flex-col items-center justify-center px-16 bg-surface-alt overflow-hidden"
    >
      {/* Mesh gradient — same family as the landing hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 70% at 5% 92%, rgba(209, 236, 252, 0.68) 0%, transparent 64%),
            radial-gradient(ellipse 60% 55% at 92% 8%, rgba(220, 240, 218, 0.58) 0%, transparent 62%),
            radial-gradient(ellipse 45% 40% at 50% 50%, rgba(250, 238, 200, 0.28) 0%, transparent 58%)
          `,
        }}
      />

      {/* Faux-OS window — real component preview, not fake divs */}
      <div className="relative w-full max-w-sm">
        <div className="rounded-xl border border-border-strong bg-surface overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border-strong bg-surface-alt">
            <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
            <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
            <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
            <span className="ml-3 text-xs font-mono text-text-muted">
              ZenTabs - Work profile
            </span>
          </div>

          {/* Bookmark list */}
          <div className="flex flex-col gap-2 p-4">
            {BOOKMARKS.map((bm, i) => (
              <MiniBookmarkCard
                key={bm.title}
                {...bm}
                delay={0.38 + i * 0.08}
                reduce={reduce}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── AuthShell — public API ──────────────────────────────────────────────────

export interface AuthShellProps {
  /** Big editorial heading. Include the terminal period: "Sign in." */
  heading: string;
  /** Form content rendered inside the left panel */
  children: React.ReactNode;
  /** Text before the alt link: "Don't have an account?" */
  altLinkPrefix: string;
  /** Link label: "Create one" */
  altLinkLabel: string;
  /** Link destination: "/register" */
  altLinkHref: string;
}

export function AuthShell({
  heading,
  children,
  altLinkPrefix,
  altLinkLabel,
  altLinkHref,
}: AuthShellProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <div className="flex min-h-[100dvh]">
      {/* ── Left panel: structural document form ── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col w-full lg:w-[44%] shrink-0 bg-canvas"
      >
        {/* Vertical divider between panels */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-0 right-0 bottom-0 w-px bg-border-strong"
        />

        {/* Top bar: wordmark + back link */}
        <div className="flex items-center justify-between px-10 lg:px-14 pt-9 pb-8">
          <Link
            href="/"
            className="text-sm font-bold tracking-tight text-text-primary hover:opacity-70 transition-opacity"
          >
            ZenTabs
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={14} weight="bold" aria-hidden="true" />
            Home
          </Link>
        </div>

        {/* Form zone — vertically centered */}
        <div className="flex-1 flex flex-col justify-center px-10 lg:px-14">
          <div className="w-full max-w-[380px]">
            {/* Editorial heading */}
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl font-bold tracking-[-0.03em] leading-[1.08] text-text-primary"
            >
              {heading}
            </motion.h1>

            {/* Structural hairline rule — the "document" signature */}
            <motion.div
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              style={{ transformOrigin: "left center" }}
              transition={{ duration: 0.4, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-border-strong mt-5 mb-8"
            />

            {/* Form — no card/container, direct on canvas */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </div>
        </div>

        {/* Bottom: alternate action link */}
        <div className="px-10 lg:px-14 pb-10">
          <p className="text-sm text-text-secondary">
            {altLinkPrefix}{" "}
            <Link
              href={altLinkHref}
              className="text-text-primary font-medium underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              {altLinkLabel}
            </Link>
          </p>
        </div>
      </motion.div>

      {/* ── Right panel: ambient product preview ── */}
      <RightPanel reduce={reduce} />
    </div>
  );
}
