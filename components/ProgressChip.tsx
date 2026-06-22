"use client";

import { useEffect, useState } from "react";
import type { ProgressStats } from "@/lib/progress";

export function ProgressChip({ stats }: { stats: ProgressStats }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false); // fuer die Regler-Animation

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setShown(true), 30);
      return () => clearTimeout(t);
    }
    setShown(false);
  }, [open]);

  return (
    <>
      <button className="progress-chip" onClick={() => setOpen(true)} aria-label="Fortschritt">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l6 -6l4 4l8 -8" />
          <path d="M14 7l7 0l0 7" />
        </svg>
        <span className="chip-text">{stats.phase}</span>
      </button>

      {open && (
        <div className="prog-overlay" onClick={() => setOpen(false)}>
          <div className="prog-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prog-modal-head">
              <div>
                <span className="eyebrow">Dein Fortschritt</span>
                <h2>Was du schon verbessert hast</h2>
              </div>
              <button className="prog-close" onClick={() => setOpen(false)} aria-label="Schließen">
                ✕
              </button>
            </div>

            {stats.streak > 0 && (
              <p className="muted" style={{ marginTop: -4 }}>
                Aktuelle Kette: <strong>{stats.streak} Tage</strong> 🔥
              </p>
            )}

            <div style={{ marginTop: 16 }}>
              {stats.metrics.map((m) => (
                <div className="prog-metric" key={m.key}>
                  <div className="prog-head">
                    <span>{m.label}</span>
                    <span className="prog-val">
                      {m.hasData ? `${Math.round(m.value * 100)}%` : "—"}
                    </span>
                  </div>
                  <div className="prog-track">
                    <div
                      className="prog-fill"
                      style={{ width: shown && m.hasData ? `${Math.round(m.value * 100)}%` : "0%" }}
                    >
                      <span className="prog-knob" />
                    </div>
                  </div>
                  <p className="prog-cap muted">
                    {m.hasData ? m.caption : "Noch keine Daten — kommt mit der Zeit."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
