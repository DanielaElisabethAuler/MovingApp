import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { SITUATION_CONFIG } from "@/config/situations";
import { getCurrentUserId, getProfile, getRecentEntries } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  const profile = await getProfile();
  if (!profile || !profile.goal) redirect("/onboarding");

  const entries = await getRecentEntries(60);

  return (
    <>
      <PageHero variant="progress" />

      {entries.length === 0 && (
        <div className="card">
          <p className="muted">Noch keine Eintraege. Starte heute deinen ersten.</p>
        </div>
      )}

      {entries.map((e) => (
        <div className="card" key={e.id}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>{e.date}</strong>
            <span>
              {e.outcome === "done" && <span className="pill ceiling">erledigt</span>}
              {e.outcome === "no_show" && (
                <span className="pill">{e.streak_forgiven ? "verpasst (verziehen)" : "verpasst"}</span>
              )}
              {e.outcome === null && <span className="pill">offen</span>}
            </span>
          </div>
          <p className="muted" style={{ marginTop: 6 }}>
            {SITUATION_CONFIG[e.situation].label} · Boden {e.floor_offer} Min ·
            Vorschlag {e.proposed_plan.modality} {e.proposed_plan.dose_min} Min
            {e.proposed_plan.is_floor_only ? " (nur Boden)" : ""}
          </p>
          <p className="muted" style={{ fontSize: "0.82rem" }}>
            {e.post_feeling !== null && `Befinden ${e.post_feeling}/100 · `}
            {e.no_show_reason && `Grund: ${e.no_show_reason} · `}
            {e.reward !== null && `Reward ${e.reward.toFixed(2)}`}
            {e.calendar_packed ? " · voller Tag" : ""}
          </p>
        </div>
      ))}

      <BottomNav />
    </>
  );
}
