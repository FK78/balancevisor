import { PointerSensor } from "@dnd-kit/react";
import { PointerActivationConstraints } from "@dnd-kit/dom";

/**
 * Shared sensor configuration for all DragDropProviders.
 * - Touch: 200ms delay with 10px tolerance (prevents scroll conflicts)
 * - Mouse: 5px distance threshold (prevents accidental drags)
 */
export const mobileFriendlySensors = [
  PointerSensor.configure({
    activationConstraints(event) {
      if (event.pointerType === "touch") {
        return [
          new PointerActivationConstraints.Delay({
            value: 200,
            tolerance: 10,
          }),
        ];
      }
      return [
        new PointerActivationConstraints.Distance({ value: 5 }),
      ];
    },
  }),
];
