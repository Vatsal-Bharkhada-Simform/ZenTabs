/**
 * Rank-based tiering for the Tags page's bento treemap.
 *
 * Replaces the old continuous font-size-by-count scaling with discrete
 * size tiers (hero/large/medium/small) computed from each tag's usage
 * count relative to the full distribution, so tile size communicates
 * *rank*, not a raw linear scale. Buckets are deliberately top-weighted
 * (not equal quartiles) because tag-usage distributions tend to be
 * power-law — a handful of tags dominate, the rest trail off.
 */

export type TagTier = "hero" | "large" | "medium" | "small";

export interface TagInput {
  id: number;
  name: string;
  count: number;
}

export interface TagWithTier extends TagInput {
  tier: TagTier;
}

export function computeTagTiers(tags: TagInput[]): TagWithTier[] {
  const n = tags.length;
  if (n === 0) return [];

  const counts = tags.map((t) => t.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  // No usage signal to visualize (every tag tied) — flatten to medium
  // rather than inflating everything to "hero".
  if (max === min) {
    return tags.map((t) => ({ ...t, tier: "medium" as const }));
  }

  // Too few tiles for a size hierarchy to read as intentional rather
  // than broken layout.
  if (n <= 4) {
    return tags.map((t) => ({ ...t, tier: "large" as const }));
  }

  const score = (count: number) => (count - min) / (max - min);

  let tiered: TagWithTier[] = tags.map((t) => {
    const s = score(t.count);
    let tier: TagTier;
    if (s >= 0.75) tier = "hero";
    else if (s >= 0.45) tier = "large";
    else if (s >= 0.2) tier = "medium";
    else tier = "small";
    return { ...t, tier };
  });

  if (n <= 8) {
    // Not enough tiles to justify a dense "small" filler tier at this
    // scale — cap hero to the single top-count tag (ties keep original,
    // i.e. alphabetical, order) and float everything else back up to
    // at least medium.
    let topIndex = 0;
    for (let i = 1; i < tiered.length; i++) {
      if (tiered[i].count > tiered[topIndex].count) topIndex = i;
    }
    return tiered.map((t, i) => {
      if (i === topIndex) return { ...t, tier: "hero" as const };
      if (t.tier === "hero") return { ...t, tier: "large" as const };
      if (t.tier === "small") return { ...t, tier: "medium" as const };
      return t;
    });
  }

  // Cap the hero tier so a bimodal distribution (e.g. many tags tied
  // near the max) can't produce a wall of oversized tiles. Demote the
  // lowest-count excess hero tags first; ties broken by original order.
  const heroCap = Math.max(1, Math.ceil(n * 0.15));
  const heroIndices = tiered
    .map((t, i) => ({ i, count: t.count }))
    .filter((x) => tiered[x.i].tier === "hero");

  if (heroIndices.length > heroCap) {
    const demoteCount = heroIndices.length - heroCap;
    const demoteIndices = new Set(
      [...heroIndices]
        .sort((a, b) => a.count - b.count || a.i - b.i)
        .slice(0, demoteCount)
        .map((x) => x.i)
    );
    tiered = tiered.map((t, i) => (demoteIndices.has(i) ? { ...t, tier: "large" as const } : t));
  }

  return tiered;
}

/**
 * Grid spans per tier. Row-span is identical at every breakpoint, so
 * only column-span needs a `md:` override (hero shrinks from a 4-col
 * mobile grid to a 6-col desktop grid; small grows a footprint on
 * desktop once there's room to spare).
 */
export const tierSpanClasses: Record<TagTier, string> = {
  hero: "col-span-4 row-span-2 md:col-span-3",
  large: "col-span-2 row-span-2",
  medium: "col-span-2 row-span-1",
  small: "col-span-2 row-span-1 md:col-span-1",
};

/** Tag-name typography per tier (Manrope, design-token type scale). */
export const tierNameClasses: Record<TagTier, string> = {
  hero: "text-2xl md:text-3xl font-bold tracking-tight",
  large: "text-xl md:text-2xl font-bold tracking-tight",
  medium: "text-base md:text-lg font-semibold",
  small: "text-sm font-semibold",
};

/** Count "eyebrow" label typography per tier (Space Mono). */
export const tierEyebrowClasses: Record<TagTier, string> = {
  hero: "text-xs",
  large: "text-[11px]",
  medium: "text-[10px]",
  small: "text-[10px]",
};

/** Line-clamp behavior per tier for long tag names. */
export const tierTruncateClasses: Record<TagTier, string> = {
  hero: "truncate-2",
  large: "truncate-2",
  medium: "truncate-1",
  small: "truncate-1",
};

/** A representative tier sequence for the loading skeleton, matching
 * the visual rhythm of a typical grid without needing real data. */
export const SKELETON_TIER_SEQUENCE: TagTier[] = [
  "hero",
  "large",
  "large",
  "medium",
  "medium",
  "medium",
  "small",
  "small",
  "small",
  "small",
  "medium",
  "large",
];
