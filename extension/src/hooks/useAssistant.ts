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
  const [threadId, setThreadId] = useState<string | null>(
    config.useMockApi ? "thread_mock_001" : null,
  );

  useEffect(() => {
    if (typeof chrome === "undefined") {
      return;
    }

    if (chrome.storage?.session) {
      chrome.storage.session.get("activeThreadId").then((result) => {
        if (typeof result.activeThreadId === "string") {
          setThreadId(result.activeThreadId);
        } else if (result.activeThreadId === null) {
          setThreadId(null);
        }
      });
    }

    const storageListener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === "session" && changes.activeThreadId) {
        const newValue = changes.activeThreadId.newValue;
        setThreadId(typeof newValue === "string" ? newValue : null);
      }
    };

    const messageListener = (message: { type?: string; threadId?: string | null }) => {
      if (message?.type === "THREAD_CHANGED" || message?.type === "OPEN_SIDE_PANEL") {
        setThreadId(typeof message.threadId === "string" ? message.threadId : null);
      }
    };

    if (chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener(storageListener);
    }
    if (chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener);
    }

    return () => {
      if (chrome.storage?.onChanged) {
        chrome.storage.onChanged.removeListener(storageListener);
      }
      if (chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    };
  }, []);

  return threadId;
}

export function useThreadContext(threadId: string | null) {
  const [context, setContext] = useState<ThreadContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!threadId) {
      setContext(null);
      setLoading(false);
      setError(null);
      return;
    }

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

export function useGenerateReplies(threadId: string | null, fingerprint?: string) {
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("medium");
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState<GenerateRepliesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!threadId) {
      setError("No active thread selected in Gmail.");
      return;
    }

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

