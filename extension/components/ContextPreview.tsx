import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { ThreadContext } from "../src/lib/api-client";

interface Props {
  context: ThreadContext | null;
  loading: boolean;
  error: string | null;
}

export function ContextPreview({ context, loading, error }: Props) {
  if (loading) {
    return <LoadingState message="Fetching thread context…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!context) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
        <svg
          className="mx-auto h-8 w-8 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
        <p className="mt-2 text-xs font-medium text-slate-600">No active thread selected</p>
        <p className="mt-1 text-[11px] text-slate-500">
          Open or select an email thread in Gmail to inspect thread context and generate replies.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800 leading-snug">{context.subject}</h3>
        {context.fingerprint && (
          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
            {context.fingerprint.slice(0, 8)}
          </span>
        )}
      </div>

      {context.participants.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {context.participants.map((participant) => (
            <span
              key={participant}
              className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
            >
              {participant}
            </span>
          ))}
        </div>
      )}

      <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
        {context.messages.map((message) => (
          <article key={message.id} className="rounded-md bg-slate-50 p-2.5 border border-slate-100">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">{message.from}</span>
              {message.date && (
                <time className="text-[10px] text-slate-400">
                  {new Date(message.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              )}
            </div>
            <p className="whitespace-pre-wrap text-xs text-slate-600 leading-relaxed">
              {message.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

