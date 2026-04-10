import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  const normalizedHeight = Math.max(height, 180);
  const chartAreaHeight = Math.max(88, Math.min(200, normalizedHeight - 122));

  return (
    <div
      className="workspace-card space-y-4 rounded-2xl border border-border/70 p-4"
      style={{ minHeight: normalizedHeight }}
    >
      <div className="space-y-2">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-5 w-48 rounded-full" />
      </div>
      <Skeleton className="w-full rounded-xl" style={{ height: chartAreaHeight }} />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
    </div>
  );
}
