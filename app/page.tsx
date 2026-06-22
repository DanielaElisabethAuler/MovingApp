import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { TodayFlow } from "@/components/TodayFlow";
import { Welcome } from "@/components/Welcome";
import { getCalendarProvider } from "@/lib/calendar";
import { todayStr } from "@/lib/date";
import { guessSituation } from "@/lib/domain/guess";
import { getCurrentUserId, getProfile, getTodayEntry } from "@/lib/db/repo";

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

  return (
    <>
      <PageHero variant="today" />

      <TodayFlow profile={profile} entry={entry} guess={guess} />

      <BottomNav />
    </>
  );
}
