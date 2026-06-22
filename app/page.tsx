import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { StreakBadge } from "@/components/StreakBadge";
import { TodayFlow } from "@/components/TodayFlow";
import { Welcome } from "@/components/Welcome";
import { getCalendarProvider } from "@/lib/calendar";
import { todayStr } from "@/lib/date";
import { guessSituation } from "@/lib/domain/guess";
import {
  getCurrentUserId,
  getProfile,
  getRecentEntries,
  getTodayEntry,
} from "@/lib/db/repo";
import { computeStreak, type DayResult } from "@/lib/domain/streak";
import type { Outcome } from "@/lib/domain/types";

// Haengt an Cookies/Session — nie statisch cachen.
export const dynamic = "force-dynamic";

export default async function Home() {
  const userId = await getCurrentUserId();
  if (!userId) return <Welcome />;

  const profile = await getProfile();
  // Onboarding noch offen, solange kein Ziel gesetzt wurde.
  if (!profile || !profile.goal) redirect("/onboarding");

  const entry = await getTodayEntry(todayStr());

  // "Rate erst, frag dann": Vermutung aus dem Kalender bilden.
  const calendarPacked = await getCalendarProvider().isPackedDay(new Date());
  const guess = guessSituation({ calendarPacked });

  const recent = await getRecentEntries(40);
  const days: DayResult[] = recent
    .filter((e) => e.outcome !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ outcome: e.outcome as Outcome, chaos: e.calendar_packed }));
  const streak = computeStreak(days);

  return (
    <>
      <PageHero variant="today" />

      <StreakBadge current={streak.current} longest={streak.longest} />
      <TodayFlow profile={profile} entry={entry} guess={guess} />

      <BottomNav />
    </>
  );
}
