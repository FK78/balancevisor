"use client";

import { useState, useTransition } from "react";
import { Settings, CheckCircle2, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveZakatSettings } from "@/db/mutations/zakat";

type ZakatSettings = {
  anniversary_date: string;
  nisab_type: string;
  use_lunar_calendar: boolean;
} | null;

export function ZakatSettingsDialog({ settings }: { settings: ZakatSettings }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"form" | "success">("form");
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setView("form");
    setOpen(nextOpen);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveZakatSettings(formData);
      setView("success");
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={settings ? "outline" : "default"} size="sm">
          <Settings className="mr-1 h-4 w-4" />
          {settings ? "Edit Settings" : "Set Anniversary"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {view === "success" ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Settings saved</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Settings saved!</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Your zakat anniversary has been updated.
                </p>
              </div>
            </div>
            <DialogFooter className="flex gap-2 sm:justify-center">
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Zakat Settings</DialogTitle>
              <DialogDescription>
                Set your zakat anniversary date and nisab preference. Zakat will be
                auto-calculated 1 day before your anniversary.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="anniversary_date">Anniversary Date</Label>
                <Input
                  id="anniversary_date"
                  name="anniversary_date"
                  type="date"
                  defaultValue={settings?.anniversary_date ?? ""}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The date you first became eligible for zakat, or your chosen annual date.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nisab_type">Nisab Threshold</Label>
                <Select name="nisab_type" defaultValue={settings?.nisab_type ?? "gold"}>
                  <SelectTrigger id="nisab_type">
                    <SelectValue placeholder="Select nisab type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">Gold (87.48g ≈ £5,686)</SelectItem>
                    <SelectItem value="silver">Silver (612.36g ≈ £398)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Gold nisab is more commonly used. Silver nisab results in a lower threshold.
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Settings
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
