import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
React.ElementRef<typeof SwitchPrimitives.Root>,
React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
        className={cn(
            "peer inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors",
            "data-[state=checked]:bg-lime-500 data-[state=unchecked]:bg-gray-400", // 검정색 대신 연두색 사용
            className
        )}
        {...props}
        ref={ref}
    >
      <SwitchPrimitives.Thumb
          className={cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-1 ring-gray-300",
              "data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
          )}
      />
    </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
