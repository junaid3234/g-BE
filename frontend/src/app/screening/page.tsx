import { ChatInterface } from "@/components/chat/chat-interface";
import { Stethoscope } from "lucide-react";

export const metadata = {
  title: "Screening | GingiAI",
  description: "AI-assisted gingivitis screening conversation",
};

export default function ScreeningPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Page header */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-5 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-md">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--foreground)]">AI Dental Screening</h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              Answer each question to complete your gingivitis assessment
            </p>
          </div>
        </div>
      </div>
      <ChatInterface />
    </div>
  );
}
