"use client";

import { type ReactNode, useState } from "react";
import { Loader2, Pencil, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ReadOnlyWidgetGrid } from "@/components/ReadOnlyWidgetGrid";
import { WidgetLayoutProvider, useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";
import type { DashboardPageId, WidgetLayoutItem } from "@/lib/widget-registry";

type WidgetCustomizerModule = typeof import("./WidgetCustomizerClient");
type ActivationAction = "edit" | "customize";

let widgetCustomizerModulePromise: Promise<WidgetCustomizerModule> | null = null;

function loadWidgetCustomizerModule() {
  if (!widgetCustomizerModulePromise) {
    widgetCustomizerModulePromise = import("./WidgetCustomizerClient").catch((error) => {
      widgetCustomizerModulePromise = null;
      throw error;
    });
  }

  return widgetCustomizerModulePromise;
}

function WidgetCustomizerLoadButtons({
  loadingAction,
  onActivate,
}: {
  loadingAction: ActivationAction | null;
  onActivate: (action: ActivationAction) => Promise<void>;
}) {
  const { isCustomised } = useWidgetLayoutContext();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        disabled={loadingAction !== null}
        onClick={() => void onActivate("edit")}
      >
        {loadingAction === "edit" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Pencil className="h-3.5 w-3.5" />
        )}
        Edit Layout
      </Button>
      <Button
        aria-label="Customize layout"
        variant="ghost"
        size="icon"
        className="relative h-8 w-8"
        disabled={loadingAction !== null}
        onClick={() => void onActivate("customize")}
      >
        {loadingAction === "customize" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Settings2 className="h-4 w-4" />
        )}
        {isCustomised && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
        )}
      </Button>
    </>
  );
}

interface WidgetCustomizerShellProps {
  readonly header?: ReactNode;
  readonly actions?: ReactNode;
  readonly intro?: ReactNode;
  readonly children: ReactNode;
  readonly className: string;
}

function WidgetCustomizerShell({
  header,
  actions,
  intro,
  children,
  className,
}: WidgetCustomizerShellProps) {
  const [module, setModule] = useState<WidgetCustomizerModule | null>(null);
  const [loadingAction, setLoadingAction] = useState<ActivationAction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleActivate(action: ActivationAction) {
    if (module) {
      if (action === "edit") {
        setIsEditing(true);
      } else {
        setDrawerOpen(true);
      }
      return;
    }

    setLoadingAction(action);

    try {
      const loadedModule = await loadWidgetCustomizerModule();
      setModule(loadedModule);

      if (action === "edit") {
        setIsEditing(true);
      } else {
        setDrawerOpen(true);
      }
    } catch {
      toast.error("Could not load layout customization.");
    } finally {
      setLoadingAction(null);
    }
  }

  const WidgetCustomizerControls = module?.WidgetCustomizerControls;
  const EditableWidgetGrid = module?.EditableWidgetGrid;

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">{header}</div>
        <div className="flex shrink-0 items-center gap-1.5">
          {actions}
          {WidgetCustomizerControls ? (
            <WidgetCustomizerControls
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
            />
          ) : (
            <WidgetCustomizerLoadButtons
              loadingAction={loadingAction}
              onActivate={handleActivate}
            />
          )}
        </div>
      </div>

      {intro}

      {EditableWidgetGrid && isEditing ? (
        <EditableWidgetGrid>{children}</EditableWidgetGrid>
      ) : (
        <>
          <ReadOnlyWidgetGrid>{children}</ReadOnlyWidgetGrid>
        </>
      )}
    </div>
  );
}

interface LazyWidgetCustomizerProps {
  readonly pageId: DashboardPageId;
  readonly serverLayout: readonly WidgetLayoutItem[];
  readonly header?: ReactNode;
  readonly actions?: ReactNode;
  readonly intro?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function LazyWidgetCustomizer({
  pageId,
  serverLayout,
  header,
  actions,
  intro,
  children,
  className = "mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10",
}: LazyWidgetCustomizerProps) {
  return (
    <WidgetLayoutProvider pageId={pageId} serverLayout={serverLayout}>
      <WidgetCustomizerShell
        header={header}
        actions={actions}
        intro={intro}
        className={className}
      >
        {children}
      </WidgetCustomizerShell>
    </WidgetLayoutProvider>
  );
}
