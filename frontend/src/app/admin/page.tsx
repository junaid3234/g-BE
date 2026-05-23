"use client";

import { useEffect, useState } from "react";
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
import { Download, Search, Users, Activity, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import type { AnalyticsOverview } from "@/lib/api";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PIE_COLORS = ["#10b981", "#f59e0b", "#f97316", "#ef4444", "#64748b"];

export default function AdminPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAnalytics()
      .then(setData)
      .catch(() => {
        setData({
          total_users: 0,
          total_screenings: 0,
          completed_screenings: 0,
          gingivitis_positive_rate: 0,
          severity_distribution: { none: 0, mild: 0, moderate: 0, severe: 0 },
          recent_submissions: [],
        });
        setError("Connect backend & auth for live analytics. Showing demo layout.");
      });
  }, []);

  const severityChart = data
    ? Object.entries(data.severity_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const filtered = (data?.recent_submissions || []).filter(
    (s) => !search || s.session_id.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { icon: Users, label: "Total Users", value: data?.total_users ?? "—", color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/30" },
    { icon: Activity, label: "Screenings", value: data?.total_screenings ?? "—", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
    { icon: CheckCircle2, label: "Completed", value: data?.completed_screenings ?? "—", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    {
      icon: TrendingUp,
      label: "Positive Rate",
      value: data ? `${Math.round(data.gingivitis_positive_rate * 100)}%` : "—",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-[var(--muted-foreground)]">
              Screening analytics &amp; patient management
            </p>
          </div>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/analytics/export`}
          >
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </a>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/30">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-300">{error}</p>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <Card key={s.label} className="flex items-center gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-5 font-semibold text-[var(--foreground)]">Severity Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    strokeWidth={0}
                    label={({ name, percent }) =>
                      (percent ?? 0) > 0 ? `${name} ${((percent ?? 0) * 100).toFixed(0)}%` : ""
                    }
                  >
                    {severityChart.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
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
            </div>
          </Card>

          <Card>
            <h3 className="mb-5 font-semibold text-[var(--foreground)]">Screening Volume</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Submissions table */}
        <Card>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-semibold text-[var(--foreground)]">Recent Submissions</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search session ID…"
                className="screening-input h-9 py-0 pl-9 pr-4 text-sm"
                style={{ width: "220px" }}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  <th className="pb-3 pr-4">Session</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Severity</th>
                  <th className="pb-3">Started</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[var(--muted-foreground)]">
                      No submissions yet. Complete a screening to populate data.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.session_id}
                      className="border-b border-[var(--border)] transition-colors hover:bg-[var(--muted)]"
                    >
                      <td className="py-3 pr-4 font-mono text-xs text-[var(--muted-foreground)]">
                        {row.session_id.slice(0, 8)}…
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={row.status === "completed" ? "success" : "default"}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 capitalize text-[var(--foreground)]">
                        {row.severity || "—"}
                      </td>
                      <td className="py-3 text-[var(--muted-foreground)]">
                        {new Date(row.started_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
