import type { CalendarProvider, FreeSlot } from "./provider";

// Mock-Kalender fuer Phase 1: deterministische, plausible Slots/Packed-Tage,
// damit der ganze Tagesflow OHNE Google-Credentials lauffaehig ist.
// Deterministisch aus dem Datum (kein Math.random) — gut testbar.
export class MockCalendarProvider implements CalendarProvider {
  async getFreeSlots(date: Date): Promise<FreeSlot[]> {
    const day = date.getDate();
    // Ein paar feste freie Fenster, leicht variiert nach Tag.
    const base = [
      { h: 7, m: 0, len: 30 },
      { h: 12, m: 30, len: 45 },
      { h: 18, m: (day % 2) * 15, len: 30 },
    ];
    return base.map(({ h, m, len }) => {
      const start = pad(h) + ":" + pad(m);
      const endMin = m + len;
      const end = pad(h + Math.floor(endMin / 60)) + ":" + pad(endMin % 60);
      return { start, end, label: `${start}-${end}` } satisfies FreeSlot;
    });
  }

  async isPackedDay(date: Date): Promise<boolean> {
    // Demo-Regel: jeder vierte Tag gilt als zugepackt (Chaos-Tag).
    return date.getDate() % 4 === 0;
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
