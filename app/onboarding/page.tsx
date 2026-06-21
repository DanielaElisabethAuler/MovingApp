import { AuthForm } from "@/components/AuthForm";
import { OnboardingForm } from "@/components/OnboardingForm";
import { getCurrentUserId, getProfile } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const userId = await getCurrentUserId();
  if (!userId) return <AuthForm />;

  const profile = await getProfile();
  return <OnboardingForm profile={profile} />;
}
