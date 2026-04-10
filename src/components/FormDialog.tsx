"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Plus, Pencil, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import posthog from "posthog-js";

type FormDialogProps = {
  entityName: string;
  isEdit: boolean;
  onSubmit: (formData: FormData) => Promise<unknown>;
  trigger?: ReactNode;
  title?: { create: string; edit: string };
  description?: { create: string; edit: string };
  successDescription?: { create: string; edit: string };
  submitLabel?: { create: string; edit: string };
  onReset?: () => void;
  contentClassName?: string;
  children: ReactNode;
};

export function FormDialog({
  entityName,
  isEdit,
  onSubmit,
  trigger,
  title,
  description,
  successDescription,
  submitLabel,
  onReset,
  contentClassName = "sm:max-w-md",
  children,
}: FormDialogProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"form" | "success">("form");
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);

  const entityLower = entityName.toLowerCase();

  const t = {
    title: title ?? { create: `Add ${entityName}`, edit: `Edit ${entityName}` },
    description: description ?? {
      create: `Add a new ${entityLower}.`,
      edit: `Update the ${entityLower} details.`,
    },
    successDescription: successDescription ?? {
      create: `Your new ${entityLower} has been created.`,
      edit: `Your ${entityLower} has been updated.`,
    },
    submitLabel: submitLabel ?? { create: `Add ${entityName}`, edit: "Save Changes" },
  };

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setView("form");
      onReset?.();
    }
    setOpen(nextOpen);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await onSubmit(formData);
        const event = `${entityName.toLowerCase()}_${isEdit ? "edited" : "added"}`;
        posthog.capture(event, { entity: entityName });
        toast.success(isEdit ? `${entityName} updated` : `${entityName} added`);
        setView("success");
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  function handleAddAnother() {
    setFormKey((k) => k + 1);
    setView("form");
    onReset?.();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (isEdit ? (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            {t.title.create}
          </Button>
        ))}
      </DialogTrigger>
      <DialogContent mobileLayout="full-height" className={contentClassName}>
        {view === "success" ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>
                {isEdit ? `${entityName} updated` : `${entityName} added`}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {isEdit ? `${entityName} updated!` : `${entityName} added!`}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {isEdit ? t.successDescription.edit : t.successDescription.create}
                </p>
              </div>
            </div>
            <DialogFooter mobileSticky className="flex gap-2 sm:justify-center">
              {!isEdit && (
                <Button variant="outline" onClick={handleAddAnother}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Another
                </Button>
              )}
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{isEdit ? t.title.edit : t.title.create}</DialogTitle>
              <DialogDescription>
                {isEdit ? t.description.edit : t.description.create}
              </DialogDescription>
            </DialogHeader>
            <form key={formKey} onSubmit={handleSubmit} className="grid gap-4">
              {children}
              <DialogFooter mobileSticky>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? t.submitLabel.edit : t.submitLabel.create}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
