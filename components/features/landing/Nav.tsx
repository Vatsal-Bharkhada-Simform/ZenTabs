"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    const sentinel = document.getElementById("nav-sentinel");
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={reduce ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-5 left-0 right-0 z-[200] flex justify-center px-4 pointer-events-none"
    >
      <nav
        className={[
          "pointer-events-auto",
          "flex items-center gap-1",
          "h-12 px-2",
          "rounded-full",
          "border border-border-strong",
          "transition-all duration-300",
          scrolled
            ? "bg-white/85 backdrop-blur-md shadow-sm"
            : "bg-white/70 backdrop-blur-sm",
        ].join(" ")}
        aria-label="Main navigation"
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="px-3 text-sm font-bold tracking-tight text-text-primary hover:opacity-70 transition-opacity"
        >
          ZenTabs
        </Link>

        {/* Divider */}
        <span className="w-px h-4 bg-border-strong mx-1" aria-hidden="true" />

        {/* Nav links */}
        <Link
          href="#features"
          className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-black/[0.04]"
        >
          Features
        </Link>
        <Link
          href="#how-it-works"
          className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-black/[0.04]"
        >
          How it works
        </Link>

        {/* Divider */}
        <span className="w-px h-4 bg-border-strong mx-1" aria-hidden="true" />

        {/* CTAs */}
        <Link
          href="/login"
          className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-black/[0.04]"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium rounded-full bg-cta-bg text-cta-text hover:bg-cta-bg-hover active:scale-[0.98] transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] select-none whitespace-nowrap"
        >
          Get started
        </Link>
      </nav>
    </motion.header>
  );
}

