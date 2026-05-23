export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-[var(--border)] border-t-[var(--primary)] animate-spin" />
        <div className="absolute inset-0 rounded-full bg-[var(--primary)]/10 blur-xl" />
      </div>
      <p className="text-sm font-medium text-[var(--muted-foreground)] animate-pulse">
        Loading GingiAI…
      </p>
    </div>
  );
}
