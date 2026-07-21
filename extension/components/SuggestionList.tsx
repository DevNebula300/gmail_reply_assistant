import { ReplySuggestion } from "../src/lib/api-client";

interface Props {
  suggestions: ReplySuggestion[];
  onSelect: (suggestion: ReplySuggestion) => void;
}

export function SuggestionList({ suggestions, onSelect }: Props) {
  if (suggestions.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Generate replies to see suggestions here.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {suggestions.map((suggestion, index) => (
        <li
          key={suggestion.id}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Option {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onSelect(suggestion)}
              className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Use this
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">
            {suggestion.text}
          </pre>
          {suggestion.warnings && suggestion.warnings.length > 0 && (
            <ul className="mt-2 space-y-1">
              {suggestion.warnings.map((warning) => (
                <li
                  key={`${suggestion.id}-${warning.code}`}
                  className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-800"
                >
                  {warning.message}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
