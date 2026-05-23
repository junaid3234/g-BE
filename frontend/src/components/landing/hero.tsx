"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIOrb } from "@/components/shared/ai-orb";

const TRUST_BADGES = [
  "83% screening accuracy",
  "28 clinical questions",
  "HIPAA-style design",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-28 pt-16 sm:px-6">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,color-mix(in_srgb,var(--secondary)_8%,transparent),transparent)]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Pill badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-4 py-1.5 text-sm font-medium text-[var(--primary)]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Dental Screening
          </motion.span>

          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Intelligent{" "}
            <span className="gradient-text">Gingivitis</span>{" "}
            Screening
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted-foreground)]">
            GingiAI guides patients through conversational oral health assessments,
            predicts gingivitis risk with machine learning, and delivers personalized
            preventive recommendations — in minutes.
          </p>

          {/* Trust badges */}
          <ul className="mt-6 flex flex-wrap gap-3">
            {TRUST_BADGES.map((badge) => (
              <li
                key={badge}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {badge}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/screening">
              <Button size="lg" className="group shadow-lg shadow-[color-mix(in_srgb,var(--primary)_25%,transparent)]">
                Start Screening
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/#workflow">
              <Button variant="outline" size="lg">
                See how it works
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right — orb + floating cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex justify-center"
        >
          {/* Glow backdrop */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_18%,transparent)_0%,transparent_70%)] blur-3xl" />

          <AIOrb size="lg" />

          {/* Floating stat card — top right */}
          <motion.div
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute -right-4 top-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-xl sm:right-0"
          >
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Accuracy</p>
            <p className="text-2xl font-bold gradient-text">83%</p>
          </motion.div>

          {/* Floating stat card — bottom left */}
          <motion.div
            initial={{ opacity: 0, x: -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="absolute -left-4 bottom-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-xl sm:left-0"
          >
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Avg. completion</p>
            <p className="text-2xl font-bold gradient-text">8 min</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
