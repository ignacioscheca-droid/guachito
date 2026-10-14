# Gauchito — notes for Claude

Habit app MVP (spec: `GUACHITO_MVP_BUILD_SPEC.docx`). Completing daily habits gives
energy to Gauchito, a chibi gaucho; a full bar sends him on a 2-hour adventure that
brings back a story and a ranch item. The owner uses it for a real one-week test.

## Branch "areas": Gauchito 2

This branch is a separate build, published at `/guachito/areas/` (installs as "Gauchito 2").
It keeps its own save (`gauchito.v2` in localStorage) and sends no notifications, so the
owner's app on main is untouched. Its design is the owner's, from his Royal Match references:
- **Day loop:** each habit gives 10 energy. The bar asks 30, and one more habit at each of
  Finch's stages (`energyGoal` in `src/game/journey.ts`). One full bar a day starts the
  next job for 8 hours; after that, habits give herraduras (the currency, +30 for filling the
  bar, +5 each). Seeing a finished job (`Reveal`) is what counts it (`actions.completeJob`).
- **The journey (`JOURNEY`):** Área 1 "El rancho de Paucho" (casa, fogón, aljibe),
  Área 2 "El galpón" (the cucha brings the dog, then galpón, gallinero), a trip to the south
  (`TRIP`, which brings lenga posts for the corrales), then Área 3 "Los corrales" (corral, molino,
  bebedero; still stand-ins until its art arrives: doc "Gauchito — Área 3: todo el arte"). Area
  order agreed with the owner: casa, galpón, corrales, cocina, laguna, estación.
- **Tab bar:** Áreas · Aventuras · Inicio · Paucho · Casita. On day 0 only Inicio is open:
  - the casita opens Casita, where the room and its shop share one screen and the first
    purchase, the bed, is forced;
  - the third day with habits opens Paucho (friendship by days together, streak, clothes);
  - the first finished area opens Áreas;
  - the end of La chacra opens Aventuras.
- **Home, laid out like Royal Match's:**
  - The area fills the screen. Above it sit the herraduras, the gear and a progress bar: the day's energy, then the 8-hour countdown, with the obra at its end; it becomes a button when ready or done.
  - Habits are Finch-sized cards (3½ in view, the last cut by the tab bar). "✓ N" and ✏️ chips sit above them. No text floats over the scene.
  - The tab bar is Royal Match's: icons only, and the chosen tab is wider, lit, with its icon raised over its name.
- **Área 1:** ChatGPT's art in `arte_build/` (area1_etapa0..3 and area1_assets/), imported by `design/tools/import_area1.py`.
  - **One scene per stage:** each obra not built yet shows as a pile of its materials.
  - **Layers, so things move:** the cloudless sky, three clouds crossing it, the stage (no sky, no trees, fire out), and two tree sprites swaying.
  - **Once built:** chimney smoke, lantern glow, three flame frames in the fogón, pava steam.
  - **While Paucho builds:** dust rises from the pile.
  - **The build transition, in Reveal:** the pile shakes, dust covers it, the obra (cut out of the next stage) pops up, then sparkles, a gold ring and confetti.
  - **Paucho idles sitting:** he cebas mate using the mate-scene frames.
  - **The onboarding's mate scene** happens on stage 0.
  - **Animation rule:** anything that moves needs a "plano limpio" (the area without it) and the thing alone on a transparent background. Doc: "Gauchito — Área 1: arte para animar".
- **Área 2 (El galpón):** ChatGPT's art in `arte_build/area2_assets/`, imported by `design/tools/import_area2.py` (shared helpers in `design/tools/area_layers.py`).
  - Built the same way as Área 1: stages, a clean plate, and a sprite sheet. Doc: "Gauchito — Área 2: todo el arte".
  - **What moves:** the clothes swing on the line; the veleta wobbles and turns with the wind (side and front frames); the lantern glows; the two hens peck (standing and pecking frames).
  - **Paucho idles** throwing maize to the hens (`paucho_maiz`), with grains falling. The dog sits by his cucha.
- **Paucho's room (Casita):** 16 places with 3 options each (`ROOM_SLOTS` in `src/game/room.ts`):
  - **Option k** is cut from ChatGPT's `cuarto_k`, in `arte_build/cuarto/`. Doc: "Gauchito — El cuarto de Paucho: todo el arte".
  - **The importer:** `design/tools/import_room.py` compares each room with `cuarto_vacio` inside each place's region (`REGIONS`). It writes the cut-outs, the shop thumbnails and the loose sprites, plus their boxes in `src/game/roomArt.ts`. `design/tools/room_map.py` drew the map that was sent with the brief.
  - **How you get each option:**
    - Most cost herraduras.
    - Three come with the trip to the south and three with friendship.
    - Six are Gauchito Premium. They still cost herraduras, and the test menu turns premium on.
  - **The save:** `room` is what you own and `placed` is what sits in each place. A save with the old six things keeps the bed as the catre and refunds the rest.
  - **`RoomScene` brings the room to life:**
    - Paucho stands, blinks, celebrates each purchase and points to the bed the first time.
    - The dog wags its tail and dozes.
    - Michi sits on the sill and naps.
    - The pendulum swings, notes come out of the gramophone, the mate steams, the candle flickers and the curtains sway.
    - The mecedora rocks when you tap it.
  - **Tapping a thing** in the room opens its place in the shop.
- **Art:** the brief is the Claude Doc "Gauchito — Arte para la build",
  https://claude.ai/code/artifact/0d52723f-435d-4f8a-a172-92b8d327966b. References are in
  `kit_build/` and ChatGPT's results go in `arte_build/` (both local only).
  - Until that art arrives, the build runs on stand-ins made by
    `design/tools/build_placeholders.py` (Área 3's lot and recoloured neckerchiefs). Obras
    without art show as wooden signs.
  - Areas are a base image plus one piece per obra (`Piece` in journey.ts). Clothes are
    overlays per pose (`WEAR` in `src/game/shop.ts`).
- **Sound and touch (`src/game/sound.ts`):**
  - **Music:** the owner's "At Peace With the Plains", with its silences trimmed, is `public/audio/musica.m4a`. It loops through a Web Audio gain, because iPhone ignores an audio element's volume. It starts with the first touch and stops while the app is hidden.
  - **Effects:** synthesized, with no files: tap, a habit done or undone, the bar ticking up, the full bar, herraduras landing, leaving to work, the build (rumble, then the pop), the area fanfare, buy, place, locked and unlock.
  - **Haptics:** Android uses `navigator.vibrate`. iPhone has no vibrate, so they click a hidden `<input switch>`; Safari 18 gives a tick each time.
  - **Every touch** on a button ticks with sound and haptic (`installTouchFeedback` in main.tsx).
  - **Ajustes → Sonido y vibración** turns each one on or off and sets the volumes. The settings are kept per device in `gauchito.sound`.
- **Publishing:** main's deploy workflow builds this branch into `/areas/`. After pushing it,
  run `gh workflow run deploy.yml --ref main`.

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
