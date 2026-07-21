export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-md border border-red-600 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          Retry
        </button>
      )}
    </div>
  );
}
