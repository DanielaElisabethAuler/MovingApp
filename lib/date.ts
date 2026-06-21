// Lokales Datum als YYYY-MM-DD (ein DailyEntry pro Kalendertag, Spec 6).
export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}
