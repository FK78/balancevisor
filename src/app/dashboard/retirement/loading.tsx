export default function RetirementLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-9 w-48 animate-pulse rounded-md" />
          <div className="bg-muted h-4 w-72 animate-pulse rounded-md" />
        </div>
        <div className="bg-muted h-9 w-28 animate-pulse rounded-md" />
      </div>

      {/* Countdown cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-muted h-10 w-10 animate-pulse rounded-xl" />
              <div className="space-y-1.5">
                <div className="bg-muted h-3 w-24 animate-pulse rounded-md" />
                <div className="bg-muted h-7 w-20 animate-pulse rounded-md" />
                <div className="bg-muted h-3 w-28 animate-pulse rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="rounded-lg border p-6 space-y-3">
        <div className="flex justify-between">
          <div className="bg-muted h-4 w-40 animate-pulse rounded-md" />
          <div className="bg-muted h-4 w-10 animate-pulse rounded-md" />
        </div>
        <div className="bg-muted h-3 w-full animate-pulse rounded-full" />
      </div>

      {/* Chart placeholder */}
      <div className="rounded-lg border p-6 space-y-3">
        <div className="bg-muted h-5 w-40 animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-64 animate-pulse rounded-md" />
        <div className="bg-muted h-[300px] w-full animate-pulse rounded-md" />
      </div>

      {/* Scenarios */}
      <div className="rounded-lg border p-6 space-y-3">
        <div className="bg-muted h-5 w-32 animate-pulse rounded-md" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <div className="bg-muted h-4 w-28 animate-pulse rounded-md" />
              <div className="bg-muted h-3 w-full animate-pulse rounded-md" />
              <div className="bg-muted h-7 w-16 animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
