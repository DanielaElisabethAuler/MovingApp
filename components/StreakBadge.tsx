// Streak-Anzeige. "never miss twice" (Spec 3.5) wird unten kurz erklaert,
// damit der Alles-oder-nichts-Druck rausbleibt.
export function StreakBadge({
  current,
  longest,
}: {
  current: number;
  longest: number;
}) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div className="badge">
        <span className="flame">🔥</span>
        <span>{current} Tage Streak</span>
      </div>
      <p className="muted" style={{ marginTop: 10 }}>
        Laengster Streak: {longest}. Ein verpasster Tag ist okay — erst zwei in
        Folge brechen die Kette.
      </p>
    </div>
  );
}
