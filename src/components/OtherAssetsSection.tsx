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
          <h2 className="text-lg font-semibold tracking-tight">Other Assets</h2>
          <p className="text-sm text-muted-foreground">
            Physical gold, silver, property, pensions, and more.
            {totalValue > 0 && ` Total: ${formatCurrency(totalValue, baseCurrency)}`}
          </p>
        </div>
        <OtherAssetFormDialog />
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Package className="h-10 w-10 opacity-40" />
            <div>
              <p className="text-sm font-medium text-foreground">No other assets yet</p>
              <p className="text-xs">Track physical gold, silver, property, pensions, and more.</p>
            </div>
            <OtherAssetFormDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden border-border/70">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${ASSET_TYPE_COLORS[asset.asset_type] ?? "bg-slate-400"}`} />
                    <span className="font-medium truncate">{asset.name}</span>
                  </div>
                  <span className="tabular-nums font-semibold whitespace-nowrap ml-2">
                    {formatCurrency(asset.value, baseCurrency)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">
                      {ASSET_TYPE_LABELS[asset.asset_type] ?? asset.asset_type}
                    </Badge>
                    {asset.is_zakatable && (
                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                        Zakatable
                      </Badge>
                    )}
                    {asset.weight_grams != null && asset.weight_grams > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        {asset.weight_grams}g
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <OtherAssetFormDialog asset={asset} />
                    <DeleteOtherAssetButton id={asset.id} name={asset.name} />
                  </div>
                </div>

                {asset.notes && (
                  <p className="text-xs text-muted-foreground truncate">{asset.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
