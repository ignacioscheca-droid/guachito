GUACHITO — MVP PRODUCT & BUILD SPEC

Product brief for Claude Code + Rive + Figma
Version: October 2026
1. Product in one sentence
Guachito is a habit-improvement app where completing real-life habits gives energy to a cheerful Argentine gaucho companion, who uses that energy to explore an evolving estancia/pampas world. The product goal of the MVP is to validate the emotional loop: the user cares about Guachito, Guachito reacts to progress, and progress unlocks a small adventure and a tangible reward.
2. Core product principle
Vos cuidás tus hábitos → el Guachito construye su vida.
Habits are not just checkboxes; they are the input to the character/world progression.
Guachito should feel alive through reactions, small animations and contextual states.
The world should reward consistency without requiring a large game system.
The MVP should feel like a coherent product, not a collection of disconnected screens.
3. MVP success criteria
Validate that users understand the habit → energy → adventure → reward loop.
Validate that the mascot creates emotional motivation beyond a conventional habit tracker.
Validate that the Argentine/gaucho world is distinctive and memorable.
Validate whether users want to return to see what Guachito does next.
Keep implementation small enough that the first playable prototype can be built quickly.
4. MVP scope
4.1 Core flow
Onboarding
Name Guachito
Choose 3 initial habits
Home: see today's habits, Guachito, energy and adventure progress
Complete a habit
Guachito reacts and energy increases
Energy reaches the adventure threshold
Start/complete one short adventure
Receive a narrative discovery/reward
Use the reward to improve the ranch
4.2 Screens
01 — Onboarding: Explain the basic promise and establish the Guachito relationship.
02 — Name Guachito: Give the companion a personal identity.
03 — Choose habits: Select the initial habits; keep the selection simple.
04 — Home: Primary daily screen: Guachito + habits + energy + adventure progress.
05 — Habit completed: Immediate emotional feedback and energy gain.
06 — Adventure ready: Show that accumulated energy enables the next adventure.
07 — Story / reward: Short narrative beat plus discovery/reward.
08 — Ranch / shop: A simple persistent place where the user sees the consequence of progress.
4.3 Content
10–15 predefined habit options for the MVP.
3 habits selected by the user at onboarding.
10 simple rewards/items.
1 adventure with a beginning, middle and reward.
A small set of Guachito emotional states.
One dog companion.
A small set of ranch/environment objects.
4.4 Animation minimum
Idle — always available on Home.
Habit completion / celebration — immediate positive feedback.
Adventure — Guachito leaves/returns or performs a short adventure sequence.
Additional prepared references: wave, happy, sad, thinking, surprised, mate, pet dog, walk, horseback, sleep, return from adventure.
5. Visual direction
Original chibi gaucho identity; friendly, rounded, expressive and highly legible at mobile scale.
Argentine estancia/pampas world: ranch/cabin, fence, trees, mountains, mate, horse, dog, windmill, lanterns, saddle gear, campfire and river.
Warm earthy palette with cream/tan/brown, red accents, green, sky blue and warm yellow/orange accents.
Guachito: brown gaucho hat, red neckerchief, cream shirt, brown fringed poncho, dark bombacha-style pants, belt and boots.
Large expressive eyes, thick eyebrows and dark moustache.
The visual language should be original; Finch/Duolingo are references for clarity and emotional UX, not assets to copy.
6. Rive implementation
Build one reusable Guachito master rather than separate drawings for each state.
Keep major body parts separated: head, eyes, brows, mouth, moustache, hat, scarf, torso, poncho, arms/hands, belt, legs and boots.
Use a rig that supports reusable animation and state changes.
Create a State Machine with at minimum: idle, habit_completed, celebrate and return_to_idle.
Prepare the structure so later states can be added: adventure, sleep, mate, pet_dog, walk, horseback, sad, surprised, thinking.
Dog should remain a separate reusable companion asset.
Use the supplied RIG_SPEC.md and character/animation boards as the source of truth for layer naming and hierarchy.
7. Figma implementation
Use the supplied 8-screen UI references as visual/product direction.
Create reusable components for: Guachito area, habit row/card, energy meter, adventure CTA, reward card, bottom navigation and ranch item.
Keep the first prototype focused on interaction and hierarchy rather than exhaustive component libraries.
Do not attempt to reproduce every Finch screen; use Finch's product philosophy only as inspiration.
8. What we are deliberately IGNORING in the MVP
These are explicitly out of scope because they add complexity without being necessary to validate the core hypothesis:
Friends, social feed, chat or social comparison.
Micropets and a collection of multiple companion species.
Seasonal events and limited-time event systems.
Breathing exercises, meditation modules and advanced self-care areas.
Advanced journaling/reflections.
Advanced analytics, detailed statistics and charts.
Complex achievements/badges.
Multiple currencies or a full economy.
Subscriptions, premium tiers and monetization experiments.
Marketplace or large item catalog.
Deep character customization.
Complex levels, XP systems or progression trees.
Multiple adventures/world regions.
Large narrative/content pipelines.
Push-notification strategy and lifecycle marketing.
Backend architecture beyond what is required to persist the MVP loop.
Large-scale personalization or recommendation algorithms.
Polished production-grade accessibility/localization systems beyond what is needed for the prototype.
9. Suggested build order for Claude Code
Set up the project shell and navigation around the 8 MVP screens.
Implement the core data model: habits, completion state, energy, adventure progress and rewards.
Implement the Home screen first because it is the central loop.
Implement habit completion and immediate Guachito feedback.
Implement the energy threshold and Adventure Ready state.
Implement the single adventure and Story/Reward state.
Implement the Ranch/Shop reward persistence.
Integrate the Rive Guachito asset and State Machine.
Add the dog companion as a separate visual layer/asset.
Polish transitions, timing and micro-interactions only after the loop is playable end-to-end.
10. Recommended acceptance test
A new user can understand the app without explanation.
The user can create/select 3 habits in the first session.
Completing a habit produces an immediate, visible Guachito reaction.
Energy visibly changes as habits are completed.
The user can reach and start the single adventure.
The adventure produces a discovery/reward.
The reward has a visible consequence in the ranch.
The user can return to Home and understand what to do next.
The character never feels visually disconnected from the habit system.
11. Asset package included
01_PRODUCT_MVP — onboarding, naming, habit selection, Home, habit completion, adventure, story/reward, ranch/shop and overview boards.
02_RIVE_CHARACTER — character poses, sprite-sheet reference, character bible, rig guide, animation board and RIG_SPEC.md.
03_ANIMATIONS — prepared GIF references for achievement, interaction and adventure.
04_REFERENCE_BOARDS — original ZIP packs for convenient reuse.
12. Working principle for tomorrow
Treat this document as the scope boundary. When a new feature is proposed, first ask whether it is necessary to validate the core hypothesis. If not, defer it. The objective is not to build a complete habit platform; it is to build a small, emotionally convincing playable loop around Guachito.