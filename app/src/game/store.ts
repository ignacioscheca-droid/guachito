import { useSyncExternalStore } from 'react'
import type { AboutYou } from './aboutYou'
import { now } from './clock'
import { FIRST_HABIT_GIFT, HABITS, STARTER_GOALS, type HabitDef } from './content'
import { dayKey, daysTogether, streak } from './friendship'
import {
  AREA_COINS,
  ENERGY_PER_HABIT,
  energyGoal,
  EXTRA_HABIT_COINS,
  FULL_ENERGY_COINS,
  JOURNEY,
  TRIP,
  TRIP_JOB,
  WORK_MS,
} from './journey'
import { friendDays, LEGACY_ROOM, priceOf, ROOM_SLOTS, roomOption, type RoomOption } from './room'
import { CLOTHES, clothesById, type Slot } from './shop'

/**
 * The day's work: the bar fills (charging), it is full (ready), Paucho builds or travels
 * for eight hours (working), the job is finished and waits to be seen (done).
 */
export type WorkStatus = 'charging' | 'ready' | 'working' | 'done'

/** Bottom bar: Áreas · Aventuras · Inicio · Paucho · Casita. Only Inicio is open on day 0. */
export type TabId = 'areas' | 'aventuras' | 'inicio' | 'paucho' | 'casita'

/** What ticking a habit gave: energy while the bar fills, herraduras once it is full. */
export type Completion = { energy: number; coins: number; full: boolean; firstTime: boolean; recalentado: number | null }

export type GameState = {
  version: 2
  onboarded: boolean
  name: string
  /** The player's own name (used in greetings). */
  playerName: string
  /** Onboarding questionnaire answers ("Contame un poco de vos"). */
  aboutYou: AboutYou | null
  /** Days in a row the player is going for (7, 14, 30…: `STREAK_GOALS`); reaching it is celebrated and the next one chosen. */
  streakGoal: number | null
  /** Termos in hand (up to TERMOS_MAX): each one keeps a missed day in the streak. */
  termos: number
  /** Missed days the streak keeps anyway: a termo covered them, or the mate was recalentado. */
  savedDays: Record<string, 'termo' | 'recalentado'>
  /** How the day began for the streak, worked out when it opens (`actions.openDay`). */
  dayStart: DayStart | null
  habits: string[]
  /** Habits the player created (name + emoji). */
  customHabits: HabitDef[]
  /** Habits added for one day only ("Solo hoy"), by local day. */
  extras: Record<string, string[]>
  /** Days the morning mate was cebado (the streak screen each new day). */
  mates: string[]
  /** Completed habit ids per local day (YYYY-MM-DD); a habit done several times a day is in it once per time. */
  completions: Record<string, string[]>
  /** How each habit is done: times a day, which days, the moment (no entry: once, every day, whenever). */
  habitPlans: Record<string, HabitPlan>
  /** Habits set aside for the day («Hoy no puedo»), by local day. */
  skips: Record<string, string[]>
  /** Energy each completion gave, per day (`gainKey`), so a mistaken tick can be undone. */
  energyGains: Record<string, Record<string, number>>
  /** Same for the herraduras a completion gave. */
  coinGains: Record<string, Record<string, number>>
  energy: number
  /** Herraduras, the game's currency. */
  coins: number
  /** The day the bar was last filled: one full bar a day (one obra a day, like Finch's adventure). */
  lastFullDay: string | null
  work: { status: WorkStatus; startedAt: number | null }
  /** Jobs of JOURNEY finished and seen (the next one is JOURNEY[jobsDone]). */
  jobsDone: number
  unlocked: TabId[]
  /** Tabs just unlocked whose welcome hasn't been shown yet. */
  unlockQueue: TabId[]
  /** Room options owned (ids from ROOM_SLOTS, like "cama_1"), and the one in each place. */
  room: string[]
  placed: Record<string, string>
  /** Gauchito Premium (for now only the test menu turns it on). */
  premium: boolean
  /** Clothes bought, and what he is wearing (no entry: his usual). */
  clothes: string[]
  outfit: Partial<Record<Slot, string>>
  /** The dog arrives with La cucha; the player names him. */
  dog: { arrived: boolean; name: string }
  /** Push subscription for the daily notifications (JSON), once they are on. */
  pushSubscription: string | null
  /** Paucho's own "¿Te aviso?" before the phone's: how many times and when it was last shown. */
  pushAsk: { times: number; last: string | null }
  /** Debug: whole days added to the clock by the test menu. */
  dayOffset: number
  /** Debug: jobs finish this many ms sooner. */
  workSkipMs: number
}

/** Times a day, days of the week (0 = Sunday) or times a week, and the moment of the day. */
export type HabitPlan = {
  times: number
  when: { kind: 'daily' } | { kind: 'days'; days: number[] } | { kind: 'week'; times: number }
  moment: Moment
}
export type Moment = 'morning' | 'any' | 'night'
export const MAX_TIMES = 10
export const DEFAULT_PLAN: HabitPlan = { times: 1, when: { kind: 'daily' }, moment: 'any' }

/**
 * What the morning found: missed days a termo covered, or a streak gone cold that today's
 * habits can still recalentar (`rescue.days` is what it was).
 */
export type DayStart = {
  day: string
  termo: string[]
  rescue: { missed: string[]; days: number; offered: boolean } | null
  /** Back after more days away than a rescue covers: Paucho welcomes you first (0 once he did). */
  away?: number
}

// Its own key, so this build never touches the save of the app on main ("guachito.v1").
const KEY = 'gauchito.v2'

const initial = (): GameState => ({
  version: 2,
  onboarded: false,
  name: 'Paucho',
  playerName: '',
  aboutYou: null,
  streakGoal: null,
  termos: 0,
  savedDays: {},
  dayStart: null,
  habits: [],
  customHabits: [],
  extras: {},
  mates: [],
  completions: {},
  habitPlans: {},
  skips: {},
  energyGains: {},
  coinGains: {},
  energy: 0,
  coins: 0,
  lastFullDay: null,
  work: { status: 'charging', startedAt: null },
  jobsDone: 0,
  unlocked: ['inicio'],
  unlockQueue: [],
  room: [],
  placed: {},
  premium: false,
  clothes: [],
  outfit: {},
  dog: { arrived: false, name: '' },
  pushSubscription: null,
  pushAsk: { times: 0, last: null },
  dayOffset: 0,
  workSkipMs: 0,
})

function parse(raw: string): GameState {
  const data = JSON.parse(raw)
  if (typeof data !== 'object' || data == null || data.version !== 2) throw new Error('not a Gauchito save')
  return migrateRoom({ ...initial(), ...data })
}

/** A save from before the room had places: the bed becomes the catre, the rest is refunded. */
function migrateRoom(s: GameState): GameState {
  if (!s.room.some((id) => id in LEGACY_ROOM || id === 'cama')) return s
  const refund = s.room.reduce((sum, id) => sum + (LEGACY_ROOM[id] ?? 0), 0)
  const bed = s.room.includes('cama')
  return {
    ...s,
    coins: s.coins + refund,
    room: bed ? ['cama_1'] : [],
    placed: bed ? { cama: 'cama_1' } : {},
  }
}

function load(): GameState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return parse(raw)
  } catch {
    /* private mode or corrupted data: start fresh */
  }
  return initial()
}

let state = load()
const listeners = new Set<() => void>()

function set(next: GameState) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full or blocked: keep playing in memory */
  }
  listeners.forEach((l) => l())
}

export function useGame<T>(select: (s: GameState) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => select(state),
  )
}

export const getState = () => state

/** Calls `l` after every state change (outside React). */
export function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

// ---- lookups ----------------------------------------------------------

export function findHabit(s: GameState, id: string): HabitDef {
  return (
    HABITS.find((h) => h.id === id) ??
    STARTER_GOALS.find((h) => h.id === id) ??
    s.customHabits.find((h) => h.id === id) ?? { id, name: id, emoji: '⭐' }
  )
}

export const goalOf = (s: GameState) => energyGoal(s.jobsDone)

/**
 * Paucho gathers energy whenever he isn't working: while charging, and also when a finished
 * job waits to be seen (the energy is then for the one after it). One full bar a day.
 */
export function chargeTarget(s: GameState, day = todayKey(s)): { goal: number } | null {
  if (s.lastFullDay === day) return null
  if (s.work.status === 'charging' && nextJob(s)) return { goal: goalOf(s) }
  if (s.work.status === 'done' && JOURNEY[s.jobsDone + 1]) return { goal: energyGoal(s.jobsDone + 1) }
  return null
}
/** The bar was already filled today: the next job waits for tomorrow's energy. */
export const restingToday = (s: GameState) => s.work.status === 'charging' && s.lastFullDay === todayKey(s)
export const nextJob = (s: GameState) => JOURNEY[s.jobsDone] ?? null
/** Clothes from the south are sold once Paucho is back from the trip. */
export const southOpen = (s: GameState) => s.jobsDone > TRIP_JOB

/**
 * Something in the casita's shop can be had now: a room option or clothes you don't own,
 * not locked, that the herraduras cover (or that is given, once its trip or friendship
 * came). It puts the red dot on the Casita tab.
 */
export function canBuySomething(s: GameState) {
  if (!s.unlocked.includes('casita')) return false
  const room = ROOM_SLOTS.flatMap((sl) => sl.options).some((o) => !s.room.includes(o.id) && !roomLock(s, o) && priceOf(o) <= s.coins)
  const clothes = CLOTHES.some((c) => !s.clothes.includes(c.id) && !(c.south && !southOpen(s)) && c.price <= s.coins)
  return room || clothes
}

/** Why a room option can't be had yet, or null when it can (bought or, if given, received). */
export function roomLock(s: GameState, o: RoomOption): 'premium' | 'south' | 'friend' | 'dog' | null {
  if (o.slot === 'plato' && !s.dog.arrived) return 'dog'
  if (o.source.kind === 'premium' && !s.premium) return 'premium'
  if (o.source.kind === 'south' && !southOpen(s)) return 'south'
  if (o.source.kind === 'friend' && daysTogether(s.completions) < friendDays(o.source.level)) return 'friend'
  return null
}

// ---- time -------------------------------------------------------------

export function todayKey(s: GameState = state) {
  const d = new Date(now() + s.dayOffset * 86_400_000)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** Every tick of the day, a habit done three times being in it three times. */
export const doneToday = (s: GameState) => s.completions[todayKey(s)] ?? []

export const planOf = (s: GameState, id: string): HabitPlan => s.habitPlans[id] ?? DEFAULT_PLAN
/** Times a habit was done on a day. */
export const timesDone = (s: GameState, id: string, day = todayKey(s)) => (s.completions[day] ?? []).filter((h) => h === id).length
/** Done all its times that day. */
export const finished = (s: GameState, id: string, day = todayKey(s)) => timesDone(s, id, day) >= planOf(s, id).times
/** Habits finished on a day (each once). */
export const finishedOn = (s: GameState, day: string) => [...new Set(s.completions[day] ?? [])].filter((id) => finished(s, id, day))

const weekday = (day: string) => new Date(`${day}T12:00:00`).getDay()
/** Days of the week `day` is in, Monday first, up to the day before it. */
function weekBefore(day: string) {
  const back = (weekday(day) + 6) % 7
  return Array.from({ length: back }, (_, i) => addDays(day, i - back))
}

/** Its day: every day, one of its days, or (so many times a week) until the week's are done. */
function dueOn(s: GameState, id: string, day: string) {
  const { when } = planOf(s, id)
  if (when.kind === 'days') return when.days.includes(weekday(day))
  if (when.kind === 'week') return weekBefore(day).filter((d) => finished(s, id, d)).length < when.times
  return true
}

/** Times a week-habit was done this week (today included), for "2 de 3 esta semana". */
export const weekCount = (s: GameState, id: string) => [...weekBefore(todayKey(s)), todayKey(s)].filter((d) => finished(s, id, d)).length

/** Today's habits: the everyday ones due today and the ones added for today only (set-aside ones too). */
export const habitsToday = (s: GameState) => {
  const day = todayKey(s)
  return [...s.habits.filter((id) => dueOn(s, id, day)), ...(s.extras[day] ?? []).filter((id) => !s.habits.includes(id))]
}
export const skippedToday = (s: GameState) => s.skips[todayKey(s)] ?? []

/** Where a tick's energy and herraduras are kept: the habit, then `id#2`, `id#3`… for its later times. */
const gainKey = (id: string, n: number) => (n === 0 ? id : `${id}#${n + 1}`)

/** Days kept for the streak: a habit done, the morning mate cebado, or a missed day saved. */
export function keptDays(s: GameState) {
  const kept: Record<string, string[]> = { ...s.completions }
  for (const d of s.mates) if (!kept[d]?.length) kept[d] = ['mate']
  for (const d in s.savedDays) if (!kept[d]?.length) kept[d] = [s.savedDays[d]]
  return kept
}

// ---- the streak's goals, termos and recalentar (Duolingo's, with mate) ----

/** The goal ladder: Paucho proposes the next one each time you reach yours. */
export const STREAK_GOALS = [7, 14, 30, 50, 100, 365]
/** Herraduras for reaching a goal (a termo comes with each). */
const GOAL_COINS: Record<number, number> = { 7: 50, 14: 100, 30: 150, 50: 200, 100: 300, 365: 500 }
export const goalCoins = (goal: number) => GOAL_COINS[goal] ?? 30
export const nextGoal = (goal: number) => STREAK_GOALS.find((g) => g > goal) ?? goal + 365
export const TERMOS_MAX = 2
export const TERMO_PRICE = 60
/** Habits that recalientan the mate on the day you come back. */
export const RESCUE_HABITS = 3
/** A longer gap can't be recalentado: the streak starts over. */
const RESCUE_MAX_GAP = 3

const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T12:00:00`)
  d.setDate(d.getDate() + n)
  return dayKey(d)
}

/** Whole days since the last kept one, before today (0 if none, or yesterday was kept). */
function daysAway(s: GameState, today: string) {
  const kept = keptDays(s)
  const last = Object.keys(kept)
    .filter((d) => d < today && kept[d].length)
    .sort()
    .pop()
  if (!last) return 0
  return Math.round((new Date(`${today}T12:00:00`).getTime() - new Date(`${last}T12:00:00`).getTime()) / 86_400_000) - 1
}

/** Missed days between the last kept one and today (oldest first); none if no streak was going. */
function missedDays(s: GameState, today: string): string[] {
  const kept = keptDays(s)
  const out: string[] = []
  for (let d = addDays(today, -1); out.length < 30; d = addDays(d, -1)) {
    if (kept[d]?.length) return out
    out.unshift(d)
  }
  return []
}

/** Days in a row kept, up to today. */
export const streakNow = (s: GameState) => streak(keptDays(s), todayKey(s))

/** A new day and its mate not cebado yet: the streak screen comes first. */
export const mateDue = (s: GameState) => s.onboarded && !s.mates.includes(todayKey(s))

export function workRemainingMs(s: GameState = state) {
  if (s.work.status !== 'working' || s.work.startedAt == null) return 0
  return Math.max(0, s.work.startedAt + WORK_MS - (now() + s.workSkipMs))
}

// ---- unlocks ----------------------------------------------------------

/** Opens tabs and queues their welcome (once each). */
function unlock(s: GameState, ...tabs: TabId[]): GameState {
  const fresh = tabs.filter((t) => !s.unlocked.includes(t))
  if (!fresh.length) return s
  return { ...s, unlocked: [...s.unlocked, ...fresh], unlockQueue: [...s.unlockQueue, ...fresh] }
}

/** The Paucho tab opens on the third day you come back: you are "compañeros" by then. */
export const PAUCHO_TAB_DAYS = 3

// ---- actions ----------------------------------------------------------

export const actions = {
  finishOnboarding(o: { name: string; playerName: string; habits: string[]; aboutYou: AboutYou; streakGoal: number }) {
    set({ ...state, ...o, onboarded: true, name: o.name.trim() || 'Paucho', playerName: o.playerName.trim(), mates: [todayKey()] })
    // the first habit is a gift: already done on day 1, so the bar starts with its energy
    if (o.habits.includes(FIRST_HABIT_GIFT)) actions.completeHabit(FIRST_HABIT_GIFT)
  },

  /**
   * A new day opens (before its mate): termos cover the days missed, if there are enough;
   * if not, and the gap is short, today's habits can recalentar the streak.
   */
  openDay() {
    const day = todayKey()
    if (state.dayStart?.day === day) return
    const missed = missedDays(state, day)
    let next: GameState = { ...state, dayStart: { day, termo: [], rescue: null } }
    if (missed.length && missed.length <= state.termos) {
      const savedDays = { ...state.savedDays }
      for (const d of missed) savedDays[d] = 'termo'
      next = { ...next, termos: state.termos - missed.length, savedDays, dayStart: { day, termo: missed, rescue: null } }
    } else if (missed.length && missed.length <= RESCUE_MAX_GAP) {
      const days = streak(keptDays(state), addDays(missed[0], -1))
      next = { ...next, dayStart: { day, termo: [], rescue: { missed, days, offered: false } } }
    } else {
      const away = daysAway(state, day)
      if (away > RESCUE_MAX_GAP) next = { ...next, dayStart: { day, termo: [], rescue: null, away } }
    }
    set(next)
  },

  /** Paucho welcomed you back. */
  welcomedBack() {
    if (state.dayStart?.away) set({ ...state, dayStart: { ...state.dayStart, away: 0 } })
  },

  /** Paucho offered to recalentar the mate: yes (do the habits today) or start over. */
  answerRescue(yes: boolean) {
    const ds = state.dayStart
    if (!ds?.rescue) return
    set({ ...state, dayStart: { ...ds, rescue: yes ? { ...ds.rescue, offered: true } : null } })
  },

  /** The goal reached: its herraduras and a termo, and the next goal (the player may pick another). */
  reachGoal() {
    const goal = state.streakGoal
    if (!goal) return
    set({ ...state, coins: state.coins + goalCoins(goal), termos: Math.min(TERMOS_MAX, state.termos + 1), streakGoal: nextGoal(goal) })
  },

  setStreakGoal(goal: number) {
    set({ ...state, streakGoal: goal })
  },

  buyTermo(): boolean {
    if (state.termos >= TERMOS_MAX || state.coins < TERMO_PRICE) return false
    set({ ...state, coins: state.coins - TERMO_PRICE, termos: state.termos + 1 })
    return true
  },

  /** Today's mate, from the streak screen: today counts for the streak. */
  cebarMate() {
    const day = todayKey()
    if (!state.mates.includes(day)) set({ ...state, mates: [...state.mates, day] })
  },

  /** Creates a habit of the player's own and returns its id. */
  addCustomHabit(name: string, emoji: string): string {
    const id = `c${now().toString(36)}`
    set({ ...state, customHabits: [...state.customHabits, { id, name: name.trim(), emoji }] })
    return id
  },

  /** A new habit of your own: for today only, or (`everyDay`) added to the daily ones. */
  addHabit(name: string, emoji: string, everyDay: boolean) {
    const id = `c${now().toString(36)}`
    const day = todayKey()
    const customHabits = [...state.customHabits, { id, name: name.trim(), emoji }]
    if (everyDay) set({ ...state, customHabits, habits: [...state.habits, id] })
    else set({ ...state, customHabits, extras: { ...state.extras, [day]: [...(state.extras[day] ?? []), id] } })
    return id
  },

  setHabits(habits: string[]) {
    set({ ...state, habits })
  },

  /** How a habit is done: times a day, its days, its moment. */
  setPlan(id: string, plan: HabitPlan) {
    const times = Math.max(1, Math.min(MAX_TIMES, plan.times))
    set({ ...state, habitPlans: { ...state.habitPlans, [id]: { ...plan, times } } })
  },

  /** Takes a habit off the list (and its plan); its past days stay. */
  removeHabit(id: string) {
    const day = todayKey()
    const { [id]: _, ...habitPlans } = state.habitPlans
    set({ ...state, habits: state.habits.filter((h) => h !== id), extras: { ...state.extras, [day]: (state.extras[day] ?? []).filter((h) => h !== id) }, habitPlans })
  },

  /** «Hoy no puedo»: the habit leaves today's list (no energy, the streak doesn't mind); `back` undoes it. */
  skipHabit(id: string, back = false) {
    const day = todayKey()
    const today = (state.skips[day] ?? []).filter((h) => h !== id)
    set({ ...state, skips: { ...state.skips, [day]: back ? today : [...today, id] } })
  },

  /**
   * Ticks a habit. While the bar fills it gives energy; the tick that fills it also gives
   * FULL_ENERGY_COINS; after that (or with no job left) habits give herraduras.
   */
  completeHabit(id: string): Completion {
    const day = todayKey()
    const done = state.completions[day] ?? []
    const n = timesDone(state, id, day)
    if (n >= Math.min(MAX_TIMES, planOf(state, id).times)) return { energy: 0, coins: 0, full: false, firstTime: false, recalentado: null }
    const firstTime = !Object.values(state.completions).some((ids) => ids.includes(id))
    const target = chargeTarget(state, day)
    const goal = target?.goal ?? goalOf(state)
    const charging = target != null
    const energy = charging ? Math.min(goal, state.energy + ENERGY_PER_HABIT) : state.energy
    const full = charging && energy >= goal
    const coins = full ? FULL_ENERGY_COINS : charging ? 0 : EXTRA_HABIT_COINS
    let next: GameState = {
      ...state,
      completions: { ...state.completions, [day]: [...done, id] },
      energyGains: { ...state.energyGains, [day]: { ...state.energyGains[day], [gainKey(id, n)]: energy - state.energy } },
      coinGains: { ...state.coinGains, [day]: { ...state.coinGains[day], [gainKey(id, n)]: coins } },
      energy,
      coins: state.coins + coins,
      lastFullDay: full ? day : state.lastFullDay,
      // (a finished job still waiting to be seen stays so: the full bar shows after it)
      work: full && state.work.status === 'charging' ? { status: 'ready', startedAt: null } : state.work,
    }
    if (done.length === 0 && daysTogether(next.completions) >= PAUCHO_TAB_DAYS) next = unlock(next, 'paucho')
    // the third habit of the day you came back recalienta the mate: the missed days count
    let recalentado: number | null = null
    const rescue = state.dayStart?.day === day ? state.dayStart.rescue : null
    if (rescue && done.length + 1 >= RESCUE_HABITS) {
      const savedDays = { ...next.savedDays }
      for (const d of rescue.missed) savedDays[d] = 'recalentado'
      next = { ...next, savedDays, dayStart: { ...state.dayStart!, rescue: null } }
      recalentado = streak(keptDays(next), day)
    }
    // (read before set(): afterwards `state` is already the new one)
    const gained = energy - state.energy
    set(next)
    return { energy: gained, coins, full, firstTime, recalentado }
  },

  /** Unticks a habit (its last time); its energy comes back out unless the job already started. */
  uncompleteHabit(id: string) {
    const day = todayKey()
    const done = state.completions[day] ?? []
    const n = timesDone(state, id, day)
    if (!n) return
    const key = gainKey(id, n - 1)
    const { [key]: gained = 0, ...gains } = state.energyGains[day] ?? {}
    const { [key]: coins = 0, ...coinGains } = state.coinGains[day] ?? {}
    const last = done.lastIndexOf(id)
    const unspent = state.work.status === 'charging' || state.work.status === 'ready' || state.work.status === 'done'
    const energy = unspent ? Math.max(0, state.energy - gained) : state.energy
    const unfilled = state.work.status === 'ready' && energy < goalOf(state)
    set({
      ...state,
      completions: { ...state.completions, [day]: done.filter((_, i) => i !== last) },
      energyGains: { ...state.energyGains, [day]: gains },
      coinGains: { ...state.coinGains, [day]: coinGains },
      energy,
      coins: Math.max(0, state.coins - coins),
      lastFullDay: unfilled && state.lastFullDay === day ? null : state.lastFullDay,
      work: unfilled ? { status: 'charging', startedAt: null } : state.work,
    })
  },

  /** Full bar → Paucho starts the next job (an obra or the trip). */
  startWork() {
    if (state.work.status !== 'ready') return
    set({ ...state, energy: 0, workSkipMs: 0, work: { status: 'working', startedAt: now() } })
  },

  /** The eight hours are up: the job waits to be seen. */
  finishWork() {
    if (state.work.status !== 'working') return
    set({ ...state, work: { status: 'done', startedAt: null } })
  },

  /**
   * Seen: the job counts, and what it opens opens. The casita opens the room (and its
   * shop), the first finished area opens Áreas, La cucha brings the dog, and the end of
   * El galpón opens Aventuras (he is off to the south next).
   */
  completeJob() {
    if (state.work.status !== 'done') return
    const job = JOURNEY[state.jobsDone]
    let next: GameState = { ...state, jobsDone: state.jobsDone + 1, work: { status: 'charging', startedAt: null } }
    if (job?.kind === 'build') {
      const lastOfArea = JOURNEY[state.jobsDone + 1]?.kind !== 'build' || (JOURNEY[state.jobsDone + 1] as { area: number }).area !== job.area
      if (job.area === 0 && job.obra === 0) next = unlock(next, 'casita')
      if (lastOfArea) next = { ...unlock(next, 'areas'), coins: next.coins + AREA_COINS }
      if (job.area === 1 && job.obra === 0) next = { ...next, dog: { arrived: true, name: next.dog.name } }
    }
    // the trip is next: Aventuras opens to say why he is going
    if (state.jobsDone + 1 === TRIP_JOB) next = unlock(next, 'aventuras')
    if (job?.kind === 'trip') next = { ...next, coins: next.coins + TRIP.coins }
    // energy gathered while it waited to be seen: a full bar is ready to go
    if (nextJob(next) && next.energy >= goalOf(next)) next = { ...next, work: { status: 'ready', startedAt: null } }
    set(next)
  },

  dismissUnlock() {
    if (state.unlockQueue.length) set({ ...state, unlockQueue: state.unlockQueue.slice(1) })
  },

  nameDog(name: string) {
    set({ ...state, dog: { arrived: true, name: name.trim() || 'Tero' } })
  },

  /** Buys (or receives) a room option and puts it in its place. */
  buyRoom(id: string): boolean {
    const o = roomOption(id)
    if (!o || state.room.includes(id) || roomLock(state, o) || state.coins < priceOf(o)) return false
    set({ ...state, coins: state.coins - priceOf(o), room: [...state.room, id], placed: { ...state.placed, [o.slot]: id } })
    return true
  },

  /** Puts an owned option in its place, or (null) leaves the place empty; what comes out stays owned. */
  placeRoom(slot: string, id: string | null) {
    const placed = { ...state.placed }
    if (id && state.room.includes(id) && roomOption(id)?.slot === slot) placed[slot] = id
    else delete placed[slot]
    set({ ...state, placed })
  },

  /** Buys clothes and puts them on straight away. */
  buyClothes(id: string): boolean {
    const c = clothesById(id)
    if (!c || state.clothes.includes(id) || state.coins < c.price) return false
    if (c.south && !southOpen(state)) return false
    set({ ...state, coins: state.coins - c.price, clothes: [...state.clothes, id], outfit: { ...state.outfit, [c.slot]: id } })
    return true
  },

  /** Puts on something he owns, or (null) goes back to his usual in that slot. */
  wear(slot: Slot, id: string | null) {
    const outfit = { ...state.outfit }
    if (id && state.clothes.includes(id) && CLOTHES.some((c) => c.id === id && c.slot === slot)) outfit[slot] = id
    else delete outfit[slot]
    set({ ...state, outfit })
  },

  setNames(companion: string, player: string) {
    set({ ...state, name: companion.trim() || state.name, playerName: player.trim() })
  },

  setPushSubscription(json: string | null) {
    set({ ...state, pushSubscription: json })
  },

  pushAsked() {
    set({ ...state, pushAsk: { times: state.pushAsk.times + 1, last: todayKey(state) } })
  },

  // ---- backup ----
  exportData(): string {
    return JSON.stringify(state, null, 1)
  },
  /** Replaces everything with a backup; false if the file isn't a save of this build. */
  importData(raw: string): boolean {
    try {
      set(parse(raw))
      return true
    } catch {
      return false
    }
  },

  // ---- test menu ----
  debugNextDay() {
    set({ ...state, dayOffset: state.dayOffset + 1 })
  },
  /** Two days later: one day missed, for the termo and recalentar. */
  debugMissDay() {
    set({ ...state, dayOffset: state.dayOffset + 2 })
  },
  debugTermo() {
    set({ ...state, termos: Math.min(TERMOS_MAX, state.termos + 1) })
  },
  /** Leaves the streak goal at today's streak, so tomorrow's mate reaches it. */
  debugGoalTomorrow() {
    set({ ...state, streakGoal: streakNow(state) + 1 })
  },
  debugFillEnergy() {
    if (state.work.status !== 'charging' || !nextJob(state)) return
    set({ ...state, energy: goalOf(state), coins: state.coins + FULL_ENERGY_COINS, work: { status: 'ready', startedAt: null } })
  },
  debugPremium() {
    set({ ...state, premium: !state.premium })
  },
  debugCoins() {
    set({ ...state, coins: state.coins + 100 })
  },
  debugFinishWork() {
    if (state.work.status === 'working') set({ ...state, workSkipMs: WORK_MS })
  },
  /** Leaves the current job finished, waiting to be seen (whatever stage it was at). */
  debugSkipJob() {
    if (!nextJob(state) || state.work.status === 'done') return
    // a skipped bar still pays, so the bed (30) can always be bought after the casita
    const paid = state.work.status === 'charging' ? FULL_ENERGY_COINS : 0
    set({ ...state, energy: 0, coins: state.coins + paid, work: { status: 'done', startedAt: null } })
  },
  debugReset() {
    set(initial())
  },
}
