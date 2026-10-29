// "Contame un poco de vos": the onboarding questionnaire, cut down to what the plan uses.
// The answers stay on the phone; the personalized plan is built from them.
import { FIRST_HABIT_GIFT } from './content'

/** Question id -> chosen option ids (one for single choice). */
export type AboutYou = Record<string, string[]>

export type Option = {
  id: string
  label: string
  emoji?: string
  /** Small second line, e.g. what an acronym means. */
  hint?: string
  /** "None of these": picking it clears the rest, and the other way round. */
  none?: boolean
}

export type Question = {
  id: string
  /** Index in SECTIONS. */
  section: number
  title: (you: string) => string
  subtitle?: string
  /** Several answers, with a "Siguiente" button; otherwise a tap answers and moves on. */
  multi?: boolean
  options: Option[]
  skip?: (answers: AboutYou) => boolean
}

export const SECTIONS = ['En qué te ayudo', 'Cómo viene tu día']

const you = (name: string) => (name ? `, ${name}` : '')

// Only what the plan uses (buildPlan): four questions, wellness wording, nothing about symptoms.
export const QUESTIONS: Question[] = [
  {
    id: 'areas',
    section: 0,
    title: (name) => `¿Qué te trae por acá${you(name)}?`,
    subtitle: 'Elegí todo lo que quieras.',
    multi: true,
    options: [
      { id: 'familia', emoji: '🏡', label: 'Pasar más tiempo con los míos' },
      { id: 'vinculos', emoji: '🤝', label: 'Conectar más con la gente' },
      { id: 'foco', emoji: '🎯', label: 'Ganar foco y productividad' },
      { id: 'rutina', emoji: '🌱', label: 'Armar y sostener una rutina' },
      { id: 'dormir', emoji: '😴', label: 'Dormir mejor' },
      { id: 'cuerpo', emoji: '💪', label: 'Moverme más y cuidar el cuerpo' },
      { id: 'calma', emoji: '🍃', label: 'Quiero sentirme más tranquilo/a' },
      { id: 'confianza', emoji: '🌻', label: 'Quererme y confiar más en mí' },
    ],
  },
  {
    id: 'sueno',
    section: 1,
    title: () => '¿Cuántas horas solés dormir por noche?',
    options: [
      { id: 'menos-5', emoji: '😴', label: 'Menos de 5 horas' },
      { id: '5-7', emoji: '🛏️', label: 'Entre 5 y 7 horas' },
      { id: '7-9', emoji: '🌙', label: 'Entre 7 y 9 horas' },
      { id: 'mas-9', emoji: '🌞', label: 'Más de 9 horas' },
    ],
  },
  {
    id: 'actividad',
    section: 1,
    title: () => '¿Cuánto te movés durante el día?',
    options: [
      { id: 'mucho', emoji: '🏃', label: 'Estoy en movimiento casi todo el día' },
      { id: 'mezcla', emoji: '🚶', label: 'Combino ratos sin moverme con algo de movimiento' },
      { id: 'poco', emoji: '🪑', label: 'Me muevo poco y quiero moverme más' },
    ],
  },
  {
    id: 'postergar',
    section: 1,
    title: () => '¿Qué cosas solés postergar?',
    subtitle: 'Elegí todas las que te pasen.',
    multi: true,
    options: [
      { id: 'decisiones', emoji: '🛤️', label: 'Decisiones importantes' },
      { id: 'mensajes', emoji: '💬', label: 'Responder mensajes' },
      { id: 'turnos', emoji: '📅', label: 'Sacar turnos' },
      { id: 'ejercicio', emoji: '👟', label: 'Hacer ejercicio' },
      { id: 'casa', emoji: '🧹', label: 'Las tareas de la casa' },
      { id: 'nada', emoji: '✨', label: 'Casi nada, ¡soy re puntual!', none: true },
    ],
  },
]

/** Finch's starter plan, in its order. */
const FINCH_PLAN = ['levantarme', 'dientes', 'cara', 'vaso-agua', 'estirarme', 'feliz', 'respirar']
/** At most this many goals come from the answers, so the plan stays mostly Finch's. */
const FROM_ANSWERS = 2
/** A picked habit makes its smaller twin redundant. */
const COVERS: Record<string, string[]> = {
  agua: ['vaso-agua'],
  ejercicio: ['caminar', 'estirarme'],
  meditar: ['respirar'],
  mate: ['los-mios'],
  pantallas: ['los-mios'],
}
/** «Quiero sentirme más tranquilo/a» adds two of these, in this order. */
const CALM = ['respirar', 'mate', 'estirarme']
export const CALM_NOTE = 'Para sentirte con más calma'

/** The calm habits the plan adds, if that goal was chosen. */
export function calmPicks(picked: string[], a: AboutYou): string[] {
  if (!(a.areas ?? []).includes('calma')) return []
  const skip = new Set(picked.flatMap((id) => COVERS[id] ?? []))
  return CALM.filter((id) => !skip.has(id)).slice(0, 2)
}

/**
 * The starter plan: the first goal, which is a gift (FIRST_HABIT_GIFT: it comes already
 * done), the habits you picked, the calm ones, goals your answers point to, then Finch's,
 * up to PLAN_SIZE in all.
 */
export function buildPlan(picked: string[], a: AboutYou, size: number): string[] {
  const has = (q: string, ...ids: string[]) => (a[q] ?? []).some((id) => ids.includes(id))
  const fromAnswers = [
    has('areas', 'familia') && 'los-mios',
    has('areas', 'dormir') && 'dormir',
    has('areas', 'cuerpo') && 'caminar',
    has('areas', 'vinculos') && 'escribirle',
    has('areas', 'confianza') && 'algo-bien',
    has('areas', 'rutina') && 'tender-cama',
    has('sueno', 'menos-5', '5-7') && 'dormir',
    has('actividad', 'poco') && 'caminar',
    has('postergar', 'mensajes') && 'mensaje',
    has('postergar', 'decisiones', 'turnos', 'ejercicio', 'casa') && 'pendiente',
  ].filter((id): id is string => !!id)

  const skip = new Set(picked.flatMap((id) => COVERS[id] ?? []))
  const plan: string[] = []
  const add = (id: string) => {
    if (plan.length < size && !plan.includes(id) && !skip.has(id)) plan.push(id)
  }
  add(FIRST_HABIT_GIFT)
  picked.forEach(add)
  calmPicks(picked, a).forEach(add)
  fromAnswers.filter((id) => !plan.includes(id) && !skip.has(id)).slice(0, FROM_ANSWERS).forEach(add)
  FINCH_PLAN.forEach(add)
  return plan
}
