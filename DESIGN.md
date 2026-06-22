# vervou — Design-Handover (Wireframes → App)

So gibst du mir deine Figma-Designs, damit ich sie möglichst **genauso** baue.
Reihenfolge: du füllst die **Tokens** (einmal global) aus und exportierst pro
Screen ein **PNG (@2x)**. Icons/Illustrationen als **SVG**. Dann baue ich Screen
für Screen, du gibst Feedback, wir finishen.

> Wichtig: Die **Logik bleibt unangetastet** (Titration/Ratsche, Delta-Reward,
> Streak, Supabase-Logging). Ich reskinne nur die Oberfläche und hänge sie an
> die bestehenden Server-Actions.

---

## 1. Globale Design-Tokens (bitte ausfüllen)

```
FARBEN (Hex)
- Hintergrund:        #
- Karte/Fläche:       #
- Text primär:        #
- Text sekundär:      #
- Akzent/Primary:     #
- Erfolg (good):      #
- Warnung:            #
- Fehler/bad:         #

TYPOGRAFIE
- Schriftfamilie:           (Name + Quelle, z.B. Google Fonts "Inter")
- Überschrift H1:           Größe / Gewicht
- Text normal:              Größe / Gewicht
- Klein/Caption:            Größe / Gewicht

FORM & ABSTAND
- Eckenradius Karten:       px
- Eckenradius Buttons:      px
- Button-Höhe:              px
- Standard-Abstand (Gap):   px
- Seiten-Padding:           px

SONSTIGES
- Dark oder Light Mode?     
- Hat es einen Verlauf/Gradient?  (wo, welche Farben)
```

---

## 2. Wireframes für das MVP

Reihenfolge im Nutzer-Flow. ⭐ = die drei Dopamin-Screens, die du neu willst.

| # | Screen | Inhalt | Status |
|---|--------|--------|--------|
| 1 | **Login / Registrieren** | Logo, E-Mail, Passwort, Umschalten Login/Signup | vorhanden, reskin |
| 2 | **Onboarding** | Ziel, Stil, Bewegungsarten, Lieblingsworkout, Musik, Kalender | vorhanden, reskin |
| 3 | **Situation wählen** | „Wie ist dein Tag?" — 5 Optionen (gut / wenig Energie / keine Zeit / anderes wichtiger / im Loch) | vorhanden, reskin |
| 4 | **Boden eingeben** | „Was ist das Kleinste, das du jetzt machst?" — Minuten | vorhanden, reskin |
| 5 ⭐| **Plan + Prediction** | Vorschlag (Modalität, Dosis, Timing) **+ kurze Vorhersage**: „Wie gut wird sich das anfühlen?" / „Bringt dich auf Streak X" | **neu (Dopamin 1)** |
| 6 ⭐| **Aktive Bestätigung** | „Ich hab's gemacht" als **aktive Geste** (Halten-zum-Bestätigen / Swipe) + „Nicht geschafft" | **neu (Dopamin 2)** |
| 7 | **Befinden-Slider** | „Wie geht's dir?" — der satte Slider (liefert intern 0–100) | vorhanden, reskin |
| 8 ⭐| **Celebrate** | Konfetti/Animation, **Streak +1 zählt hoch**, „Besser als gedacht 💥" (Prediction-Error), **Teilen**-Button, CTA „morgen wieder" | **neu (Dopamin 3)** |
| 9 | **No-Show-Gründe** | „Warum hat's nicht geklappt?" — 4 anklickbare Gründe (sanft, keine Strafe-Optik) | vorhanden, reskin |
| 10| **Verlauf / Streak** | Streak-Anzeige, Liste der Tage | vorhanden, reskin |

**Minimal nötig fürs MVP:** alle 10. **Neu zu designen (Kern deines Wunsches):**
5, 6, 8. Den Rest gibt es schon funktional — die reskinne ich nach deinen Frames.

---

## 3. Der Dopamin-Loop (was jeder der 3 Screens leisten soll)

**5 — Prediction (Anticipation).**
Kurz, ein Drag/Tipp. Erfasst eine **Vorhersage** (z.B. erwartetes Befinden 0–100
oder „schaff ich heute? ja/eher"). Das baut Erwartung auf — und liefert später
den Vergleich „erwartet vs. echt". (Wir können das als `predicted_feeling`
mitloggen → macht das Lern-Log noch wertvoller.)

**6 — Aktive Bestätigung (Ownership).**
Bewusst **kein** lascher Tap: Halten-zum-Bestätigen (Button füllt sich) oder
Swipe-to-complete. Der kleine Effort = „ich hab's verdient". Erst danach kommt
der Slider (echtes Befinden).

**8 — Celebrate (Reward + Prediction-Error).**
- Konfetti / Animation beim Öffnen.
- Streak zählt sichtbar **+1** hoch.
- Wenn echtes Befinden > Vorhersage: „**Besser als gedacht 💥**" (der eigentliche
  Dopamin-Kick).
- **Teilen** via Web-Share (Handy-Teilen-Dialog: Text „Tag 5 🔥 mit vervou" +
  Link). Optional später: teilbares Bild.
- No-Show-Fall bekommt **keine** Celebration — sanftes „alles gut, morgen weiter"
  (Streak bleibt, never miss twice).

> Technisch alles ohne schwere Libs machbar: Konfetti = winzige Lib oder CSS,
> Count-up = simple Animation, Teilen = `navigator.share` (PWA).

---

## 4. Pro Screen mitliefern

- [ ] PNG @2x (ein Bild pro Screen/Zustand)
- [ ] Reihenfolge / wie man dahin kommt
- [ ] Besonderheiten der Interaktion (was passiert beim Tippen/Ziehen)
- [ ] Icons/Illustrationen als SVG (separat)

Wenn ein Screen mehrere Zustände hat (z.B. Slider bei 20 % vs. 90 %), gern je ein
PNG — dann treffe ich die Animation besser.
