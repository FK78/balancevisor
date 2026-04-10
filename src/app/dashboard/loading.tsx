export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 md:space-y-8 md:px-10 md:py-8">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="space-y-1.5">
            <div className="bg-muted h-3 w-20 animate-pulse rounded-md" />
            <div className="bg-muted h-9 w-64 animate-pulse rounded-md" />
            <div className="bg-muted h-4 w-24 animate-pulse rounded-md" />
          </div>
          <div className="flex gap-2">
            <div className="bg-muted h-8 w-24 animate-pulse rounded-md" />
            <div className="bg-muted h-8 w-28 animate-pulse rounded-md" />
          </div>
        </div>

        {/* Hero card */}
        <div className="rounded-[2rem] bg-[var(--workspace-shell)] px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="h-6 w-28 animate-pulse rounded-full bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded-md bg-white/15" />
                <div className="h-10 w-48 animate-pulse rounded-md bg-white/15 sm:h-12 sm:w-56" />
                <div className="h-4 w-72 animate-pulse rounded-md bg-white/10" />
              </div>
            </div>
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 w-28 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
        </div>

        {/* Tabs bar */}
        <div className="workspace-surface rounded-[1.75rem] border border-[var(--workspace-card-border)] px-3 py-3 shadow-sm sm:px-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <div className="bg-muted h-4 w-16 animate-pulse rounded-md" />
                <div className="bg-muted h-3 w-32 animate-pulse rounded-md" />
              </div>
              <div className="bg-muted h-8 w-24 animate-pulse rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-5 space-y-3">
          <div className="bg-muted h-5 w-32 animate-pulse rounded-md" />
          <div className="bg-muted h-[200px] w-full animate-pulse rounded-lg" />
        </div>
        <div className="rounded-lg border p-5 space-y-3">
          <div className="bg-muted h-5 w-28 animate-pulse rounded-md" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted h-10 w-full animate-pulse rounded-md" />
            ))}
          </div>
        </div>
        <div className="rounded-lg border p-5 space-y-3">
          <div className="bg-muted h-5 w-36 animate-pulse rounded-md" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
                  <div className="bg-muted h-4 w-24 animate-pulse rounded-md" />
                </div>
                <div className="bg-muted h-4 w-16 animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border p-5 space-y-3">
          <div className="bg-muted h-5 w-40 animate-pulse rounded-md" />
          <div className="bg-muted h-2.5 w-full animate-pulse rounded-full" />
          <div className="bg-muted h-2.5 w-3/4 animate-pulse rounded-full" />
          <div className="bg-muted h-2.5 w-1/2 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}
