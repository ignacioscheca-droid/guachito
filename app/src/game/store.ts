import { useSyncExternalStore } from 'react'
import type { AboutYou } from './aboutYou'
import { HABITS, STARTER_GOALS, type HabitDef } from './content'
import { daysTogether } from './friendship'
import {
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
export type Completion = { energy: number; coins: number; full: boolean; firstTime: boolean }

export type GameState = {
  version: 2
  onboarded: boolean
  name: string
  /** The player's own name (used in greetings). */
  playerName: string
  /** Onboarding questionnaire answers ("Contame un poco de vos"). */
  aboutYou: AboutYou | null
  /** Days in a row the player committed to on day 1 (2, 5, 7 or 14). */
  streakGoal: number | null
  habits: string[]
  /** Habits the player created (name + emoji). */
  customHabits: HabitDef[]
  /** Completed habit ids per local day (YYYY-MM-DD). */
  completions: Record<string, string[]>
  /** Energy each completion gave, per day, so a mistaken tick can be undone. */
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

// Its own key, so this build never touches the save of the app on main ("guachito.v1").
const KEY = 'gauchito.v2'

const initial = (): GameState => ({
  version: 2,
  onboarded: false,
  name: 'Paucho',
  playerName: '',
  aboutYou: null,
  streakGoal: null,
  habits: [],
  customHabits: [],
  completions: {},
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
  const d = new Date(Date.now() + s.dayOffset * 86_400_000)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export const doneToday = (s: GameState) => s.completions[todayKey(s)] ?? []

export function workRemainingMs(s: GameState = state) {
  if (s.work.status !== 'working' || s.work.startedAt == null) return 0
  return Math.max(0, s.work.startedAt + WORK_MS - (Date.now() + s.workSkipMs))
}

// ---- unlocks ----------------------------------------------------------

/** Opens tabs and queues their welcome (once each). */
function unlock(s: GameState, ...tabs: TabId[]): GameState {
  const fresh = tabs.filter((t) => !s.unlocked.includes(t))
  if (!fresh.length) return s
  return { ...s, unlocked: [...s.unlocked, ...fresh], unlockQueue: [...s.unlockQueue, ...fresh] }
}

/** The Paucho tab opens on the third day you come back: you are "compañeros" by then. */
const PAUCHO_TAB_DAYS = 3

// ---- actions ----------------------------------------------------------

export const actions = {
  finishOnboarding(o: { name: string; playerName: string; habits: string[]; aboutYou: AboutYou; streakGoal: number }) {
    set({ ...state, ...o, onboarded: true, name: o.name.trim() || 'Paucho', playerName: o.playerName.trim() })
  },

  /** Creates a habit of the player's own and returns its id. */
  addCustomHabit(name: string, emoji: string): string {
    const id = `c${Date.now().toString(36)}`
    set({ ...state, customHabits: [...state.customHabits, { id, name: name.trim(), emoji }] })
    return id
  },

  setHabits(habits: string[]) {
    set({ ...state, habits })
  },

  /**
   * Ticks a habit. While the bar fills it gives energy; the tick that fills it also gives
   * FULL_ENERGY_COINS; after that (or with no job left) habits give herraduras.
   */
  completeHabit(id: string): Completion {
    const day = todayKey()
    const done = state.completions[day] ?? []
    if (done.includes(id)) return { energy: 0, coins: 0, full: false, firstTime: false }
    const firstTime = !Object.values(state.completions).some((ids) => ids.includes(id))
    const goal = goalOf(state)
    const charging = state.work.status === 'charging' && nextJob(state) != null && state.lastFullDay !== day
    const energy = charging ? Math.min(goal, state.energy + ENERGY_PER_HABIT) : state.energy
    const full = charging && energy >= goal
    const coins = full ? FULL_ENERGY_COINS : charging ? 0 : EXTRA_HABIT_COINS
    let next: GameState = {
      ...state,
      completions: { ...state.completions, [day]: [...done, id] },
      energyGains: { ...state.energyGains, [day]: { ...state.energyGains[day], [id]: energy - state.energy } },
      coinGains: { ...state.coinGains, [day]: { ...state.coinGains[day], [id]: coins } },
      energy,
      coins: state.coins + coins,
      lastFullDay: full ? day : state.lastFullDay,
      work: full ? { status: 'ready', startedAt: null } : state.work,
    }
    if (done.length === 0 && daysTogether(next.completions) >= PAUCHO_TAB_DAYS) next = unlock(next, 'paucho')
    // (read before set(): afterwards `state` is already the new one)
    const gained = energy - state.energy
    set(next)
    return { energy: gained, coins, full, firstTime }
  },

  /** Unticks a habit; its energy comes back out unless the job already started. */
  uncompleteHabit(id: string) {
    const day = todayKey()
    const done = state.completions[day] ?? []
    if (!done.includes(id)) return
    const { [id]: gained = 0, ...gains } = state.energyGains[day] ?? {}
    const { [id]: coins = 0, ...coinGains } = state.coinGains[day] ?? {}
    const unspent = state.work.status === 'charging' || state.work.status === 'ready'
    const energy = unspent ? Math.max(0, state.energy - gained) : state.energy
    const unfilled = state.work.status === 'ready' && energy < goalOf(state)
    set({
      ...state,
      completions: { ...state.completions, [day]: done.filter((h) => h !== id) },
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
    set({ ...state, energy: 0, workSkipMs: 0, work: { status: 'working', startedAt: Date.now() } })
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
      if (lastOfArea) next = unlock(next, 'areas')
      if (job.area === 1 && job.obra === 0) next = { ...next, dog: { arrived: true, name: next.dog.name } }
    }
    // the trip is next: Aventuras opens to say why he is going
    if (state.jobsDone + 1 === TRIP_JOB) next = unlock(next, 'aventuras')
    if (job?.kind === 'trip') next = { ...next, coins: next.coins + TRIP.coins }
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
