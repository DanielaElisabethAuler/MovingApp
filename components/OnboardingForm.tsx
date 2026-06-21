"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProfile } from "@/app/actions";
import { STYLE_BIAS } from "@/config/styleBias";
import type { ProfileRow } from "@/lib/db/types";
import type { Style } from "@/lib/domain/types";

const DEFAULT_MODALITIES = ["yoga", "joggen", "kraft", "dehnen", "spazieren"];

// Onboarding (Spec 7.1): Wohin + Stil + Modalitaeten + Lieblingsworkout +
// Kalender verbinden. Der Stil ist der "langsame Regler" des Users (Spec 2.1) —
// das Tempo der Titration wird bewusst NICHT abgefragt (Spec 2.2).
export function OnboardingForm({ profile }: { profile: ProfileRow | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mods, setMods] = useState<string[]>(
    profile?.modalities ?? ["yoga", "joggen", "kraft"],
  );

  function toggleMod(m: string) {
    setMods((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("modalities", mods.join(","));
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
    <form className="card" onSubmit={onSubmit}>
      <h1>Lass uns starten</h1>
      <p className="muted">
        Das Ziel ist Konsistenz, nicht Stundenzahl. Der Boden bleibt winzig.
      </p>

      <label>Wohin willst du? (dein Ziel)</label>
      <input
        type="text"
        name="goal"
        defaultValue={profile?.goal ?? ""}
        placeholder="z.B. Marathon, staerker werden, einfach dranbleiben"
      />

      <label>Stil</label>
      <select name="style" defaultValue={profile?.style ?? "nachhaltig"}>
        {(Object.keys(STYLE_BIAS) as Style[]).map((s) => (
          <option key={s} value={s}>
            {STYLE_BIAS[s].label}
          </option>
        ))}
      </select>

      <label>Bewegungsarten (Rotation)</label>
      <div className="row">
        {DEFAULT_MODALITIES.map((m) => (
          <button
            type="button"
            key={m}
            className={mods.includes(m) ? "selected" : ""}
            onClick={() => toggleMod(m)}
          >
            {m}
          </button>
        ))}
      </div>

      <label>Lieblingsworkout (fuer schwere Tage)</label>
      <input
        type="text"
        name="favorite_workout"
        defaultValue={profile?.favorite_workout ?? ""}
        placeholder="z.B. lockerer Lauf mit Playlist"
      />

      <label>Musik-Link (fuer &quot;im Loch&quot;)</label>
      <input
        type="url"
        name="music_link"
        defaultValue={profile?.music_link ?? ""}
        placeholder="https://..."
      />

      <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16 }}>
        <input
          type="checkbox"
          name="google_calendar"
          defaultChecked={profile?.integrations?.google_calendar ?? false}
          style={{ width: "auto" }}
        />
        Google Calendar verbinden (Phase 1: Mock-Kalender)
      </label>

      <button className="primary full" style={{ marginTop: 18 }} disabled={busy}>
        {busy ? "..." : "Los geht's"}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
