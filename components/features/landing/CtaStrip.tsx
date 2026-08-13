"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export default function CtaStrip() {
  const reduce = useReducedMotion();

  return (
    <section className="py-24 lg:py-32 border-t border-border-strong bg-canvas-dark">
      <div className="max-w-[80rem] mx-auto px-6 flex flex-col items-center text-center gap-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-text-primary leading-[1.1]">
            Start organising today.
          </h2>
          <p className="text-base text-text-secondary max-w-[38ch] leading-normal">
            Free to use. No credit card required. Takes 30 seconds to set up.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 text-base font-medium rounded-sm bg-cta-bg text-cta-text hover:bg-cta-bg-hover active:scale-[0.98] transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] select-none whitespace-nowrap group"
          >
            Get started
            <span aria-hidden="true" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black/[0.06] transition-transform duration-[250ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 8L8 2M8 2H3.5M8 2V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
