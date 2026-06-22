"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { planWorkout, unplanWorkout } from "@/app/actions";

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export interface CalDay {
  date: string;
  outcome: "done" | "no_show";
  modality: string;
  dose: number;
  feeling: number | null;
  situation: string;
}

export interface CalPlan {
  date: string;
  modality: string;
}

const pad = (n: number) => n.toString().padStart(2, "0");

export function ActivityCalendar({
  entries,
  planned,
  modalities,
  today,
  initialYear,
  initialMonth,
}: {
  entries: CalDay[];
  planned: CalPlan[];
  modalities: string[];
  today: string;
  initialYear: number;
  initialMonth: number;
}) {
  const router = useRouter();
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [sel, setSel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const map = new Map(entries.map((e) => [e.date, e]));
  const planMap = new Map(planned.map((p) => [p.date, p]));

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

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    await fn();
    setBusy(false);
    router.refresh();
  }

  const selEntry = sel ? map.get(sel) : undefined;
  const selPlan = sel ? planMap.get(sel) : undefined;
  const selFuture = sel ? sel > today : false;

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
            <span key={d} className="cal-wd">{d}</span>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((d, i) => {
            if (d === null) return <span key={i} className="cal-day empty" />;
            const ds = `${year}-${pad(month + 1)}-${pad(d)}`;
            const e = map.get(ds);
            const p = planMap.get(ds);
            const future = ds > today;
            const cls = ["cal-day"];
            if (e?.outcome === "done") cls.push("done");
            else if (e?.outcome === "no_show") cls.push("noshow");
            else if (p) cls.push("planned");
            if (ds === today) cls.push("today");
            if (ds === sel) cls.push("sel");
            const clickable = !!e || future;
            return (
              <button
                key={i}
                className={cls.join(" ")}
                onClick={() => clickable && setSel(ds)}
                style={{ cursor: clickable ? "pointer" : "default" }}
              >
                <span className="cal-num">{d}</span>
                {e?.outcome === "done" && <span className="cal-dot done" />}
                {e?.outcome === "no_show" && <span className="cal-dot noshow" />}
                {!e && p && <span className="cal-dot planned" />}
              </button>
            );
          })}
        </div>

        <div className="cal-legend">
          <span><span className="cal-dot done" /> erledigt</span>
          <span><span className="cal-dot planned" /> geplant</span>
        </div>
      </div>

      <div className="cal-detail">
        {!sel || !(selEntry || selFuture) ? (
          <p className="cal-placeholder">Plan your next days</p>
        ) : (
          <>
          <span className="eyebrow">
            {Number(sel.slice(8))}. {MONTHS[Number(sel.slice(5, 7)) - 1]}
          </span>

          {selEntry ? (
            selEntry.outcome === "done" ? (
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
            )
          ) : (
            // Zukunft: Workout planen
            <>
              <h2 style={{ margin: "2px 0 8px" }}>
                {selPlan ? "Geplant" : "Workout planen"}
              </h2>
              {selPlan && (
                <p className="muted" style={{ textTransform: "capitalize" }}>
                  {selPlan.modality}
                </p>
              )}
              <div className="row" style={{ marginTop: 10 }}>
                {modalities.map((m) => (
                  <button
                    key={m}
                    className={`choice${selPlan?.modality === m ? " selected" : ""}`}
                    disabled={busy}
                    style={{ flex: "1 1 30%", textTransform: "capitalize" }}
                    onClick={() => run(() => planWorkout({ date: sel, modality: m }))}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {selPlan && (
                <button
                  className="linklike"
                  disabled={busy}
                  onClick={() => run(() => unplanWorkout({ date: sel }))}
                >
                  Planung entfernen
                </button>
              )}
            </>
          )}
          </>
        )}
      </div>
    </>
  );
}
