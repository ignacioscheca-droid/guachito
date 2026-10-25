// Habits and art helpers. The areas, obras and the trip live in journey.ts; the shop in shop.ts.
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

/**
 * Small self-care goals for the starter plan (onboarding): Finch's seven, plus a few
 * the plan picks from "Contame un poco de vos" (see buildPlan in aboutYou.ts).
 */
export const STARTER_GOALS: HabitDef[] = [
  { id: 'levantarme', name: 'Levantarme de la cama', emoji: '🌻' },
  { id: 'dientes', name: 'Lavarme los dientes', emoji: '🪥' },
  { id: 'cara', name: 'Lavarme la cara', emoji: '🧼' },
  { id: 'vaso-agua', name: 'Tomar un vaso de agua', emoji: '💧' },
  { id: 'estirarme', name: 'Estirarme un rato', emoji: '🦒' },
  { id: 'feliz', name: 'Hacer algo que me haga feliz', emoji: '😊' },
  { id: 'respirar', name: 'Respirar hondo 3 veces', emoji: '🍃' },
  { id: 'los-mios', name: 'Un rato sin pantallas con los míos', emoji: '🏡' },
  { id: 'escribirle', name: 'Escribirle a alguien que quiero', emoji: '💌' },
  { id: 'algo-bien', name: 'Anotar algo que hice bien', emoji: '✍️' },
  { id: 'tender-cama', name: 'Tender la cama', emoji: '🛏️' },
  { id: 'caminar', name: 'Salir a caminar 10 minutos', emoji: '🚶' },
  { id: 'mensaje', name: 'Responder un mensaje pendiente', emoji: '💬' },
  { id: 'pendiente', name: 'Hacer una cosa que vengo postergando', emoji: '✅' },
]

/** Emojis offered when creating your own habit. */
export const HABIT_EMOJIS = ['🧸', '🤗', '❤️', '🏋️', '🏃', '🚴', '🧘', '📚', '💧', '🍎', '😴', '🎸', '🌱', '☀️', '🍳', '📵', '🐶', '🎨', '✍️', '📞']

/** Ideas when adding a habit of your own (like Finch's suggestions): five themes, five each. */
export const HABIT_SUGGESTIONS: { id: string; name: string; items: [string, string][] }[] = [
  {
    id: 'faciles',
    name: 'Victorias fáciles',
    items: [
      ['🛏️', 'Tender la cama'],
      ['💧', 'Tomar un vaso de agua'],
      ['🪥', 'Lavarme los dientes'],
      ['👕', 'Cambiarme de ropa'],
      ['🧼', 'Lavarme la cara'],
    ],
  },
  {
    id: 'gratitud',
    name: 'Gratitud',
    items: [
      ['🙏', 'Anotar 3 cosas que agradezco'],
      ['💌', 'Agradecerle a alguien'],
      ['🌅', 'Mirar el atardecer'],
      ['📸', 'Sacarle una foto a algo lindo'],
      ['✍️', 'Anotar algo que me salió bien'],
    ],
  },
  {
    id: 'calma',
    name: 'Calma',
    items: [
      ['🌬️', 'Respirar hondo 3 veces'],
      ['🧘', 'Meditar 5 minutos'],
      ['🧉', 'Un mate sin pantallas'],
      ['🎶', 'Escuchar una canción tranqui'],
      ['🚿', 'Una ducha sin apuro'],
    ],
  },
  {
    id: 'conexion',
    name: 'Conexión',
    items: [
      ['📞', 'Llamar a alguien que quiero'],
      ['🤗', 'Dar un abrazo'],
      ['💬', 'Responder un mensaje pendiente'],
      ['🍽️', 'Comer en familia'],
      ['🐶', 'Jugar con mi mascota'],
    ],
  },
  {
    id: 'movimiento',
    name: 'Movimiento',
    items: [
      ['🚶', 'Caminar 10 minutos'],
      ['🦒', 'Estirarme un rato'],
      ['💃', 'Bailar una canción'],
      ['🪜', 'Subir por la escalera'],
      ['☀️', 'Salir al sol 10 minutos'],
    ],
  },
]

/** Habits you pick in onboarding, before the plan fills up the rest. */
export const HABITS_TO_PICK = 3
/** The starter plan has as many goals as Finch's. */
export const PLAN_SIZE = 7
export const MAX_HABITS = PLAN_SIZE
/**
 * Where something stands on a square scene, in % of its side: x = centre, y = where it
 * touches the ground (or hangs), h = height, w = width (only for things that must be
 * squashed, like a rug), z = draw order override (default: lower on screen = in front).
 */
export type Spot = { x: number; y: number; h: number; w?: number; z?: number }
