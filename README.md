# vervou — Phase 1 (MVP)

> For the days you usually quit.

> Der Boden wird winzig und unkaputtbar, die Decke bleibt offen.
> Ziel ist **Konsistenz**, nicht Stundenzahl.

Phase-1-MVP nach `bewegungs_app_spec.md`, Abschnitt 7.

## Stack

- **Next.js 14** (App Router, TypeScript), mobil-responsiv, **PWA-installierbar**.
- **Supabase** (Auth + Postgres), Zugriff via `@supabase/ssr`, Row Level Security.
- **Domänenlogik** als reines TS in `lib/domain/*` — framework-agnostisch und
  unit-getestet (`vitest`), damit Phase 2 (ML) die Regeln ersetzen kann, ohne
  UI/DB anzufassen.

## Architektur-Leitplanken (im Code erzwungen)

| Spec | Umsetzung |
|------|-----------|
| Tempo nicht als Regler exponieren (2.2) | Schrittweite lebt nur in `lib/domain/titration.ts`, keine UI dafür |
| Ratsche zeigt nach oben (2.3) | `floor_offer` senkt `upper_edge_min` nie; gut bewerteter Boden-Tag titriert hoch |
| Kein Pro-User-ML in Phase 1 (7.4) | Transparente Regel in `titrate()`; alles wird trotzdem geloggt |
| Reward = base + Δ(pre→post) (3.3) | `lib/domain/reward.ts` |
| Streak = never miss twice (3.5) | `lib/domain/streak.ts` |
| Slider → numerischer `post_score` (3.2) | `components/PostFeelingSlider.tsx` + `lib/domain/scoring.ts` |

## Offene Punkte aus Abschnitt 9 → als Config (nicht hartcodiert)

In Absprache entschieden und als **editierbare/lernbare** Config abgelegt:

- `config/noShowReasons.ts` — die 4 anklickbaren Gründe + ihr Lern-Signal.
- `config/situations.ts` — die Situation→Plan-Defaults (aus Spec Abschnitt 4).
- `config/styleBias.ts` — Stil→Bias („klar gestaffelt"), nur Dosis über dem Boden.

Phase 2 darf diese Werte durch gelernte ersetzen.

## Sofort testen (Demo-Modus, kein Setup)

Ohne Supabase-Keys startet die App automatisch im **Demo-Modus**: ein lokaler,
dateibasierter Store (`.localdata/db.json`, gitignored), fester Demo-User, keine
Anmeldung. Damit ist der komplette Tagesflow ohne Account/Docker testbar.

```bash
npm install
npm run dev        # http://localhost:3000  -> direkt ins Onboarding
```

Im Header gibt es „zuruecksetzen", um den Demo-Store zu leeren und erneut
durchzuspielen. Sobald echte Supabase-Keys in `.env.local` stehen, schaltet die
App automatisch auf Supabase um (der Demo-Pfad wird dann nie benutzt).

## Setup (Produktion, mit Supabase)

1. `npm install`
2. Supabase bereitstellen — **eine** Variante:
   - gehostet: Projekt auf supabase.com anlegen, oder
   - lokal: `supabase start` (CLI, braucht Docker).
3. Schema einspielen: `supabase/migrations/0001_init.sql` (SQL-Editor oder
   `supabase db push`). Legt Tabellen + RLS + Auto-Profil-Trigger an.
4. `.env.local` aus `.env.local.example` erstellen und URL + Anon-Key eintragen.
5. `npm run dev` → http://localhost:3000

> Ohne Supabase-Keys zeigt die App einen Setup-Hinweis. Die **Domänenlogik +
> Tests laufen komplett ohne Supabase**: `npm run test`.

## Befehle

- `npm run dev` — Dev-Server
- `npm run build` / `npm start` — Production
- `npm run test` — Unit-Tests (reward, titration/Ratsche, streak)

## Tagesflow

Situation (4 + guter Tag) → „Was ist das Kleinste, das du jetzt machst?" (Boden)
→ Plan (Boden **plus** titrierte Dosis, stil-gebiast, bei *keine Zeit* in
Kalender-Slot / 4×15) → Outcome (`done`/`no_show`) → bei `done`: Slider →
Reward berechnen & loggen → Rotation + Streak + Lernstand updaten.

Jeder Schritt persistiert serverseitig in `daily_entries` — **das Lern-Log ist
das Asset** für Phase 2.

## Integrationen (Phase 1)

- **Google Calendar**: hinter `CalendarProvider` gestubbt
  (`lib/calendar/mock.ts`). Echtes OAuth ist ein markierter Config-Punkt
  (`lib/calendar/google.ts`, `CALENDAR_PROVIDER=google` + Google-Credentials).
- **Push**: PWA-Manifest + Service-Worker-Scaffold (`public/sw.js`) vorhanden;
  Push-Versand für No-Shows ist als Hook angelegt, in Phase 1 nicht scharf.

## Bekannte TODOs

- PWA-Icons `public/icon-192.png` / `public/icon-512.png` noch hinzufügen
  (Manifest referenziert sie bereits).
- Google-Calendar-OAuth verdrahten, sobald Credentials vorliegen.
- Schlaf-Integration + automatische Situations-Erkennung = Phase 2.
