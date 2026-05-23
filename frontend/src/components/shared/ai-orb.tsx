"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE_MAP = {
  sm: { outer: "h-16 w-16", icon: "h-7 w-7", ring1: "h-20 w-20", ring2: "h-24 w-24" },
  md: { outer: "h-28 w-28", icon: "h-12 w-12", ring1: "h-36 w-36", ring2: "h-44 w-44" },
  lg: { outer: "h-44 w-44", icon: "h-20 w-20", ring1: "h-56 w-56", ring2: "h-72 w-72" },
};

export function AIOrb({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const s = SIZE_MAP[size];

  return (
    <div className={cn("relative flex items-center justify-center", s.ring2, className)}>
      {/* Outer pulse ring 2 */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.05, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "absolute rounded-full border border-[var(--primary)]",
          s.ring2
        )}
      />
      {/* Outer pulse ring 1 */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.1, 0.25] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className={cn(
          "absolute rounded-full border border-[var(--primary)]",
          s.ring1
        )}
      />
      {/* Glow blob */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "absolute rounded-full bg-gradient-to-br from-[var(--gradient-start)]/30 to-[var(--gradient-end)]/30 blur-2xl",
          s.outer
        )}
      />
      {/* Main orb */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "relative flex items-center justify-center rounded-full gradient-brand shadow-2xl",
          s.outer
        )}
        style={{
          boxShadow:
            "0 0 40px color-mix(in srgb, var(--primary) 40%, transparent), 0 20px 60px color-mix(in srgb, var(--primary) 20%, transparent)",
        }}
      >
        {/* Inner highlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
        <Bot className={cn("relative text-white drop-shadow-lg", s.icon)} />
      </motion.div>
    </div>
  );
}
