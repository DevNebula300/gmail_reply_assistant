import { LENGTH_OPTIONS, Length, TONE_OPTIONS, Tone } from "../src/lib/api-client";

interface Props {
  tone: Tone;
  setTone: (tone: Tone) => void;
  length: Length;
  setLength: (length: Length) => void;
  instruction: string;
  setInstruction: (instruction: string) => void;
  onGenerate: () => void;
  loading: boolean;
  disabled: boolean;
  disabledReason?: string;
}

export function ReplyControls({
  tone,
  setTone,
  length,
  setLength,
  instruction,
  setInstruction,
  onGenerate,
  loading,
  disabled,
  disabledReason,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">Generate replies</h2>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <label className="text-xs text-slate-600">
          Tone
          <select
            className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            disabled={isDisabled}
            aria-label="Tone"
          >
            {TONE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-600">
          Length
          <select
            className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            value={length}
            onChange={(e) => setLength(e.target.value as Length)}
            disabled={isDisabled}
            aria-label="Length"
          >
            {LENGTH_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mb-3 block text-xs text-slate-600">
        Instruction (optional)
        <input
          type="text"
          className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          placeholder='e.g. "decline politely"'
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={isDisabled}
          aria-label="Instruction"
        />
      </label>

      {disabled && disabledReason && (
        <p className="mb-2 text-xs text-amber-700 font-medium">{disabledReason}</p>
      )}

      <button
        type="button"
        onClick={onGenerate}
        disabled={isDisabled}
        className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Generating…" : "Generate 3 replies"}
      </button>
    </section>
  );
}
