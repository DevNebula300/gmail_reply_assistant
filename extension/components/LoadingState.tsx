export interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading…" }: LoadingStateProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
      <span
        className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
        aria-hidden="true"
      />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
