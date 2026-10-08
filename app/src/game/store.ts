import { useSyncExternalStore } from 'react'
import type { AboutYou } from './aboutYou'
import {
  ADVENTURE_COINS,
  ADVENTURE_MS,
  ENERGY_GOAL,
  ENERGY_PER_HABIT,
  energyShare,
  EXTRA_HABIT_COINS,
  FULL_ENERGY_COINS,
  EPISODES,
  HABITS,
  ITEMS,
  itemById,
  STARTER_GOALS,
  type HabitDef,
} from './content'

export type AdventureStatus = 'charging' | 'ready' | 'running' | 'returned'

export type Reward = { coins: number; itemId: string | null; episode: number }

/** What ticking a habit gave: energy while the bar fills, coins once it is full. */
export type Completion = { energy: number; coins: number; full: boolean; firstTime: boolean }

export type GameState = {
  version: 1
  onboarded: boolean
  name: string
  /** The player's own name (used in greetings and reminders). */
  playerName: string
  /** Onboarding questionnaire answers ("Contame un poco de vos"), for the personalized plan. */
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
  /** Same for the coins a completion gave (the bar filling, or a habit after it was full). */
  coinGains: Record<string, Record<string, number>>
  /** Days the bar got full (Paucho becomes a baqueano at BAQUEANO_DAYS), and the last one. */
  fullEnergyDays: number
  lastFullDay: string | null
  /** Energy rules the save follows ('finch': 5 per habit, 15 to go; older saves used 100). */
  energyRule: 'finch'
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
  playerName: '',
  aboutYou: null,
  streakGoal: null,
  habits: [],
  customHabits: [],
  completions: {},
  energyGains: {},
  coinGains: {},
  fullEnergyDays: 0,
  lastFullDay: null,
  energyRule: 'finch',
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
  const s: GameState = { ...initial(), ...data }
  // Saves from before Finch's energy rules (a bar of 100 split among all habits): today's
  // ticks count 5 each now, and three of them fill the bar.
  if (data.energyRule !== 'finch') {
    s.energyRule = 'finch'
    if (s.adventure.status === 'charging') {
      s.energy = Math.min(ENERGY_GOAL, (s.completions[todayKey(s)] ?? []).length * ENERGY_PER_HABIT)
      if (s.energy >= ENERGY_GOAL) s.adventure = { ...s.adventure, status: 'ready' }
    } else if (s.adventure.status === 'ready') s.energy = ENERGY_GOAL
    else s.energy = 0
  }
  return s
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
  finishOnboarding(o: { name: string; playerName: string; habits: string[]; aboutYou: AboutYou; streakGoal: number }) {
    set({ ...state, ...o, onboarded: true, name: o.name.trim() || 'Gauchito', playerName: o.playerName.trim() })
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
   * FULL_ENERGY_COINS and counts a full-energy day; after that, habits give coins.
   */
  completeHabit(id: string): Completion {
    const day = todayKey()
    const done = state.completions[day] ?? []
    if (done.includes(id)) return { energy: 0, coins: 0, full: false, firstTime: false }
    const firstTime = !Object.values(state.completions).some((ids) => ids.includes(id))
    const charging = state.adventure.status === 'charging'
    const energy = charging ? Math.min(ENERGY_GOAL, state.energy + energyShare(state.habits, id)) : state.energy
    const full = charging && energy >= ENERGY_GOAL
    const coins = full ? FULL_ENERGY_COINS : charging ? 0 : EXTRA_HABIT_COINS
    const newDay = full && state.lastFullDay !== day
    set({
      ...state,
      completions: { ...state.completions, [day]: [...done, id] },
      energyGains: { ...state.energyGains, [day]: { ...state.energyGains[day], [id]: energy - state.energy } },
      coinGains: { ...state.coinGains, [day]: { ...state.coinGains[day], [id]: coins } },
      energy,
      coins: state.coins + coins,
      fullEnergyDays: state.fullEnergyDays + (newDay ? 1 : 0),
      lastFullDay: full ? day : state.lastFullDay,
      adventure: { ...state.adventure, status: full ? 'ready' : state.adventure.status },
    })
    return { energy: energy - state.energy, coins, full, firstTime }
  },

  /** Unticks a habit; its energy comes back out unless the adventure already used it. */
  uncompleteHabit(id: string) {
    const day = todayKey()
    const done = state.completions[day] ?? []
    if (!done.includes(id)) return
    const { [id]: gained = 0, ...gains } = state.energyGains[day] ?? {}
    const { [id]: coins = 0, ...coinGains } = state.coinGains[day] ?? {}
    const unspent = state.adventure.status === 'charging' || state.adventure.status === 'ready'
    const energy = unspent ? Math.max(0, state.energy - gained) : state.energy
    const unfilled = state.adventure.status === 'ready' && energy < ENERGY_GOAL
    const undoFullDay = unfilled && state.lastFullDay === day
    set({
      ...state,
      completions: { ...state.completions, [day]: done.filter((h) => h !== id) },
      energyGains: { ...state.energyGains, [day]: gains },
      coinGains: { ...state.coinGains, [day]: coinGains },
      energy,
      coins: Math.max(0, state.coins - coins),
      fullEnergyDays: state.fullEnergyDays - (undoFullDay ? 1 : 0),
      lastFullDay: undoFullDay ? null : state.lastFullDay,
      adventure: { ...state.adventure, status: unfilled ? 'charging' : state.adventure.status },
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

  setNames(companion: string, player: string) {
    set({ ...state, name: companion.trim() || state.name, playerName: player.trim() })
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
    const day = todayKey()
    set({
      ...state,
      energy: ENERGY_GOAL,
      coins: state.coins + FULL_ENERGY_COINS,
      fullEnergyDays: state.fullEnergyDays + (state.lastFullDay !== day ? 1 : 0),
      lastFullDay: day,
      adventure: { ...state.adventure, status: 'ready' },
    })
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
