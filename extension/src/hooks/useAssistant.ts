import { useCallback, useEffect, useState } from "react";
import {
  api,
  GenerateRepliesResponse,
  Length,
  ThreadContext,
  Tone,
  UserSession,
} from "../lib/api-client";

export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSession()
      .then(setSession)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { session, loading, error };
}

export function useActiveThread() {
  const [threadId, setThreadId] = useState<string>("thread_mock_001");

  useEffect(() => {
    chrome.storage.session.get("activeThreadId").then((result) => {
      if (typeof result.activeThreadId === "string") {
        setThreadId(result.activeThreadId);
      }
    });
  }, []);

  return threadId;
}

export function useThreadContext(threadId: string) {
  const [context, setContext] = useState<ThreadContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .getThreadContext(threadId)
      .then(setContext)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [threadId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { context, loading, error, refresh };
}

export function useGenerateReplies(threadId: string, fingerprint?: string) {
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("medium");
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState<GenerateRepliesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateReplies({
        thread_id: threadId,
        tone,
        length,
        instruction: instruction.trim() || undefined,
        thread_fingerprint: fingerprint,
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [threadId, tone, length, instruction, fingerprint]);

  return {
    tone,
    setTone,
    length,
    setLength,
    instruction,
    setInstruction,
    result,
    loading,
    error,
    generate,
  };
}
