"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { quickRecategorise } from "@/db/mutations/transactions";
import type { CategoryWithColor } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CategorySourceBadge } from "@/components/CategorySourceBadge";

export function InlineCategoryPicker({
  transactionId,
  currentCategoryId,
  categorySource,
  merchantName,
  categories,
}: {
  transactionId: string;
  currentCategoryId: string | null;
  categorySource: string | null;
  merchantName: string | null;
  categories: CategoryWithColor[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const currentCategory = currentCategoryId
    ? categories.find((c) => c.id === currentCategoryId)
    : null;

  function handleSelect(categoryId: string) {
    if (categoryId === currentCategoryId) {
      setOpen(false);
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);
    setOpen(false);

    startTransition(async () => {
      try {
        await quickRecategorise(transactionId, categoryId);
        toast.success(
          `Got it — future "${merchantName ?? "similar"}" transactions → ${cat?.name ?? "selected category"}`,
        );
        router.refresh();
      } catch {
        toast.error("Failed to update category");
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-xs font-normal"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : currentCategory ? (
              <>
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: currentCategory.color }}
                />
                <span className="truncate max-w-[100px]">{currentCategory.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Uncategorised</span>
            )}
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="start">
          <div className="max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate flex-1 text-left">{cat.name}</span>
                {cat.id === currentCategoryId && (
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <CategorySourceBadge source={categorySource} />
    </div>
  );
}
