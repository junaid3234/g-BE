"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Moon, Sun, Stethoscope, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#workflow", label: "How it works" },
  { href: "/screening", label: "Screening" },
  { href: "/admin", label: "Admin" },
];

function ClerkAuthButtons() {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return null;
  if (isSignedIn) return <UserButton />;
  return (
    <>
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm">Sign up</Button>
      </SignUpButton>
    </>
  );
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-[var(--border)] bg-[var(--card)]/95 shadow-sm shadow-[color-mix(in_srgb,var(--primary)_8%,transparent)] backdrop-blur-xl"
            : "border-b border-transparent bg-[var(--card)]/80 backdrop-blur-md"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-semibold"
            aria-label="GingiAI home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-md transition-shadow group-hover:shadow-lg group-hover:shadow-[color-mix(in_srgb,var(--primary)_30%,transparent)]">
              <Stethoscope className="h-5 w-5" />
            </span>
            <span className="gradient-text text-lg font-bold tracking-tight">GingiAI</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("#")[0]) && link.href.split("#")[0] !== "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--muted)] text-[var(--primary)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="rounded-lg"
            >
              <Sun className="h-4.5 w-4.5 dark:hidden" />
              <Moon className="hidden h-4.5 w-4.5 dark:block" />
            </Button>

            <Link href="/screening" className="hidden sm:block">
              <Button size="sm" className="shadow-sm">Start Screening</Button>
            </Link>

            {hasClerk && (
              <div className="hidden sm:flex items-center gap-2">
                <ClerkAuthButtons />
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-[var(--border)] bg-[var(--card)] px-4 pb-4 pt-2 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-[var(--border)] pt-3">
                <Link href="/screening">
                  <Button size="sm" className="w-full">Start Screening</Button>
                </Link>
                {hasClerk && <ClerkAuthButtons />}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
