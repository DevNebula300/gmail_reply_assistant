const DEFAULT_BASE_URL = "http://localhost:8000";

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL,
  useMockApi: (import.meta.env.VITE_USE_MOCK_API ?? "true") === "true",
};

export type Tone = "professional" | "friendly" | "concise" | "formal" | "casual";
export type Length = "short" | "medium" | "detailed";

export interface ThreadMessage {
  id: string;
  from: string;
  to?: string[];
  date: string;
  body: string;
}

export interface ThreadContext {
  thread_id: string;
  subject: string;
  participants: string[];
  messages: ThreadMessage[];
  fingerprint?: string;
}

export interface SafetyWarning {
  code: string;
  message: string;
}

export interface ReplySuggestion {
  id: string;
  text: string;
  warnings?: SafetyWarning[];
}

export interface GenerateRepliesResponse {
  request_id: string;
  suggestions: ReplySuggestion[];
  thread_fingerprint?: string;
}

export interface UserSession {
  user_id: string;
  email: string;
  gmail_connected: boolean;
  display_name?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

const MOCK_THREAD: ThreadContext = {
  thread_id: "thread_mock_001",
  subject: "Project timeline follow-up",
  participants: ["alex@example.com", "you@example.com"],
  messages: [
    {
      id: "msg_001",
      from: "alex@example.com",
      date: "2026-07-18T14:30:00Z",
      body: "Hi, just checking whether we can confirm the delivery date for phase 1.",
    },
  ],
  fingerprint: "fp_mock_thread_001",
};

const MOCK_REPLIES: GenerateRepliesResponse = {
  request_id: "req_mock_local",
  thread_fingerprint: "fp_mock_thread_001",
  suggestions: [
    {
      id: "sug_1",
      text: "Hi Alex,\n\nThanks for following up. I will confirm the timeline shortly.\n\nBest regards",
    },
    {
      id: "sug_2",
      text: "Hi Alex,\n\nAppreciate the check-in. I need a bit more time before committing to a date.\n\nThanks",
      warnings: [
        {
          code: "date",
          message: "This reply mentions a date commitment not clearly supported by context.",
        },
      ],
    },
    {
      id: "sug_3",
      text: "Hi Alex,\n\nGot it — I will review and send an update soon.\n\nBest",
    },
  ],
};

export const api = {
  health: () => request<{ status: string; version: string }>("/health"),

  getSession: () =>
    config.useMockApi
      ? Promise.resolve<UserSession>({
          user_id: "user_dev_001",
          email: "dev@example.com",
          gmail_connected: false,
          display_name: "Dev User",
        })
      : request<UserSession>("/auth/me"),

  getThreadContext: (threadId: string) =>
    config.useMockApi
      ? Promise.resolve({ ...MOCK_THREAD, thread_id: threadId })
      : request<ThreadContext>(`/threads/${threadId}`),

  generateReplies: (payload: {
    thread_id: string;
    tone: Tone;
    length: Length;
    instruction?: string;
    thread_fingerprint?: string;
  }) =>
    config.useMockApi
      ? Promise.resolve({
          ...MOCK_REPLIES,
          request_id: `req_${Date.now()}`,
          thread_fingerprint: payload.thread_fingerprint ?? MOCK_REPLIES.thread_fingerprint,
        })
      : request<GenerateRepliesResponse>("/replies/generate", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
};
