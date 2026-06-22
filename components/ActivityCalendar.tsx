"use client";

import { useState } from "react";

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export interface CalDay {
  date: string; // YYYY-MM-DD
  outcome: "done" | "no_show";
  modality: string;
  dose: number;
  feeling: number | null;
  situation: string;
}

const pad = (n: number) => n.toString().padStart(2, "0");

export function ActivityCalendar({
  entries,
  today,
  initialYear,
  initialMonth,
}: {
  entries: CalDay[];
  today: string;
  initialYear: number;
  initialMonth: number; // 0-11
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [sel, setSel] = useState<string | null>(null);

  const map = new Map(entries.map((e) => [e.date, e]));

  // Monday-first Offset + Tage im Monat.
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function step(delta: number) {
    setSel(null);
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  const selEntry = sel ? map.get(sel) : undefined;

  return (
    <>
      <div className="card">
        <div className="cal-head">
          <button className="cal-nav" onClick={() => step(-1)} aria-label="Voriger Monat">
            ‹
          </button>
          <div className="cal-title">
            {MONTHS[month]} {year}
          </div>
          <button className="cal-nav" onClick={() => step(1)} aria-label="Nächster Monat">
            ›
          </button>
        </div>

        <div className="cal-weekdays">
          {WEEKDAYS.map((d) => (
            <span key={d} className="cal-wd">
              {d}
            </span>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((d, i) => {
            if (d === null) return <span key={i} className="cal-day empty" />;
            const ds = `${year}-${pad(month + 1)}-${pad(d)}`;
            const e = map.get(ds);
            const cls = ["cal-day"];
            if (e?.outcome === "done") cls.push("done");
            if (e?.outcome === "no_show") cls.push("noshow");
            if (ds === today) cls.push("today");
            if (ds === sel) cls.push("sel");
            return (
              <button
                key={i}
                className={cls.join(" ")}
                onClick={() => e && setSel(ds)}
              >
                <span className="cal-num">{d}</span>
                {e?.outcome === "done" && <span className="cal-dot done" />}
                {e?.outcome === "no_show" && <span className="cal-dot noshow" />}
              </button>
            );
          })}
        </div>

        <div className="cal-legend">
          <span>
            <span className="cal-dot done" /> erledigt
          </span>
          <span>
            <span className="cal-dot noshow" /> verpasst
          </span>
        </div>
      </div>

      {selEntry && (
        <div className="card">
          <span className="eyebrow">
            {Number(selEntry.date.slice(8))}. {MONTHS[month]}
          </span>
          {selEntry.outcome === "done" ? (
            <>
              <h2 style={{ margin: "2px 0 8px", textTransform: "capitalize" }}>
                {selEntry.modality}
              </h2>
              <p className="muted">
                {selEntry.situation} · {selEntry.dose} Min
                {selEntry.feeling !== null && ` · Befinden ${selEntry.feeling}/100`}
              </p>
            </>
          ) : (
            <>
              <h2 style={{ margin: "2px 0 8px" }}>Nicht geschafft</h2>
              <p className="muted">{selEntry.situation} — morgen wieder.</p>
            </>
          )}
        </div>
      )}
    </>
  );
}
