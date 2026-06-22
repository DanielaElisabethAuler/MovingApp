import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { DemoBar } from "@/components/DemoBar";
import { LogoutButton } from "@/components/LogoutButton";
import { PageHero } from "@/components/PageHero";
import { Welcome } from "@/components/Welcome";
import { getCurrentUserId, getProfile, isLocalMode } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return <Welcome />;

  const profile = await getProfile();
  if (!profile || !profile.goal) redirect("/onboarding");
  const local = isLocalMode();

  return (
    <>
      <PageHero variant="profile" />

      <div className="card">
        <span className="eyebrow">Einstellungen</span>
        <h1>Konto</h1>
        <div style={{ marginTop: 16 }}>{local ? <DemoBar /> : <LogoutButton />}</div>
        <div style={{ marginTop: 14 }}>
          <DeleteAccountButton />
        </div>
      </div>

      <BottomNav />
    </>
  );
}
