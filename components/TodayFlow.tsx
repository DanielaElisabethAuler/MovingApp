"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { completeDay, missDay, startDay } from "@/app/actions";
import { NO_SHOW_REASON_LIST } from "@/config/noShowReasons";
import { SITUATION_CONFIG } from "@/config/situations";
import type { DailyEntryRow, ProfileRow } from "@/lib/db/types";
import type { SituationGuess } from "@/lib/domain/guess";
import { SITUATIONS, type NoShowReason, type Situation } from "@/lib/domain/types";
import { PostFeelingSlider } from "./PostFeelingSlider";

export function TodayFlow({
  profile,
  entry,
  guess,
}: {
  profile: ProfileRow;
  entry: DailyEntryRow | null;
  guess: SituationGuess;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lokale Schritte vor dem ersten Speichern.
  const [situation, setSituation] = useState<Situation | null>(null);
  const [floor, setFloor] = useState<number>(10);
  const [picking, setPicking] = useState(false); // Vermutung abgelehnt -> Kacheln
  const [showMore, setShowMore] = useState(false); // "etwas anderes?"
  const [selecting, setSelecting] = useState<Situation | null>(null); // Tap-Animation
  // Nach dem Plan: Outcome-Verzweigung.
  const [missMode, setMissMode] = useState(false);
  const [doneMode, setDoneMode] = useState(false);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    const res = await fn();
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Fehler");
      return;
    }
    router.refresh();
  }

  // Fuehlbares Tippen: Haptik + kurzes "Atmen" der Kachel, dann weicher Wechsel.
  function choose(s: Situation) {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
    setSelecting(s);
    setTimeout(() => {
      setSituation(s);
      setSelecting(null);
    }, 220);
  }

  // ---- Ergebnis schon geloggt: Zusammenfassung -----------------------------
  if (entry && entry.outcome === "done") {
    return (
      <div className="card">
        <h1>Stark — erledigt ✅</h1>
        <p className="muted">
          {entry.proposed_plan.modality} · {entry.proposed_plan.dose_min} Min.
          Befinden danach: {entry.post_feeling}/100.
        </p>
        <p className="muted">Komm morgen wieder. Die Kette waechst.</p>
      </div>
    );
  }

  if (entry && entry.outcome === "no_show") {
    return (
      <div className="card">
        <h1>Heute nicht — alles gut.</h1>
        <p className="muted">
          {entry.streak_forgiven
            ? "Ein verpasster Tag ist okay. Die Kette bleibt — erst zwei in Folge brechen sie."
            : "Morgen ist ein neuer Versuch. Klein anfangen reicht."}
        </p>
      </div>
    );
  }

  // ---- Plan liegt vor, Outcome offen ---------------------------------------
  if (entry && entry.outcome === null) {
    const plan = entry.proposed_plan;

    if (missMode) {
      return (
        <div className="card">
          <h1>Warum hat&apos;s nicht geklappt?</h1>
          <p className="muted">Kurz antippen — kein Freitext.</p>
          <div className="row" style={{ marginTop: 12 }}>
            {NO_SHOW_REASON_LIST.map((r) => (
              <button
                key={r.reason}
                className="choice"
                disabled={busy}
                onClick={() => run(() => missDay({ reason: r.reason as NoShowReason }))}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button className="linklike" onClick={() => setMissMode(false)} disabled={busy}>
            Zurück
          </button>
          {error && <div className="error">{error}</div>}
        </div>
      );
    }

    if (doneMode) {
      return (
        <PostFeelingSlider
          busy={busy}
          onConfirm={(v) => run(() => completeDay({ postFeeling: v }))}
        />
      );
    }

    return (
      <div className="card">
        <div className="gradient-strip" />
        <span className="eyebrow">Dein Plan</span>
        <div style={{ marginBottom: 8 }}>
          {plan.is_floor_only ? (
            <span className="pill floor">Boden gesichert</span>
          ) : (
            <span className="pill">Boden + titriert</span>
          )}
          {plan.fragments && (
            <span className="pill">
              {plan.fragments.length}× {plan.fragments[0]} Min
            </span>
          )}
          {plan.ceilingOpen && <span className="pill ceiling">Decke offen</span>}
          {entry.calendar_packed && <span className="pill">voller Tag</span>}
        </div>
        <div className="plan-dose">{plan.dose_min} Min</div>
        <h1 style={{ marginTop: 4, textTransform: "capitalize" }}>{plan.modality}</h1>
        <p className="muted">{plan.timing}</p>
        <p className="muted">{plan.rationale}</p>
        {plan.preferFavorite && profile.music_link && (
          <p className="muted">
            🎵 <a href={profile.music_link} target="_blank" rel="noreferrer">Musik an</a>
          </p>
        )}

        <div className="row" style={{ marginTop: 18 }}>
          <button
            className="primary"
            style={{ flex: 1 }}
            disabled={busy}
            onClick={() => setDoneMode(true)}
          >
            Gemacht
          </button>
          <button style={{ flex: 1 }} disabled={busy} onClick={() => setMissMode(true)}>
            Nicht geschafft
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>
    );
  }

  // ---- Situation: erst raten, dann (falls nötig) wählen --------------------
  if (!situation) {
    // Vermutung bestätigen (eine Entscheidung statt fünf).
    if (!picking) {
      const g = SITUATION_CONFIG[guess.situation];
      return (
        <div className="card">
          <span className="eyebrow">Dein Tag</span>
          <h1>{g.feeling}</h1>
          <p className="muted">{guess.reason} Passt das?</p>
          <button
            className="primary full"
            style={{ marginTop: 18 }}
            onClick={() => choose(guess.situation)}
          >
            Ja, los
          </button>
          <button className="linklike" onClick={() => setPicking(true)}>
            Ne, ist anders
          </button>
        </div>
      );
    }

    // Kacheln: Wort + Icon, reduziert (2 wahrscheinliche + "etwas anderes?").
    const others = SITUATIONS.filter((s) => s !== guess.situation);
    const prominent = others.slice(0, 2);
    const rest = others.slice(2);

    const tile = (s: Situation) => {
      const cfg = SITUATION_CONFIG[s];
      return (
        <button
          key={s}
          className={`choice tile${selecting === s ? " breathe" : ""}`}
          onClick={() => choose(s)}
        >
          <span className="tile-icon">{cfg.icon}</span>
          <span className="tile-word">{cfg.tile}</span>
        </button>
      );
    };

    return (
      <div className="card">
        <span className="eyebrow">Dein Tag</span>
        <h1>Wie fühlt sich heute an?</h1>
        <div className="row" style={{ marginTop: 14 }}>{prominent.map(tile)}</div>
        {!showMore ? (
          <button className="linklike" onClick={() => setShowMore(true)}>
            etwas anderes?
          </button>
        ) : (
          <div className="row" style={{ marginTop: 10 }}>{rest.map(tile)}</div>
        )}
      </div>
    );
  }

  // ---- Boden-Eingabe (Erklärung erscheint JETZT, nach der Wahl) ------------
  const cfg = SITUATION_CONFIG[situation];
  return (
    <div className="card">
      <button
        className="linklike back"
        onClick={() => {
          setSituation(null);
          setPicking(false);
          setShowMore(false);
        }}
      >
        ← zurück
      </button>

      <div className="chosen">
        <span className="chosen-icon">{cfg.icon}</span>
        <div>
          <strong>{cfg.feeling}</strong>
          <span className="muted">{cfg.hint}</span>
        </div>
      </div>

      <span className="eyebrow">Der Boden</span>
      <h1>Was ist das Kleinste, das du jetzt machst?</h1>
      <p className="muted">Winzig genug, dass du ihn sicher schaffst.</p>
      <label>Minuten</label>
      <input
        type="number"
        min={1}
        max={240}
        value={floor}
        onChange={(e) => setFloor(Number(e.target.value))}
      />
      <button
        className="primary full"
        style={{ marginTop: 16 }}
        disabled={busy || floor < 1}
        onClick={() => run(() => startDay({ situation, floorOffer: floor }))}
      >
        {busy ? "..." : "Plan vorschlagen"}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
