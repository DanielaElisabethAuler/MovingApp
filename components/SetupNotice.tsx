// Wird gezeigt, wenn Supabase-Keys fehlen. Die Domaenenlogik laeuft ohne
// Supabase (npm run test), aber Auth/Logging brauchen die Keys.
export function SetupNotice() {
  return (
    <div className="card">
      <h1>Fast fertig — Supabase verbinden</h1>
      <p className="muted">
        Das Lern-Log wird serverseitig in Supabase gespeichert. Lege{" "}
        <code>.env.local</code> an (Vorlage: <code>.env.local.example</code>) und
        trage URL + Anon-Key ein.
      </p>
      <ol className="muted">
        <li>
          Gehostetes Projekt auf supabase.com <em>oder</em> lokal:{" "}
          <code>supabase start</code>.
        </li>
        <li>
          Migration einspielen: <code>supabase/migrations/0001_init.sql</code>.
        </li>
        <li>
          <code>NEXT_PUBLIC_SUPABASE_URL</code> und{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> setzen, dann neu laden.
        </li>
      </ol>
      <p className="muted">
        Tipp: <code>npm run test</code> validiert die Lernlogik komplett ohne
        Supabase.
      </p>
    </div>
  );
}
