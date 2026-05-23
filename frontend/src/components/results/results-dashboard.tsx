"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar, Download, ShieldAlert, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";
import type { PredictResponse } from "@/lib/api";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RiskMeter } from "./risk-meter";

const SEVERITY_COLORS: Record<string, string> = {
  none: "#10b981",
  mild: "#f59e0b",
  moderate: "#f97316",
  severe: "#ef4444",
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

export function ResultsDashboard({
  sessionId,
  result,
}: {
  sessionId: string;
  result: PredictResponse;
}) {
  const featureData = (result.feature_importance || [])
    .slice(0, 6)
    .map((f) => ({
      name: f.feature.replace(/_/g, " ").slice(0, 20),
      value: Math.round(f.importance * 1000) / 10,
    }));

  const isHighRisk = result.risk_level === "high" || result.risk_level === "critical";

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <div className="mb-2 flex items-center gap-2">
            {result.has_gingivitis ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            )}
            <span className="text-sm font-medium text-[var(--muted-foreground)]">
              Session {sessionId.slice(0, 8)}…
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
            Screening Results
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--muted-foreground)]">{result.explanation}</p>
        </div>
        <div className="flex gap-2">
          <a href={api.pdfUrl(sessionId)} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </a>
          <Link href="/screening">
            <Button size="sm">
              <RotateCcw className="h-4 w-4" />
              New Screening
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Risk overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Card className="flex flex-col items-center justify-center py-8">
            <RiskMeter riskLevel={result.risk_level} confidence={result.confidence} />
          </Card>
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="md:col-span-2"
        >
          <Card className="h-full space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={result.has_gingivitis ? "danger" : "success"}>
                {result.has_gingivitis ? "Gingivitis Likely" : "Low Risk"}
              </Badge>
              <Badge variant="warning" className="capitalize">
                Severity: {result.severity}
              </Badge>
              <Badge>Model: {result.model_version}</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Confidence" value={`${Math.round(result.confidence * 100)}%`} />
              <Stat label="Severity Score" value={result.severity_score.toFixed(2)} />
              <Stat label="Risk Level" value={result.risk_level} />
            </div>
            {isHighRisk && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/30">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Your results indicate elevated risk. We strongly recommend scheduling a professional dental evaluation.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <Card>
            <h3 className="mb-5 font-semibold text-[var(--foreground)]">Key Contributing Factors</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <Card>
            <h3 className="mb-5 font-semibold text-[var(--foreground)]">Severity Classification</h3>
            <div className="relative h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ name: result.severity, value: 1 }]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    strokeWidth={0}
                  >
                    <Cell fill={SEVERITY_COLORS[result.severity] || "var(--primary)"} />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold capitalize text-[var(--foreground)]">
                  {result.severity}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">severity</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
        <Card>
          <h3 className="mb-5 flex items-center gap-2 font-semibold text-[var(--foreground)]">
            <ShieldAlert className="h-5 w-5 text-[var(--primary)]" />
            Personalized Recommendations
          </h3>
          <ul className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-[var(--foreground)]">{rec}</span>
              </motion.li>
            ))}
          </ul>
        </Card>
      </motion.div>

      {/* Schedule CTA */}
      <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
        <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/30">
              <Calendar className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)]">Schedule a Dental Visit</p>
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                Based on your{" "}
                <span className="font-medium capitalize text-[var(--primary)]">
                  {result.risk_level}
                </span>{" "}
                risk profile, we recommend booking a professional evaluation.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <a href={api.pdfUrl(sessionId)} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </a>
            <Link href="/screening">
              <Button>
                <RotateCcw className="h-4 w-4" />
                New Screening
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4">
      <p className="text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-xl font-bold capitalize text-[var(--foreground)]">{value}</p>
    </div>
  );
}
