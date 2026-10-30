// Plays ~60 days of several kinds of player, many seeds, through the real actions (the same
// order the app calls them in: openDay → mate → see the finished job → habits → start the job),
// checking the invariants after every action; and prints a pacing report from the steady player.
import { describe, expect, it } from 'vitest'
import { AREA_COINS, AREAS, energyGoal, JOURNEY, TRIP, TRIP_JOB } from './journey'
import { priceOf, ROOM_SLOTS } from './room'
import { CLOTHES } from './shop'
import {
  actions,
  chargeTarget,
  getState,
  goalCoins,
  goalOf,
  habitsToday,
  MAX_TIMES,
  mateDue,
  nextGoal,
  roomLock,
  skippedToday,
  STREAK_GOALS,
  streakNow,
  TERMO_PRICE,
  TERMOS_MAX,
  todayKey,
  workRemainingMs,
  type GameState,
} from './store'
import { setClock } from './clock'
import { addDays, DAY0, newGame, timeOf } from '../test/helpers'

// ---- tunable constants --------------------------------------------------
// Pacing ranges (soft assertions) for a steady player: all habits, twice a day, 60 days.
// Tune these when the economy changes: they are the numbers the owner is happy with today.
const PACING = {
  /** Day index (0 = onboarding day) on which the area is finished and seen. One obra a day, so
   * Área 1 (3 obras) closes on day 2-3 and Área 2 (3 obras) on day 5-6. */
  area1Day: [2, 3],
  area2Day: [5, 6],
  /** Whole journey (3 + 3 obras, the trip, 3 obras = 10 jobs): one job a day. */
  journeyEndDay: [9, 11],
  /** Herraduras earned in the first week: 7 days × (30 for the bar + 4 habits × 5) = 350, plus the
   * prizes it meets (2 areas × 50, the trip 50, the 7-day goal 50) = 550. */
  firstWeekEarned: [450, 650],
  /** A normal day, prizes aside: 7 habits = 30 + 4×5 = 50 while a job is ahead, 7×5 = 35 after the last. */
  dayWhileJourney: [45, 55],
  dayAfterJourney: [30, 40],
  /** Days with nothing new (no job seen, no tab, no goal) among days 1-13: the journey is one new thing a day. */
  quietDaysFirst14: [1, 5],
}
const SEEDS = 25
const DAYS = 60

// ---- seeded random --------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
type Rng = () => number
const chance = (rng: Rng, p: number) => rng() < p
const between = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))

// ---- player profiles --------------------------------------------------------
type Session = { hour: number; /** habits to tick; 'all' or 'fill' (just enough for the bar) */ ticks: number | 'all' | 'fill' }
type Profile = {
  name: string
  sessions: (day: number, rng: Rng) => Session[]
  /** Chance to leave the morning mate screen without cebar */
  skipMate?: number
  /** Chance to start a full bar's job at once (else at the next session) */
  startNow?: number
  shops?: boolean
  chaos?: boolean
}

const steady: Profile = {
  name: 'steady (everything, twice a day)',
  sessions: () => [
    { hour: 8, ticks: 3 },
    { hour: 20, ticks: 'all' },
  ],
  startNow: 1,
}
const minimum: Profile = {
  name: 'minimum (one visit at night, just enough)',
  sessions: () => [{ hour: 22, ticks: 'fill' }],
  startNow: 1,
}
const erratic: Profile = {
  name: 'erratic (random days, hours, amounts, undo, skips, plans)',
  sessions: (_d, rng) => {
    if (!chance(rng, 0.65)) return []
    const n = between(rng, 1, 3)
    return Array.from({ length: n }, () => ({ hour: between(rng, 6, 23), ticks: between(rng, 0, 6) })).sort((a, b) => a.hour - b.hour)
  },
  skipMate: 0.15,
  startNow: 0.7,
  shops: true,
  chaos: true,
}
/** Steady for three weeks, gone a week, then back. */
const vacation: Profile = {
  name: 'vacation (steady, gone for 7 days from day 21)',
  sessions: (d) => (d >= 21 && d < 28 ? [] : [{ hour: 9, ticks: 'all' }]),
  startNow: 1,
  shops: true,
}
/** Gaps of 1-4 days now and then: termos, rescues and welcome-backs. */
const gappy: Profile = {
  name: 'gappy (misses 1-4 days every ~8)',
  sessions: (d, rng) => (gapUntil(d, rng) ? [] : [{ hour: between(rng, 7, 22), ticks: between(rng, 1, 5) }]),
  startNow: 1,
  shops: true,
}
let gap = { from: -1, to: -1 }
function gapUntil(d: number, rng: Rng) {
  if (d === 0) gap = { from: -1, to: -1 }
  if (d >= gap.from && d <= gap.to) return true
  if (d > gap.to && chance(rng, 1 / 8)) {
    gap = { from: d, to: d + between(rng, 1, 4) - 1 }
    return true
  }
  return false
}
const PROFILES = [steady, minimum, erratic, vacation, gappy]

// ---- a reference streak, written apart from the game's -------------------------------
function referenceStreak(s: GameState, today: string) {
  const kept = new Set<string>()
  for (const [d, ids] of Object.entries(s.completions)) if (ids.length) kept.add(d)
  for (const d of s.mates) kept.add(d)
  for (const d of Object.keys(s.savedDays)) kept.add(d)
  let d = kept.has(today) ? today : addDays(today, -1)
  let n = 0
  while (kept.has(d)) {
    n++
    d = addDays(d, -1)
  }
  return n
}

/** What the runs actually reached, so a green test cannot hide a branch nobody played. */
const reached = { termo: 0, rescue: 0, recalentado: 0, away: 0, goal: 0, undo: 0, skip: 0, trip: 0, area: 0, buyRoom: 0, buyTermo: 0 }

// ---- the run ---------------------------------------------------------------------
type DayLog = { day: number; jobsDone: number; coins: number; streak: number; events: number }
type Run = {
  log: DayLog[]
  earned: number[] // herraduras earned per day (no spending)
  jobSeenDay: number[] // day index on which job i was seen
  final: GameState
  fills: number
  started: number
  completed: number
  coins: number
}

function play(profile: Profile, seed: number, days = DAYS): Run {
  const rng = mulberry32(seed * 7919 + 13)
  const start = DAY0
  newGame({ day: start, hour: 9 })
  const s = getState
  let t = 0 // distinct ms for every action (custom habit ids come from the clock)
  const stamp = (day: string, hour: number) => setClock(timeOf(day, hour) + ++t)

  // ledger, kept apart from the state: every action says what it must have done to the herraduras
  let ledger = s().coins
  let started = 0
  let completed = 0
  let fills = 0
  let events = 0
  const ticksLog: Record<string, { id: string; coins: number; energy: number }[]> = {}
  const fullsByDay: Record<string, number> = {}
  const fail = (msg: string) => {
    throw new Error(`[${profile.name} seed ${seed} day ${todayKey()}] ${msg}`)
  }
  ticksLog[todayKey()] = [{ id: 'levantarme', coins: 0, energy: 10 }] // the onboarding gift

  const check = (what: string) => {
    const g = s()
    const here = `after ${what}`
    if (!Number.isInteger(g.coins) || g.coins < 0) fail(`herraduras ${g.coins} ${here}`)
    if (g.coins !== ledger) fail(`ledger says ${ledger}, state has ${g.coins} ${here}`)
    if (g.energy < 0 || g.energy > 70) fail(`energy ${g.energy} ${here}`)
    if (g.termos < 0 || g.termos > TERMOS_MAX) fail(`termos ${g.termos} ${here}`)
    if (g.jobsDone < 0 || g.jobsDone > JOURNEY.length) fail(`jobsDone ${g.jobsDone} ${here}`)
    const w = g.work
    if ((w.status === 'working') !== (w.startedAt != null)) fail(`work ${JSON.stringify(w)} ${here}`)
    if (w.status === 'ready' && g.energy < goalOf(g)) fail(`ready with ${g.energy}/${goalOf(g)} ${here}`)
    const inFlight = w.status === 'working' || w.status === 'done' ? 1 : 0
    if (started - completed !== inFlight || (w.status === 'ready' && started !== completed)) {
      fail(`jobs started ${started}, seen ${completed}, status ${w.status} ${here}`)
    }
    if (completed !== g.jobsDone) fail(`seen ${completed} but jobsDone ${g.jobsDone} ${here}`)
    if (!g.unlocked.includes('inicio') || g.unlockQueue.some((u) => !g.unlocked.includes(u))) fail(`unlocks ${here}`)
    for (const [d, ids] of Object.entries(g.completions)) {
      for (const id of new Set(ids)) if (ids.filter((x) => x === id).length > MAX_TIMES) fail(`${id} too many times on ${d} ${here}`)
    }
    if (g.streakGoal != null && !(g.streakGoal > 0)) fail(`goal ${g.streakGoal} ${here}`)
    if (streakNow(g) !== referenceStreak(g, todayKey(g))) fail(`streak ${streakNow(g)} vs reference ${referenceStreak(g, todayKey(g))} ${here}`)
  }

  const tickOne = (id: string) => {
    const before = s()
    const day = todayKey(before)
    const times = before.habitPlans[id]?.times ?? 1
    const had = (before.completions[day] ?? []).filter((h) => h === id).length
    const target = chargeTarget(before, day)
    const goal = target?.goal ?? goalOf(before)
    const r = actions.completeHabit(id)
    if (had >= times) {
      if (r.energy || r.coins) fail(`over-ticked ${id} gave ${JSON.stringify(r)}`)
      return
    }
    const wantEnergy = target ? Math.min(10, goal - before.energy) : 0
    const full = target != null && before.energy + 10 >= goal
    const wantCoins = full ? 30 : target ? 0 : 5
    if (r.energy !== wantEnergy || r.coins !== wantCoins || r.full !== full) fail(`tick ${id}: got ${JSON.stringify(r)}, wanted energy ${wantEnergy} coins ${wantCoins} full ${full}`)
    if (r.recalentado) reached.recalentado++
    ledger += wantCoins
    if (full) {
      fills++
      fullsByDay[day] = (fullsByDay[day] ?? 0) + 1
      if (fullsByDay[day] > 1) fail('two full bars in a day')
    }
    ;(ticksLog[day] ??= []).push({ id, coins: wantCoins, energy: wantEnergy })
    if (s().energy !== before.energy + wantEnergy) fail(`energy ${before.energy} + ${wantEnergy} ≠ ${s().energy}`)
    check(`tick ${id}`)
  }

  const undoOne = () => {
    const day = todayKey()
    const log = ticksLog[day] ?? []
    // the onboarding gift is ticked like any other
    const mine = log[log.length - 1]
    if (!mine) return
    const before = s()
    actions.uncompleteHabit(mine.id)
    reached.undo++
    log.pop()
    ledger = Math.max(0, ledger - mine.coins)
    if (before.coins - mine.coins < 0 && s().coins !== 0) fail('undo went below zero')
    // the bar was unfilled: it can be filled again today
    if (mine.coins === 30 && s().lastFullDay !== day) {
      fullsByDay[day]--
      fills--
    }
    check(`undo ${mine.id}`)
  }

  const seeJob = () => {
    const before = s()
    if (before.work.status !== 'done') return
    const idx = before.jobsDone
    const job = JOURNEY[idx]
    const lastOfArea = job.kind === 'build' && !(JOURNEY[idx + 1]?.kind === 'build' && (JOURNEY[idx + 1] as { area: number }).area === job.area)
    ledger += (lastOfArea ? AREA_COINS : 0) + (job.kind === 'trip' ? TRIP.coins : 0)
    actions.completeJob()
    completed++
    events++
    if (job.kind === 'trip') reached.trip++
    if (lastOfArea) reached.area++
    jobSeen[idx] = dayIdx
    check(`see job ${idx}`)
    actions.completeJob() // seen twice by a double tap: no effect
    if (s().jobsDone !== idx + 1) fail('a job was counted twice')
  }

  const startIfReady = () => {
    if (s().work.status !== 'ready') return
    actions.startWork()
    started++
    check('start work')
  }

  const openApp = (skipMate: boolean) => {
    // the clock of the app: a job whose eight hours are up is marked done
    if (s().work.status === 'working' && workRemainingMs() === 0) {
      actions.finishWork()
      check('finish work')
    }
    if (mateDue(s())) {
      actions.openDay()
      const ds = s().dayStart
      if (ds?.termo.length) reached.termo++
      if (ds?.rescue) reached.rescue++
      if (ds?.away) reached.away++
      if (ds?.away) actions.welcomedBack()
      else if (ds?.rescue && !ds.rescue.offered) actions.answerRescue(chance(rng, 0.85))
      check('open day')
      if (skipMate) return
      const before = s()
      const days = referenceStreak({ ...before, mates: [...before.mates, todayKey(before)] }, todayKey(before))
      actions.cebarMate()
      if (before.streakGoal && days >= before.streakGoal) {
        const goal = before.streakGoal
        ledger += goalCoins(goal)
        const termosBefore = before.termos
        actions.reachGoal()
        events++
        reached.goal++
        if (s().termos !== Math.min(TERMOS_MAX, termosBefore + 1)) fail('goal termo')
        if (s().streakGoal !== nextGoal(goal)) fail('next goal')
      }
      check('cebar mate')
    }
    seeJob()
    startIfReady()
  }

  const shop = () => {
    if (s().termos < TERMOS_MAX && s().coins >= TERMO_PRICE && chance(rng, 0.3)) {
      if (!actions.buyTermo()) fail('buyTermo refused')
      ledger -= TERMO_PRICE
      reached.buyTermo++
      check('buy termo')
    }
    const g = s()
    if (g.unlocked.includes('casita')) {
      const options = ROOM_SLOTS.flatMap((sl) => sl.options)
        .filter((o) => !g.room.includes(o.id) && !roomLock(g, o) && priceOf(o) <= g.coins)
        .sort((a, b) => priceOf(a) - priceOf(b))
      if (options.length && chance(rng, 0.5)) {
        if (!actions.buyRoom(options[0].id)) fail('buyRoom refused an affordable option')
        ledger -= priceOf(options[0])
        reached.buyRoom++
        check('buy room')
      }
    }
    const h = s()
    const c = CLOTHES.find((x) => !h.clothes.includes(x.id) && !(x.south && h.jobsDone <= TRIP_JOB) && x.price <= h.coins)
    if (c && chance(rng, 0.2)) {
      if (!actions.buyClothes(c.id)) fail('buyClothes refused')
      ledger -= c.price
      check('buy clothes')
    }
  }

  const chaos = () => {
    const g = s()
    const r = rng()
    if (r < 0.15) {
      actions.skipHabit(g.habits[between(rng, 0, g.habits.length - 1)], chance(rng, 0.3))
      reached.skip++
    }
    else if (r < 0.3) {
      const id = g.habits[between(rng, 0, g.habits.length - 1)]
      const kind = between(rng, 0, 2)
      actions.setPlan(id, {
        times: between(rng, 0, 12),
        moment: 'any',
        when: kind === 0 ? { kind: 'daily' } : kind === 1 ? { kind: 'days', days: [0, 1, 2, 3, 4, 5, 6].filter(() => chance(rng, 0.6)) } : { kind: 'week', times: between(rng, 1, 5) },
      })
    } else if (r < 0.4) actions.addHabit('Extra', '⭐', chance(rng, 0.3))
    else if (r < 0.5 && g.habits.length > 3) actions.removeHabit(g.habits[between(rng, 1, g.habits.length - 1)])
    else if (r < 0.6) undoOne()
    check('chaos')
  }

  const jobSeen: number[] = []
  let dayIdx = 0
  const earned: number[] = []
  const log: DayLog[] = []
  const recent = [streakNow(s())]
  let prevSaved = 0

  // the onboarding day: the mate was cebado at the start, the gift is already ticked
  check('onboarding')

  for (dayIdx = 0; dayIdx < days; dayIdx++) {
    const day = addDays(start, dayIdx)
    const sessions = dayIdx === 0 ? [{ hour: 10, ticks: 'all' as const }] : profile.sessions(dayIdx, rng)
    const unlockedBefore = s().unlocked.length
    const ledgerBefore = ledger
    if (dayIdx > 0) ticksLog[day] = []
    let spent = 0
    for (const se of sessions) {
      stamp(day, se.hour)
      openApp(!!profile.skipMate && chance(rng, profile.skipMate))
      const g0 = s()
      if (g0.onboarded && todayKey(g0) !== day) fail('clock out of step')
      let n: number
      if (se.ticks === 'all') n = 99
      else if (se.ticks === 'fill') n = Math.max(1, Math.ceil(((chargeTarget(g0)?.goal ?? goalOf(g0)) - g0.energy) / 10))
      else n = se.ticks
      for (let i = 0; i < n; i++) {
        const g = s()
        const open = habitsToday(g).filter((id) => !skippedToday(g).includes(id) && (g.completions[todayKey(g)] ?? []).filter((h) => h === id).length < (g.habitPlans[id]?.times ?? 1))
        if (!open.length) break
        stamp(day, se.hour)
        tickOne(open[0])
        if (chance(rng, profile.startNow ?? 1)) startIfReady()
        if (profile.chaos && chance(rng, 0.2)) chaos()
      }
      if (profile.shops) {
        const c0 = ledger
        shop()
        spent += c0 - ledger
      }
      if (profile.chaos) chaos()
      startIfReady()
    }
    stamp(day, 23)
    check('end of day')

    // streak: never up by more than one a day, except a termo or a recalentar adds the days it
    // saved (and a recalentar brings back a streak that read 0 while the player was away: at
    // most 3 days, so the peak of the last 5 days is what it can return to)
    const nowStreak = streakNow(s())
    const savedNow = Object.keys(s().savedDays).length
    recent.push(nowStreak)
    const base = Math.max(...recent.slice(-6, -1), 0)
    if (nowStreak > base + 1 + (savedNow - prevSaved)) fail(`streak jumped ${recent[recent.length - 2]} → ${nowStreak} (saved ${savedNow - prevSaved})`)
    if (savedNow === prevSaved && nowStreak > (recent[recent.length - 2] ?? 0) + 1) fail(`streak jumped ${recent[recent.length - 2]} → ${nowStreak} with nothing saved`)
    prevSaved = savedNow

    // the save always survives a round trip
    const raw = actions.exportData()
    if (!actions.importData(raw)) fail('own save refused')
    expect(JSON.parse(actions.exportData())).toEqual(JSON.parse(raw))

    if (s().unlocked.length > unlockedBefore) events++
    earned.push(ledger - ledgerBefore + spent)
    log.push({ day: dayIdx, jobsDone: s().jobsDone, coins: s().coins, streak: nowStreak, events })
  }
  // the end of the run: jobs started, seen and in flight add up
  const g = s()
  const inFlight = g.work.status === 'working' || g.work.status === 'done' ? 1 : 0
  expect(started - completed).toBe(inFlight)
  expect(g.jobsDone).toBe(completed)
  return { log, earned, jobSeenDay: jobSeen, final: g, fills, started, completed, coins: g.coins }
}

describe('simulation: invariants over many seeds', () => {
  for (const profile of PROFILES) {
    it(`${profile.name}: ${SEEDS} seeds × ${DAYS} days, no broken rule`, () => {
      let jobs = 0
      for (let seed = 1; seed <= SEEDS; seed++) {
        const run = play(profile, seed)
        jobs += run.completed
      }
      expect(jobs).toBeGreaterThan(0)
    })
  }
  it('the runs reached every branch of the streak, the journey and the shop', () => {
    expect(Object.entries(reached).filter(([, n]) => n === 0).map(([k]) => k)).toEqual([])
  })
  it('is deterministic: the same seed plays the same game', () => {
    const a = play(erratic, 3)
    const b = play(erratic, 3)
    expect(b.log).toEqual(a.log)
  })
})

// ---- the pacing report -------------------------------------------------------------
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]

describe('pacing report (steady player)', () => {
  it('prints how the economy and the journey pace out, and keeps it inside the tunable ranges', () => {
    const run = play({ ...steady, shops: false }, 1)
    const min = play({ ...minimum, shops: false }, 1)
    const area1 = run.jobSeenDay[AREAS[0].obras.length - 1]
    const area2 = run.jobSeenDay[AREAS[0].obras.length + AREAS[1].obras.length - 1]
    const end = run.jobSeenDay[JOURNEY.length - 1]
    const week = (w: number) => run.earned.slice(w * 7, w * 7 + 7).reduce((a, b) => a + b, 0)
    // a day is "quiet" when no job was seen, no tab opened and no streak goal was met
    const quiet = (from: number, to: number) => {
      let n = 0
      for (let d = from; d < to; d++) if (run.log[d].events === run.log[d - 1].events) n++
      return n
    }
    const coinItems = ROOM_SLOTS.flatMap((sl) => sl.options).filter((o) => o.source.kind === 'coins')
    const prices = coinItems.map(priceOf).sort((a, b) => a - b)
    const total = prices.reduce((a, b) => a + b, 0)
    const clothes = CLOTHES.reduce((a, c) => a + c.price, 0)
    // a day's herraduras without the prizes (area, trip, goal) = the median day
    const onJourney = median(run.earned.slice(1, end))
    const afterJourney = median(run.earned.slice(end + 1))
    const days = (price: number, perDay: number) => Math.ceil(price / perDay)
    const last = run.log[run.log.length - 1]
    console.log(
      [
        '',
        '── Pacing report: steady player (every habit, 8:00 and 20:00), 60 days ──',
        `Jobs: ${JOURNEY.length} (areas ${AREAS.map((a) => a.obras.length).join(' + ')}; the trip is job ${TRIP_JOB + 1}). Bar: ${energyGoal(0)} to start, ${energyGoal(7)} from job 8.`,
        `Day each job is seen (0 = onboarding day): ${run.jobSeenDay.map((d, i) => `#${i + 1}→${d}`).join('  ')}`,
        `Área 1 finished: day ${area1}.  Área 2 finished: day ${area2}.  Journey ends: day ${end}.`,
        `Herraduras earned by week: ${[0, 1, 2, 3].map((w) => `W${w + 1} ${week(w)}`).join('  ')}`,
        `  a normal day while the journey runs: ${onJourney}; once it is over (the bar no longer pays 30): ${afterJourney}`,
        `  week 1 is the one-week test: prizes included (areas ${AREA_COINS} each, trip ${TRIP.coins}, goal ${goalCoins(7)})`,
        `Prices: bed 30 (forced, day 0) · termo ${TERMO_PRICE}: ${days(TERMO_PRICE, onJourney)} day(s) while the journey runs`,
        `Room items for herraduras: ${coinItems.length}, ${prices[0]}-${prices[prices.length - 1]} each (median ${median(prices)}), ${total} in all; clothes ${clothes}`,
        `  cheapest ${prices[0]}: ${days(prices[0], onJourney)} d · median: ${days(median(prices), onJourney)} d · dearest ${prices[prices.length - 1]}: ${days(prices[prices.length - 1], onJourney)} d (journey pace)`,
        `  everything: ${days(total + clothes, onJourney)} d at journey pace, ${days(total + clothes, afterJourney)} d at post-journey pace`,
        `Days with nothing new: first 14 days ${quiet(1, 14)} of 13 · days 14-59 ${quiet(14, 60)} of 46`,
        `Streak goals met: ${STREAK_GOALS.filter((g) => g <= last.streak).join(', ')} · final streak ${last.streak} · jobsDone ${run.final.jobsDone}/${JOURNEY.length} · herraduras ${run.coins}`,
        `Minimum player (one visit at 22:00, just enough habits): Área 1 day ${min.jobSeenDay[2]}, Área 2 day ${min.jobSeenDay[5]}, journey ends day ${min.jobSeenDay[JOURNEY.length - 1]}, herraduras in week 1: ${min.earned.slice(0, 7).reduce((a, b) => a + b, 0)}`,
        '',
      ].join('\n'),
    )

    // soft assertions on the tunable ranges at the top of the file
    const within = (label: string, v: number, [lo, hi]: number[]) => {
      expect(v, label).toBeGreaterThanOrEqual(lo)
      expect(v, label).toBeLessThanOrEqual(hi)
    }
    within('Área 1 day', area1, PACING.area1Day)
    within('Área 2 day', area2, PACING.area2Day)
    within('journey end day', end, PACING.journeyEndDay)
    within('first week earned', week(0), PACING.firstWeekEarned)
    within('quiet days in the first 14', quiet(1, 14), PACING.quietDaysFirst14)
    within('herraduras a normal day on the journey', onJourney, PACING.dayWhileJourney)
    within('herraduras a normal day after the journey', afterJourney, PACING.dayAfterJourney)
  })
})
