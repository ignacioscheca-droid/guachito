// The daily notifications are composed on the phone, by the service worker (public/sw.js),
// from what you have done today. The SW can't read localStorage, so the app keeps a
// small copy of the relevant state in IndexedDB. Nothing leaves the phone.
import { ENERGY_PER_HABIT, jobInfo, WORK_MS } from './journey'
import { findHabit, getState, goalOf, habitsToday, nextJob, restingToday, subscribe, type GameState } from './store'

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
  v: 3
  name: string
  playerName: string
  habits: { id: string; name: string; emoji: string }[]
  /** Completed habit ids per local day (last 14 days). */
  completions: Record<string, string[]>
  /** The job under way or next, as said in a sentence ("la casa"), and when it ends. */
  work: { status: GameState['work']['status']; doneAt: number | null; job: string | null; trip: boolean }
  /** Today's bar is already full (one a day): habits now give herraduras. */
  resting: boolean
  /** Habits still needed today for the day's job (0 once the bar is full). */
  toGo: number
}

function build(s: GameState): ReminderSnapshot {
  const days = Object.keys(s.completions).sort().slice(-14)
  const job = nextJob(s)
  return {
    v: 3,
    name: s.name,
    playerName: s.playerName,
    habits: habitsToday(s).map((id) => {
      const h = findHabit(s, id)
      return { id, name: h.name, emoji: h.emoji ?? CATALOG_EMOJI[id] ?? '⭐' }
    }),
    completions: Object.fromEntries(days.map((d) => [d, s.completions[d]])),
    work: { status: s.work.status, doneAt: s.work.startedAt != null ? s.work.startedAt + WORK_MS : null, job: job ? jobInfo(job).the : null, trip: job?.kind === 'trip' },
    resting: restingToday(s),
    toGo: s.work.status === 'charging' ? Math.ceil((goalOf(s) - s.energy) / ENERGY_PER_HABIT) : 0,
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('gauchito-v2', 1)
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
