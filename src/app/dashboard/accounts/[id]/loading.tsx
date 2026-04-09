export default function AccountDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      {/* Breadcrumb */}
      <div className="bg-muted h-8 w-24 animate-pulse rounded-md" />

      {/* Account header card */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-muted h-12 w-12 animate-pulse rounded-xl" />
            <div className="space-y-2">
              <div className="bg-muted h-6 w-40 animate-pulse rounded-md" />
              <div className="bg-muted h-4 w-28 animate-pulse rounded-md" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-muted h-7 w-24 animate-pulse rounded-md" />
            <div className="bg-muted h-7 w-7 animate-pulse rounded-md" />
            <div className="bg-muted h-7 w-7 animate-pulse rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-4 text-center space-y-1">
              <div className="bg-muted mx-auto h-3 w-16 animate-pulse rounded-md" />
              <div className="bg-muted mx-auto h-7 w-24 animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Transaction list skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="bg-muted h-6 w-32 animate-pulse rounded-md" />
          <div className="flex gap-2">
            <div className="bg-muted h-9 w-28 animate-pulse rounded-md" />
            <div className="bg-muted h-9 w-28 animate-pulse rounded-md" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="bg-muted h-4 w-20 animate-pulse rounded-md" />
              <div className="bg-muted h-4 w-40 animate-pulse rounded-md" />
            </div>
            <div className="bg-muted h-4 w-20 animate-pulse rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
