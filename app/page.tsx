import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { DemoBar } from "@/components/DemoBar";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { StreakBadge } from "@/components/StreakBadge";
import { TodayFlow } from "@/components/TodayFlow";
import { todayStr } from "@/lib/date";
import {
  getCurrentUserId,
  getProfile,
  getRecentEntries,
  getTodayEntry,
  isLocalMode,
} from "@/lib/db/repo";
import { computeStreak, type DayResult } from "@/lib/domain/streak";
import type { Outcome } from "@/lib/domain/types";

// Haengt an Cookies/Session — nie statisch cachen.
export const dynamic = "force-dynamic";

export default async function Home() {
  const userId = await getCurrentUserId();
  if (!userId) return <AuthForm />;
  const local = isLocalMode();

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
      <header className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <span className="brand">
          <Logo size={36} />
          <strong>vervou</strong>
        </span>
        <span className="row" style={{ gap: 14 }}>
          <Link href="/history">Verlauf</Link>
          {local ? <DemoBar /> : <LogoutButton />}
        </span>
      </header>

      <StreakBadge current={streak.current} longest={streak.longest} />
      <TodayFlow profile={profile} entry={entry} />
    </>
  );
}
