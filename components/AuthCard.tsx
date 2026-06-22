"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Login/Registrieren als Milchglas-Karte (im Welcome ueber dem Farbverlauf,
// auf dem Desktop in der rechten Spalte).
export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      setInfo("Account erstellt — du kannst dich jetzt einloggen.");
      setMode("signin");
      return;
    }
    router.refresh();
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <h2>{mode === "signup" ? "Account erstellen" : "Willkommen zurück"}</h2>
      <p className="auth-muted">
        {mode === "signup"
          ? "Leg los — in unter einer Minute."
          : "Schön, dass du wieder da bist."}
      </p>

      <label>E-Mail</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="du@beispiel.de"
      />
      <label>Passwort</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        placeholder="••••••••"
      />

      <button className="primary full" type="submit" disabled={busy} style={{ marginTop: 18 }}>
        {busy ? "..." : mode === "signup" ? "Loslegen" : "Einloggen"}
      </button>

      {error && <div className="error">{error}</div>}
      {info && <div className="auth-muted" style={{ marginTop: 8 }}>{info}</div>}

      <p className="auth-muted auth-toggle">
        {mode === "signup" ? "Du hast schon ein Konto? " : "Noch kein Konto? "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMode(mode === "signup" ? "signin" : "signup");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "signup" ? "Dann log dich ein" : "Registrieren"}
        </a>
      </p>
    </form>
  );
}
