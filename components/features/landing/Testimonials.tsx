"use client";

import { motion, useReducedMotion } from "motion/react";

const testimonials = [
  {
    quote:
      "I used to lose links in browser folders. Now I actually find what I saved.",
    name: "Marcus Levi",
    role: "Product Designer, Craft Studio",
  },
  {
    quote:
      "The profile switching is what got me. Work and personal, completely separate.",
    name: "Priya Shenoy",
    role: "Senior Engineer, Figma",
  },
  {
    quote:
      "Finally a bookmark tool that doesn't feel like a cemetery of forgotten URLs.",
    name: "Tom Baxter",
    role: "Content Strategist, Orbit",
  },
];

export default function Testimonials() {
  const reduce = useReducedMotion();

  return (
    <section className="py-24 lg:py-32 border-t border-border-strong bg-canvas">
      <div className="max-w-[80rem] mx-auto px-6">
        {/* Header */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-text-primary leading-[1.1] pb-12"
        >
          What people are saying
        </motion.p>

        {/* Grid — alternating widths (40% / 30% / 30% on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-[5fr_4fr_4fr] gap-4">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.55,
                delay: i * 0.09,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col justify-between gap-8 p-7 rounded-lg border border-border-strong bg-surface"
            >
              <blockquote>
                <p className="text-base text-text-primary leading-snug font-medium">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>
              <figcaption className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-text-primary">
                  {t.name}
                </span>
                <span className="text-xs text-text-muted">{t.role}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
