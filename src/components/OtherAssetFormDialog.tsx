"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/FormDialog";
import { addOtherAsset, editOtherAsset } from "@/db/mutations/other-assets";
import { ASSET_TYPES, isZakatableByDefault } from "@/lib/other-asset-types";

export type OtherAsset = {
  id: string;
  name: string;
  asset_type: string;
  value: number;
  weight_grams: number | null;
  is_zakatable: boolean;
  notes: string | null;
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  gold: "Gold",
  silver: "Silver",
  property: "Property",
  pension: "Pension",
  vehicle: "Vehicle",
  collectible: "Collectible",
  business: "Business Asset",
  cash: "Cash (physical)",
  other: "Other",
};

const METAL_TYPES = new Set(["gold", "silver"]);

export function OtherAssetFormDialog({ asset }: { asset?: OtherAsset } = {}) {
  const isEdit = !!asset;
  const [assetType, setAssetType] = useState(asset?.asset_type ?? "gold");

  const isMetal = METAL_TYPES.has(assetType);

  return (
    <FormDialog
      entityName="Asset"
      isEdit={isEdit}
      onSubmit={(fd) => isEdit ? editOtherAsset(asset.id, fd) : addOtherAsset(fd)}
      description={{
        create: "Add a physical or non-account asset. Gold and silver can be tracked by weight for live price valuation.",
        edit: "Update the asset details.",
      }}
      trigger={isEdit ? (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Pencil className="h-4 w-4" />
        </Button>
      ) : undefined}
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Wedding ring, Buy-to-let flat"
          defaultValue={asset?.name ?? ""}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="asset_type">Type</Label>
        <Select
          name="asset_type"
          defaultValue={assetType}
          onValueChange={setAssetType}
        >
          <SelectTrigger id="asset_type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {ASSET_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {ASSET_TYPE_LABELS[type] ?? type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isMetal && (
        <div className="grid gap-2">
          <Label htmlFor="weight_grams">Weight (grams)</Label>
          <Input
            id="weight_grams"
            name="weight_grams"
            type="number"
            step="0.01"
            min="0"
            defaultValue={asset?.weight_grams ?? ""}
            placeholder="e.g. 50"
          />
          <p className="text-xs text-muted-foreground">
            If provided, value will be auto-calculated from live {assetType} prices.
          </p>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="value">Value ({isMetal ? "manual override" : "estimated"})</Label>
        <Input
          id="value"
          name="value"
          type="number"
          step="0.01"
          min="0"
          defaultValue={asset?.value ?? 0}
          placeholder="0"
        />
        {isMetal && (
          <p className="text-xs text-muted-foreground">
            Leave at 0 if you entered a weight — value will be computed from live prices.
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_zakatable"
          name="is_zakatable"
          defaultChecked={asset?.is_zakatable ?? isZakatableByDefault(assetType)}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="is_zakatable" className="text-sm font-normal">
          Include in Zakat calculation
        </Label>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea
          id="notes"
          name="notes"
          placeholder="Any additional details..."
          defaultValue={asset?.notes ?? ""}
          rows={2}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </FormDialog>
  );
}
