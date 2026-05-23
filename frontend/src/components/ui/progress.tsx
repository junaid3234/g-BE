"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export function Progress({ value = 0, className }: { value?: number; className?: string }) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]",
        className
      )}
      value={value}
    >
      <ProgressPrimitive.Indicator
        className="h-full gradient-brand transition-all duration-500 ease-out"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
