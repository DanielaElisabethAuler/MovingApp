"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProfile } from "@/app/actions";
import type { ProfileRow } from "@/lib/db/types";
import type { Style } from "@/lib/domain/types";

const GOALS = [
  { value: "Marathon", label: "Marathon", sub: "Auf ein großes Ziel hinarbeiten" },
  { value: "Stärker werden", label: "Stärker werden", sub: "Kraft & Muskeln aufbauen" },
  { value: "Dranbleiben", label: "Einfach dranbleiben", sub: "Konsistenz vor allem" },
  { value: "Besser schlafen", label: "Besser schlafen", sub: "Bewegung für die Erholung" },
];

const STYLES: { value: Style; label: string; sub: string }[] = [
  { value: "ambitioniert", label: "Ambitioniert", sub: "Größere Schritte, Decke offen" },
  { value: "nachhaltig", label: "Nachhaltig", sub: "Moderat & stetig" },
  { value: "dranbleiben", label: "Nur dranbleiben", sub: "Kleinster Nudge, Hauptsache dabei" },
];

const MODS = ["yoga", "joggen", "kraft", "dehnen", "spazieren"];
const TOTAL = 5;

function vibrate() {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
}

export function OnboardingForm({ profile }: { profile: ProfileRow | null }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(profile?.goal ?? "");
  const [style, setStyle] = useState<Style>(profile?.style ?? "nachhaltig");
  const [mods, setMods] = useState<string[]>(profile?.modalities ?? []);
  const [favorite, setFavorite] = useState(profile?.favorite_workout ?? "");
  const [music, setMusic] = useState(profile?.music_link ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = () => setStep((s) => Math.min(TOTAL - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  function pick<T>(setter: (v: T) => void, v: T) {
    vibrate();
    setter(v);
    setTimeout(next, 220);
  }

  function toggleMod(m: string) {
    vibrate();
    setMods((c) => (c.includes(m) ? c.filter((x) => x !== m) : [...c, m]));
  }

  async function finish() {
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.set("goal", goal);
    fd.set("style", style);
    fd.set("modalities", mods.join(","));
    fd.set("favorite_workout", favorite);
    fd.set("music_link", music);
    const res = await saveProfile(fd);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Fehler");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="onboarding">
      <div className="ob-panel">
        {step > 0 && (
          <button className="ob-back" onClick={back} aria-label="Zurück">
            ‹ zurück
          </button>
        )}

        <div className="ob-step" key={step}>
          {step === 0 && (
            <>
              <span className="eyebrow">Dein Ziel</span>
              <h1>Wohin willst du?</h1>
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  className={`ob-option${goal === g.value ? " sel" : ""}`}
                  onClick={() => pick(setGoal, g.value)}
                >
                  <span>
                    {g.label}
                    <span className="ob-sub">{g.sub}</span>
                  </span>
                </button>
              ))}
            </>
          )}

          {step === 1 && (
            <>
              <span className="eyebrow">Dein Stil</span>
              <h1>Wie willst du rangehen?</h1>
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  className={`ob-option${style === s.value ? " sel" : ""}`}
                  onClick={() => pick(setStyle, s.value)}
                >
                  <span>
                    {s.label}
                    <span className="ob-sub">{s.sub}</span>
                  </span>
                </button>
              ))}
            </>
          )}

          {step === 2 && (
            <>
              <span className="eyebrow">Bewegungsarten</span>
              <h1>Was machst du gern?</h1>
              <p className="ob-hint">Mehrere möglich.</p>
              {MODS.map((m) => (
                <button
                  key={m}
                  className={`ob-option${mods.includes(m) ? " sel" : ""}`}
                  style={{ textTransform: "capitalize" }}
                  onClick={() => toggleMod(m)}
                >
                  {m}
                  <span className="ob-check">{mods.includes(m) ? "✓" : ""}</span>
                </button>
              ))}
              <button
                className="primary full ob-next"
                disabled={mods.length === 0}
                onClick={next}
              >
                Weiter
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <span className="eyebrow">Für schwere Tage</span>
              <h1>Dein Lieblingsworkout?</h1>
              <p className="ob-hint">
                Schlägt dir die App vor, wenn du im Loch bist. Optional.
              </p>
              <input
                className="ob-input"
                type="text"
                value={favorite}
                onChange={(e) => setFavorite(e.target.value)}
                placeholder="z.B. lockerer Lauf mit Playlist"
              />
              <button className="primary full ob-next" onClick={next}>
                {favorite ? "Weiter" : "Überspringen"}
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <span className="eyebrow">Für den Antrieb</span>
              <h1>Ein Musik-Link?</h1>
              <p className="ob-hint">Für „im Loch"-Tage. Optional.</p>
              <input
                className="ob-input"
                type="url"
                value={music}
                onChange={(e) => setMusic(e.target.value)}
                placeholder="https://..."
              />
              <button className="primary full ob-next" disabled={busy} onClick={finish}>
                {busy ? "..." : "Fertig — los geht's"}
              </button>
              {error && <div className="error">{error}</div>}
            </>
          )}
        </div>

        <div className="ob-dots">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span
              key={i}
              className={`ob-dot${i === step ? " active" : ""}${i < step ? " done" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
