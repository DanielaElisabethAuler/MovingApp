"use client";

import { useState } from "react";
import { AuthCard } from "./AuthCard";
import { SlideToStart } from "./SlideToStart";

// Einstiegs-Screen: vollflaechiger Farbverlauf, Slide-to-Start, dann Login-Glas.
// Desktop: Split-Layout (Verlauf links, Login rechts) — per CSS.
export function Welcome() {
  const [started, setStarted] = useState(false);

  return (
    <div className="welcome">
      <div className="welcome-panel">
        <div className="welcome-hero">
          <span className="welcome-eyebrow">Willkommen bei vervou</span>
          <h1 className="welcome-title">For the days you usually quit.</h1>
          <p className="welcome-sub">Der Boden bleibt winzig. Die Kette wächst.</p>
        </div>

        <div className={`slide-wrap${started ? " hidden" : ""}`}>
          <SlideToStart onComplete={() => setStarted(true)} />
        </div>
      </div>

      <div className={`welcome-auth${started ? " show" : ""}`}>
        <AuthCard />
      </div>
    </div>
  );
}
