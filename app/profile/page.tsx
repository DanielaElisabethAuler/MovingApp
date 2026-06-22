import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Welcome } from "@/components/Welcome";
import { STYLE_BIAS } from "@/config/styleBias";
import { getCurrentUserId, getProfile } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const userId = await getCurrentUserId();
  if (!userId) return <Welcome />;

  const profile = await getProfile();
  if (!profile || !profile.goal) redirect("/onboarding");

  return (
    <>
      <PageHero variant="profile" />

      <div className="card">
        <span className="eyebrow">Profil</span>
        <h1>Dein Profil</h1>
        <p className="muted" style={{ marginTop: 10 }}>
          <strong>Ziel:</strong> {profile.goal}
        </p>
        <p className="muted">
          <strong>Stil:</strong> {STYLE_BIAS[profile.style].label}
        </p>
        <p className="muted">
          <strong>Bewegungsarten:</strong> {profile.modalities.join(", ")}
        </p>
        {profile.favorite_workout && (
          <p className="muted">
            <strong>Lieblingsworkout:</strong> {profile.favorite_workout}
          </p>
        )}
      </div>

      <BottomNav />
    </>
  );
}
