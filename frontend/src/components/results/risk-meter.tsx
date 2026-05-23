"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const RISK_COLORS: Record<string, string> = {
  low: "from-emerald-400 to-teal-400",
  moderate: "from-amber-400 to-orange-400",
  high: "from-orange-500 to-rose-500",
  critical: "from-rose-600 to-red-700",
};

export function RiskMeter({
  riskLevel,
  confidence,
}: {
  riskLevel: string;
  confidence: number;
}) {
  const pct = Math.round(confidence * 100);
  const gradient = RISK_COLORS[riskLevel] || RISK_COLORS.moderate;

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <svg viewBox="0 0 200 120" className="w-full">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-sky-100 dark:text-slate-800"
        />
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#riskGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pct / 100 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={cn("stop-color-sky-500")} />
            <stop offset="100%" className={cn("stop-color-teal-500")} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-x-0 bottom-2 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-slate-900 dark:text-white"
        >
          {pct}%
        </motion.p>
        <p className={cn("text-sm font-medium capitalize bg-gradient-to-r bg-clip-text text-transparent", gradient)}>
          {riskLevel} risk
        </p>
      </div>
    </div>
  );
}

