"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDaySlots, planWorkout, unplanWorkout } from "@/app/actions";

const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const WD_FULL = [
  "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag",
];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

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
  time?: string | null;
}

const pad = (n: number) => n.toString().padStart(2, "0");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function mondayOf(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86400000);
}

// Insights, die wirklich was Neues sagen — aus dem Verlauf abgeleitet.
function buildInsights(entries: CalDay[]): Map<string, string[]> {
  const asc = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const map = new Map<string, string[]>();
  let maxDose = 0;
  let lastDone: string | null = null;
  let streak = 0;
  let prevMiss = false;

  for (const e of asc) {
    const ins: string[] = [];
    if (e.outcome === "done") {
      streak += 1;
      prevMiss = false;

      if (lastDone) {
        const gap = daysBetween(lastDone, e.date);
        if (gap >= 4) {
          ins.push(`💪 Comeback nach ${gap} Tagen Pause — erstes ${cap(e.modality)} seit Längerem`);
        }
      } else {
        ins.push("🌱 Allererster Eintrag — der Anfang der Kette");
      }

      if (e.situation === "Im Loch") ins.push("🌧️→☀️ Aus dem Loch aufgetaucht");
      if (e.situation === "Keine Zeit") ins.push("⏳ Trotz vollem Tag bewegt");
      if (e.situation === "Anderes wichtiger") ins.push("🎯 Kopf woanders — und trotzdem dran");
      if (e.situation === "Wenig Energie") ins.push("🌙 Trotz wenig Energie aufgetaucht");

      if (e.dose > maxDose) {
        if (maxDose > 0) ins.push(`📈 Neue Bestdosis: ${e.dose} Min`);
        maxDose = e.dose;
      }

      if (e.feeling !== null && e.feeling >= 80) ins.push("✨ Danach richtig gut gefühlt");

      if ([3, 7, 14, 21, 30, 50, 100].includes(streak)) {
        ins.push(`🔥 ${streak} Tage am Stück`);
      }

      lastDone = e.date;
      if (ins.length === 0) ins.push("✅ Sauber abgehakt");
    } else {
      if (prevMiss) streak = 0;
      else prevMiss = true;
      ins.push("Verpasst — kein Drama. Morgen klein anfangen.");
    }
    map.set(e.date, ins.slice(0, 3));
  }
  return map;
}

export function ActivityWeek({
  entries,
  planned,
  modalities,
  calendarConnected,
  today,
}: {
  entries: CalDay[];
  planned: CalPlan[];
  modalities: string[];
  calendarConnected: boolean;
  today: string;
}) {
  const router = useRouter();
  const todayDate = new Date(today + "T00:00:00");
  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(todayDate));
  const [sel, setSel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pickMod, setPickMod] = useState<string | null>(null);
  const [manualTime, setManualTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);

  const map = new Map(entries.map((e) => [e.date, e]));
  const planMap = new Map(planned.map((p) => [p.date, p]));
  const insights = buildInsights(entries);

  useEffect(() => {
    setPickMod(null);
    setManualTime("");
    if (calendarConnected && sel && sel > today && !planMap.get(sel)) {
      getDaySlots({ date: sel }).then((r) => setSlots(r.slots ?? [])).catch(() => setSlots([]));
    } else {
      setSlots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  function shiftWeek(delta: number) {
    setSel(null);
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  }

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    await fn();
    setBusy(false);
    router.refresh();
  }

  async function savePlan(time: string | null) {
    await run(() => planWorkout({ date: sel!, modality: pickMod!, time }));
    setPickMod(null);
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const label =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${weekStart.getDate()}.–${weekEnd.getDate()}. ${MONTHS[weekEnd.getMonth()]}`
      : `${weekStart.getDate()}. ${MONTHS[weekStart.getMonth()]} – ${weekEnd.getDate()}. ${MONTHS[weekEnd.getMonth()]}`;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const selEntry = sel ? map.get(sel) : undefined;
  const selPlan = sel ? planMap.get(sel) : undefined;
  const selFuture = sel ? sel > today : false;
  const selDow = sel ? (new Date(sel + "T00:00:00").getDay() + 6) % 7 : 0;

  return (
    <>
      <div className="card week-card">
        <div className="cal-head">
          <button className="cal-nav" onClick={() => shiftWeek(-1)} aria-label="Vorige Woche">
            ‹
          </button>
          <div className="cal-title">{label}</div>
          <button className="cal-nav" onClick={() => shiftWeek(1)} aria-label="Nächste Woche">
            ›
          </button>
        </div>

        <div className="week-grid">
          {days.map((d, i) => {
            const ds = iso(d);
            const e = map.get(ds);
            const p = planMap.get(ds);
            const future = ds > today;
            const cls = ["week-circle"];
            if (e?.outcome === "done") cls.push("done");
            else if (e?.outcome === "no_show") cls.push("noshow");
            else if (p) cls.push("planned");
            if (ds === today) cls.push("today");
            if (ds === sel) cls.push("sel");
            const clickable = !!e || future;
            return (
              <div className="week-day" key={ds}>
                <span className="week-wd">{WD[i]}</span>
                <button
                  className={cls.join(" ")}
                  onClick={() => clickable && setSel(ds)}
                  style={{ cursor: clickable ? "pointer" : "default" }}
                >
                  {d.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cal-detail">
        {!sel || !(selEntry || selFuture) ? (
          <p className="cal-placeholder">Plan your next days</p>
        ) : selEntry ? (
          // Insights zum Tag
          <>
            <span className="eyebrow">
              {WD_FULL[selDow]} · {Number(sel.slice(8))}. {MONTHS[Number(sel.slice(5, 7)) - 1]}
            </span>
            <h2 style={{ margin: "2px 0 4px", textTransform: "capitalize" }}>
              {selEntry.outcome === "done" ? selEntry.modality : "Nicht geschafft"}
            </h2>
            {selEntry.outcome === "done" && (
              <p className="muted" style={{ fontSize: "0.84rem", margin: "0 0 10px" }}>
                {selEntry.situation} · {selEntry.dose} Min
                {selEntry.feeling !== null && ` · Befinden ${selEntry.feeling}/100`}
              </p>
            )}
            <ul className="insights">
              {(insights.get(sel) ?? []).map((t, k) => (
                <li className="insight" key={k}>{t}</li>
              ))}
            </ul>
          </>
        ) : selPlan ? (
          <>
            <h2 style={{ margin: "2px 0 8px" }}>Geplant</h2>
            <p className="muted" style={{ textTransform: "capitalize" }}>
              {selPlan.modality}
              {selPlan.time ? ` · ${selPlan.time}` : ""}
            </p>
            <button
              className="linklike"
              disabled={busy}
              onClick={() => run(() => unplanWorkout({ date: sel }))}
            >
              Planung entfernen
            </button>
          </>
        ) : !pickMod ? (
          <>
            <h2 style={{ margin: "2px 0 8px" }}>Workout planen</h2>
            <p className="muted">Was willst du machen?</p>
            <div className="row" style={{ marginTop: 10 }}>
              {modalities.map((m) => (
                <button
                  key={m}
                  className="choice"
                  style={{ flex: "1 1 30%", textTransform: "capitalize" }}
                  onClick={() => setPickMod(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 style={{ margin: "2px 0 8px", textTransform: "capitalize" }}>{pickMod}</h2>
            {calendarConnected && slots.length > 0 && (
              <>
                <p className="muted">Freie Zeiten aus deinem Kalender:</p>
                <div className="row" style={{ margin: "8px 0 6px" }}>
                  {slots.map((s) => (
                    <button
                      key={s}
                      className="choice"
                      disabled={busy}
                      style={{ flex: "1 1 46%" }}
                      onClick={() => savePlan(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
            <label>Uhrzeit (optional)</label>
            <input
              type="time"
              value={manualTime}
              onChange={(e) => setManualTime(e.target.value)}
            />
            <button
              className="primary full"
              disabled={busy}
              style={{ marginTop: 12 }}
              onClick={() => savePlan(manualTime || null)}
            >
              {busy ? "..." : manualTime ? `Für ${manualTime} Uhr planen` : "Ohne feste Zeit planen"}
            </button>
            <button className="linklike" onClick={() => setPickMod(null)}>
              ← andere Sportart
            </button>
          </>
        )}
      </div>
    </>
  );
}
