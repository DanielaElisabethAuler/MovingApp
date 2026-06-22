"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setCalendarConnected } from "@/app/actions";

// Kalender verbinden. Phase 1: aktiviert die (Mock-)Kalender-Wahrnehmung.
// Echtes Google-OAuth wird verdrahtet, sobald Google-Credentials vorliegen.
export function CalendarConnect({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await setCalendarConnected({ connected: !connected });
    setBusy(false);
    router.refresh();
  }

  return (
    <div>
      <div className="connect-row">
        <span className="connect-name">📅 Google Calendar</span>
        <button
          className={connected ? "btn" : "btn primary"}
          disabled={busy}
          style={{ padding: "10px 18px" }}
          onClick={toggle}
        >
          {busy ? "..." : connected ? "Trennen" : "Verbinden"}
        </button>
      </div>

      <div className="connect-row">
        <span className="connect-name muted"> Apple / Outlook</span>
        <span className="muted" style={{ fontSize: "0.82rem" }}>bald</span>
      </div>

      <p className="muted" style={{ fontSize: "0.8rem", marginTop: 10 }}>
        {connected
          ? "Verbunden — die App nutzt freie Zeiten für deine Planung."
          : "Verbinde deinen Kalender, damit die App freie Zeiten für die Planung kennt."}
      </p>
    </div>
  );
}
