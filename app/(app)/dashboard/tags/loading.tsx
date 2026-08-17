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
        <div className="border border-border-strong rounded-xl bg-surface p-6 md:p-8">
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-5 bg-border-strong rounded"
                style={{ width: `${48 + (i % 4) * 20}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
