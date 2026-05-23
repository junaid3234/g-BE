"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Mic, Send } from "lucide-react";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/types";
import { AIOrb } from "@/components/shared/ai-orb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageBubble } from "./message-bubble";
import { QuestionPanel } from "./question-panel";
import { TypingIndicator } from "./typing-indicator";

const SECTION_LABELS: Record<string, string> = {
  A: "Basic Information",
  B: "Oral Hygiene Practices",
  C: "Gingival Symptoms",
  D: "Clinical Assessment",
};

const TOTAL_QUESTIONS = 28;

export function ChatInterface() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionKey, setQuestionKey] = useState<string | null>(null);
  const [options, setOptions] = useState<string[] | null>(null);
  const [inputType, setInputType] = useState<"choice" | "number" | "text">("choice");
  const [progress, setProgress] = useState(0);
  const [section, setSection] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentQuestionText = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    return lastAssistant?.content ?? "";
  }, [messages]);

  const questionNumber = useMemo(
    () => Math.max(1, Math.min(TOTAL_QUESTIONS, Math.round((progress / 100) * TOTAL_QUESTIONS) + 1)),
    [progress]
  );

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.startChat();
        if (cancelled) return;
        setSessionId(res.session_id);
        setQuestionKey(res.question_key);
        setOptions(res.options);
        setInputType(res.input_type as "choice" | "number" | "text");
        setProgress(res.progress);
        setSection(res.section);
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: res.message.content,
            timestamp: new Date(),
          },
        ]);
      } catch (e) {
        setError(
          e instanceof Error
            ? `${e.message}. Start the backend: cd backend && uvicorn app.main:app --reload`
            : "Failed to start screening. Is the API running on port 8000?"
        );
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submitAnswer = async (answer: string) => {
    if (!sessionId || !questionKey || !answer.trim()) return;
    setError(null);
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", content: answer, timestamp: new Date() },
    ]);
    setTextInput("");
    setTyping(true);

    try {
      await new Promise((r) => setTimeout(r, 500));
      const res = await api.answerChat(sessionId, questionKey, answer.trim());
      setTyping(false);
      setProgress(res.progress);
      setSection(res.section);

      if (res.completed) {
        if (res.message) {
          setMessages((m) => [
            ...m,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: res.message!.content,
              timestamp: new Date(),
            },
          ]);
        }
        const pred = await api.predict(sessionId);
        sessionStorage.setItem(`gingiai-result-${sessionId}`, JSON.stringify(pred));
        router.push(`/results/${sessionId}`);
        return;
      }

      if (res.message) {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: res.message!.content,
            timestamp: new Date(),
          },
        ]);
      }
      setQuestionKey(res.question_key);
      setOptions(res.options);
      setInputType(res.input_type as "choice" | "number" | "text");
    } catch (e) {
      setTyping(false);
      setError(e instanceof Error ? e.message : "Failed to submit answer");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
        <p className="font-medium text-[var(--muted-foreground)]">Initializing Gingi assistant...</p>
      </div>
    );
  }

  if (error && !sessionId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Card className="border-2 border-[var(--destructive)] bg-[color-mix(in_srgb,var(--destructive)_8%,var(--card))] p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[var(--destructive)]" />
          <h2 className="text-lg font-bold text-[var(--foreground)]">Cannot load questionnaire</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[300px_1fr]">
      <aside className="hidden lg:block">
        <Card className="sticky top-24 space-y-4 border-2">
          <div className="flex items-center gap-3">
            <AIOrb size="sm" />
            <div>
              <p className="font-bold text-[var(--foreground)]">Gingi Assistant</p>
              <p className="text-xs text-[var(--muted-foreground)]">Screening in progress</p>
            </div>
          </div>
          <Progress value={progress} />
          <p className="text-sm font-semibold text-[var(--primary)]">{Math.round(progress)}% complete</p>
          {section && (
            <p className="rounded-xl border-2 border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]">
              Section {section}: {SECTION_LABELS[section] || section}
            </p>
          )}
        </Card>
      </aside>

      <Card className="flex h-[calc(100vh-10rem)] min-h-[520px] flex-col overflow-hidden border-2 p-0 shadow-xl">
        {/* Mobile progress */}
        <div className="shrink-0 border-b border-[var(--border)] bg-[var(--muted)] px-4 py-3 lg:hidden">
          <Progress value={progress} />
          <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">
            {Math.round(progress)}% — Section {section}: {section ? SECTION_LABELS[section] : ""}
          </p>
        </div>

        {/* Always-visible current question */}
        {currentQuestionText && (
          <QuestionPanel
            questionText={currentQuestionText}
            section={section}
            sectionLabel={section ? SECTION_LABELS[section] || section : ""}
            questionNumber={questionNumber}
          />
        )}

        {/* Chat history — scrollable middle */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--background)] p-4">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Conversation
          </p>
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Answer area — fixed at bottom, high contrast */}
        <div className="shrink-0 border-t-2 border-[var(--primary)] bg-[var(--card)] p-4 shadow-[0_-8px_24px_color-mix(in_srgb,var(--primary)_12%,transparent)]">
          <p className="mb-3 text-sm font-bold text-[var(--foreground)]">Your answer</p>

          {error && (
            <p className="mb-3 flex items-center gap-2 rounded-lg border border-[var(--destructive)] bg-[color-mix(in_srgb,var(--destructive)_10%,var(--card))] px-3 py-2 text-sm text-[var(--destructive)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          {options && options.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((opt) => (
                <Button
                  key={opt}
                  variant="answer"
                  onClick={() => submitAnswer(opt)}
                  disabled={typing}
                >
                  {opt}
                </Button>
              ))}
            </div>
          ) : inputType === "number" ? (
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                submitAnswer(textInput);
              }}
            >
              <label className="sr-only" htmlFor="age-input">Age</label>
              <input
                id="age-input"
                type="number"
                min={1}
                max={120}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your age (e.g. 25)"
                className="screening-input flex-1"
                autoFocus
              />
              <Button type="submit" disabled={typing || !textInput.trim()} className="sm:w-auto">
                <Send className="h-4 w-4" />
                Submit
              </Button>
            </form>
          ) : (
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                submitAnswer(textInput);
              }}
            >
              <input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your answer..."
                className="screening-input flex-1"
              />
              <Button type="submit" disabled={typing || !textInput.trim()}>
                <Send className="h-4 w-4" />
                Submit
              </Button>
            </form>
          )}

          <Button variant="ghost" size="sm" className="mt-3 w-full opacity-60" disabled>
            <Mic className="mr-2 h-4 w-4" />
            Voice assistant (coming soon)
          </Button>
        </div>
      </Card>
    </div>
  );
}
