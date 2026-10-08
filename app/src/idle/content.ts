// Gauchito Idle (exploration, branch idle-tycoon): Paucho restores a ruined ranch.
// Habits give stars, stars (and later coins) pay for repairs, the vegetable garden
// keeps producing coins while you are away. Like Gardenscapes' restoration, idle-style.
import { STARTER_GOALS, type HabitDef } from '../game/content'

/** The day's habits, preset: the starter plan's seven easy goals (Finch's). */
export const IDLE_HABITS: HabitDef[] = ['levantarme', 'dientes', 'cara', 'vaso-agua', 'estirarme', 'feliz', 'respirar'].map(
  (id) => STARTER_GOALS.find((g) => g.id === id)!,
)
export const STARS_PER_HABIT = 1

/** A spot on the square patio image, in % of its side (like the ranch items). */
export type Spot = { x: number; y: number }

export type Fix = {
  id: string
  name: string
  emoji: string
  stars: number
  coins: number
  /** Where on the patio it is (the marker, the dust while Paucho works). */
  spot: Spot
  /** What Paucho says when it's done. */
  line: string
}

/**
 * The repairs, in order. Day 0 gives 7 stars: the first five (1+1+1+2+2) end with the
 * garden planted, so Paucho has coins growing for the next day's repairs.
 */
export const FIXES: Fix[] = [
  { id: 'yuyos', name: 'Sacar los yuyos del patio', emoji: '🌾', stars: 1, coins: 0, spot: { x: 55, y: 80 }, line: '¡Ahora sí se ve el patio!' },
  { id: 'cerca', name: 'Levantar la cerca', emoji: '🪵', stars: 1, coins: 0, spot: { x: 36, y: 50 }, line: '¡La cerca quedó derechita!' },
  { id: 'puerta', name: 'Arreglar la puerta', emoji: '🚪', stars: 1, coins: 0, spot: { x: 95, y: 50 }, line: '¡Ya cierra la puerta! Esta noche dormimos tranquilos.' },
  { id: 'techo', name: 'Ponerle techo nuevo', emoji: '🏠', stars: 2, coins: 0, spot: { x: 84, y: 24 }, line: '¡Se acabaron las goteras!' },
  { id: 'huerta', name: 'Plantar la huerta', emoji: '🥕', stars: 2, coins: 0, spot: { x: 68, y: 84 }, line: '¡Plantamos la huerta! Lo que dé lo vendemos en el pueblo.' },
  { id: 'ventana', name: 'Ponerle vidrios a la ventana', emoji: '🪟', stars: 1, coins: 20, spot: { x: 77.5, y: 45 }, line: '¡Entra luz a la casa!' },
  { id: 'paredes', name: 'Pintar las paredes', emoji: '🖌️', stars: 2, coins: 40, spot: { x: 82, y: 58 }, line: '¡Quedó blanquita como antes!' },
  { id: 'aljibe', name: 'Arreglar el aljibe', emoji: '🪣', stars: 2, coins: 60, spot: { x: 46, y: 68 }, line: '¡Agua fresquita en el patio!' },
  { id: 'galeria', name: 'Armar la galería', emoji: '🪑', stars: 3, coins: 100, spot: { x: 62, y: 30 }, line: '¡Ahora tenemos sombra para el mate!' },
]

/** The garden: coins per hour once planted, and how many hours it holds before it stops. */
export const HUERTA = { perHour: 12, capHours: 8, spot: { x: 68, y: 84 } as Spot }

/** Weeds on the patio floor until "Sacar los yuyos" (placeholders until the ruin art). */
export const WEEDS: (Spot & { s: number })[] = [
  { x: 30, y: 78, s: 1 },
  { x: 44, y: 88, s: 1.2 },
  { x: 58, y: 74, s: 0.9 },
  { x: 72, y: 92, s: 1.1 },
  { x: 86, y: 78, s: 1 },
  { x: 12, y: 90, s: 1.2 },
  { x: 92, y: 66, s: 0.8 },
]
