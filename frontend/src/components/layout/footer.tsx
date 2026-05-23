import Link from "next/link";
import { Stethoscope, Heart, GitFork, Globe, Rss } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--card)]">
      {/* Subtle gradient top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-60" />

      <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-lg">
                <Stethoscope className="h-5 w-5" />
              </span>
              <span className="gradient-text text-lg font-bold tracking-tight">GingiAI</span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              AI-assisted gingivitis screening for educational and preventive care workflows.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://github.com/vkchavan/GingiAI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <GitFork className="h-4 w-4" />
              </a>
              <a
                href="https://jvxlabs.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="JVX Labs website"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Blog"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <Rss className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--muted-foreground)]">
              <li>
                <Link href="/screening" className="transition-colors hover:text-[var(--primary)]">
                  Screening
                </Link>
              </li>
              <li>
                <Link href="/#features" className="transition-colors hover:text-[var(--primary)]">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#workflow" className="transition-colors hover:text-[var(--primary)]">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/admin" className="transition-colors hover:text-[var(--primary)]">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">
              Compliance
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--muted-foreground)]">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                HIPAA-style design
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Audit logging
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Encrypted transit
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Minimal PHI storage
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">
              Disclaimer
            </h4>
            <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
              GingiAI is not a medical diagnosis tool. Results are for educational and
              preventive purposes only. Always consult a licensed dental professional
              for clinical evaluation and treatment.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-[var(--border)]" />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-[var(--muted-foreground)]">
            &copy; {year} GingiAI. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            Made with{" "}
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            {" "}by{" "}
            <a
              href="https://www.instagram.com/jvxlabs?igsh=NHlqeHIzbTRuZnUy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--primary)] transition-opacity hover:opacity-80"
            >
              JVX Labs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
