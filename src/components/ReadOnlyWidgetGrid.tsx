"use client";

import { Children, type ReactElement, type ReactNode, useMemo } from "react";
import { useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";

interface ReadOnlyWidgetGridProps {
  readonly children: ReactNode;
}

export function ReadOnlyWidgetGrid({ children }: ReadOnlyWidgetGridProps) {
  const { layout } = useWidgetLayoutContext();

  const orderedChildren = useMemo(() => {
    const childMap = new Map<string, ReactElement>();

    Children.forEach(children, (child) => {
      if (child && typeof child === "object" && "props" in child) {
        const props = (child as ReactElement<{ id?: string }>).props;
        if (props.id) {
          childMap.set(props.id, child as ReactElement);
        }
      }
    });

    const result: ReactElement[] = [];

    for (const item of layout) {
      if (!item.visible) continue;

      const child = childMap.get(item.widgetId);
      if (child) {
        result.push(child);
      }
    }

    for (const [id, child] of childMap) {
      if (!layout.some((item) => item.widgetId === id)) {
        result.push(child);
      }
    }

    return result;
  }, [children, layout]);

  return <>{orderedChildren}</>;
}
