import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "success" | "warning" | "danger" }) {
  const variants = {
    default: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    danger: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

