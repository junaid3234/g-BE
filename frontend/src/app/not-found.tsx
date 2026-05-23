import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stethoscope, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {/* Orb-style icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--gradient-start)]/20 to-[var(--gradient-end)]/20 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full gradient-brand shadow-2xl">
          <Stethoscope className="h-10 w-10 text-white" />
        </div>
      </div>

      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
        404 — Page not found
      </p>
      <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
        Lost in the clinic?
      </h1>
      <p className="mt-4 max-w-md text-[var(--muted-foreground)]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/">
          <Button size="lg">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link href="/screening">
          <Button variant="outline" size="lg">
            Start Screening
          </Button>
        </Link>
      </div>
    </div>
  );
}
