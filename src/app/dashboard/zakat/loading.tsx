export default function ZakatLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10 animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-64 rounded-lg bg-muted" />
          <div className="h-4 w-96 rounded bg-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-32 rounded-md bg-muted" />
          <div className="h-9 w-40 rounded-md bg-muted" />
        </div>
      </div>

      {/* Countdown card */}
      <div className="h-28 rounded-xl bg-muted" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>

      {/* Nisab status banner */}
      <div className="h-16 rounded-xl bg-muted" />

      {/* Breakdown cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-56 rounded-xl bg-muted" />
        <div className="h-56 rounded-xl bg-muted" />
      </div>

      {/* Formula card */}
      <div className="h-32 rounded-xl bg-muted" />
    </div>
  );
}
