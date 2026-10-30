import type { AboutYou } from '../game/aboutYou'
import { setClock } from '../game/clock'
import { dayKey } from '../game/friendship'
import { actions, getState, todayKey, type GameState } from '../game/store'

const pad = (n: number) => String(n).padStart(2, '0')

/** Local time (TZ is pinned to Madrid by `npm test`) on a YYYY-MM-DD day, in ms. */
export const timeOf = (day: string, hour = 9, min = 0) => new Date(`${day}T${pad(hour)}:${pad(min)}:00`).getTime()
/** Moves the game's clock to a local day and hour. */
export const setTime = (day: string, hour = 9, min = 0) => setClock(timeOf(day, hour, min))
export const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T12:00:00`)
  d.setDate(d.getDate() + n)
  return dayKey(d)
}

export const HOUR = 3_600_000
export const DAY0 = '2026-03-02'
/** A full week of daily habits (MAX_HABITS), the first one being the onboarding's gift. */
export const HABIT_IDS = ['levantarme', 'agua', 'leer', 'ejercicio', 'meditar', 'fruta', 'sol']

/** A new game, onboarded on `day` at `hour` with its first habit (the gift) already ticked. */
export function newGame({ day = DAY0, hour = 9, habits = HABIT_IDS, goal = 7 } = {}) {
  setTime(day, hour)
  actions.debugReset()
  actions.finishOnboarding({ name: 'Paucho', playerName: 'Test', habits, aboutYou: {} as AboutYou, streakGoal: goal })
}

/** Overwrites part of the save, going through the same door as a backup import. */
export function patch(p: Partial<GameState>) {
  if (!actions.importData(JSON.stringify({ ...getState(), ...p }))) throw new Error('patch: import refused')
}

/** Ticks `n` habits that are still open today. */
export function tick(n: number) {
  const s = getState()
  const done = s.completions[todayKey(s)] ?? []
  for (const id of s.habits.filter((h) => !done.includes(h)).slice(0, n)) actions.completeHabit(id)
}
