"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "gradient-brand font-medium text-white shadow-md"
            : "border-2 border-[var(--border)] bg-[var(--chat-bot)] font-medium text-[var(--foreground)] shadow-sm"
        )}
      >
        {content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
