// The road Paucho and the player walk together: three areas to build, one obra per day
// of full energy, and a trip to the south between the second and the third (Royal Match
// areas, Finch's day loop).
//
// Área 1 is the final art (the casa v2, design/tools/import_area_casa.py): the whole area
// drawn finished, in layers (sky, drifting clouds, the scene), and each obra cut out so
// the app can draw it faded until it is built ("fixes bring the colour back"). Areas 2
// and 3 still run on stand-ins: a base image and a wooden sign per obra.

import type { Spot } from './content'

export type Piece =
  /** A cut-out laid over the base: `box` in % of the square base (left, top, width). */
  | { image: string; box: { left: number; top: number; width: number } }
  /** A cut-out standing on the ground at `spot` (x = centre, y = feet, h = height, all %). */
  | { image: string; spot: Spot }
  /** No art yet: a sign at `spot` with the obra's emoji and name. */
  | { sign: Spot }
  /** Drawn in the area's art already: `cut` is it cut out, laid faded on top until built. */
  | { cut: string; box: { left: number; top: number; width: number } }

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
  /** Art of the area (before any obra, or finished when its obras are `cut`). */
  base: string
  /** Height / width of the art. */
  aspect: number
  /** The art in layers: a cloudless sky, the art's own clouds, the scene with no sky. */
  layers?: { sky: string; skyHeight: number; scene: string; clouds: { image: string; box: { left: number; top: number; width: number } }[] }
  /** Colour above the art when the screen is taller than it. */
  skyTop: string
  /** Fraction of the art's height where Home's habit cards begin. */
  cardsAt: number
  /** Fraction of the art's height kept in view when it is shown cropped (Áreas cards). */
  focusY: number
  obras: Obra[]
  /** Where Paucho and the dog stand (x % of width; y, h % of height). */
  hero: Spot
  dog: Spot
  /** Paucho's own thing to do here while he isn't building (Área 1: cebar mate). */
  sit?: Spot
  /** Little things that move (see AreaLife). */
  life?: 'casa'
  /** Paucho's line when the area opens. */
  intro: string
}

const HERO_H = 25.1

export const AREAS: Area[] = [
  {
    id: 'rancho',
    name: 'El rancho de Paucho',
    base: 'area_casa_v2',
    aspect: 1.5,
    layers: {
      sky: 'area1_sky',
      skyHeight: 21.48,
      scene: 'area1_scene',
      clouds: [
        { image: 'area1_cloud_1', box: { left: 0.1, top: 6.05, width: 25.29 } },
        { image: 'area1_cloud_2', box: { left: 68.36, top: 5.4, width: 31.54 } },
      ],
    },
    skyTop: '#50a8fc',
    cardsAt: 0.69,
    focusY: 0.42,
    hero: { x: 57.6, y: 62.8, h: 21 },
    sit: { x: 57.6, y: 62.6, h: 21.2 },
    dog: { x: 46, y: 64, h: 7.5 },
    life: 'casa',
    intro: 'Acá voy a hacer mi rancho. ¡Con tu ayuda, en tres días está!',
    obras: [
      {
        id: 'casa',
        name: 'La casa',
        the: 'la casa',
        emoji: '🏠',
        steps: ['Paredes', 'Techo', 'Galería', 'Puerta'],
        piece: { cut: 'area1_obra_casa', box: { left: 0.1, top: 14.32, width: 99.8 } },
        done: '¡Ya tengo casa! Gracias a vos.',
      },
      {
        id: 'fogon',
        name: 'El fogón',
        the: 'el fogón',
        emoji: '🔥',
        steps: ['Piedras', 'Leña', 'Pava', 'Troncos'],
        piece: { cut: 'area1_obra_fogon', box: { left: 1.27, top: 50.98, width: 45.9 } },
        done: 'Ahora tenemos dónde tomar unos mates juntos.',
      },
      {
        id: 'aljibe',
        name: 'El aljibe',
        the: 'el aljibe',
        emoji: '🪣',
        steps: ['Piedras', 'Pozo', 'Roldana', 'Balde'],
        piece: { cut: 'area1_obra_aljibe', box: { left: 69.63, top: 44.79, width: 30.27 } },
        done: 'Agua fresquita para el mate, todos los días.',
      },
    ],
  },
  {
    id: 'chacra',
    name: 'La chacra',
    base: 'area2_0',
    aspect: 1,
    skyTop: '#62a8f0',
    cardsAt: 0.95,
    focusY: 0.6,
    hero: { x: 60, y: 84, h: HERO_H },
    dog: { x: 44, y: 85, h: 11.3 },
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
    aspect: 1,
    skyTop: '#7aa6dc',
    cardsAt: 0.95,
    focusY: 0.6,
    hero: { x: 30, y: 84, h: HERO_H },
    dog: { x: 16, y: 85, h: 11.3 },
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
