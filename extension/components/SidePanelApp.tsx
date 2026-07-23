import { useState } from "react";
import { ConnectGmail } from "./ConnectGmail";
import { ContextPreview } from "./ContextPreview";
import { LoadingState } from "./LoadingState";
import { SuggestionList } from "./SuggestionList";
import {
  useActiveThread,
  useGenerateReplies,
  useSession,
  useThreadContext,
} from "../src/hooks/useAssistant";
import { ReplySuggestion } from "../src/lib/api-client";

const TONES = ["professional", "friendly", "concise", "formal", "casual"] as const;
const LENGTHS = ["short", "medium", "detailed"] as const;

export function SidePanelApp() {
  const {
    session,
    loading: sessionLoading,
    connecting,
    error: sessionError,
    login,
    logout,
  } = useSession();
  const threadId = useActiveThread();
  const { context, loading: contextLoading, error: contextError } = useThreadContext(threadId);
  const generateState = useGenerateReplies(threadId, context?.fingerprint);
  const [selectedText, setSelectedText] = useState<string | null>(null);

  const handleSelectSuggestion = (suggestion: ReplySuggestion) => {
    setSelectedText(suggestion.text);
    // TODO(phase-5): Insert into Gmail compose editor or save as draft
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen p-4">
        <LoadingState message="Checking connection status…" />
      </div>
    );
  }

  if (!session || !session.gmail_connected) {
    return (
      <div className="min-h-screen p-4">
        <header className="mb-4">
          <h1 className="text-lg font-semibold text-slate-900">Gmail Reply Assistant</h1>
          <p className="text-xs text-slate-500">
            Generate contextual drafts safely without auto-sending.
          </p>
        </header>
        <ConnectGmail onConnect={() => void login()} connecting={connecting} error={sessionError} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <header className="mb-4">
        <h1 className="text-lg font-semibold text-slate-900">Gmail Reply Assistant</h1>
        <p className="text-xs text-slate-500">
          Generate contextual drafts safely without auto-sending.
        </p>
      </header>

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Account</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Connected
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
          <div>
            <p className="font-medium text-slate-900">{session.display_name ?? session.email}</p>
            <p className="text-xs text-slate-500">{session.email}</p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Disconnect
          </button>
        </div>
      </section>

      <section className="mb-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Context preview</h2>
        <ContextPreview
          context={context}
          loading={contextLoading}
          error={contextError}
        />
      </section>

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Generate replies</h2>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <label className="text-xs text-slate-600">
            Tone
            <select
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
              value={generateState.tone}
              onChange={(e) => generateState.setTone(e.target.value as typeof generateState.tone)}
            >
              {TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-600">
            Length
            <select
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
              value={generateState.length}
              onChange={(e) =>
                generateState.setLength(e.target.value as typeof generateState.length)
              }
            >
              {LENGTHS.map((length) => (
                <option key={length} value={length}>
                  {length}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mb-3 block text-xs text-slate-600">
          Instruction (optional)
          <input
            type="text"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder='e.g. "decline politely"'
            value={generateState.instruction}
            onChange={(e) => generateState.setInstruction(e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={() => void generateState.generate()}
          disabled={generateState.loading}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {generateState.loading ? "Generating…" : "Generate 3 replies"}
        </button>
        {generateState.error && (
          <p className="mt-2 text-xs text-red-600">{generateState.error}</p>
        )}
      </section>

      <section className="mb-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Suggestions</h2>
        <SuggestionList
          suggestions={generateState.result?.suggestions ?? []}
          onSelect={handleSelectSuggestion}
        />
      </section>

      {selectedText && (
        <section className="rounded-lg border border-green-200 bg-green-50 p-3">
          <h2 className="mb-1 text-sm font-semibold text-green-900">Selected draft</h2>
          <pre className="whitespace-pre-wrap font-sans text-sm text-green-900">
            {selectedText}
          </pre>
          <p className="mt-2 text-xs text-green-700">
            Phase 5 will insert this into Gmail or save as a draft.
          </p>
        </section>
      )}
    </div>
  );
}

