export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      <div className="space-y-2">
        <div className="bg-muted h-9 w-48 animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-72 animate-pulse rounded-md" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border-border rounded-lg border p-6">
            <div className="bg-muted h-4 w-28 animate-pulse rounded-md" />
            <div className="bg-muted mt-4 h-8 w-20 animate-pulse rounded-md" />
          </div>
        ))}
      </div>

      <div className="border-border rounded-lg border p-6">
        <div className="bg-muted h-6 w-56 animate-pulse rounded-md" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-muted h-10 w-full animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
