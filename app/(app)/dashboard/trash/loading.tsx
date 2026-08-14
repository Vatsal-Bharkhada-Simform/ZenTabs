export default function TrashLoading() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 md:px-8 py-6 bg-canvas">
        <div className="animate-pulse">
          <div className="h-7 w-20 bg-border-strong rounded-md mb-2" />
          <div className="h-4 w-48 bg-border-strong/60 rounded-md" />
        </div>
        <div className="h-9 w-32 bg-border-strong rounded-md animate-pulse" />
      </div>

      {/* List Skeleton */}
      <div className="flex flex-col border-t border-border-strong bg-canvas">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 py-3 px-4 md:px-8 border-b border-border-strong animate-pulse">
            <div className="flex items-center gap-3 flex-1 w-full">
              <div className="shrink-0 w-8 h-8 bg-border-strong rounded-md" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/3 bg-border-strong rounded" />
                <div className="h-3 w-1/4 bg-border-strong/60 rounded" />
              </div>
            </div>
            <div className="flex justify-end w-full sm:w-auto gap-4 shrink-0">
               <div className="h-4 w-24 bg-border-strong/60 rounded" />
               <div className="flex gap-2">
                 <div className="h-7 w-20 bg-border-strong rounded-md" />
                 <div className="h-7 w-20 bg-border-strong rounded-md" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
