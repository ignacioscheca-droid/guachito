// A small log of failures for testing on the phone: uncaught errors, unhandled promise
// rejections, React render errors, and notes from the test menu ("Algo se ve mal"). It keeps
// the last ERROR_LIMIT on the device ("gauchito.v2.errors", not in the save) with a compact
// summary of the game when it happened. Only failures: no usage logging, nothing leaves the phone.
import { useSyncExternalStore } from 'react'
import { now } from './clock'
import { jobInfo } from './journey'
import { PUSH_WORKER_URL } from './push'
import { getState, goalOf, nextJob, streakNow, todayKey } from './store'

export type ErrorKind = 'error' | 'rejection' | 'react' | 'note'

/** Where the game stood: enough to replay the situation, no habit names or answers. */
export type StateSummary = {
  day: string
  energy: string
  work: string
  job: string | null
  jobsDone: number
  streak: number
  coins: number
}

export type ErrorEntry = {
  /** ms since the epoch */
  t: number
  kind: ErrorKind
  message: string
  stack: string
  /** The screen or tab on view ("inicio", "settings"…) */
  screen: string
  state: StateSummary | null
}

const KEY = 'gauchito.v2.errors'
export const ERROR_LIMIT = 30
const MAX_MESSAGE = 300
const MAX_STACK_LINES = 8
const MAX_STACK_LINE = 160

function load(): ErrorEntry[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(list) ? list.slice(-ERROR_LIMIT) : []
  } catch {
    return []
  }
}

let entries = load()
const listeners = new Set<() => void>()
let screen = 'inicio'

function save(next: ErrorEntry[]) {
  entries = next
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    /* storage full or blocked: the log lasts this session */
  }
  listeners.forEach((l) => l())
}

export const readErrors = () => entries

export function useErrorLog() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => entries,
  )
}

/** The app says what is on screen (App.tsx), so each entry can say where it happened. */
export function setErrorScreen(name: string) {
  screen = name
}

export function summarize(): StateSummary | null {
  try {
    const s = getState()
    const job = nextJob(s)
    return {
      day: todayKey(s),
      energy: `${s.energy}/${goalOf(s)}`,
      work: s.work.status,
      job: job ? jobInfo(job).name : null,
      jobsDone: s.jobsDone,
      streak: streakNow(s),
      coins: s.coins,
    }
  } catch {
    return null
  }
}

/** The first lines of a stack, each cut short. */
export function trimStack(stack: string | undefined | null) {
  return (stack ?? '')
    .split('\n')
    .slice(0, MAX_STACK_LINES)
    .map((l) => (l.length > MAX_STACK_LINE ? `${l.slice(0, MAX_STACK_LINE)}…` : l))
    .join('\n')
}

/** Adds an entry (never throws: logging a failure must not cause another). */
export function logError(kind: ErrorKind, message: string, stack?: string | null) {
  try {
    const text = String(message || kind).slice(0, MAX_MESSAGE)
    const t = now()
    const last = entries[entries.length - 1]
    // the same failure twice in a row (React reports a render error twice): one entry
    if (last && last.kind === kind && last.message === text && t - last.t < 2000) return
    save([...entries, { t, kind, message: text, stack: trimStack(stack), screen, state: summarize() }].slice(-ERROR_LIMIT))
  } catch {
    /* nothing else to do */
  }
}

/** A note from the test menu: "Algo se ve mal". */
export const logNote = (text: string) => logError('note', text.trim() || 'Algo se ve mal')

export function clearErrors() {
  save([])
}

/** Catches what the app doesn't: call once at startup. */
export function installErrorLog() {
  window.addEventListener('error', (e) => {
    // the browser's own noise: a resize loop is not a failure of the game
    if (/ResizeObserver loop/.test(e.message)) return
    logError('error', e.message, e.error instanceof Error ? e.error.stack : `${e.filename}:${e.lineno}:${e.colno}`)
  })
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason
    logError('rejection', r instanceof Error ? r.message : String(r), r instanceof Error ? r.stack : null)
  })
}

const KIND_LABEL: Record<ErrorKind, string> = { error: 'Error', rejection: 'Promesa rota', react: 'Pantalla rota', note: 'Nota' }
export const kindLabel = (k: ErrorKind) => KIND_LABEL[k]

const pad = (n: number) => String(n).padStart(2, '0')
/** Local "2026-10-30 13:05:09". */
export function formatTime(t: number) {
  const d = new Date(t)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function stateLine(st: StateSummary | null) {
  if (!st) return 'sin estado'
  const job = st.job ? ` (${st.job})` : ''
  return `día ${st.day} · energía ${st.energy} · trabajo ${st.work}${job} · ${st.jobsDone} hechos · racha ${st.streak} · herraduras ${st.coins}`
}

/** The whole log as plain text, to paste into a chat. */
export function errorLogAsText(list: ErrorEntry[] = entries) {
  const head = `Gauchito 2 · errores (${list.length}) · ${formatTime(now())}`
  const body = list.map((e) => [`[${formatTime(e.t)}] ${kindLabel(e.kind)} · ${e.screen} · ${e.message}`, `  ${stateLine(e.state)}`, e.stack && e.stack.replace(/^/gm, '  ')].filter(Boolean).join('\n'))
  return [head, ...body].join('\n\n')
}

/**
 * Later step, not wired yet and called from nowhere: sends the log to the Cloudflare push
 * worker (`PUSH_WORKER_URL`, push-worker/ on main) so it can be read without the phone.
 * The worker needs an `/errors` route first. Until then nothing is sent.
 */
export async function postErrorLogToWorker(list: ErrorEntry[] = entries): Promise<boolean> {
  if (!PUSH_WORKER_URL || !list.length) return false
  const res = await fetch(`${PUSH_WORKER_URL}/errors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app: 'gauchito-v2', errors: list }),
  })
  return res.ok
}
