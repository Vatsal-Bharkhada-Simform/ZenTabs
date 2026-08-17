export default function CollectionsLoading() {
  return (
    <div className="flex h-[calc(100dvh-4rem)] md:h-full w-full overflow-hidden">
      {/* Sidebar Skeleton (Master) */}
      <div className="flex flex-col h-full bg-surface-alt border-r border-border-strong w-full md:w-72 shrink-0">
        <div className="flex items-center justify-between px-4 py-4 md:py-6 border-b border-border-strong shrink-0 animate-pulse">
          <div>
            <div className="h-6 w-24 bg-border-strong rounded-md mb-2" />
            <div className="h-4 w-16 bg-border-strong/60 rounded-md" />
          </div>
          <div className="h-7 w-7 bg-border-strong rounded-md" />
        </div>
        <div className="flex-1 p-3 space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-transparent animate-pulse">
              <div className="flex items-center gap-2.5 w-full">
                <div className="h-4 w-4 bg-border-strong rounded-sm shrink-0" />
                <div className="h-4 w-3/4 bg-border-strong rounded-md" />
              </div>
              <div className="h-4 w-6 bg-border-strong/60 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Detail Skeleton (Right Pane) */}
      <div className="hidden md:flex flex-col h-full bg-canvas w-full min-w-0">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 px-4 md:px-8 py-4 md:py-6 shrink-0 border-b border-border-strong">
          <div className="flex items-start gap-3 w-full animate-pulse">
            <div className="min-w-0 flex-1">
              <div className="h-7 w-48 bg-border-strong rounded-md mb-2" />
              <div className="h-4 w-72 bg-border-strong/60 rounded-md" />
            </div>
          </div>
        </div>

        {/* List Skeleton */}
        <div className="flex-1 overflow-y-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 py-3 px-4 md:px-8 border-b border-border-strong animate-pulse">
              <div className="flex items-center gap-3 flex-1 w-full">
                <div className="shrink-0 w-8 h-8 bg-border-strong rounded-md" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-border-strong rounded" />
                  <div className="h-3 w-1/3 bg-border-strong/60 rounded" />
                </div>
              </div>
              <div className="hidden sm:flex gap-2 w-48 shrink-0">
                <div className="h-5 w-14 bg-border-strong rounded-sm" />
                <div className="h-5 w-16 bg-border-strong rounded-sm" />
              </div>
              <div className="flex justify-end w-full sm:w-auto shrink-0 gap-4">
                <div className="h-4 w-16 bg-border-strong/60 rounded" />
                <div className="h-6 w-6 bg-border-strong rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
