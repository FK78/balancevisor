import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="workspace-card space-y-4 rounded-2xl border border-border/70 p-4"
      style={{ minHeight: height }}
    >
      <div className="space-y-2">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-5 w-48 rounded-full" />
      </div>
      <Skeleton className="h-[200px] w-full rounded-xl" />
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
