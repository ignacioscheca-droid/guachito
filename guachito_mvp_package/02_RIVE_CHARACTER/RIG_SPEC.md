# Guachito — Rigging spec v0.1

## Character hierarchy
- Root
- Body
- Head
  - Eyes_L / Eyes_R
  - Brows_L / Brows_R
  - Mouth
  - Moustache
- Hat
  - Crown
  - Band
  - Brim
- Scarf
- Poncho_L / Poncho_R
- Torso / Belt / Buckle
- Arm_L / Hand_L
- Arm_R / Hand_R
- Leg_L / Boot_L
- Leg_R / Boot_R
- Mate / Bombilla

## Primary state machines
- idle
- greeting
- happy
- thinking
- surprised
- sad
- sleepy
- mate
- pet_dog
- walk
- celebrate
- ride
- adventure_return

## MVP animation targets
1. idle_loop: 2–3 s, breathing + blink + subtle poncho motion
2. complete_habit: 1.2–1.8 s, smile → anticipation → jump → celebration → settle
3. greeting: 1.2 s, arm wave + head tilt + blink
4. mate: 2.5 s, pick up mate → sip → satisfied expression → return
5. adventure: 3–5 s, mount → ride cycle → landscape transition → arrival
6. reward: 1.5 s, eyes widen → smile → confetti → thumbs up

## Interaction rules
- Hat remains a stable anchor to head movement.
- Moustache follows facial orientation but does not deform independently.
- Poncho has secondary motion on jumps and walking.
- Scarf has delayed secondary motion.
- Eyes and brows are independent controls.
- Dog is a separate rig.

## Export targets
- Rive: primary interactive mascot
- Lottie: lightweight one-shot UI animations
- PNG/SVG: static fallback states and store assets
