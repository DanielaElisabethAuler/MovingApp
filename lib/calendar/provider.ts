// Calendar-Integration hinter einem Interface (Spec 5, Phase 1).
// Phase 1 laeuft mit dem Mock (kein OAuth noetig). Echtes Google-OAuth ist ein
// markierter Config-Punkt (siehe google.ts) und wird verdrahtet, sobald
// Credentials vorliegen.

export interface FreeSlot {
  start: string; // ISO oder lesbarer Text
  end: string;
  label: string; // z.B. "10:30-11:15"
}

export interface CalendarProvider {
  // Freie Slots an einem Tag finden -> Einheit einplanen (Spec 5).
  getFreeSlots(date: Date): Promise<FreeSlot[]>;
  // Zugepackter Tag? -> No-Shows entschaerfen (Chaos-Tag, Spec 3.4).
  isPackedDay(date: Date): Promise<boolean>;
}
