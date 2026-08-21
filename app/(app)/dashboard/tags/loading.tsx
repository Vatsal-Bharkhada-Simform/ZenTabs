import { tierSpanClasses, SKELETON_TIER_SEQUENCE } from "@/lib/tagTiers";

export default function TagsLoading() {
  return (
    <div className="flex flex-col min-h-full animate-pulse">
      <div className="flex items-center justify-between px-4 md:px-8 py-6">
        <div className="space-y-2">
          <div className="h-6 w-16 bg-border-strong rounded" />
          <div className="h-4 w-40 bg-border-strong rounded" />
        </div>
      </div>
      <div className="px-4 md:px-8">
        <div className="grid grid-cols-4 md:grid-cols-6 grid-flow-dense auto-rows-[84px] md:auto-rows-[96px] gap-3 md:gap-4">
          {SKELETON_TIER_SEQUENCE.map((tier, i) => (
            <div
              key={i}
              className={`bg-surface-alt border border-border-strong ${tierSpanClasses[tier]}`}
              style={{ borderRadius: "var(--radius-bezel-outer)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
