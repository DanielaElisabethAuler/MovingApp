# Deploy für erste Tester (Vercel + Supabase)

Ziel: öffentliche HTTPS-URL, installierbar als PWA, echte Anmeldung, geteilte
Datenbank. Reihenfolge unbedingt einhalten — Vercel braucht die Supabase-Keys.

> Der lokale Demo-Modus (Datei-Store) funktioniert auf Vercel **nicht**
> (serverless = flüchtiges Dateisystem). Deshalb ist hier Supabase nötig.

---

## 1. Supabase-Projekt (kostenlos)

1. Auf https://supabase.com → **Sign up** (GitHub-Login geht am schnellsten).
2. **New project** → Name z.B. `bewegungs-coach`, DB-Passwort vergeben
   (irgendeins, wird hier nicht weiter gebraucht), Region: EU (Frankfurt).
3. Warten bis das Projekt „grün" ist (~2 Min).
4. **SQL Editor** (linkes Menü) → **New query** → den Inhalt von
   `supabase/migrations/0001_init.sql` einfügen → **Run**.
   → Legt Tabellen, RLS-Policies und den Auto-Profil-Trigger an.
5. **Project Settings → API** → diese drei Werte kopieren:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (service_role brauchst du für Phase 1 noch nicht.)
6. **Authentication → Providers → Email**: für einfaches Testen
   „Confirm email" **aus**schalten (sonst muss jeder Tester erst eine
   Bestätigungsmail klicken). Später wieder an.

## 2. Lokal mit echten Keys gegentesten

```bash
cp .env.local.example .env.local
# NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY eintragen
npm run dev
```
- http://localhost:3000 → jetzt erscheint **Login** (statt Demo-Modus).
- Registrieren → Onboarding → einen Tag durchspielen.
- In Supabase **Table Editor → daily_entries** prüfen, dass die Zeile da ist.

Klappt das, ist der Deploy nur noch Formsache.

## 3. Code zu GitHub

```bash
# (git ist bereits initialisiert, erster Commit liegt vor)
# Neues leeres GitHub-Repo anlegen (ohne README), dann:
git remote add origin https://github.com/<dein-user>/<repo>.git
git branch -M main
git push -u origin main
```

## 4. Vercel

1. https://vercel.com → mit GitHub einloggen → **Add New → Project**.
2. Das Repo importieren. Framework wird als **Next.js** erkannt — nichts ändern.
3. **Environment Variables** setzen (beide):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**. Nach ~1 Min gibt's eine URL `https://<projekt>.vercel.app`.
5. **Supabase → Authentication → URL Configuration**: die Vercel-URL als
   **Site URL** eintragen (für korrekte Auth-Redirects).

## 5. Tester einladen

Schick ihnen die Vercel-URL. Am Handy: öffnen → „Zum Startbildschirm
hinzufügen" → läuft als installierte PWA. Jeder registriert sich selbst;
RLS trennt die Daten pro Person.

---

### Updates später
Einfach committen + `git push` → Vercel deployed automatisch neu.
