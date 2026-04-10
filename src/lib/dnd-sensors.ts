import { PointerSensor } from "@dnd-kit/react";
import { PointerActivationConstraints } from "@dnd-kit/dom";

/**
 * Shared sensor configuration for desktop DragDropProviders.
 * Mobile uses ▲/▼ buttons instead of DnD, so only desktop constraints needed.
 * 5px distance threshold prevents accidental drags on click.
 */
export const mobileFriendlySensors = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 5 }),
    ],
  }),
];
