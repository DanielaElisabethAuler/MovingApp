import { redirect } from "next/navigation";
import { ActivityCalendar, type CalDay } from "@/components/ActivityCalendar";
import { BottomNav } from "@/components/BottomNav";
import { ProgressChip } from "@/components/ProgressChip";
import { SITUATION_CONFIG } from "@/config/situations";
import { todayStr } from "@/lib/date";
import {
  getCurrentUserId,
  getPlannedWorkouts,
  getProfile,
  getRecentEntries,
} from "@/lib/db/repo";
import { getProgressStats } from "@/lib/progress";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  const profile = await getProfile();
  if (!profile || !profile.goal) redirect("/onboarding");

  const entries = await getRecentEntries(366);
  const days: CalDay[] = entries
    .filter((e) => e.outcome !== null)
    .map((e) => ({
      date: e.date,
      outcome: e.outcome as "done" | "no_show",
      modality: e.proposed_plan.modality,
      dose: e.proposed_plan.dose_min,
      feeling: e.post_feeling,
      situation: SITUATION_CONFIG[e.situation].label,
    }));

  const planned = await getPlannedWorkouts();
  const stats = await getProgressStats();
  const today = todayStr();
  const [yy, mm] = today.split("-").map(Number);

  return (
    <div className="cal-screen">
      <div className="cal-hero">
        <ProgressChip stats={stats} />
      </div>

      <ActivityCalendar
        entries={days}
        planned={planned.map((p) => ({ date: p.date, modality: p.modality }))}
        modalities={profile.modalities}
        today={today}
        initialYear={yy}
        initialMonth={mm - 1}
      />

      <BottomNav />
    </div>
  );
}
