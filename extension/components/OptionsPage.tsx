import { useState } from "react";

const TONES = ["professional", "friendly", "concise", "formal", "casual"] as const;
const LENGTHS = ["short", "medium", "detailed"] as const;

export interface StylePreferences {
  defaultTone: (typeof TONES)[number];
  defaultLength: (typeof LENGTHS)[number];
  greeting: string;
  signOff: string;
  phrasesToAvoid: string;
}

const DEFAULT_PREFERENCES: StylePreferences = {
  defaultTone: "professional",
  defaultLength: "medium",
  greeting: "",
  signOff: "",
  phrasesToAvoid: "",
};

export function OptionsPage() {
  const [preferences, setPreferences] = useState<StylePreferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);

  const updateField = <K extends keyof StylePreferences>(
    key: K,
    value: StylePreferences[K],
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO(phase-5): persist via PUT /preferences/style instead of local state only
    setSaved(true);
  };

  return (
    <div className="min-h-screen p-4">
      <header className="mb-4">
        <h1 className="text-lg font-semibold text-slate-900">Reply Assistant Settings</h1>
        <p className="text-xs text-slate-500">
          Phase 1 scaffold — preferences are local only and not yet persisted.
        </p>
      </header>

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Default writing style</h2>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <label className="text-xs text-slate-600">
            Default tone
            <select
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
              value={preferences.defaultTone}
              onChange={(e) =>
                updateField("defaultTone", e.target.value as StylePreferences["defaultTone"])
              }
            >
              {TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-600">
            Default length
            <select
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
              value={preferences.defaultLength}
              onChange={(e) =>
                updateField("defaultLength", e.target.value as StylePreferences["defaultLength"])
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
          Preferred greeting
          <input
            type="text"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder='e.g. "Hi [Name],"'
            value={preferences.greeting}
            onChange={(e) => updateField("greeting", e.target.value)}
          />
        </label>

        <label className="mb-3 block text-xs text-slate-600">
          Preferred sign-off
          <input
            type="text"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder='e.g. "Best regards,"'
            value={preferences.signOff}
            onChange={(e) => updateField("signOff", e.target.value)}
          />
        </label>

        <label className="mb-3 block text-xs text-slate-600">
          Phrases to avoid
          <textarea
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            rows={3}
            placeholder="One phrase per line"
            value={preferences.phrasesToAvoid}
            onChange={(e) => updateField("phrasesToAvoid", e.target.value)}
          />
        </label>

        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Save preferences
        </button>
        {saved && (
          <p className="mt-2 text-xs text-green-700">
            Saved locally. Backend sync arrives in Phase 5.
          </p>
        )}
      </section>
    </div>
  );
}
