# Gauchito — MVP

Habit app where completing real habits gives energy to Gauchito, who goes on an
adventure in the pampas and brings back things for the ranch. Scope and intent:
`GUACHITO_MVP_BUILD_SPEC.docx`.

Live: https://ignacioscheca-droid.github.io/guachito/ (deployed on every push to `main`).

## Run it

```bash
cd app
npm install
npm run dev -- --host
```

Open the printed `Network:` URL on a phone on the same Wi‑Fi. On iPhone, Share →
"Add to Home Screen" runs it full screen like an app.

## Daily reminder

`.github/workflows/reminder.yml` sends a Web Push at 16:00 (Madrid) to the phone
subscription stored in the `PUSH_SUBSCRIPTION` secret. To set it up on a phone:
install the app from the Home Screen, open Ajustes → Activar notificaciones, and
save the code it shows as that secret. Run the workflow by hand to test.

## Playtest helpers

- Tap the Home greeting 5 times, or open the app with `?test`, for the test menu:
  next day, fill energy, finish the adventure now, +100 coins, reset.
- Pacing (in `app/src/game/content.ts`): today's habits together fill the 100 bar,
  the adventure lasts 2 hours, each adventure gives 50 coins + one ranch item.

## Layout

```
app/                     Vite + React + TypeScript web app
  src/game/content.ts    habits, ranch items, adventure episodes, tuning numbers
  src/game/store.ts      game state (saved in localStorage) and actions
  src/screens/           onboarding, home, habit done, adventure, story, ranch
  src/components/        scene, Gauchito (Rive or still-pose fallback), UI pieces
  public/a/              web-ready art (generated from guachito_assets/)
  public/rive/           guachito.riv (the app falls back to the still poses without it)
guachito_assets/         the artist's delivery (local only, not in git)
design/
  source/                the first art package (local only, not in git)
  tools/import_assets.py guachito_assets/ -> app/public/a/ (baselines, shared crop box, WebP)
  tools/rive_parts.py    parts for the Rive rig, from the web poses
  tools/rive_export.py   exports the open Rive file to app/public/rive/guachito.riv
  tools/contact.py       contact sheets for reviewing art
  tools/ranch_preview.py renders the ranch layout for review
scripts/send-reminder.mjs  the daily push, run by .github/workflows/reminder.yml
  tools/legacy/          the old cut-from-boards pipeline (superseded)
  rive/                  Rive parts + how the rig is built
```

## Updating art

```bash
python3 design/tools/import_assets.py
```

## Rive

`app/public/rive/guachito.riv` is picked up automatically when present. Artboard
`Guachito` (906 × 1210; artboard name kept from the old spelling), animations `idle`, `habit_completed`, `celebrate`,
`return_to_idle`. Details and the free-plan caveat: `design/rive/README.md`.
