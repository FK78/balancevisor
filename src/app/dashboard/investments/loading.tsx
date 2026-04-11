export default function InvestmentsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="bg-muted h-9 w-40 animate-pulse rounded-md" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="bg-muted h-9 w-28 animate-pulse rounded-md" />
          <div className="bg-muted h-9 w-28 animate-pulse rounded-md" />
          <div className="bg-muted h-9 w-28 animate-pulse rounded-md" />
        </div>
      </div>

      <section className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
          <div className="space-y-3 rounded-[1.75rem] border p-6">
            <div className="bg-muted h-4 w-28 animate-pulse rounded-md" />
            <div className="bg-muted h-10 w-3/4 animate-pulse rounded-md" />
            <div className="bg-muted h-5 w-full animate-pulse rounded-md" />
            <div className="bg-muted h-5 w-5/6 animate-pulse rounded-md" />
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[1.5rem] border p-4">
                <div className="bg-muted h-3 w-20 animate-pulse rounded-md" />
                <div className="bg-muted mt-3 h-7 w-24 animate-pulse rounded-md" />
                <div className="bg-muted mt-2 h-4 w-16 animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border p-6">
          <div className="bg-muted h-4 w-28 animate-pulse rounded-md" />
          <div className="bg-muted mt-3 h-8 w-72 animate-pulse rounded-md" />
          <div className="bg-muted mt-2 h-4 w-full animate-pulse rounded-md" />
          <div className="bg-muted mt-5 h-20 w-full animate-pulse rounded-[1.25rem]" />
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-muted h-9 w-28 animate-pulse rounded-md" />
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border p-6">
          <div className="bg-muted h-4 w-28 animate-pulse rounded-md" />
          <div className="bg-muted mt-3 h-8 w-96 animate-pulse rounded-md" />
          <div className="grid gap-4 pt-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[1.4rem] border p-4">
                <div className="bg-muted h-3 w-20 animate-pulse rounded-md" />
                <div className="bg-muted mt-3 h-6 w-full animate-pulse rounded-md" />
                <div className="bg-muted mt-2 h-12 w-full animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[1.5rem] border p-5">
            <div className="bg-muted h-3 w-24 animate-pulse rounded-md" />
            <div className="bg-muted mt-3 h-8 w-32 animate-pulse rounded-md" />
            <div className="bg-muted mt-2 h-4 w-full animate-pulse rounded-md" />
            <div className="bg-muted mt-3 h-10 w-full animate-pulse rounded-md" />
          </div>
        ))}
      </div>

      <div className="rounded-[1.75rem] border p-6">
        <div className="bg-muted h-4 w-28 animate-pulse rounded-md" />
        <div className="bg-muted mt-3 h-8 w-80 animate-pulse rounded-md" />
        <div className="bg-muted mt-5 h-56 w-full animate-pulse rounded-[1.4rem]" />
      </div>

      <div className="rounded-[1.75rem] border p-6">
        <div className="bg-muted h-4 w-28 animate-pulse rounded-md" />
        <div className="bg-muted mt-3 h-8 w-72 animate-pulse rounded-md" />
        <div className="space-y-4 pt-5 md:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-[1.4rem] border p-4">
              <div className="bg-muted h-4 w-16 animate-pulse rounded-md" />
              <div className="bg-muted mt-3 h-6 w-40 animate-pulse rounded-md" />
              <div className="bg-muted mt-3 h-10 w-full animate-pulse rounded-md" />
            </div>
          ))}
        </div>
        <div className="hidden pt-5 md:block">
          <div className="bg-muted h-10 w-full animate-pulse rounded-t-xl" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-muted mt-2 h-14 w-full animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
