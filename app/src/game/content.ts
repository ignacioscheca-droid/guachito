// All MVP content lives here: habits, ranch items and the single adventure.
// Copy is Rioplatense Spanish (voseo), matching the mockups.

export const art = (name: string) => `${import.meta.env.BASE_URL}a/${name}.webp`

export type HabitDef = {
  id: string
  name: string
  /** Artist icon (art name) for catalog habits... */
  icon?: string
  /** ...or an emoji for habits the player creates. */
  emoji?: string
}

export const HABITS: HabitDef[] = [
  { id: 'agua', name: 'Tomar 8 vasos de agua', icon: 'habit_agua' },
  { id: 'ejercicio', name: 'Hacer 20 min de ejercicio', icon: 'habit_ejercicio' },
  { id: 'fruta', name: 'Comer una fruta', icon: 'habit_fruta' },
  { id: 'dormir', name: 'Acostarme antes de las 23:30', icon: 'habit_dormir' },
  { id: 'meditar', name: 'Meditar 5 minutos', icon: 'habit_meditar' },
  { id: 'foco', name: 'Una hora de trabajo sin distracciones', icon: 'habit_foco' },
  { id: 'leer', name: 'Leer 10 páginas', icon: 'habit_leer' },
  { id: 'mate', name: 'Un mate tranqui, sin pantallas', icon: 'habit_mate' },
  { id: 'plantas', name: 'Regar las plantas', icon: 'habit_plantas' },
  { id: 'sol', name: 'Salir al sol 10 minutos', icon: 'habit_sol' },
  { id: 'cocinar', name: 'Cocinar algo casero', icon: 'habit_cocinar' },
  { id: 'pantallas', name: 'Apagar pantallas a las 23', icon: 'habit_pantallas' },
]

/** Emojis offered when creating your own habit. */
export const HABIT_EMOJIS = ['🧸', '🤗', '❤️', '🏋️', '🏃', '🚴', '🧘', '📚', '💧', '🍎', '😴', '🎸', '🌱', '☀️', '🍳', '📵', '🐶', '🎨', '✍️', '📞']

export const HABITS_TO_PICK = 3
export const MAX_HABITS = 5
export const ENERGY_GOAL = 100
/** Daily pace: the adventure takes two real hours. */
export const ADVENTURE_MS = 2 * 60 * 60 * 1000
export const ADVENTURE_COINS = 50

/** Energy each habit gives: completing all of today's habits fills the bar exactly. */
export function energyShare(habitIds: string[], id: string) {
  const n = habitIds.length
  const i = habitIds.indexOf(id)
  if (n === 0 || i < 0) return 0
  return Math.floor(ENERGY_GOAL / n) + (i < ENERGY_GOAL % n ? 1 : 0)
}

/**
 * Where an item stands on the patio, in % of the square patio image (1254 px):
 * x = centre, y = where it touches the ground (or hangs), h = height, w = width
 * (only for things that must be squashed, like the rug), z = draw order override
 * (default: lower on screen = in front).
 */
export type Spot = { x: number; y: number; h: number; w?: number; z?: number }

export type ItemDef = {
  id: string
  name: string
  price: number
  image: string
  spot: Spot
  /** Item it rests on (the lantern on the table...). Until it is owned, `alt` is used. */
  needs?: string
  alt?: Spot
}

export const ITEMS: ItemDef[] = [
  { id: 'herradura', name: 'Herradura de la suerte', price: 50, image: 'item_herradura', spot: { x: 94.5, y: 46.7, h: 5.4, z: 1 } },
  { id: 'planta', name: 'Planta nativa', price: 50, image: 'item_planta', spot: { x: 82.5, y: 67.6, h: 14.9 } },
  { id: 'farol', name: 'Farol de campo', price: 50, image: 'item_farol', spot: { x: 45.4, y: 64.5, h: 6.8, z: 75 }, needs: 'mesa', alt: { x: 64, y: 65.8, h: 6.8 } },
  { id: 'mesa', name: 'Mesa de algarrobo', price: 60, image: 'item_mesa', spot: { x: 48.7, y: 73.5, h: 12.5 } },
  { id: 'silla', name: 'Silla de campo', price: 60, image: 'item_silla', spot: { x: 36.3, y: 71.1, h: 13.1 } },
  { id: 'alfombra', name: 'Matra pampa', price: 70, image: 'item_alfombra', spot: { x: 56, y: 81.7, h: 14.4, w: 58.8, z: 60 } },
  { id: 'barril', name: 'Barril', price: 80, image: 'item_barril', spot: { x: 61.5, y: 66.7, h: 10.8 } },
  { id: 'guitarra', name: 'Guitarra criolla', price: 100, image: 'item_guitarra', spot: { x: 72.8, y: 74.6, h: 16.5 }, needs: 'sillon', alt: { x: 54.5, y: 66, h: 15 } },
  { id: 'fogon', name: 'Fogón', price: 90, image: 'item_fogon', spot: { x: 27, y: 87, h: 14.4 } },
  { id: 'sillon', name: 'Sillón del patio', price: 120, image: 'item_sillon', spot: { x: 68.6, y: 71.8, h: 15.2 } },
]

export const itemById = (id: string) => ITEMS.find((i) => i.id === id)!

/** The one MVP adventure region. Each day's run is one episode, in order. */
export const ADVENTURE = { name: 'Las Pampas' }

export type Episode = {
  title: string
  /** Shown one after another while Guachito is out. */
  beats: [string, string, string]
  story: string
  image: string
  itemId: string
  replies: { label: string; answer: string }[]
}

// A week of adventures. Each brings back one ranch item; table, chair and
// armchair are left for the shop (50 coins per adventure pays for them by day 5).
export const EPISODES: Episode[] = [
  {
    title: 'El caballo salvaje',
    beats: ['Ensilló el caballo y salió al galope…', 'Algo lo sigue entre los pastos…', '¡Pegó la vuelta con algo en la mochila!'],
    story:
      'Hoy conocí un caballo que no paraba de perseguirme por el campo. Al principio me asusté, pero terminamos galopando juntos hasta el atardecer. Y mirá lo que encontré en el camino…',
    image: 'story_1',
    itemId: 'herradura',
    replies: [
      { label: '¡Qué aventura!', answer: '¡Ni te imaginás! Todavía me tiemblan las piernas.' },
      { label: '¿Y qué pasó después?', answer: 'Se quedó pastando cerca del arroyo. Creo que vamos a ser amigos.' },
      { label: 'La próxima llevá comida.', answer: 'Jaja, tenés razón. ¡La próxima llevo pan casero!' },
    ],
  },
  {
    title: 'El payador del arroyo',
    beats: ['Siguió el arroyo río arriba…', 'De un puesto viejo sale música…', 'Vuelve silbando una chacarera…'],
    story:
      'Seguí el arroyo hasta un puesto abandonado. Adentro había un viejo payador que me enseñó una chacarera. Antes de irme, me regaló algo para el rancho…',
    image: 'story_2',
    itemId: 'guitarra',
    replies: [
      { label: '¡Tocá algo!', answer: 'Dame unos días que practico… ¡y te hago un concierto!' },
      { label: '¿Quién era el payador?', answer: 'Dijo llamarse Don Ramón. Hablaba en rimas todo el tiempo.' },
      { label: 'Qué lindo regalo.', answer: '¡Sí! Va a quedar hermosa en el patio.' },
    ],
  },
  {
    title: 'Noche de estrellas',
    beats: ['Salió tarde, con el sol bajando…', 'Lo agarró la noche en plena pampa…', 'Vuelve oliendo a leña…'],
    story:
      'Me agarró la noche en medio de la pampa. Prendí un fueguito, miré las estrellas y el perro se durmió en mi falda. Volví con ganas de armar un fogón en casa…',
    image: 'story_3',
    itemId: 'fogon',
    replies: [
      { label: '¿No tuviste frío?', answer: 'Un poco, ¡pero el poncho hace milagros!' },
      { label: '¡Hagamos un asado!', answer: '¡Eso! Vos traé las ganas, yo pongo el fuego.' },
      { label: 'Qué noche linda.', answer: 'Había tantas estrellas que perdí la cuenta.' },
    ],
  },
  {
    title: 'Atardecer en la loma',
    beats: ['Va camino a la loma más alta…', 'Llegó justo para el atardecer…', 'Baja con una lucecita en la mano…'],
    story:
      'Subí a la loma más alta para ver el atardecer y me quedé hasta que salió la luna. Para bajar no se veía nada, así que un puestero me prestó su farol… ¡y me dijo que me lo quedara!',
    image: 'story_4',
    itemId: 'farol',
    replies: [
      { label: '¿Qué se veía desde arriba?', answer: 'Toda la pampa pintada de naranja. Hasta el rancho se veía chiquitito.' },
      { label: 'Qué buena gente.', answer: '¿Viste? En el campo siempre hay alguien que te da una mano.' },
      { label: 'No vuelvas tan tarde.', answer: 'Prometido. Bueno… casi prometido.' },
    ],
  },
  {
    title: 'La estancia vecina',
    beats: ['Fue a visitar a Doña Rosa…', 'Entre telares y mates…', 'Vuelve con un paquete enorme…'],
    story:
      'Fui a la estancia de Doña Rosa, que teje las matras más lindas de la zona. Me enseñó a usar el telar y, de tanto que me reí con mis nudos, me regaló una para el patio.',
    image: 'story_5',
    itemId: 'alfombra',
    replies: [
      { label: '¿Aprendiste a tejer?', answer: 'Un poquito. Me salió una matra chiquita… para el perro.' },
      { label: '¡Qué colores!', answer: 'Los tiñe con plantas del campo. ¡Hasta el rojo sale de una raíz!' },
      { label: 'Saludala de mi parte.', answer: 'Le voy a llevar unos alfajores la próxima.' },
    ],
  },
  {
    title: 'La pulpería del camino',
    beats: ['Tomó el camino real…', 'Para a matear en una pulpería…', 'Vuelve empujando algo redondo…'],
    story:
      'Paré en una pulpería a tomar unos mates. El pulpero estaba renovando todo y me regaló un barril de roble que ya no usaba. ¡Lo traje rodando hasta casa!',
    image: 'story_6',
    itemId: 'barril',
    replies: [
      { label: '¿Rodando todo el camino?', answer: 'Todo. El perro me ayudó… bueno, me miró ayudar.' },
      { label: '¿Qué hay adentro?', answer: 'Nada todavía. ¡Pero ya se me va a ocurrir algo!' },
      { label: 'Contame de la pulpería.', answer: 'Tenía de todo: yerba, alpargatas, caramelos y un loro que hablaba.' },
    ],
  },
  {
    title: 'El mapa del tesoro',
    beats: ['Encontró un mapa en una tranquera…', 'Siguen las pistas con el perro…', '¡Encontraron el tesoro!'],
    story:
      'En una tranquera vieja había un mapa escondido. Seguimos las pistas con el perro durante toda la tarde y el tesoro era… una planta nativa que solo crece junto al arroyo. ¡La traje para el patio!',
    image: 'story_7',
    itemId: 'planta',
    replies: [
      { label: '¡Un tesoro de verdad!', answer: 'El mejor: va a crecer con nosotros.' },
      { label: '¿Quién dejó el mapa?', answer: 'No sé… pero tenía dibujado un sombrero igual al mío.' },
      { label: 'Qué semana, Guachito.', answer: '¡Gracias a vos! Cada hábito tuyo fue un paso de esta aventura.' },
    ],
  },
]
