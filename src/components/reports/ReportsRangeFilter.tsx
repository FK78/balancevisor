"use client";

import { Button } from "@/components/ui/button";
import { useReportsContext } from "@/components/reports/ReportsProvider";

type RangeOption = 3 | 6 | 12;

export function ReportsRangeFilter() {
  const { range, setRange } = useReportsContext();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {([3, 6, 12] as RangeOption[]).map((option) => (
        <Button
          key={option}
          size="sm"
          variant={range === option ? "default" : "outline"}
          onClick={() => setRange(option)}
        >
          {option}mo
        </Button>
      ))}
    </div>
  );
}
