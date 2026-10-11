// Friendship with Paucho grows with the days you come back (any day with at least one
// habit), and never goes down; the streak counts those days in a row, Finch-style.

export const LEVELS = [
  { name: 'Conocidos', days: 1 },
  { name: 'Compañeros', days: 3 },
  { name: 'Amigos', days: 7 },
  { name: 'Compadres', days: 14 },
  { name: 'Amigos del alma', days: 30 },
]

type Completions = Record<string, string[]>

/** Days with at least one habit done. */
export const daysTogether = (c: Completions) => Object.values(c).filter((ids) => ids.length > 0).length

export function friendship(days: number) {
  let i = 0
  while (i + 1 < LEVELS.length && days >= LEVELS[i + 1].days) i++
  const next = LEVELS[i + 1] ?? null
  return { level: LEVELS[i], index: i, next, toNext: next ? next.days - days : 0 }
}

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Days in a row with a habit, up to `today` (today still counts as kept until it ends). */
export function streak(c: Completions, today: string) {
  const has = (k: string) => (c[k] ?? []).length > 0
  const d = new Date(`${today}T12:00:00`)
  if (!has(today)) d.setDate(d.getDate() - 1)
  let n = 0
  while (has(dayKey(d))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

/** The longest run of days in a row so far. */
export function bestStreak(c: Completions) {
  const days = Object.keys(c)
    .filter((k) => c[k].length > 0)
    .sort()
  let best = 0
  let run = 0
  let prev: Date | null = null
  for (const k of days) {
    const d = new Date(`${k}T12:00:00`)
    run = prev && Math.round((d.getTime() - prev.getTime()) / 86_400_000) === 1 ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return best
}
