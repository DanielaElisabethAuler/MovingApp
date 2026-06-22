import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { StreakBadge } from "@/components/StreakBadge";
import { TodayFlow } from "@/components/TodayFlow";
import { todayStr } from "@/lib/date";
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
  if (!userId) return <AuthForm />;

  const profile = await getProfile();
  // Onboarding noch offen, solange kein Ziel gesetzt wurde.
  if (!profile || !profile.goal) redirect("/onboarding");

  const entry = await getTodayEntry(todayStr());
  const recent = await getRecentEntries(40);
  const days: DayResult[] = recent
    .filter((e) => e.outcome !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ outcome: e.outcome as Outcome, chaos: e.calendar_packed }));
  const streak = computeStreak(days);

  return (
    <>
      <header className="topbar">
        <span className="brand">
          <Logo size={32} />
          <strong>vervou</strong>
        </span>
      </header>

      <div className="hero hero-today" />

      <StreakBadge current={streak.current} longest={streak.longest} />
      <TodayFlow profile={profile} entry={entry} />

      <BottomNav />
    </>
  );
}
