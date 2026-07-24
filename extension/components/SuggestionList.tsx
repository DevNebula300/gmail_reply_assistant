import { ReplySuggestion } from "../src/lib/api-client";

interface Props {
  suggestions: ReplySuggestion[];
  selectedText?: string | null;
  onSelect: (suggestion: ReplySuggestion) => void;
  onRegenerate?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SuggestionList({
  suggestions,
  selectedText,
  onSelect,
  onRegenerate,
  loading = false,
  disabled = false,
}: Props) {
  if (suggestions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
        <p className="text-xs text-slate-500">Generate replies to see suggestions here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Suggestions</h2>
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={loading || disabled}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Regenerate suggestions"
          >
            {loading ? "Regenerating…" : "Regenerate"}
          </button>
        )}
      </div>

      <ul className="space-y-3" aria-label="Reply suggestions">
        {suggestions.map((suggestion, index) => {
          const isSelected = selectedText === suggestion.text;
          return (
            <li
              key={suggestion.id}
              className={`rounded-lg border p-3 shadow-sm transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Option {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onSelect(suggestion)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isSelected ? "Selected" : "Use this"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 leading-relaxed">
                {suggestion.text}
              </pre>
              {suggestion.warnings && suggestion.warnings.length > 0 && (
                <ul className="mt-2.5 space-y-1">
                  {suggestion.warnings.map((warning) => (
                    <li
                      key={`${suggestion.id}-${warning.code}`}
                      className="flex items-start gap-1.5 rounded bg-amber-50 px-2 py-1.5 text-xs text-amber-800 border border-amber-200/60"
                    >
                      <span className="shrink-0 font-bold">⚠️</span>
                      <span>{warning.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

