// Encargos (the owner's call, 2026-11-08; design: Claude Doc "Gauchito — Encargos"): Paucho's
// notes in his libreta. Four a day and six a week, small and many, so every habit moves
// something, also after the bar is full. They pay only herraduras, more the harder they are,
// and you cobrás them by hand in their tab, like Finch's quests.
//
// Progress is never stored: it is worked out from what the game already keeps (completions,
// mates, coinGains, `log`), so it can't drift. The save keeps only what was asked and paid.
import { now } from './clock'
import { areaName, ENERGY_PER_HABIT, EXTRA_HABIT_COINS, FULL_ENERGY_COINS, JOURNEY, jobInfo } from './journey'
import { FIRST_BED } from './room'
import type { GameState, Moment } from './store'
import { canBuySomething, chargeTarget, dueOn, finished, nextJob, planOf, workRemainingMs } from './store'

/** How much an encargo asks of you; that sets what it pays. */
export type Level = 'toque' | 'chico' | 'medio' | 'grande' | 'especial'
export const LEVEL_COINS: Record<Level, number> = { toque: 5, chico: 10, medio: 15, grande: 20, especial: 25 }
/** Every encargo's herraduras times this (1 for the owner's test; the simulation may lower it). */
export const ENCARGO_SCALE = 1
export const coinsOf = (n: number) => Math.round(n * ENCARGO_SCALE)

/** One of today's four: which encargo, how many, and (for "ver la obra") the job it waits for. */
export type DailyPick = { id: string; target: number; base?: number }
/** A weekly line: its steps (how many), what each pays, and the step it is on. */
export type Line = { id: string; steps: number[]; coins: number[]; step: number; base?: number }
export type Encargos = {
  day: string
  daily: DailyPick[]
  paid: boolean[]
  week: { no: number; start: string; end: string; lines: Line[] }
  /** Herraduras cobradas for you when a tanda renewed with cumplidos not cobrados ("Te guardé…"). */
  kept: number
}

// ---- what the game already shows -------------------------------------------

const DAY_MS = 86_400_000
const shift = (day: string, n: number) => {
  const d = new Date(`${day}T12:00:00`)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const between = (a: string, b: string) => Math.round((new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime()) / DAY_MS)
const daysFrom = (start: string, end: string) => Array.from({ length: between(start, end) + 1 }, (_, i) => shift(start, i))
const weekday = (day: string) => new Date(`${day}T12:00:00`).getDay()

/** The onboarding's day (day 0): its mate is the first one. */
export function firstDay(s: GameState): string | null {
  return [...s.mates, ...Object.keys(s.completions)].sort()[0] ?? null
}

export const logged = (s: GameState, day: string, kind: string) => (s.log[day] ?? []).filter((k) => k === kind).length
const gains = (s: GameState, day: string) => Object.values(s.coinGains[day] ?? {})
/** The tick that filled the bar paid FULL_ENERGY_COINS. */
const filled = (s: GameState, day: string) => (gains(s, day).includes(FULL_ENERGY_COINS) ? 1 : 0)
/** Habits after the bar was full (or with Paucho away working): they paid the extra herraduras. */
const afterBar = (s: GameState, day: string) => gains(s, day).filter((c) => c === EXTRA_HABIT_COINS).length
const ticks = (s: GameState, day: string) => (s.completions[day] ?? []).length
const inMoment = (s: GameState, day: string, m: Moment) => (s.completions[day] ?? []).filter((id) => planOf(s, id).moment === m).length

/** The day's habits (set-aside ones out). */
function dueList(s: GameState, day: string) {
  const out = s.skips[day] ?? []
  return [...s.habits.filter((id) => dueOn(s, id, day)), ...(s.extras[day] ?? []).filter((id) => !s.habits.includes(id))].filter((id) => !out.includes(id))
}
const wholePlan = (s: GameState, day: string) => {
  const due = dueList(s, day)
  return due.length > 0 && due.every((id) => finished(s, id, day)) ? 1 : 0
}
const moments = (s: GameState, day: string) => new Set(dueList(s, day).map((id) => planOf(s, id).moment))
const allMoments = (s: GameState, day: string) => (['morning', 'any', 'night'] as Moment[]).every((m) => inMoment(s, day, m) > 0) ? 1 : 0

/** Habit-times left today after the ones the bar still needs: what "con Paucho trabajando" can ask. */
function leftAfterBar(s: GameState, day: string) {
  const times = dueList(s, day).reduce((n, id) => n + Math.max(0, planOf(s, id).times - (s.completions[day] ?? []).filter((h) => h === id).length), 0)
  const target = chargeTarget(s, day)
  const needed = target ? Math.max(0, Math.ceil((target.goal - s.energy) / ENERGY_PER_HABIT)) : 0
  return times - needed
}

/** The bar can still fill today: a job is next (or comes after the one under way) and it wasn't filled. */
const barToday = (s: GameState, day: string) => s.lastFullDay !== day && (nextJob(s) != null && (s.work.status !== 'working' || JOURNEY[s.jobsDone + 1] != null))

/** Paucho is building something that will be finished (and can be seen) today. */
function obraToday(s: GameState) {
  const job = nextJob(s)
  if (!job || job.kind !== 'build') return false
  if (s.work.status === 'done') return true
  if (s.work.status !== 'working') return false
  const midnight = new Date(now() + s.dayOffset * DAY_MS)
  midnight.setHours(24, 0, 0, 0)
  return workRemainingMs(s) < midnight.getTime() - (now() + s.dayOffset * DAY_MS) - 30 * 60_000
}
/** The job index where `jobsDone` ends its area. */
const areaEnd = (jobsDone: number) => {
  const job = JOURNEY[jobsDone]
  if (!job || job.kind !== 'build') return -1
  return JOURNEY.findLastIndex((j) => j.kind === 'build' && j.area === job.area)
}

// ---- the daily encargos ------------------------------------------------------

type DailyDef = {
  id: string
  /** Art name (app/public/a) or an emoji, for the card's icon. */
  icon: string
  level: (target: number) => Level
  text: (s: GameState, p: DailyPick) => string
  count: (s: GameState, day: string, p: DailyPick) => number
  /** Can be asked today. */
  ok?: (s: GameState, day: string) => boolean
}
const lv = (l: Level) => () => l

export const DAILY: Record<string, DailyDef> = {
  // 1 · arranque: done with the first thing you do
  mate: { id: 'mate', icon: 'habit_mate', level: lv('toque'), text: () => 'Cebá el mate conmigo', count: (s, d) => (s.mates.includes(d) ? 1 : 0) },
  primer: { id: 'primer', icon: 'ui_check', level: lv('toque'), text: () => 'Hacé tu primer hábito', count: (s, d) => Math.min(1, ticks(s, d)) },
  // 2 · la barra: the centre of the day
  barra: { id: 'barra', icon: 'ui_energia', level: lv('chico'), text: () => 'Llená la barra', count: filled, ok: barToday },
  obra: {
    id: 'obra',
    icon: '🔨',
    level: lv('chico'),
    text: (s, p) => {
      const job = JOURNEY[p.base ?? 0]
      if (job?.kind === 'build' && areaEnd(p.base ?? 0) === p.base) return `Terminemos ${areaName(job.area, s.name, true)}`
      return `Mirá ${job ? jobInfo(job).the : 'la obra'} terminada`
    },
    count: (s, _d, p) => (s.jobsDone > (p.base ?? 0) ? 1 : 0),
    ok: (s) => obraToday(s),
  },
  // 3 · con Paucho trabajando: the habits after the bar keep counting
  trabajando: {
    id: 'trabajando',
    icon: '🔨',
    level: (n) => (n >= 2 ? 'medio' : 'chico'),
    text: (_s, p) => (p.target === 1 ? 'Hacé 1 hábito mientras trabajo' : `Hacé ${p.target} hábitos mientras trabajo`),
    count: afterBar,
    ok: (s, d) => leftAfterBar(s, d) >= 1,
  },
  // 4 · variado
  cama: { id: 'cama', icon: 'nav_inicio', level: lv('toque'), text: () => 'Elegime una cama para la casita', count: (s) => (s.room.includes(FIRST_BED) ? 1 : 0), ok: (s) => !s.room.includes(FIRST_BED) },
  habito: { id: 'habito', icon: '✍️', level: lv('chico'), text: () => 'Agregá un hábito tuyo', count: (s, d) => Math.min(1, logged(s, d, 'habit')) },
  paucho: { id: 'paucho', icon: 'g_avatar', level: lv('toque'), text: () => 'Pasá a verme a mi pestaña', count: (s, d) => Math.min(1, logged(s, d, 'paucho')), ok: (s) => s.unlocked.includes('paucho') },
  plan: { id: 'plan', icon: '✏️', level: lv('toque'), text: () => 'Ajustá el plan de un hábito', count: (s, d) => Math.min(1, logged(s, d, 'plan')), ok: (s) => !Object.values(s.log).some((ks) => ks.includes('plan')) },
  manana: { id: 'manana', icon: 'habit_sol', level: lv('toque'), text: () => 'Hacé un hábito «Al arrancar»', count: (s, d) => Math.min(1, inMoment(s, d, 'morning')), ok: (s, d) => moments(s, d).has('morning') },
  noche: { id: 'noche', icon: 'habit_dormir', level: lv('chico'), text: () => 'Hacé un hábito «A la noche»', count: (s, d) => Math.min(1, inMoment(s, d, 'night')), ok: (s, d) => moments(s, d).has('night') },
  momentos: { id: 'momentos', icon: '🕰️', level: lv('medio'), text: () => 'Hacé un hábito en cada momento del día', count: allMoments, ok: (s, d) => moments(s, d).size === 3 },
  todo: { id: 'todo', icon: '⭐', level: lv('medio'), text: () => 'Hacé todos los hábitos de hoy', count: wholePlan, ok: (s, d) => leftAfterBar(s, d) >= 1 },
  doble: {
    id: 'doble',
    icon: '🔁',
    level: lv('chico'),
    text: () => 'Hacé un hábito dos veces',
    count: (s, d) => (dueList(s, d).some((id) => (s.completions[d] ?? []).filter((h) => h === id).length >= 2) ? 1 : 0),
    ok: (s, d) => dueList(s, d).some((id) => planOf(s, id).times >= 2),
  },
  compra: { id: 'compra', icon: 'ui_herradura', level: lv('chico'), text: () => 'Comprá algo para la casita', count: (s, d) => Math.min(1, logged(s, d, 'buy')), ok: (s) => canBuySomething(s) },
  poner: {
    id: 'poner',
    icon: 'ui_tab_mesa',
    level: lv('toque'),
    text: () => 'Cambiá algo de lugar en mi cuarto',
    count: (s, d) => Math.min(1, logged(s, d, 'place')),
    ok: (s) => s.room.some((id) => !Object.values(s.placed).includes(id)),
  },
  ropa: { id: 'ropa', icon: '🧣', level: lv('toque'), text: () => 'Probame ropa nueva', count: (s, d) => Math.min(1, logged(s, d, 'wear')), ok: (s) => s.unlocked.includes('paucho') && s.clothes.length > 0 },
}

/** The variado bank, from week 2 on. */
const VARIADO = ['manana', 'noche', 'momentos', 'todo', 'doble', 'compra', 'poner', 'ropa', 'habito', 'paucho']

/** Days 1–7 are written by hand: they go with what opens each day (Claude Doc, "La primera semana"). */
const FIRST_WEEK: { arranque: string; trabajando: number; variado: string }[] = [
  { arranque: 'mate', trabajando: 1, variado: 'cama' },
  { arranque: 'mate', trabajando: 1, variado: 'habito' },
  { arranque: 'primer', trabajando: 1, variado: 'paucho' },
  { arranque: 'mate', trabajando: 2, variado: 'plan' },
  { arranque: 'mate', trabajando: 1, variado: 'noche' },
  { arranque: 'primer', trabajando: 2, variado: 'compra' },
  { arranque: 'mate', trabajando: 1, variado: 'todo' },
]

/** A number from a day, so a day's picks are the same however many times it opens. */
const seed = (day: string) => [...day].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

function pickDaily(s: GameState, day: string, n: number, yesterday: DailyPick[] | null): DailyPick[] {
  const can = (id: string) => DAILY[id].ok?.(s, day) ?? true
  const fixed = n >= 1 && n <= 7 ? FIRST_WEEK[n - 1] : null
  const out: DailyPick[] = []
  out.push({ id: fixed?.arranque ?? (seed(day) % 3 === 0 ? 'primer' : 'mate'), target: 1 })
  // the bar: the obra when it gets finished today, else filling it
  if (can('obra')) out.push({ id: 'obra', target: 1, base: s.jobsDone })
  else if (can('barra')) out.push({ id: 'barra', target: 1 })
  // with Paucho working: as many as are left after the bar, up to two
  const left = Math.max(0, leftAfterBar(s, day))
  const want = fixed?.trabajando ?? (left >= 3 ? 2 : 1)
  if (left >= 1) out.push({ id: 'trabajando', target: Math.min(want, left) })
  // variado (and whatever the slots above couldn't ask)
  const taken = new Set(out.map((p) => p.id))
  const before = new Set((yesterday ?? []).map((p) => p.id))
  const bank = [...(fixed && can(fixed.variado) ? [fixed.variado] : []), ...rotate(VARIADO, seed(day))]
  for (const id of bank) {
    if (out.length >= 4) break
    if (taken.has(id) || !can(id) || (before.has(id) && id !== fixed?.variado)) continue
    out.push({ id, target: 1 })
    taken.add(id)
  }
  return out
}
const rotate = <T,>(xs: T[], k: number) => xs.map((_, i) => xs[(i + k) % xs.length])

// ---- the weekly lines ----------------------------------------------------------

type LineDef = {
  id: string
  icon: string
  steps: number[]
  coins: number[]
  /** Counts days (a day can't count twice): no step asks 7 of 7, that's the streak's. */
  days?: boolean
  special?: boolean
  text: (s: GameState, n: number, line: Line) => string
  count: (s: GameState, days: string[], line: Line) => number
  ok?: (s: GameState) => boolean
}
const sum = (f: (s: GameState, d: string) => number) => (s: GameState, days: string[]) => days.reduce((n, d) => n + f(s, d), 0)
const obrasLeft = (s: GameState) => JOURNEY.slice(s.jobsDone).some((j) => j.kind === 'build')

export const LINES: Record<string, LineDef> = {
  habitos: { id: 'habitos', icon: '📋', steps: [5, 12, 20, 30], coins: [10, 15, 20, 25], text: (_s, n) => `Hacé ${n} hábitos`, count: sum(ticks) },
  mates: { id: 'mates', icon: 'habit_mate', steps: [2, 4, 6], coins: [10, 15, 20], days: true, text: (_s, n) => `Cebá ${n} mates conmigo`, count: sum((s, d) => (s.mates.includes(d) ? 1 : 0)) },
  barras: { id: 'barras', icon: 'ui_energia', steps: [2, 4, 6], coins: [10, 15, 25], days: true, text: (_s, n) => `Llená la barra ${n} veces`, count: sum(filled), ok: (s) => nextJob(s) != null },
  trabajando: { id: 'trabajando', icon: '🔨', steps: [2, 5, 10], coins: [10, 15, 20], text: (_s, n) => `Hacé ${n} hábitos mientras trabajo`, count: sum(afterBar) },
  todo: { id: 'todo', icon: '⭐', steps: [1, 3, 5], coins: [10, 15, 25], days: true, text: (_s, n) => (n === 1 ? 'Hacé todos los hábitos de un día' : `Hacé todos los hábitos ${n} días`), count: sum(wholePlan) },
  noche: {
    id: 'noche',
    icon: 'habit_dormir',
    steps: [2, 4, 7],
    coins: [10, 15, 20],
    text: (_s, n) => `Hacé ${n} hábitos «A la noche»`,
    count: sum((s, d) => inMoment(s, d, 'night')),
    ok: (s) => s.habits.some((id) => planOf(s, id).moment === 'night'),
  },
  momentos: {
    id: 'momentos',
    icon: '🕰️',
    steps: [1, 3],
    coins: [10, 20],
    days: true,
    text: (_s, n) => (n === 1 ? 'Un día, hacé hábitos en cada momento' : `${n} días, hacé hábitos en cada momento`),
    count: sum(allMoments),
    ok: (s) => new Set(s.habits.map((id) => planOf(s, id).moment)).size === 3,
  },
  casita: {
    id: 'casita',
    icon: 'nav_inicio',
    steps: [1, 3, 5],
    coins: [10, 15, 20],
    text: (_s, n) => (n === 1 ? 'Comprá una cosa para la casita' : `Comprá ${n} cosas para la casita`),
    count: sum((s, d) => logged(s, d, 'buy')),
  },
  obras: {
    id: 'obras',
    icon: '🔨',
    steps: [1, 2, 3],
    coins: [10, 15, 20],
    text: (_s, n) => (n === 1 ? 'Mirá una obra terminada' : `Mirá ${n} obras terminadas`),
    count: sum((s, d) => logged(s, d, 'obra')),
    ok: obrasLeft,
  },
  perro: {
    id: 'perro',
    icon: 'perro_b1_mira',
    steps: [1],
    coins: [25],
    special: true,
    text: () => 'Conocé a tu perro',
    count: (s) => (s.dog.name ? 1 : 0),
    ok: (s) => !s.dog.name && s.jobsDone <= 3,
  },
  area: {
    id: 'area',
    icon: '🏡',
    steps: [1],
    coins: [25],
    special: true,
    text: (s, _n, line) => {
      const job = JOURNEY[line.base ?? 0]
      return job?.kind === 'build' ? `Terminemos ${areaName(job.area, s.name, true)}` : 'Terminemos el área'
    },
    count: (s, _d, line) => (s.jobsDone > (line.base ?? 0) ? 1 : 0),
    ok: (s) => areaEnd(s.jobsDone) >= 0 && areaEnd(s.jobsDone) - s.jobsDone < 2,
  },
}
const ROTATING = ['trabajando', 'todo', 'noche', 'momentos', 'casita', 'obras']

/** The steps for this week: from week 2, the top one is 110% of what you did last week (×days/7). */
function stepsFor(def: LineDef, last: number | null, length: number) {
  const top = def.steps[def.steps.length - 1]
  let factor = last == null ? 1 : Math.min(2, Math.max(0.6, (last * 1.1) / top))
  factor *= length / 7
  const cap = def.days ? Math.max(1, Math.min(6, length - 1)) : Infinity
  const steps: number[] = []
  const coins: number[] = []
  def.steps.forEach((n, i) => {
    const v = Math.min(cap, Math.max(1, Math.round(n * factor)))
    if (steps.length && v <= steps[steps.length - 1]) return
    steps.push(v)
    coins.push(def.coins[i])
  })
  return { steps, coins }
}

function pickWeek(s: GameState, start: string, end: string, no: number): Line[] {
  const length = between(start, end) + 1
  const lastDays = daysFrom(shift(start, -7), shift(start, -1))
  const can = (id: string) => LINES[id].ok?.(s) ?? true
  const make = (id: string): Line => {
    const def = LINES[id]
    const line: Line = { id, steps: def.steps, coins: def.coins, step: 0 }
    // the special "Terminar {área}" stays on the area it was asked for
    if (id === 'area') line.base = areaEnd(s.jobsDone)
    const last = no <= 1 || def.special ? null : def.count(s, lastDays, line)
    return { ...line, ...stepsFor(def, last, length) }
  }
  const ids: string[] = no <= 1 ? ['habitos', 'mates', 'barras', 'trabajando', 'casita'] : ['habitos', 'mates', can('barras') ? 'barras' : 'todo']
  if (no > 1) for (const id of rotate(ROTATING, no)) if (ids.length < 5 && !ids.includes(id) && can(id)) ids.push(id)
  const special = ['perro', 'area'].find(can)
  if (special) ids.push(special)
  else for (const id of rotate(ROTATING, no + 3)) if (ids.length < 6 && !ids.includes(id) && can(id)) ids.push(id)
  return ids.filter((id) => can(id) || no <= 1).map(make)
}

// ---- reading them ---------------------------------------------------------------

export type DailyView = { i: number; pick: DailyPick; def: DailyDef; text: string; level: Level; coins: number; count: number; done: boolean; paid: boolean }
/** `count` is clamped to the step; `total` is the week's whole count. */
export type LineView = { line: Line; def: LineDef; text: string; count: number; total: number; target: number; coins: number; done: boolean; finished: boolean }

export function dailyView(s: GameState): DailyView[] {
  const e = s.encargos
  if (!e) return []
  return e.daily.map((pick, i) => {
    const def = DAILY[pick.id]
    const level = def.level(pick.target)
    const count = Math.min(pick.target, def.count(s, e.day, pick))
    return { i, pick, def, text: def.text(s, pick), level, coins: coinsOf(LEVEL_COINS[level]), count, done: count >= pick.target, paid: e.paid[i] ?? false }
  })
}

export const weekDays = (s: GameState, upTo: string) => {
  const w = s.encargos?.week
  return w ? daysFrom(w.start, upTo < w.end ? upTo : w.end) : []
}

export function lineView(s: GameState, today: string): LineView[] {
  const e = s.encargos
  if (!e) return []
  const days = weekDays(s, today)
  return e.week.lines.map((line) => {
    const def = LINES[line.id]
    const finishedAll = line.step >= line.steps.length
    const target = line.steps[Math.min(line.step, line.steps.length - 1)]
    const total = def.count(s, days, line)
    const count = Math.min(target, total)
    return {
      line,
      def,
      total,
      text: def.text(s, target, line),
      count,
      target,
      coins: coinsOf(line.coins[Math.min(line.step, line.coins.length - 1)]),
      done: !finishedAll && count >= target,
      finished: finishedAll,
    }
  })
}

/** Cumplidos waiting to be cobrados: the tab's badge. */
export const toCobrar = (s: GameState, today: string) =>
  dailyView(s).filter((d) => d.done && !d.paid).length + lineView(s, today).filter((l) => l.done).length

/** Everything cumplido and not cobrado, as herraduras: paid for you when the tanda renews. */
function unpaid(s: GameState, renewDaily: boolean, renewWeek: boolean, today: string) {
  let coins = 0
  if (renewDaily) for (const d of dailyView(s)) if (d.done && !d.paid) coins += d.coins
  if (renewWeek && s.encargos) {
    const days = weekDays(s, today)
    for (const line of s.encargos.week.lines) {
      const count = LINES[line.id].count(s, days, line)
      for (let k = line.step; k < line.steps.length && count >= line.steps[k]; k++) coins += coinsOf(line.coins[k])
    }
  }
  return coins
}

/**
 * The encargos for `day`: on day 0 none (the onboarding is enough); from day 1, today's four
 * and the week's lines. Week 1 is days 1–7; then weeks end on Sunday. Cumplidos not cobrados
 * from the tanda that ends are paid into `kept`.
 */
export function renew(s: GameState, day: string): { encargos: Encargos | null; coins: number } {
  const first = firstDay(s)
  const n = first ? between(first, day) : 0
  const e = s.encargos
  if (n < 1 || e?.day === day) return { encargos: e, coins: 0 }
  const newWeek = !e || day > e.week.end
  // the day before's tanda ends: its weeks' days are counted up to its own end
  const coins = e ? unpaid(s, true, newWeek, e.week.end) : 0
  let week = e?.week
  if (!week || newWeek) {
    const no = (week?.no ?? 0) + 1
    const end = no === 1 ? shift(first!, 7) : shift(day, (7 - weekday(day)) % 7)
    week = { no, start: day, end, lines: pickWeek(s, day, end, no) }
  }
  const daily = pickDaily(s, day, n, e?.daily ?? null)
  return { encargos: { day, daily, paid: daily.map(() => false), week, kept: (e?.kept ?? 0) + coins }, coins }
}

/** Days left in the week, today included ("Quedan 4 días"). */
export const daysLeft = (s: GameState, today: string) => (s.encargos ? between(today, s.encargos.week.end) + 1 : 0)
