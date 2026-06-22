"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAccount } from "@/app/actions";

// Konto/Profil loeschen (in den Einstellungen). Zwei-Schritt-Bestaetigung,
// weil destruktiv.
export function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function del() {
    setBusy(true);
    await deleteAccount();
    setBusy(false);
    router.push("/");
    router.refresh();
  }

  if (!confirming) {
    return (
      <button className="btn full danger" onClick={() => setConfirming(true)}>
        Konto löschen
      </button>
    );
  }

  return (
    <div>
      <p className="muted" style={{ marginBottom: 10 }}>
        Wirklich löschen? Alle deine Daten werden entfernt — das lässt sich nicht
        rückgängig machen.
      </p>
      <div className="row">
        <button
          className="btn"
          style={{ flex: 1 }}
          onClick={() => setConfirming(false)}
          disabled={busy}
        >
          Abbrechen
        </button>
        <button className="btn danger" style={{ flex: 1 }} onClick={del} disabled={busy}>
          {busy ? "..." : "Ja, löschen"}
        </button>
      </div>
    </div>
  );
}
