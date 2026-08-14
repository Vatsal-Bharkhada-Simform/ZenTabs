export default function ProfileDetailLoading() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-6 bg-canvas">
        <div className="flex items-center gap-3 w-full animate-pulse">
          <div className="shrink-0 h-8 w-8 bg-border-strong rounded-md" />
          <div className="min-w-0 flex-1">
            <div className="h-7 w-48 bg-border-strong rounded-md mb-2" />
            <div className="h-4 w-24 bg-border-strong/60 rounded-md" />
          </div>
        </div>
        <div className="h-9 w-28 bg-border-strong rounded-lg animate-pulse shrink-0" />
      </div>

      {/* Bookmark list */}
      <div className="border-t border-border-strong bg-canvas">
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
            <div className="flex justify-end w-full sm:w-auto shrink-0">
               <div className="h-7 w-20 bg-border-strong rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
