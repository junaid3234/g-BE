"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { PredictResponse } from "@/lib/api";
import { api } from "@/lib/api";
import { ResultsDashboard } from "@/components/results/results-dashboard";

export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem(`gingiai-result-${sessionId}`);
    if (cached) {
      setResult(JSON.parse(cached));
      return;
    }
    api
      .predict(sessionId)
      .then(setResult)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load results"));
  }, [sessionId]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-rose-600">{error}</div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return <ResultsDashboard sessionId={sessionId} result={result} />;
}
