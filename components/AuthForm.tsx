"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "./Logo";

// Schlichtes E-Mail/Passwort-Login (gut lokal testbar). Magic-Link kann spaeter
// ergaenzt werden; fuer das MVP reicht Passwort-Auth via Supabase.
export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (mode === "signup") {
      setInfo("Account erstellt. Du kannst dich jetzt einloggen.");
      setMode("signin");
      return;
    }
    router.refresh();
  }

  return (
    <div className="card">
      <div className="logo-hero">
        <Logo size={72} />
      </div>
      <span className="eyebrow">Willkommen bei Felicurv</span>
      <h1>{mode === "signin" ? "Einloggen" : "Account erstellen"}</h1>
      <form onSubmit={submit}>
        <label>E-Mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Passwort</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <div style={{ marginTop: 16 }}>
          <button className="primary full" type="submit" disabled={busy}>
            {busy ? "..." : mode === "signin" ? "Einloggen" : "Registrieren"}
          </button>
        </div>
      </form>
      {error && <div className="error">{error}</div>}
      {info && <div className="muted" style={{ marginTop: 8 }}>{info}</div>}
      <p className="muted" style={{ marginTop: 14 }}>
        {mode === "signin" ? "Noch kein Account?" : "Schon registriert?"}{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
        >
          {mode === "signin" ? "Registrieren" : "Einloggen"}
        </a>
      </p>
    </div>
  );
}
