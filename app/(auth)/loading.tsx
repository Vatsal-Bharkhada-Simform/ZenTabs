// Covers /login and /register — shows while NextAuth session check + form render completes
export default function AuthLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-canvas px-4">
      <div className="w-full max-w-sm animate-pulse">
        {/* Brand */}
        <div className="h-7 w-24 bg-border-strong rounded-md mb-10 mx-auto" />

        {/* Heading */}
        <div className="h-8 w-40 bg-border-strong rounded-md mb-2" />
        <div className="h-4 w-56 bg-border-strong/60 rounded-md mb-8" />

        {/* Form fields */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="h-4 w-20 bg-border-strong/60 rounded" />
            <div className="h-10 w-full bg-border-strong rounded-md" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-24 bg-border-strong/60 rounded" />
            <div className="h-10 w-full bg-border-strong rounded-md" />
          </div>
          <div className="h-10 w-full bg-border-strong rounded-md mt-2" />
        </div>

        {/* Footer link */}
        <div className="h-4 w-48 bg-border-strong/40 rounded mt-6 mx-auto" />
      </div>
    </div>
  );
}
