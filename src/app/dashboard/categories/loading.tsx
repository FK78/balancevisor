export default function CategoriesLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      <div className="space-y-3">
        <div className="bg-muted h-9 w-36 animate-pulse rounded-md" />
      </div>

      <div className="space-y-5">
        <div className="rounded-[2rem] border border-border/60 p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
            <div className="space-y-3">
              <div className="bg-muted h-4 w-32 animate-pulse rounded-md" />
              <div className="bg-muted h-10 w-3/4 animate-pulse rounded-md" />
              <div className="bg-muted h-4 w-full animate-pulse rounded-md" />
              <div className="bg-muted h-4 w-4/5 animate-pulse rounded-md" />
              <div className="bg-muted h-9 w-28 animate-pulse rounded-md" />
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-muted/60 p-4">
                  <div className="bg-muted h-3 w-20 animate-pulse rounded-md" />
                  <div className="bg-muted mt-3 h-7 w-16 animate-pulse rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border/60 p-5">
          <div className="bg-muted h-4 w-28 animate-pulse rounded-md" />
          <div className="bg-muted mt-3 h-8 w-64 animate-pulse rounded-md" />
          <div className="grid grid-cols-1 gap-3 pt-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/60 p-4">
                <div className="bg-muted h-3 w-20 animate-pulse rounded-md" />
                <div className="bg-muted mt-3 h-5 w-full animate-pulse rounded-md" />
                <div className="bg-muted mt-2 h-4 w-5/6 animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-[1.75rem] border p-6">
            <div className="bg-muted h-5 w-40 animate-pulse rounded-md" />
            <div className="bg-muted mt-2 h-4 w-56 animate-pulse rounded-md" />
            <div className="bg-muted mt-6 h-[240px] w-full animate-pulse rounded-2xl" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[1.75rem] border p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="bg-muted h-11 w-11 animate-pulse rounded-2xl" />
                <div className="space-y-2">
                  <div className="bg-muted h-5 w-28 animate-pulse rounded-md" />
                  <div className="bg-muted h-4 w-32 animate-pulse rounded-md" />
                </div>
              </div>
              <div className="bg-muted h-8 w-8 animate-pulse rounded-md" />
            </div>
            <div className="grid gap-3 pt-5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="rounded-2xl border p-4">
                <div className="bg-muted h-3 w-20 animate-pulse rounded-md" />
                <div className="bg-muted mt-3 h-8 w-14 animate-pulse rounded-md" />
                <div className="bg-muted mt-2 h-4 w-28 animate-pulse rounded-md" />
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border p-4">
                  <div className="bg-muted h-3 w-24 animate-pulse rounded-md" />
                  <div className="bg-muted mt-3 h-4 w-full animate-pulse rounded-md" />
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="bg-muted h-3 w-16 animate-pulse rounded-md" />
                  <div className="bg-muted mt-3 h-4 w-5/6 animate-pulse rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[1.75rem] border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="bg-muted h-5 w-48 animate-pulse rounded-md" />
            <div className="bg-muted h-4 w-80 animate-pulse rounded-md" />
          </div>
          <div className="bg-muted h-9 w-24 animate-pulse rounded-md" />
        </div>
        <div className="space-y-3 pt-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-4">
              <div className="bg-muted h-3 w-24 animate-pulse rounded-md" />
              <div className="bg-muted mt-3 h-4 w-56 animate-pulse rounded-md" />
              <div className="bg-muted mt-2 h-3 w-32 animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
