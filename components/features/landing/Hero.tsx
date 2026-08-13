"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";

/** Mini bookmark card used in the hero product preview */
function BookmarkCard({
  title,
  url,
  tag,
  delay,
}: {
  title: string;
  url: string;
  tag: string;
  delay: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 px-4 py-3 bg-surface border border-border-strong rounded-lg"
    >
      {/* Favicon placeholder */}
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

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col justify-center"
    >
      {/* Sentinel for nav scroll detection */}
      <div id="nav-sentinel" className="absolute top-0 h-1 w-full" aria-hidden="true" />

      {/* Mesh gradient background — bottom-left → mid-upper-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 85% 70% at 0% 100%, rgba(209, 236, 252, 0.78) 0%, transparent 65%),
            radial-gradient(ellipse 65% 60% at 85% 12%, rgba(220, 240, 218, 0.68) 0%, transparent 62%),
            radial-gradient(ellipse 50% 45% at 46% 55%, rgba(250, 238, 200, 0.45) 0%, transparent 58%)
          `,
        }}
      />

      {/* Content — padded enough to clear fixed nav, otherwise centered by flex parent */}
      <div className="relative flex flex-col lg:grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-8 items-center max-w-[80rem] mx-auto w-full px-6 pt-24 pb-16">
        {/* Left — copy */}
        <div className="flex flex-col items-start gap-6">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl lg:text-[3.75rem] font-bold tracking-[-0.03em] leading-[1.08] text-text-primary"
          >
            Your bookmarks,
            <br />
            finally organised.
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-text-secondary leading-normal max-w-[42ch]"
          >
            Save, tag and search every link in one place. Switch between personal and work profiles instantly.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 text-base font-medium rounded-sm bg-cta-bg text-cta-text hover:bg-cta-bg-hover active:scale-[0.98] transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] select-none whitespace-nowrap group"
          >
            Get started
            <span aria-hidden="true" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black/[0.06] transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 8L8 2M8 2H3.5M8 2V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              See how it works
              <ArrowRight size={14} weight="bold" />
            </Link>
          </motion.div>
        </div>

        {/* Right — product preview */}
        <motion.div
          initial={reduce ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md lg:max-w-none"
        >
          {/* Faux app window */}
          <div className="rounded-xl border border-border-strong bg-surface overflow-hidden shadow-sm">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border-strong bg-surface-alt">
              <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
              <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
              <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
              <span className="ml-3 text-xs font-mono text-text-muted">ZenTabs - Work profile</span>
            </div>

            {/* Bookmark list preview */}
            <div className="flex flex-col gap-2 p-4">
              <BookmarkCard
                title="Next.js App Router — Official Docs"
                url="nextjs.org/docs/app"
                tag="Dev"
                delay={0.28}
              />
              <BookmarkCard
                title="Tailwind CSS v4 — What's new"
                url="tailwindcss.com/blog"
                tag="CSS"
                delay={0.36}
              />
              <BookmarkCard
                title="Linear — Issue Tracker"
                url="linear.app"
                tag="Tools"
                delay={0.44}
              />
              <BookmarkCard
                title="Phosphor Icons — React"
                url="phosphoricons.com"
                tag="Design"
                delay={0.52}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
