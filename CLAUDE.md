# Gauchito — notes for Claude

Habit app MVP (spec: `GUACHITO_MVP_BUILD_SPEC.docx`). Completing daily habits gives
energy to Gauchito, a chibi gaucho; a full bar sends him on a 2-hour adventure that
brings back a story and a ranch item. The owner uses it for a real one-week test.

## Name

The app and character are **Gauchito**. The spec and first builds said "Guachito";
lowercase ids keep that spelling on purpose, because renaming them would lose saved
data or break links: the `guachito.v1` localStorage key, the `guachito` IndexedDB,
the repo and its Pages URL, `guachito.riv` and its `Guachito` artboard, CSS classes,
and the `guachito_assets/` folder. Everything people read says Gauchito.

## Working with the owner

- Write to him in Rioplatense Spanish (voseo). App copy is also voseo.
- He tests on his iPhone; the app is installed from the Home Screen (PWA).
- He judges by looking: after a visual change, check it at 390×844 and show it.

## How it's built

- `app/` — Vite + React + TypeScript, no backend. State lives in `localStorage`
  (`app/src/game/store.ts`), with export/import backup in Ajustes.
- Deploy: push to `main` → `.github/workflows/deploy.yml` → GitHub Pages at
  `https://ignacioscheca-droid.github.io/guachito/` (base path from `BASE_PATH`).
- Daily notifications, Europe/Madrid: buen día 9:00 (`morning`), reminder 16:00
  (`reminder`), buenas noches 21:00 (`night`). `.github/workflows/reminder.yml` runs
  `scripts/send-reminder.mjs`; each time has two UTC crons (summer/winter) at :50, and
  the script works out the Madrid hour from the cron that fired, waits for :00 and sends
  (the other cron exits). Manual test: `gh workflow run reminder.yml -f kind=night`.
  Secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_SUBSCRIPTION` (copied from the
  app's Ajustes on the phone; set 2026-10-08). The public key is also in
  `app/src/game/push.ts`. iPhone push only works from the installed Home Screen app.
  The push carries only its kind; `app/public/sw.js` writes the text on the phone.
  Morning and night are plain greetings from Gauchito, never about the habits (the owner's
  call): one per day from `GREETINGS` in sw.js. The 16:00 reminder reads a snapshot of
  today's state that the app keeps in IndexedDB (`src/game/reminderSnapshot.ts`) — what's
  done, what's missing, where Gauchito is. Ajustes → 9:00 / 16:00 / 21:00 shows them.
- Content and tuning: `app/src/game/content.ts` — habit catalog, energy and coins
  (ENERGY_PER_HABIT, ENERGY_GOAL, ADVENTURE_MS…), 7 episodes, ranch items and their
  patio spots.

## Decisions already made

- Day loop copies Finch's day 0 (owner's call, from his Finch recording): each habit gives
  5 energy and 15 (three habits) fills the bar; later habits give 3 coins. A full bar runs
  `EnergyFull.tsx`: the bar counts to "¡Al máximo!", "¡Yujuuu!" + 30 coins flying to the
  counter, then "El rancho de Paucho está creciendo" (Finch's bird grows up; Paucho can't,
  so the ranch does: Ranchito → Puesto at 7 full-energy days → Estancia at 21,
  `RANCH_STAGES` in content.ts; the Rancho tab is titled with the stage; art per stage is
  being tried: mockup brief in the Claude Doc "Gauchito — Etapas del rancho (mockups)",
  https://claude.ai/code/artifact/708b4a2d-1ce9-4692-a086-c4dc5e2bbda6, kit in
  `kit_rancho_etapas/`, results go to `rancho_etapas/`, both local only), then
  "¡Salir de aventura!" → 8-hour adventure; Home shows him riding the pampas with a
  "vuelve en…" track. Habits leave the list with confetti and a toast ("¡Primera vez que
  lo completás!"); done ones fold into "Hechos hoy". One episode per adventure, 7 in all.
- His habits: Jugar con Oli 🧸, Darle un abrazo a Pau 🤗, Entrenar 🏋️ (custom habits).
- Ranch layout follows his reference image `rancho_completo_unlocked.png` (local only);
  `design/tools/ranch_preview.py` renders the layout for review.
- Out of scope: weekly history view, offline caching, usage logging.
- Onboarding (`app/src/screens/Onboarding.tsx`): a mate scene replaces the welcome screen.
  1) Gauchito ceba un mate y te mira (no text) · 2) "¡Hola! Soy el Gauchito ___" (the
  player names him) → "Soy tu compañero para cuidarte un poquito cada día. ¡Y cuando
  vos te cuidás, a mí también me hace bien!" · 3) "¿Cómo te llamás?" · 4) "¡Un gusto,
  {nombre}! ¿Querés un mate?" Sí → "¡Tomá, está muy rico!" / No → "¡Más para mí!" ·
  5) "Bueno, y ahora contame un poco de vos." → questionnaire (`src/screens/Questionnaire.tsx`,
  questions in `src/game/aboutYou.ts`): Finch's 12–24 except "have you used Finch before?";
  "¿Qué te trae por acá, {nombre}?" titles its areas question. Answers are saved as
  `aboutYou` · 6) pick up to 3 habits from the grid · 7) "Armando tus metas…" (Finch 25,
  with placeholder 5-star reviews instead of "45 million people") · 8) "El plan de
  {nombre}" (Finch 26, `src/screens/PlanScreens.tsx`): 7 goals like Finch's — the picked
  habits, up to 2 goals the answers point to, then Finch's basics (`buildPlan` in
  `aboutYou.ts`, goals in `STARTER_GOALS` in content.ts). The plan becomes the daily
  habits, so energy is split over 7 (MAX_HABITS = 7). He is called Paucho unless renamed ·
  9) day 1 (Finch 32–34, `src/screens/DayOne.tsx`): "¡Jueves genial!" card with a gentle
  reminder, "1 día de racha", and "¿Cuántos días seguidos…?" (2/5/7/14, saved as
  `streakGoal`). The app doesn't count streaks yet.
  Naming the dog comes later, not in onboarding. Art brief: Claude Doc "Gauchito — Escena del mate (onboarding)"
  (https://claude.ai/code/artifact/a95a438f-5c51-43af-8984-69abcb3ff50b, tab "Para pegar en
  ChatGPT" is the brief); the owner generates the art with ChatGPT from `kit_escena_mate/`.
  The 25 poses arrived 2026-10-08 in `escena_mate/` (local only): A = plano general
  1024×1536 (cebando, sorbo, "ahh", te mira), B = plano medio 1254×1254 with
  `_cerrada`/`_abierta` (+ `_parpadeo` for b2/b3); variants are pixel-aligned.
  `design/tools/import_mate_scene.py` cleans the halos of A2·1, A3, A4. A2·3 keeps a
  smoky halo, so the scene plays A1 in its place. A5 (te mira) was redone clean on
  2026-10-08; if any A pose changes, the shared crop can change too: re-check the
  `steam` points in `SCENE` and the `.mi-scene__guy` aspect ratio.

## Art

- Web-ready art is in `app/public/a/*.webp`, generated by `design/tools/import_assets.py`
  from the artist's delivery `guachito_assets/` — **which is not in git** (local on
  the owner's Mac, as are `design/source/` and the reference image). In a cloud
  session you can use the existing webp files but cannot regenerate them.
- The artist's full-body poses, items, icons and illustrations are good. Their modular
  rig parts don't rebuild the character, so the Rive file is pose-swap + eyelids.
- Rive: `app/public/rive/guachito.riv`, built in the Rive desktop app ("Gauchito v1")
  through its local MCP server — only available on the owner's Mac. Free-plan exports
  drop view models, so the app plays the animations by name (`RiveGauchito.tsx`).
  See `design/rive/README.md`.

## Checks

- `cd app && npx tsc -b && npm run build`
- Hidden test menu: tap the Home greeting 5 times, or open with `?test`. "Ver el onboarding"
  replays the mate scene without saving anything.
