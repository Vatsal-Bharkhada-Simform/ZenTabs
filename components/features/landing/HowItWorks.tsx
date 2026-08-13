"use client";

import { motion, useReducedMotion } from "motion/react";
import { FloppyDisk, SquaresFour, Binoculars } from "@phosphor-icons/react";

const steps = [
  {
    number: "01",
    icon: FloppyDisk,
    verb: "Save",
    body: "Paste any URL. We fetch the title and favicon so you don't have to.",
  },
  {
    number: "02",
    icon: SquaresFour,
    verb: "Organise",
    body: "Tag it, drop it in a collection, and assign it to the right profile.",
  },
  {
    number: "03",
    icon: Binoculars,
    verb: "Find",
    body: "Search by title, tag, or URL. Relevant results appear as you type.",
  },
];

export default function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="py-24 lg:py-32 border-t border-border-strong bg-surface-alt"
    >
      <div className="max-w-[80rem] mx-auto px-6">
        {/* Section header — no eyebrow (second one used in Features already) */}
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-text-primary leading-[1.1] mb-16"
        >
          Three steps.
          <br />
          <span className="text-text-secondary font-medium">That really is all.</span>
        </motion.h2>

        {/* Steps — large display numbers, NOT three equal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.verb}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative flex flex-col gap-4"
              >
                {/* Giant background number — visual anchor, not a label */}
                <span
                  aria-hidden="true"
                  className="absolute -top-4 -left-2 text-[7rem] font-bold leading-none select-none pointer-events-none text-border-strong opacity-60"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {step.number}
                </span>

                {/* Foreground content */}
                <div className="relative pt-12">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-surface border border-border-strong mb-4">
                    <Icon size={20} weight="bold" className="text-text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {step.verb}
                  </h3>
                  <p className="text-sm text-text-secondary leading-normal">
                    {step.body}
                  </p>
                </div>

                {/* Connector line (not shown on last) */}
                {i < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden md:block absolute top-16 -right-6 lg:-right-8 w-8 lg:w-12 h-px bg-border-strong"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
