export default function ProfilesLoading() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 md:px-8 py-6 bg-canvas">
        <div className="animate-pulse">
          <div className="h-7 w-24 bg-border-strong rounded-md mb-2" />
          <div className="h-4 w-64 bg-border-strong/60 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-border-strong rounded-md animate-pulse" />
      </div>

      {/* Grid Skeleton */}
      <div className="border-t border-border-strong">
        <div className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-4 p-5 bg-canvas border border-border-strong rounded-xl animate-pulse">
              <div className="flex items-start justify-between gap-3">
                <div className="w-full">
                  <div className="h-5 w-3/4 bg-border-strong rounded-md mb-2" />
                  <div className="h-4 w-1/3 bg-border-strong/60 rounded-md" />
                </div>
                <div className="flex gap-1 shrink-0">
                  <div className="h-7 w-7 bg-border-strong rounded-md" />
                  <div className="h-7 w-7 bg-border-strong rounded-md" />
                </div>
              </div>
              <div className="h-9 w-full bg-border-strong rounded-lg mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
