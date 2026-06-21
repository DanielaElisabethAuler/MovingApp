import type { CalendarProvider, FreeSlot } from "./provider";

// ============================================================================
// STUB — echtes Google Calendar OAuth (Spec 5, Phase 1 als Config-Punkt).
//
// TODO: needs GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI.
// Sobald Credentials vorliegen:
//   1. OAuth-Flow (Route /api/calendar/callback) Token holen/refreshen.
//   2. freebusy.query -> freie Slots des Tages ableiten.
//   3. events.list -> Dichte des Tages -> isPackedDay.
// Bis dahin liefert dieser Stub bewusst nichts und das System faellt auf den
// MockCalendarProvider zurueck (siehe getCalendarProvider()).
// ============================================================================
export class GoogleCalendarProvider implements CalendarProvider {
  async getFreeSlots(_date: Date): Promise<FreeSlot[]> {
    throw new Error(
      "GoogleCalendarProvider: OAuth noch nicht verdrahtet (GOOGLE_CLIENT_ID/SECRET fehlen).",
    );
  }

  async isPackedDay(_date: Date): Promise<boolean> {
    throw new Error(
      "GoogleCalendarProvider: OAuth noch nicht verdrahtet (GOOGLE_CLIENT_ID/SECRET fehlen).",
    );
  }
}
