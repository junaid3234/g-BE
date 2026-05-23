"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Activity,
  Brain,
  MessageSquare,
  Shield,
  Sparkles,
  Users,
  ArrowRight,
  Quote,
} from "lucide-react";
import { Hero } from "@/components/landing/hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    title: "Conversational Screening",
    desc: "ChatGPT-style one-question-at-a-time flow with typing indicators and progress tracking.",
    color: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-950/30",
  },
  {
    icon: Brain,
    title: "ML Risk Prediction",
    desc: "Random Forest classifier with confidence scores, severity levels, and SHAP explainability.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: Activity,
    title: "Live Risk Meter",
    desc: "Real-time visual risk assessment with animated gauges and clinical dashboards.",
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/30",
  },
  {
    icon: Shield,
    title: "HIPAA-Style Security",
    desc: "JWT auth, audit logs, rate limiting, and minimal PHI storage architecture.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
];

const stats = [
  { label: "Screening Accuracy", value: "83%", desc: "Validated on clinical dataset" },
  { label: "Questions Covered", value: "28", desc: "Across 4 clinical sections" },
  { label: "Avg. Completion", value: "8 min", desc: "Per screening session" },
  { label: "Severity Classes", value: "4", desc: "None · Mild · Moderate · Severe" },
];

const testimonials = [
  {
    quote:
      "GingiAI transformed our student dental screening program with an intuitive AI workflow.",
    author: "Dr. Sarah Chen",
    role: "Dental Public Health",
    initials: "SC",
  },
  {
    quote:
      "The conversational interface made patients comfortable sharing sensitive gum symptoms.",
    author: "James Okonkwo",
    role: "Clinical Researcher",
    initials: "JO",
  },
];

const workflow = [
  {
    step: "01",
    title: "Start Chat",
    desc: "Patient begins guided screening with Gingi AI assistant.",
  },
  {
    step: "02",
    title: "Collect Data",
    desc: "Hygiene habits, symptoms, and clinical indices captured step-by-step.",
  },
  {
    step: "03",
    title: "Predict Risk",
    desc: "Random Forest model classifies gingivitis and severity.",
  },
  {
    step: "04",
    title: "Get Report",
    desc: "Personalized recommendations, charts, and downloadable PDF.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function HomePage() {
  return (
    <div className="bg-[var(--background)]">
      <Hero />

      {/* ── Features ── */}
      <section id="features" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center"
          >
            <span className="mb-3 inline-block rounded-full border border-[var(--border)] bg-[var(--muted)] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Capabilities
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Enterprise-grade <span className="gradient-text">features</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[var(--muted-foreground)]">
              Built for clinical workflows with the polish of a consumer product.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[color-mix(in_srgb,var(--primary)_12%,transparent)]">
                  <div className={`mb-4 inline-flex rounded-xl p-2.5 ${f.bg}`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {f.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-[var(--border)] bg-[var(--muted)] px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center"
            >
              <p className="text-4xl font-extrabold gradient-text">{s.value}</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{s.label}</p>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Workflow ── */}
      <section
        id="workflow"
        className="px-4 py-24 sm:px-6"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center"
          >
            <span className="mb-3 inline-block rounded-full border border-[var(--border)] bg-[var(--muted)] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Process
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
              AI <span className="gradient-text">workflow</span>
            </h2>
          </motion.div>

          <div className="relative grid gap-6 md:grid-cols-4">
            {/* Connector line */}
            <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent md:block" />

            {workflow.map((w, i) => (
              <motion.div
                key={w.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card relative p-6"
              >
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-sm font-bold text-white shadow-md">
                  {w.step}
                </span>
                <h3 className="mt-2 font-semibold text-[var(--foreground)]">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {w.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="border-t border-[var(--border)] bg-[var(--muted)] px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center"
          >
            <span className="mb-3 inline-block rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Testimonials
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Trusted by <span className="gradient-text">clinicians</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="relative p-8">
                  <Quote className="absolute right-6 top-6 h-8 w-8 text-[var(--border)]" />
                  <Sparkles className="mb-4 h-5 w-5 text-teal-500" />
                  <p className="text-base leading-relaxed text-[var(--foreground)]">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-brand text-sm font-bold text-white">
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{t.author}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl gradient-brand p-12 text-center text-white shadow-2xl shadow-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
        >
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <Users className="relative mx-auto mb-5 h-12 w-12 opacity-90" />
          <h2 className="relative text-3xl font-extrabold">Ready to screen smarter?</h2>
          <p className="relative mt-3 text-lg opacity-90">
            Start your AI-assisted gingivitis assessment in under 10 minutes.
          </p>
          <Link href="/screening" className="relative mt-8 inline-block">
            <Button
              size="lg"
              className="group bg-white text-[var(--primary)] shadow-lg hover:bg-white/95 hover:shadow-xl"
            >
              Start Screening Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
