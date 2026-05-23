export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type ScreeningState = {
  sessionId: string | null;
  questionKey: string | null;
  options: string[] | null;
  inputType: "choice" | "number" | "text";
  progress: number;
  section: string | null;
  completed: boolean;
};
