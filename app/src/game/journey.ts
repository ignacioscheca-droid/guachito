// The road Paucho and the player walk together: three areas to build, one obra per day
// of full energy, and a trip to the south between the second and the third (Royal Match
// areas, Finch's day loop). Art per area: a base image (the area before any obra) plus
// one piece per obra laid over it; until ChatGPT's art arrives an obra without a piece
// shows as a wooden sign (see AreaScene).

import type { Spot } from './content'

export type Piece =
  /** A cut-out laid over the base: `box` in % of the square base (left, top, width). */
  | { image: string; box: { left: number; top: number; width: number } }
  /** A cut-out standing on the ground at `spot` (x = centre, y = feet, h = height, all %). */
  | { image: string; spot: Spot }
  /** No art yet: a sign at `spot` with the obra's emoji and name. */
  | { sign: Spot }

export type Obra = {
  id: string
  name: string
  /** For sentences: "va a construir la casita". */
  the: string
  emoji: string
  /** One label per habit the bar needs (the bar may need 3 or 4). */
  steps: string[]
  piece: Piece
  /** What Paucho says when it is finished. */
  done: string
}

export type Area = {
  id: string
  name: string
  /** Art of the area before any obra. */
  base: string
  obras: Obra[]
  /** Where Paucho and the dog stand. */
  hero: Spot
  dog: Spot
  /** Camera for Home: which point of the square stays in view, and where the ground meets the card. */
  camera: { focusX: number; screenX: number; groundY: number; minZoom: number }
  /** Paucho's line when the area opens. */
  intro: string
}

const HERO_H = 25.1

export const AREAS: Area[] = [
  {
    id: 'rancho',
    name: 'El rancho de Paucho',
    base: 'area1_0',
    hero: { x: 42, y: 79, h: HERO_H },
    dog: { x: 58, y: 80, h: 11.3 },
    camera: { focusX: 58, screenX: 50, groundY: 95, minZoom: 1.15 },
    intro: 'Acá voy a hacer mi rancho. ¡Con tu ayuda, en tres días está!',
    obras: [
      {
        id: 'casita',
        name: 'La casita',
        the: 'la casita',
        emoji: '🏠',
        steps: ['Postes', 'Paredes', 'Techo', 'Puerta'],
        piece: { image: 'area1_casita', box: { left: 47.77, top: 16.59, width: 52.23 } },
        done: '¡Ya tengo casita! Gracias a vos.',
      },
      {
        id: 'fogon',
        name: 'El fogón',
        the: 'el fogón',
        emoji: '🔥',
        steps: ['Piedras', 'Leña', 'Banco', 'Pava'],
        piece: { image: 'item_fogon', spot: { x: 19, y: 70, h: 12 } },
        done: 'Ahora tenemos dónde tomar unos mates juntos.',
      },
      {
        id: 'corral',
        name: 'El corral',
        the: 'el corral',
        emoji: '🐴',
        steps: ['Postes', 'Alambrado', 'Tranquera', 'Bebedero'],
        piece: { image: 'area1_corral', spot: { x: 24, y: 52, h: 13 } },
        done: '¡Llegó Lucero, mi caballo! Ya tiene su corral.',
      },
    ],
  },
  {
    id: 'chacra',
    name: 'La chacra',
    base: 'area2_0',
    hero: { x: 60, y: 84, h: HERO_H },
    dog: { x: 44, y: 85, h: 11.3 },
    camera: { focusX: 50, screenX: 50, groundY: 96, minZoom: 1.15 },
    intro: 'Detrás del rancho hay lugar para una chacra. ¿Arrancamos?',
    obras: [
      {
        id: 'cucha',
        name: 'La cucha',
        the: 'la cucha',
        emoji: '🛖',
        steps: ['Tablas', 'Techo', 'Mantita', 'Plato'],
        piece: { sign: { x: 24, y: 72, h: 15 } },
        done: '¡Mirá quién llegó! Un perrito encontró su cucha.',
      },
      {
        id: 'huerta',
        name: 'La huerta',
        the: 'la huerta',
        emoji: '🥬',
        steps: ['Surcos', 'Semillas', 'Riego', 'Cerco'],
        piece: { sign: { x: 48, y: 66, h: 15 } },
        done: 'En unos días comemos verduras de nuestra huerta.',
      },
      {
        id: 'molino',
        name: 'El molino',
        the: 'el molino',
        emoji: '💨',
        steps: ['Torre', 'Aspas', 'Tanque', 'Caños'],
        piece: { sign: { x: 76, y: 60, h: 15 } },
        done: 'Con el molino no nos falta agua nunca más.',
      },
      {
        id: 'gallinero',
        name: 'El gallinero',
        the: 'el gallinero',
        emoji: '🐔',
        steps: ['Paredes', 'Nidos', 'Rampita', 'Gallinas'],
        piece: { sign: { x: 36, y: 58, h: 15 } },
        done: '¡Tres gallinas nuevas! Mañana hay huevos frescos.',
      },
    ],
  },
  {
    id: 'pulperia',
    name: 'La pulpería',
    base: 'area3_0',
    hero: { x: 30, y: 84, h: HERO_H },
    dog: { x: 16, y: 85, h: 11.3 },
    camera: { focusX: 50, screenX: 50, groundY: 96, minZoom: 1.15 },
    intro: 'La pulpería del camino está vieja y cerrada. ¡La vamos a dejar como nueva!',
    obras: [
      {
        id: 'techo',
        name: 'El techo',
        the: 'el techo',
        emoji: '🪵',
        steps: ['Vigas', 'Tablas', 'Tejas', 'Canaleta'],
        piece: { sign: { x: 50, y: 56, h: 15 } },
        done: 'La madera del sur quedó hermosa en el techo.',
      },
      {
        id: 'mostrador',
        name: 'El mostrador',
        the: 'el mostrador',
        emoji: '🫙',
        steps: ['Estantes', 'Mostrador', 'Frascos', 'Pintura'],
        piece: { sign: { x: 70, y: 64, h: 15 } },
        done: 'Ya abrimos puertas y ventanas. ¡Hay de todo!',
      },
      {
        id: 'palenque',
        name: 'El palenque',
        the: 'el palenque',
        emoji: '🐎',
        steps: ['Postes', 'Barra', 'Bebedero', 'Sombra'],
        piece: { sign: { x: 30, y: 66, h: 15 } },
        done: 'Ahora los que pasan pueden atar el caballo y quedarse.',
      },
      {
        id: 'cartel',
        name: 'El cartel',
        the: 'el cartel',
        emoji: '🪧',
        steps: ['Tablas', 'Letras', 'Faroles', 'Banderines'],
        piece: { sign: { x: 58, y: 48, h: 15 } },
        done: '¡Abrió la pulpería! Gracias por acompañarme todo el camino.',
      },
    ],
  },
]

/** An area's name with Paucho's own name in it ("El rancho de Tito"); `the` lowercases the article. */
export function areaName(area: number, companion: string, the = false) {
  const name = AREAS[area].name.replace('Paucho', companion)
  return the ? name.replace(/^El /, 'el ').replace(/^La /, 'la ') : name
}

/** The trip between La chacra and La pulpería. */
export const TRIP = {
  id: 'sur',
  name: 'Viaje al sur',
  place: 'el sur',
  emoji: '🏔️',
  steps: ['Ensillar', 'Provisiones', 'Mate', 'Poncho'],
  /** Why he goes, told when La chacra is done. */
  reason: 'Para arreglar la pulpería necesito madera de lenga, y esa solo hay en el sur.',
  brings: 'madera de lenga',
  bringsEmoji: '🪵',
  coins: 50,
  /** Shown while he rides, one after the other. */
  beats: ['Ensilló a Lucero y salió al trote…', 'Cruzando la meseta, hace cada vez más frío…', '¡Pegó la vuelta con la madera atada al lomo!'],
  story:
    'Crucé media Argentina hasta el sur. Hacía un frío que pelaba, pero los lagos eran turquesa y los bosques de lenga, rojos como el fuego. Un puestero me cambió la madera por unos mates… ¡y me regaló ropa de lana!',
  image: 'ill_adventure_ready',
  replies: [
    { label: '¡Qué viaje!', answer: 'Volví con las orejas congeladas, ¡pero feliz!' },
    { label: '¿Hacía mucho frío?', answer: '¡Mucho! Por suerte me prestaron un gorro de lana.' },
    { label: 'Contame de los lagos', answer: 'Eran tan celestes que parecían de mentira.' },
  ],
}

/** Regions for the trips diary; only the south is in this build. */
export const REGIONS = [
  { id: 'sur', name: 'El sur', emoji: '🏔️' },
  { id: 'norte', name: 'El norte', emoji: '🌵' },
  { id: 'litoral', name: 'El litoral', emoji: '🌊' },
  { id: 'cuyo', name: 'Cuyo', emoji: '🍇' },
]

export type Job = { kind: 'build'; area: number; obra: number } | { kind: 'trip' }

/** Every job in order: the obras of areas 1 and 2, the trip, the obras of area 3. */
export const JOURNEY: Job[] = [
  ...AREAS[0].obras.map((_, obra) => ({ kind: 'build' as const, area: 0, obra })),
  ...AREAS[1].obras.map((_, obra) => ({ kind: 'build' as const, area: 1, obra })),
  { kind: 'trip' },
  ...AREAS[2].obras.map((_, obra) => ({ kind: 'build' as const, area: 2, obra })),
]

/** Index in JOURNEY of the trip. */
export const TRIP_JOB = JOURNEY.findIndex((j) => j.kind === 'trip')

// Finch's economy in round numbers (the owner's call): every habit gives 10 energy and the
// bar asks one more habit at each of Finch's growth stages (7, 22, 42, 67 adventures).
export const ENERGY_PER_HABIT = 10
export function energyGoal(jobsDone: number) {
  return jobsDone < 7 ? 30 : jobsDone < 22 ? 40 : jobsDone < 42 ? 50 : jobsDone < 67 ? 60 : 70
}
/** Herraduras for filling the bar, and for each habit after that. */
export const FULL_ENERGY_COINS = 30
export const EXTRA_HABIT_COINS = 5
/** Like Finch's adventures, an obra or a trip takes eight real hours. */
export const WORK_MS = 8 * 60 * 60 * 1000

export const jobAt = (jobsDone: number): Job | null => JOURNEY[jobsDone] ?? null

/** Name and steps of a job, whatever its kind. */
export function jobInfo(job: Job) {
  if (job.kind === 'trip') return { name: TRIP.name, the: `el viaje al ${TRIP.place.replace('el ', '')}`, emoji: TRIP.emoji, steps: TRIP.steps }
  const o = AREAS[job.area].obras[job.obra]
  return { name: o.name, the: o.the, emoji: o.emoji, steps: o.steps }
}

/**
 * Which area Home shows after `jobsDone` jobs, and how many of its obras stand. While the
 * trip is next or under way, La chacra stays on screen (finished); after it, La pulpería.
 */
export function areaView(jobsDone: number) {
  let done = 0
  for (let a = 0; a < AREAS.length; a++) {
    const start = JOURNEY.findIndex((j) => j.kind === 'build' && j.area === a)
    const count = AREAS[a].obras.length
    if (jobsDone < start + count || a === AREAS.length - 1) {
      // a finished area stays up until the next one starts
      if (jobsDone < start && a > 0) return { area: a - 1, built: AREAS[a - 1].obras.length }
      done = Math.max(0, Math.min(count, jobsDone - start))
      return { area: a, built: done }
    }
  }
  return { area: 0, built: 0 }
}

/** Areas fully built after `jobsDone` jobs. */
export function areasDone(jobsDone: number) {
  return AREAS.filter((_, a) => {
    const last = JOURNEY.findLastIndex((j) => j.kind === 'build' && j.area === a)
    return jobsDone > last
  }).length
}
