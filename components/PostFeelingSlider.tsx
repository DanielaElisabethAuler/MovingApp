"use client";

import { useState } from "react";

// Spec 3.2: ein cleaner, befriedigend ziehbarer Slider. Der User sieht nur den
// Slider — intern liefert er aber IMMER einen numerischen Wert (0..100), den
// der Delta-Reward (3.3) braucht. "Schoen zu ziehen" und "liefert eine Zahl"
// sind kein Widerspruch.

const EMOJIS = ["😣", "😕", "😐", "🙂", "😄"];
const LABELS = ["im Loch", "geht so", "okay", "gut", "stark"];

export function PostFeelingSlider({
  onConfirm,
  busy,
}: {
  onConfirm: (value: number) => void;
  busy?: boolean;
}) {
  const [value, setValue] = useState(60);

  const bucket = Math.min(4, Math.floor(value / 20));
  const color =
    value < 33 ? "var(--bad)" : value < 66 ? "var(--warn)" : "var(--good)";

  return (
    <div className="card feeling">
      <h1>Wie geht&apos;s dir?</h1>
      <p className="muted">Nach der Einheit — zieh einfach.</p>

      <div className="feeling-emoji" style={{ transform: `scale(${1 + value / 400})` }}>
        {EMOJIS[bucket]}
      </div>
      <div className="feeling-value" style={{ color }}>
        {value}
      </div>
      <div className="muted">{LABELS[bucket]}</div>

      <input
        className="slider"
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label="Befinden nach der Einheit"
      />

      <div className="step-dots">
        {LABELS.map((_, i) => (
          <span key={i} className={i === bucket ? "on" : ""} />
        ))}
      </div>

      <button
        className="primary full"
        disabled={busy}
        onClick={() => onConfirm(value)}
      >
        {busy ? "..." : "Speichern"}
      </button>
    </div>
  );
}
