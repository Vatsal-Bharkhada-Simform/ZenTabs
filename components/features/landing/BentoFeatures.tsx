"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  BookmarkSimple,
  UsersThree,
  FolderOpen,
  Tag,
  MagnifyingGlass,
} from "@phosphor-icons/react";

type Feature = {
  icon: React.ElementType;
  title: string;
  body: string;
  accent?: string; // optional bg tint for visual diversity
  wide?: boolean;  // spans 2 cols on desktop
};

const features: Feature[] = [
  {
    icon: BookmarkSimple,
    title: "Save anything",
    body: "Paste a URL and ZenTabs captures the title, description, and favicon automatically.",
    wide: true,
    accent: "bg-accent-blue-bg",
  },
  {
    icon: UsersThree,
    title: "Switch profiles",
    body: "Keep work and personal completely separate. Switch in one click.",
  },
  {
    icon: FolderOpen,
    title: "Collections",
    body: "Group related bookmarks into named collections. A bookmark can live in multiple.",
    accent: "bg-accent-green-bg",
  },
  {
    icon: Tag,
    title: "Tag everything",
    body: "Apply multiple tags to any bookmark and filter your list instantly.",
  },
  {
    icon: MagnifyingGlass,
    title: "Find fast",
    body: "Full-text search across titles, URLs, and tags. No more scrolling.",
  },
];

export default function BentoFeatures() {
  const reduce = useReducedMotion();

  return (
    <section id="features" className="py-24 lg:py-32 bg-canvas">
      <div className="max-w-[80rem] mx-auto px-6">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-text-muted mb-3">
            Features
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-text-primary leading-[1.1]">
            Built for people who actually
            <br />
            use their bookmarks.
          </h2>
        </div>

        {/* Bento grid — 5 cells, no empty slots */}
        {/* Desktop: [wide 2-col] [1-col] / [1-col] [1-col] [1-col] */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={[
                  "relative flex flex-col gap-4 p-8 rounded-lg",
                  "border border-border-strong",
                  "transition-shadow duration-250",
                  "hover:shadow-shadow-card-hover",
                  feature.wide ? "md:col-span-2" : "",
                  feature.accent ?? "bg-surface",
                ].join(" ")}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-surface border border-border-strong">
                  <Icon size={20} weight="bold" className="text-text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-normal max-w-[48ch]">
                    {feature.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
