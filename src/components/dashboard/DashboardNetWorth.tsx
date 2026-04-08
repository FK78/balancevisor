import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  Landmark,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type DashboardNetWorthProps = {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  investmentValue: number;
  currency: string;
};

export function DashboardNetWorth({
  netWorth,
  totalAssets,
  totalLiabilities,
  investmentValue,
  currency,
}: DashboardNetWorthProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Landmark className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Net Worth
            </p>
            <p
              className={`text-3xl font-bold tabular-nums ${
                netWorth >= 0 ? "text-foreground" : "text-red-600"
              }`}
            >
              {netWorth < 0 ? "−" : ""}
              {formatCurrency(netWorth, currency)}
            </p>
          </div>
        </div>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-muted-foreground text-xs">Assets</p>
              <p className="font-semibold tabular-nums">
                {formatCurrency(totalAssets, currency)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-muted-foreground text-xs">Liabilities</p>
              <p className="font-semibold tabular-nums">
                {formatCurrency(totalLiabilities, currency)}
              </p>
            </div>
          </div>
          {investmentValue > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-muted-foreground text-xs">Investments</p>
                <p className="font-semibold tabular-nums">
                  {formatCurrency(investmentValue, currency)}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
