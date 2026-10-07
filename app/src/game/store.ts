import { useSyncExternalStore } from 'react'
import {
  ADVENTURE_COINS,
  ADVENTURE_MS,
  ENERGY_GOAL,
  energyShare,
  EPISODES,
  HABITS,
  ITEMS,
  itemById,
  type HabitDef,
} from './content'

export type AdventureStatus = 'charging' | 'ready' | 'running' | 'returned'

export type Reward = { coins: number; itemId: string | null; episode: number }

export type GameState = {
  version: 1
  onboarded: boolean
  name: string
  habits: string[]
  /** Habits the player created (name + emoji). */
  customHabits: HabitDef[]
  /** Completed habit ids per local day (YYYY-MM-DD). */
  completions: Record<string, string[]>
  /** Energy each completion gave, per day, so a mistaken tick can be undone. */
  energyGains: Record<string, Record<string, number>>
  energy: number
  coins: number
  adventure: { status: AdventureStatus; startedAt: number | null; runs: number }
  pendingReward: Reward | null
  ownedItems: string[]
  /** Item to spotlight next time the ranch is shown. */
  newItemId: string | null
  /** Push subscription for the daily reminder (JSON), once notifications are on. */
  pushSubscription: string | null
  /** Debug: whole days added to the clock by the test menu. */
  dayOffset: number
  /** Debug: adventures finish this many ms sooner. */
  adventureSkipMs: number
}

const KEY = 'guachito.v1'

const initial = (): GameState => ({
  version: 1,
  onboarded: false,
  name: 'Gauchito',
  habits: [],
  customHabits: [],
  completions: {},
  energyGains: {},
  energy: 0,
  coins: 0,
  adventure: { status: 'charging', startedAt: null, runs: 0 },
  pendingReward: null,
  ownedItems: [],
  newItemId: null,
  pushSubscription: null,
  dayOffset: 0,
  adventureSkipMs: 0,
})

function parse(raw: string): GameState {
  const data = JSON.parse(raw)
  if (typeof data !== 'object' || data == null || data.version !== 1) throw new Error('not a Gauchito save')
  // The app was first spelled "Guachito": rename a companion that still has that default.
  if (data.name === 'Guachito') data.name = 'Gauchito'
  return { ...initial(), ...data }
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
  return HABITS.find((h) => h.id === id) ?? s.customHabits.find((h) => h.id === id) ?? { id, name: id, emoji: '⭐' }
}

/** Today's episode while out, or the one just finished. */
export const currentEpisode = (s: GameState) => EPISODES[s.adventure.runs % EPISODES.length]

// ---- time -------------------------------------------------------------

export function todayKey(s: GameState = state) {
  const d = new Date(Date.now() + s.dayOffset * 86_400_000)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export const doneToday = (s: GameState) => s.completions[todayKey(s)] ?? []

export function adventureRemainingMs(s: GameState = state) {
  if (s.adventure.status !== 'running' || s.adventure.startedAt == null) return 0
  return Math.max(0, s.adventure.startedAt + ADVENTURE_MS - (Date.now() + s.adventureSkipMs))
}

// ---- actions ----------------------------------------------------------

export const actions = {
  finishOnboarding(name: string, habits: string[]) {
    set({ ...state, onboarded: true, name: name.trim() || 'Gauchito', habits })
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

  /** Returns the energy gained (0 if already done, or while an adventure is underway). */
  completeHabit(id: string): number {
    const day = todayKey()
    const done = state.completions[day] ?? []
    if (done.includes(id)) return 0
    const charging = state.adventure.status === 'charging'
    const energy = charging ? Math.min(ENERGY_GOAL, state.energy + energyShare(state.habits, id)) : state.energy
    const status: AdventureStatus = charging && energy >= ENERGY_GOAL ? 'ready' : state.adventure.status
    const gained = energy - state.energy
    set({
      ...state,
      completions: { ...state.completions, [day]: [...done, id] },
      energyGains: { ...state.energyGains, [day]: { ...state.energyGains[day], [id]: gained } },
      energy,
      adventure: { ...state.adventure, status },
    })
    return gained
  },

  /** Unticks a habit; its energy comes back out unless the adventure already used it. */
  uncompleteHabit(id: string) {
    const day = todayKey()
    const done = state.completions[day] ?? []
    if (!done.includes(id)) return
    const { [id]: gained = 0, ...gains } = state.energyGains[day] ?? {}
    const unspent = state.adventure.status === 'charging' || state.adventure.status === 'ready'
    const energy = unspent ? Math.max(0, state.energy - gained) : state.energy
    const status: AdventureStatus = state.adventure.status === 'ready' && energy < ENERGY_GOAL ? 'charging' : state.adventure.status
    set({
      ...state,
      completions: { ...state.completions, [day]: done.filter((h) => h !== id) },
      energyGains: { ...state.energyGains, [day]: gains },
      energy,
      adventure: { ...state.adventure, status },
    })
  },

  startAdventure() {
    if (state.adventure.status !== 'ready') return
    set({ ...state, energy: 0, adventureSkipMs: 0, adventure: { ...state.adventure, status: 'running', startedAt: Date.now() } })
  },

  /** Called when the timer runs out; prepares the reward. */
  returnFromAdventure() {
    if (state.adventure.status !== 'running') return
    const episode = state.adventure.runs % EPISODES.length
    const wanted = EPISODES[episode].itemId
    const itemId = !state.ownedItems.includes(wanted)
      ? wanted
      : (ITEMS.find((i) => !state.ownedItems.includes(i.id))?.id ?? null)
    const coins = itemId ? ADVENTURE_COINS : ADVENTURE_COINS * 2
    set({
      ...state,
      adventure: { status: 'returned', startedAt: null, runs: state.adventure.runs + 1 },
      pendingReward: { coins, itemId, episode },
    })
  },

  claimReward() {
    const r = state.pendingReward
    if (!r) return
    set({
      ...state,
      coins: state.coins + r.coins,
      ownedItems: r.itemId && !state.ownedItems.includes(r.itemId) ? [...state.ownedItems, r.itemId] : state.ownedItems,
      newItemId: r.itemId,
      pendingReward: null,
      adventure: { ...state.adventure, status: 'charging' },
    })
  },

  buyItem(id: string): boolean {
    const item = itemById(id)
    if (state.ownedItems.includes(id) || state.coins < item.price) return false
    set({ ...state, coins: state.coins - item.price, ownedItems: [...state.ownedItems, id], newItemId: id })
    return true
  },

  clearNewItem() {
    if (state.newItemId) set({ ...state, newItemId: null })
  },

  setPushSubscription(json: string | null) {
    set({ ...state, pushSubscription: json })
  },

  // ---- backup ----
  exportData(): string {
    return JSON.stringify(state, null, 1)
  },
  /** Replaces everything with a backup; false if the file isn't a Gauchito save. */
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
    if (state.adventure.status !== 'charging') return
    set({ ...state, energy: ENERGY_GOAL, adventure: { ...state.adventure, status: 'ready' } })
  },
  debugCoins() {
    set({ ...state, coins: state.coins + 100 })
  },
  debugFinishAdventure() {
    if (state.adventure.status === 'running') set({ ...state, adventureSkipMs: ADVENTURE_MS })
  },
  debugReset() {
    set(initial())
  },
}
