import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { CalendarConnect } from "@/components/CalendarConnect";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { DemoBar } from "@/components/DemoBar";
import { LogoutButton } from "@/components/LogoutButton";
import { PageHero } from "@/components/PageHero";
import { Welcome } from "@/components/Welcome";
import {
  getCurrentUserEmail,
  getCurrentUserId,
  getProfile,
  isLocalMode,
} from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return <Welcome />;

  const profile = await getProfile();
  if (!profile || !profile.goal) redirect("/onboarding");
  const local = isLocalMode();
  const email = await getCurrentUserEmail();

  return (
    <>
      <PageHero variant="profile" />

      <div className="card">
        <span className="eyebrow">Einstellungen</span>
        <h1>Konto</h1>
        <p className="muted" style={{ marginTop: 10 }}>
          Angemeldet als <strong>{email ?? "Demo-Modus"}</strong>
        </p>
        <p className="muted" style={{ fontSize: "0.82rem" }}>
          Auf Handy und Desktop muss exakt diese E-Mail stehen, damit alles
          synchron ist.
        </p>
        <div style={{ marginTop: 16 }}>{local ? <DemoBar /> : <LogoutButton />}</div>
        <div style={{ marginTop: 14 }}>
          <DeleteAccountButton />
        </div>
      </div>

      <div className="card">
        <span className="eyebrow">Kalender</span>
        <h2 style={{ margin: "4px 0 12px" }}>Verbinden</h2>
        <CalendarConnect connected={profile.integrations?.google_calendar ?? false} />
      </div>

      <BottomNav />
    </>
  );
}
