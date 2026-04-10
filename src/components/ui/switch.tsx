"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[24px] w-[44px] shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-[#34C759] dark:data-[state=checked]:bg-[#30D158] data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-[20px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2),0_1px_1px_rgba(0,0,0,0.06)] ring-0 transition-transform data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
