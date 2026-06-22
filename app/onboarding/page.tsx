import { OnboardingForm } from "@/components/OnboardingForm";
import { Welcome } from "@/components/Welcome";
import { getCurrentUserId, getProfile } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const userId = await getCurrentUserId();
  if (!userId) return <Welcome />;

  const profile = await getProfile();
  return <OnboardingForm profile={profile} />;
}
