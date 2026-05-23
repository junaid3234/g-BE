import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "gradient-brand text-white shadow-md hover:brightness-110 active:scale-[0.98]",
        outline:
          "border-2 border-[var(--primary)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]",
        ghost:
          "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
        answer:
          "w-full justify-start border-2 border-[var(--border)] bg-[var(--card)] px-4 py-3.5 text-left text-[var(--foreground)] shadow-sm hover:border-[var(--primary)] hover:bg-[var(--muted)] active:border-[var(--primary)] active:bg-[color-mix(in_srgb,var(--primary)_12%,var(--card))]",
        glass:
          "border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_80%,transparent)] backdrop-blur hover:bg-[var(--card)]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
