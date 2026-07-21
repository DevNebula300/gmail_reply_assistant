import { ThreadContext } from "../src/lib/api-client";

interface Props {
  context: ThreadContext | null;
  loading: boolean;
  error: string | null;
}

export function ContextPreview({ context, loading, error }: Props) {
  if (loading) {
    return <p className="text-sm text-slate-500">Loading thread context…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!context) {
    return <p className="text-sm text-slate-500">No thread context available.</p>;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <h2 className="mb-1 text-sm font-semibold text-slate-800">{context.subject}</h2>
      <p className="mb-2 text-xs text-slate-500">
        {context.participants.join(" · ")}
      </p>
      <div className="max-h-32 space-y-2 overflow-y-auto">
        {context.messages.map((message) => (
          <article key={message.id} className="rounded bg-slate-50 p-2">
            <p className="text-xs font-medium text-slate-600">{message.from}</p>
            <p className="text-xs text-slate-700">{message.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
