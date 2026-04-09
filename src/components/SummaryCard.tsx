import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function SummaryCard({ title, value, change, icon: Icon, color }: {
  title: string;
  description: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardDescription className="text-[13px] font-medium text-muted-foreground">
          {title}
        </CardDescription>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="text-primary h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-0.5">
        <CardTitle className={`text-2xl font-bold tabular-nums ${color}`}>
          {value}
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          {change}
        </p>
      </CardContent>
    </Card>
  );
}