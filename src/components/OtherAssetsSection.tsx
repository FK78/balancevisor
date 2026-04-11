import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { OtherAssetFormDialog, type OtherAsset } from "@/components/OtherAssetFormDialog";
import { DeleteOtherAssetButton } from "@/components/DeleteOtherAssetButton";
import { formatCurrency } from "@/lib/formatCurrency";

const ASSET_TYPE_LABELS: Record<string, string> = {
  gold: "Gold",
  silver: "Silver",
  property: "Property",
  pension: "Pension",
  vehicle: "Vehicle",
  collectible: "Collectible",
  business: "Business",
  cash: "Cash",
  other: "Other",
};

const ASSET_TYPE_COLORS: Record<string, string> = {
  gold: "bg-yellow-400",
  silver: "bg-gray-400",
  property: "bg-blue-400",
  pension: "bg-purple-400",
  vehicle: "bg-orange-400",
  collectible: "bg-pink-400",
  business: "bg-emerald-400",
  cash: "bg-green-400",
  other: "bg-slate-400",
};

const ASSET_UPKEEP_CUES: Record<string, string> = {
  gold: "Review with market prices",
  silver: "Review with market prices",
  property: "Review value seasonally",
  pension: "Keep details current",
  vehicle: "Review value seasonally",
  collectible: "Review value seasonally",
  business: "Keep details current",
  cash: "Keep details current",
  other: "Keep details current",
};

interface OtherAssetsSectionProps {
  readonly assets: readonly OtherAsset[];
  readonly baseCurrency: string;
}

export function OtherAssetsSection({ assets, baseCurrency }: OtherAssetsSectionProps) {
  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Assets outside broker feeds</h2>
          <p className="text-sm text-muted-foreground">
            Keep non-broker wealth in the portfolio story so total value and zakat checks stay complete.
            {totalValue > 0 && ` Total value: ${formatCurrency(totalValue, baseCurrency)}`}
          </p>
        </div>
        <OtherAssetFormDialog />
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Package className="h-10 w-10 opacity-40" />
            <div>
              <p className="text-sm font-medium text-foreground">No assets outside broker feeds yet</p>
              <p className="text-xs">
                Add property, gold, pensions, and other holdings to extend your portfolio view beyond broker feeds.
              </p>
            </div>
            <OtherAssetFormDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden border-border/70">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-medium tabular-nums text-foreground">
                      {formatCurrency(asset.value, baseCurrency)}
                    </p>
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          ASSET_TYPE_COLORS[asset.asset_type] ?? "bg-slate-400"
                        }`}
                      />
                      <span className="truncate font-medium">{asset.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <OtherAssetFormDialog asset={asset} />
                    <DeleteOtherAssetButton id={asset.id} name={asset.name} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {ASSET_TYPE_LABELS[asset.asset_type] ?? asset.asset_type}
                  </Badge>
                  {asset.is_zakatable && (
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                      Zakat relevant
                    </Badge>
                  )}
                  {asset.weight_grams != null && asset.weight_grams > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {asset.weight_grams}g
                    </Badge>
                  )}
                </div>

                {asset.notes && <p className="text-xs text-muted-foreground truncate">{asset.notes}</p>}
                <p className="text-xs text-muted-foreground">
                  {ASSET_UPKEEP_CUES[asset.asset_type] ?? "Keep details current"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
