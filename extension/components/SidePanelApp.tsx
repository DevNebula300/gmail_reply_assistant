import { useState } from "react";
import { ContextPreview } from "./ContextPreview";
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
  const { session, loading: sessionLoading } = useSession();
  const threadId = useActiveThread();
  const { context, loading: contextLoading, error: contextError } = useThreadContext(threadId);
  const generateState = useGenerateReplies(threadId, context?.fingerprint);
  const [selectedText, setSelectedText] = useState<string | null>(null);

  const handleSelectSuggestion = (suggestion: ReplySuggestion) => {
    setSelectedText(suggestion.text);
    // TODO(phase-5): Insert into Gmail compose editor or save as draft
  };

  return (
    <div className="min-h-screen p-4">
      <header className="mb-4">
        <h1 className="text-lg font-semibold text-slate-900">Gmail Reply Assistant</h1>
        <p className="text-xs text-slate-500">
          Phase 0 scaffold — generate drafts only, never auto-send.
        </p>
      </header>

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Account</h2>
        {sessionLoading ? (
          <p className="text-sm text-slate-500">Checking session…</p>
        ) : session ? (
          <div className="text-sm text-slate-700">
            <p>{session.email}</p>
            <p className="text-xs text-slate-500">
              Gmail {session.gmail_connected ? "connected" : "not connected"}
            </p>
            {!session.gmail_connected && (
              <button
                type="button"
                className="mt-2 rounded-md border border-blue-600 px-3 py-1.5 text-xs font-medium text-blue-600"
                disabled
                title="Implement in Phase 2"
              >
                Connect Gmail (Phase 2)
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No session</p>
        )}
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
