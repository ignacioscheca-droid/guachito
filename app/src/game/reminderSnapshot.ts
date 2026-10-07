// The daily reminder is composed on the phone, by the service worker (public/sw.js),
// from what you have done today. The SW can't read localStorage, so the app keeps a
// small copy of the relevant state in IndexedDB. Nothing leaves the phone.
import { ADVENTURE_MS, EPISODES, itemById } from './content'
import { findHabit, getState, subscribe, type GameState } from './store'

/** Emoji for catalog habits, which use artist icons in the app. */
const CATALOG_EMOJI: Record<string, string> = {
  agua: '💧',
  ejercicio: '🏋️',
  fruta: '🍎',
  dormir: '😴',
  meditar: '🧘',
  foco: '💻',
  leer: '📚',
  mate: '🧉',
  plantas: '🌱',
  sol: '☀️',
  cocinar: '🍳',
  pantallas: '📵',
}

export type ReminderSnapshot = {
  v: 1
  name: string
  playerName: string
  habits: { id: string; name: string; emoji: string }[]
  /** Completed habit ids per local day (last 14 days). */
  completions: Record<string, string[]>
  adventure: { status: GameState['adventure']['status']; returnAt: number | null; episode: string | null }
  rewardItem: string | null
}

function build(s: GameState): ReminderSnapshot {
  const days = Object.keys(s.completions).sort().slice(-14)
  const { status, startedAt, runs } = s.adventure
  const episode =
    status === 'running' ? EPISODES[runs % EPISODES.length].title : s.pendingReward ? EPISODES[s.pendingReward.episode].title : null
  return {
    v: 1,
    name: s.name,
    playerName: s.playerName,
    habits: s.habits.map((id) => {
      const h = findHabit(s, id)
      return { id, name: h.name, emoji: h.emoji ?? CATALOG_EMOJI[id] ?? '⭐' }
    }),
    completions: Object.fromEntries(days.map((d) => [d, s.completions[d]])),
    adventure: { status, returnAt: startedAt != null ? startedAt + ADVENTURE_MS : null, episode },
    rewardItem: s.pendingReward?.itemId ? itemById(s.pendingReward.itemId).name : null,
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('guachito', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('kv')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveReminderSnapshot() {
  if (!('indexedDB' in window)) return
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('kv', 'readwrite')
      tx.objectStore('kv').put(build(getState()), 'reminder')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    /* private mode or storage blocked: the reminder falls back to a generic text */
  }
}

/** Keeps the snapshot current: now, and shortly after every change. */
export function startReminderSnapshots() {
  let timer = 0
  saveReminderSnapshot()
  subscribe(() => {
    clearTimeout(timer)
    timer = window.setTimeout(saveReminderSnapshot, 300)
  })
}
