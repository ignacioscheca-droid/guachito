// The idle exploration's own save, apart from the app's (guachito.v1) on the same site.
import { useSyncExternalStore } from 'react'
import { FIXES, HUERTA, IDLE_HABITS, STARS_PER_HABIT } from './content'

const KEY = 'gauchito-idle.v1'

export type IdleState = {
  version: 1
  stars: number
  coins: number
  /** Habit ids done per local day (YYYY-MM-DD). */
  completions: Record<string, string[]>
  fixed: string[]
  /** When the garden last got collected (or planted); null until it is. */
  huertaSince: number | null
  /** Debug: days and hours added to the clock by the test menu. */
  dayOffset: number
  hourOffset: number
}

const initial = (): IdleState => ({
  version: 1,
  stars: 0,
  coins: 0,
  completions: {},
  fixed: [],
  huertaSince: null,
  dayOffset: 0,
  hourOffset: 0,
})

function load(): IdleState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initial(), ...JSON.parse(raw) }
  } catch {
    /* private mode or corrupted data: start fresh */
  }
  return initial()
}

let state = load()
const listeners = new Set<() => void>()

function set(next: IdleState) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* keep playing in memory */
  }
  listeners.forEach((l) => l())
}

export function useIdle<T>(select: (s: IdleState) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => select(state),
  )
}

export const now = (s: IdleState = state) => Date.now() + s.hourOffset * 3_600_000 + s.dayOffset * 86_400_000

export function dayKey(s: IdleState = state) {
  const d = new Date(now(s))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const doneToday = (s: IdleState) => s.completions[dayKey(s)] ?? []

/** The next repairs still to do, in order. */
export const nextFixes = (s: IdleState) => FIXES.filter((f) => !s.fixed.includes(f.id))

/** Coins waiting in the garden. */
export function huertaCoins(s: IdleState) {
  if (s.huertaSince == null) return 0
  const hours = Math.min(HUERTA.capHours, (now(s) - s.huertaSince) / 3_600_000)
  return Math.floor(hours * HUERTA.perHour)
}

export const idle = {
  completeHabit(id: string): boolean {
    const day = dayKey()
    const done = state.completions[day] ?? []
    if (done.includes(id) || !IDLE_HABITS.some((h) => h.id === id)) return false
    set({ ...state, stars: state.stars + STARS_PER_HABIT, completions: { ...state.completions, [day]: [...done, id] } })
    return true
  },
  uncompleteHabit(id: string) {
    const day = dayKey()
    const done = state.completions[day] ?? []
    if (!done.includes(id) || state.stars < STARS_PER_HABIT) return
    set({ ...state, stars: state.stars - STARS_PER_HABIT, completions: { ...state.completions, [day]: done.filter((h) => h !== id) } })
  },
  /** Pays for a repair and marks it done; false if it can't be afforded or isn't next in line. */
  fix(id: string): boolean {
    const f = FIXES.find((x) => x.id === id)
    if (!f || state.fixed.includes(id) || state.stars < f.stars || state.coins < f.coins) return false
    set({
      ...state,
      stars: state.stars - f.stars,
      coins: state.coins - f.coins,
      fixed: [...state.fixed, id],
      huertaSince: id === 'huerta' ? now() : state.huertaSince,
    })
    return true
  },
  collectHuerta(): number {
    const got = huertaCoins(state)
    if (got <= 0) return 0
    set({ ...state, coins: state.coins + got, huertaSince: now() })
    return got
  },
  // ---- test menu ----
  debugNextDay() {
    set({ ...state, dayOffset: state.dayOffset + 1 })
  },
  debugHour() {
    set({ ...state, hourOffset: state.hourOffset + 1 })
  },
  debugStars() {
    set({ ...state, stars: state.stars + 5 })
  },
  debugReset() {
    set(initial())
  },
}
