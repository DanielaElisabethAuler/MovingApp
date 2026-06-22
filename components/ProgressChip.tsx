"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ProgressMetric, ProgressStats } from "@/lib/progress";

const RADIUS = 36;
const CIRC = 2 * Math.PI * RADIUS;

function Ring({ metric, shown }: { metric: ProgressMetric; shown: boolean }) {
  const offset = shown && metric.hasData ? CIRC * (1 - metric.value) : CIRC;
  return (
    <div className="ring">
      <div className="ring-circle">
        <svg viewBox="0 0 86 86">
          <circle className="ring-bg" cx="43" cy="43" r={RADIUS} />
          <circle
            className="ring-fg"
            cx="43"
            cy="43"
            r={RADIUS}
            style={{ strokeDasharray: CIRC, strokeDashoffset: offset }}
          />
        </svg>
        <span className="ring-val">
          {metric.hasData ? `${Math.round(metric.value * 100)}%` : "—"}
        </span>
      </div>
      <span className="ring-label">{metric.label}</span>
    </div>
  );
}

export function ProgressChip({ stats }: { stats: ProgressStats }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setShown(true), 40);
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

      {open &&
        createPortal(
          <div className="prog-overlay" onClick={() => setOpen(false)}>
          <div className="prog-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prog-modal-head">
              <div>
                <span className="eyebrow">Dein Fortschritt</span>
                <h2>Was du schon verbessert hast</h2>
              </div>
            </div>

            {stats.streak > 0 && (
              <p className="muted" style={{ marginTop: -2 }}>
                Aktuelle Kette: <strong>{stats.streak} Tage</strong> 🔥
              </p>
            )}

            <div className="prog-rings">
              {stats.metrics.map((m) => (
                <Ring key={m.key} metric={m} shown={shown} />
              ))}
            </div>

            <div className="prog-foot">
              <p className="prog-quote">„Nicht groß anfangen. Einfach anfangen.“</p>
              <button className="prog-close-btn" onClick={() => setOpen(false)}>
                Schließen
              </button>
            </div>
          </div>
          </div>,
          document.body,
        )}
    </>
  );
}
