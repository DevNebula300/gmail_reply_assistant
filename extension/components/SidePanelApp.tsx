import { useState } from "react";
import { ConnectGmail } from "./ConnectGmail";
import { ContextPreview } from "./ContextPreview";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { ReplyControls } from "./ReplyControls";
import { SuggestionList } from "./SuggestionList";
import {
  useActiveThread,
  useGenerateReplies,
  useSession,
  useThreadContext,
} from "../src/hooks/useAssistant";
import { ReplySuggestion } from "../src/lib/api-client";

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

  const handleGenerate = async () => {
    setSelectedText(null);
    await generateState.generate();
  };

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

  const isGenerateDisabled = !threadId || !context?.fingerprint;
  const generateDisabledReason = !threadId
    ? "Please select an active email thread in Gmail."
    : !context?.fingerprint
    ? "Thread context fingerprint missing. Please select or refresh an active thread."
    : undefined;

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

      <section className="mb-4">
        <ReplyControls
          tone={generateState.tone}
          setTone={generateState.setTone}
          length={generateState.length}
          setLength={generateState.setLength}
          instruction={generateState.instruction}
          setInstruction={generateState.setInstruction}
          onGenerate={() => void handleGenerate()}
          loading={generateState.loading}
          disabled={isGenerateDisabled}
          disabledReason={generateDisabledReason}
        />
      </section>

      {generateState.error && (
        <div className="mb-4">
          <ErrorState message={generateState.error} />
        </div>
      )}

      <section className="mb-4">
        <SuggestionList
          suggestions={generateState.result?.suggestions ?? []}
          selectedText={selectedText}
          onSelect={handleSelectSuggestion}
          onRegenerate={() => void handleGenerate()}
          loading={generateState.loading}
          disabled={isGenerateDisabled}
        />
      </section>

      {selectedText && (
        <section className="rounded-lg border border-green-200 bg-green-50 p-3">
          <h2 className="mb-1 text-sm font-semibold text-green-900">Selected draft</h2>
          <pre className="whitespace-pre-wrap font-sans text-sm text-green-900 leading-relaxed">
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


