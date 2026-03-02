"use client";

import { useTransition } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerZakatCalculation } from "@/db/mutations/zakat";

export function CalculateZakatButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await triggerZakatCalculation(false);
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending} size="sm">
      {isPending ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <Calculator className="mr-1 h-4 w-4" />
      )}
      Calculate Zakat Now
    </Button>
  );
}
