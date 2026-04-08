"use client";

import { useState, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_ICONS } from "@/lib/categoryIcons";
import { FormDialog } from "@/components/FormDialog";
import { addCategory, editCategory } from "@/db/mutations/categories";

type Category = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
};

const PRESET_COLORS = [
  "#4CAF50", "#F44336", "#2196F3", "#FF9800",
  "#9C27B0", "#607D8B", "#E91E63", "#00BCD4",
  "#795548", "#CDDC39",
];

export function CategoryFormDialog({ category }: { category?: Category }) {
  const isEdit = !!category;
  const [selectedColor, setSelectedColor] = useState(category?.color ?? PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(category?.icon ?? null);
  const [iconSearch, setIconSearch] = useState("");

  const filteredIcons = useMemo(() => {
    const entries = Object.entries(CATEGORY_ICONS);
    if (!iconSearch) return entries;
    return entries.filter(([name]) => name.includes(iconSearch.toLowerCase()));
  }, [iconSearch]);

  const handleReset = useCallback(() => {
    if (!isEdit) {
      setSelectedColor(PRESET_COLORS[0]);
      setSelectedIcon(null);
      setIconSearch("");
    }
  }, [isEdit]);

  return (
    <FormDialog
      entityName="Category"
      isEdit={isEdit}
      onSubmit={(fd) => {
        fd.set("color", selectedColor);
        fd.set("icon", selectedIcon ?? "");
        return isEdit ? editCategory(category.id, fd) : addCategory(fd);
      }}
      description={{
        create: "Create a new spending category.",
        edit: "Update the category details.",
      }}
      onReset={handleReset}
    >
      {/* Name */}
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Subscriptions"
          defaultValue={category?.name ?? ""}
          required
        />
      </div>

      {/* Color */}
      <div className="grid gap-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                selectedColor === color
                  ? "border-foreground scale-110"
                  : "border-transparent hover:border-muted-foreground/50"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>

      {/* Icon */}
      <div className="grid gap-2">
        <Label>Icon</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto rounded-md border p-2">
          {filteredIcons.map(([name, Icon]) => (
            <button
              key={name}
              type="button"
              title={name}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                selectedIcon === name
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setSelectedIcon(selectedIcon === name ? null : name)}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          {filteredIcons.length === 0 && (
            <p className="col-span-8 text-center text-xs text-muted-foreground py-2">No icons found</p>
          )}
        </div>
        {selectedIcon && (
          <p className="text-xs text-muted-foreground">Selected: {selectedIcon}</p>
        )}
      </div>
    </FormDialog>
  );
}
