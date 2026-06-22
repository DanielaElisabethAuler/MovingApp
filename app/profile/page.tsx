import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { DemoBar } from "@/components/DemoBar";
import { LogoutButton } from "@/components/LogoutButton";
import { PageHero } from "@/components/PageHero";
import { Welcome } from "@/components/Welcome";
import { STYLE_BIAS } from "@/config/styleBias";
import { getCurrentUserId, getProfile, isLocalMode } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const userId = await getCurrentUserId();
  if (!userId) return <Welcome />;

  const profile = await getProfile();
  if (!profile || !profile.goal) redirect("/onboarding");
  const local = isLocalMode();

  return (
    <>
      <PageHero variant="profile" />

      <div className="card">
        <span className="eyebrow">Profil</span>
        <h1>Deine Einstellungen</h1>
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

        <div style={{ marginTop: 20 }}>
          {local ? <DemoBar /> : <LogoutButton />}
        </div>
      </div>

      <BottomNav />
    </>
  );
}
