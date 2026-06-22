import { getProgressStats } from "@/lib/progress";
import { ProgressChip } from "./ProgressChip";

// Randloser Bild-Hero oben. Oben links: Fortschritts-Chip (Phasen-Satz) statt
// Marke — oeffnet das Fortschritts-Glasfenster.
export async function PageHero({
  variant,
}: {
  variant: "today" | "progress" | "profile";
}) {
  const stats = await getProgressStats();
  return (
    <div className={`hero hero-${variant}`}>
      <ProgressChip stats={stats} />
    </div>
  );
}
