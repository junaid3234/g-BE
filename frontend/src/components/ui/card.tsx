import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--card-foreground)] shadow-sm transition-shadow",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
