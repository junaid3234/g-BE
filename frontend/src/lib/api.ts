const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type ChatStartResponse = {
  session_id: string;
  message: { role: string; content: string };
  question_key: string;
  options: string[] | null;
  input_type: string;
  progress: number;
  section: string;
};

export type ChatAnswerResponse = {
  session_id: string;
  message: { role: string; content: string } | null;
  question_key: string | null;
  options: string[] | null;
  input_type: string;
  progress: number;
  section: string | null;
  completed: boolean;
};

export type PredictResponse = {
  session_id: string | null;
  prediction_id: string | null;
  has_gingivitis: boolean;
  severity: string;
  severity_score: number;
  confidence: number;
  risk_level: string;
  feature_importance: { feature: string; importance: number }[];
  recommendations: string[];
  explanation: string;
  model_version: string;
};

export type AnalyticsOverview = {
  total_users: number;
  total_screenings: number;
  completed_screenings: number;
  gingivitis_positive_rate: number;
  severity_distribution: Record<string, number>;
  recent_submissions: {
    session_id: string;
    status: string;
    started_at: string;
    severity: string | null;
    has_gingivitis: boolean | null;
  }[];
};

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API request failed");
  }
  return res.json();
}

export const api = {
  startChat: () => fetchApi<ChatStartResponse>("/chat/start", { method: "POST" }),
  answerChat: (sessionId: string, questionKey: string, answer: string) =>
    fetchApi<ChatAnswerResponse>("/chat/answer", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, question_key: questionKey, answer }),
    }),
  predict: (sessionId: string) =>
    fetchApi<PredictResponse>("/predict", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    }),
  getReport: (sessionId: string) => fetchApi<unknown>(`/reports/session/${sessionId}`),
  getAnalytics: (token?: string) =>
    fetchApi<AnalyticsOverview>("/analytics/overview", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  exportCsv: (token?: string) =>
    `${API_URL}/analytics/export${token ? "" : ""}`,
  pdfUrl: (sessionId: string) => `${API_URL}/reports/session/${sessionId}/pdf`,
  health: () => fetchApi<{ status: string }>("/health"),
};
