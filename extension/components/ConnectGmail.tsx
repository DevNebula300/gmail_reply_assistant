import { ErrorState } from "./ErrorState";

export interface ConnectGmailProps {
  onConnect: () => void;
  connecting: boolean;
  error?: string | null;
}

export function ConnectGmail({ onConnect, connecting, error }: ConnectGmailProps) {
  return (
    <div className="flex min-h-[400px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {/* Logo / Badge */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-900">Connect Gmail</h2>
        <p className="mt-2 text-sm text-slate-600">
          Authorize access to generate AI-powered reply suggestions directly in your side panel.
        </p>

        {/* Feature list */}
        <ul className="mt-6 w-full space-y-3 text-left">
          <li className="flex items-start text-xs text-slate-700">
            <span className="mr-2 text-blue-600">✓</span>
            <span>Reads email threads only when open to generate context-aware replies</span>
          </li>
          <li className="flex items-start text-xs text-slate-700">
            <span className="mr-2 text-blue-600">✓</span>
            <span>Creates initial draft suggestions — never auto-sends emails</span>
          </li>
          <li className="flex items-start text-xs text-slate-700">
            <span className="mr-2 text-blue-600">✓</span>
            <span>Secure OAuth 2.0 authentication directly with Google</span>
          </li>
        </ul>
      </div>

      {/* Action section */}
      <div className="mt-6 flex flex-col gap-3">
        {error && <ErrorState message={error} onRetry={onConnect} />}

        <button
          type="button"
          onClick={onConnect}
          disabled={connecting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {connecting ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                aria-hidden="true"
              />
              <span>Connecting to Google…</span>
            </>
          ) : (
            <span>Connect Gmail Account</span>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-400">
          By connecting, you agree to grant read and draft privileges to the assistant.
        </p>
      </div>
    </div>
  );
}
