import { GoogleCalendarProvider } from "./google";
import { MockCalendarProvider } from "./mock";
import type { CalendarProvider } from "./provider";

export type { CalendarProvider, FreeSlot } from "./provider";

// Provider-Auswahl per Env. Default "mock" -> Phase 1 laeuft ohne OAuth.
// "google" erst aktivieren, wenn die Credentials gesetzt sind.
export function getCalendarProvider(): CalendarProvider {
  if (process.env.CALENDAR_PROVIDER === "google") {
    return new GoogleCalendarProvider();
  }
  return new MockCalendarProvider();
}
