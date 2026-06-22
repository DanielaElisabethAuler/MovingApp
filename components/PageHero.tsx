import { Logo } from "./Logo";

// Randloser Bild-Hero oben (links/rechts/oben bis zum Rand), Marke als Chip drauf.
export function PageHero({
  variant,
}: {
  variant: "today" | "progress" | "profile";
}) {
  return (
    <div className={`hero hero-${variant}`}>
      <span className="hero-brand">
        <Logo size={20} />
        <strong>vervou</strong>
      </span>
    </div>
  );
}
