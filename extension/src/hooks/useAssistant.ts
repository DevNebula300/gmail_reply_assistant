import { useCallback, useEffect, useState } from "react";
import {
  api,
  config,
  GenerateRepliesResponse,
  Length,
  setAuthToken,
  ThreadContext,
  Tone,
  UserSession,
} from "../lib/api-client";

export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSession();
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const { authorization_url } = await api.startGoogleAuth();

      let token: string | null = null;

      if (typeof chrome !== "undefined" && chrome.identity?.launchWebAuthFlow) {
        const redirectUrl = await chrome.identity.launchWebAuthFlow({
          url: authorization_url,
          interactive: true,
        });
        if (redirectUrl) {
          const urlObj = new URL(redirectUrl);
          token = urlObj.searchParams.get("token") || urlObj.searchParams.get("code");
        }
      }

      // Fallback for mock mode or test environment
      if (!token && config.useMockApi) {
        token = "mock_session_token_dev2026";
      }

      if (token) {
        await setAuthToken(token);
      }

      const updatedSession = await api.getSession();
      setSession(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setConnecting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.logout();
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return { session, loading, connecting, error, login, logout, refresh };
}

export function useActiveThread() {
  const [threadId, setThreadId] = useState<string>("thread_mock_001");

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.session) {
      chrome.storage.session.get("activeThreadId").then((result) => {
        if (typeof result.activeThreadId === "string") {
          setThreadId(result.activeThreadId);
        }
      });
    }
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
