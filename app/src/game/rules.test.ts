// The game's rules, one by one. Names read like the rules (see CLAUDE.md: "Day loop", "Racha").
// Time is the game's own clock (clock.ts) in the device's local day: `npm test` pins TZ to Madrid.
import { beforeEach, describe, expect, it } from 'vitest'
import { setClock } from './clock'
import { dayKey, streak } from './friendship'
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
import {
  actions,
  chargeTarget,
  DEFAULT_PLAN,
  finished,
  getState,
  goalCoins,
  goalOf,
  habitsToday,
  keptDays,
  MAX_TIMES,
  mateDue,
  nextGoal,
  RESCUE_HABITS,
  restingToday,
  skippedToday,
  STREAK_GOALS,
  streakNow,
  TERMO_PRICE,
  TERMOS_MAX,
  timesDone,
  todayKey,
  weekCount,
  workRemainingMs,
} from './store'
import { addDays, DAY0, HABIT_IDS, HOUR, newGame, patch, setTime, tick, timeOf } from '../test/helpers'

const s = getState
const done = (): { status: 'done'; startedAt: null } => ({ status: 'done', startedAt: null })

beforeEach(() => newGame())

describe('the day is the device\'s local day', () => {
  it('changes at local midnight, not at UTC', () => {
    setTime('2026-03-10', 23, 59)
    expect(todayKey()).toBe('2026-03-10')
    setTime('2026-03-11', 0, 1)
    expect(todayKey()).toBe('2026-03-11')
  })
  it('gives consecutive days across the spring and autumn clock changes (Madrid)', () => {
    for (const from of ['2026-03-28', '2026-10-24']) {
      for (let i = 0; i < 3; i++) {
        setTime(addDays(from, i), 23, 30)
        expect(todayKey()).toBe(addDays(from, i))
      }
    }
  })
  it('the test menu\'s dayOffset moves the day a whole day at a time', () => {
    actions.debugNextDay()
    expect(todayKey()).toBe(addDays(DAY0, 1))
    actions.debugMissDay()
    expect(todayKey()).toBe(addDays(DAY0, 3))
  })
})

describe('energy and the bar', () => {
  it('each habit gives 10 energy (the onboarding gift already gave the first)', () => {
    expect(ENERGY_PER_HABIT).toBe(10)
    expect(s().energy).toBe(10)
    expect(actions.completeHabit('agua')).toMatchObject({ energy: 10, coins: 0, full: false })
    expect(s().energy).toBe(20)
  })
  it('the bar asks 30 and one more habit at each of Finch\'s stages (7, 22, 42, 67 jobs)', () => {
    const goals = (n: number) => energyGoal(n)
    expect([goals(0), goals(6)]).toEqual([30, 30])
    expect([goals(7), goals(21)]).toEqual([40, 40])
    expect([goals(22), goals(41)]).toEqual([50, 50])
    expect([goals(42), goals(66)]).toEqual([60, 60])
    expect([goals(67), goals(200)]).toEqual([70, 70])
  })
  it('the third habit fills the bar: +30 herraduras, ready to go, one bar a day', () => {
    const before = s().coins
    const r = actions.completeHabit('agua')
    expect(r.full).toBe(false)
    const full = actions.completeHabit('leer')
    expect(full).toMatchObject({ full: true, coins: FULL_ENERGY_COINS })
    expect(s()).toMatchObject({ energy: 30, work: { status: 'ready' }, lastFullDay: todayKey() })
    expect(s().coins).toBe(before + FULL_ENERGY_COINS)
    expect(restingToday(s())).toBe(false) // ready, not resting: resting is a charging bar already filled today
  })
  it('a bar of 40 (from the 8th job on) needs four habits', () => {
    patch({ jobsDone: 7, energy: 0, completions: {}, lastFullDay: null })
    expect(goalOf(s())).toBe(40)
    tick(3)
    expect(s().work.status).toBe('charging')
    tick(1)
    expect(s()).toMatchObject({ energy: 40, work: { status: 'ready' } })
  })
  it('after the full bar each habit gives 5 herraduras and no energy', () => {
    tick(2)
    expect(s().work.status).toBe('ready')
    const coins = s().coins
    const r = actions.completeHabit('ejercicio')
    expect(r).toMatchObject({ energy: 0, coins: EXTRA_HABIT_COINS, full: false })
    expect(s().coins).toBe(coins + EXTRA_HABIT_COINS)
    expect(s().energy).toBe(30)
  })
  it('the energy never goes past the goal and a habit is never ticked past its times', () => {
    tick(2)
    const again = actions.completeHabit('agua')
    expect(again).toMatchObject({ energy: 0, coins: 0 })
    expect(s().energy).toBe(30)
  })
  it('the next day the bar fills again (one full bar a day)', () => {
    tick(2)
    actions.startWork()
    setTime(addDays(DAY0, 1), 9)
    patch({ work: done() })
    actions.completeJob()
    expect(chargeTarget(s())).toEqual({ goal: 30 })
    tick(3)
    expect(s().work.status).toBe('ready')
    expect(s().lastFullDay).toBe(todayKey())
  })
  it('Paucho does not gather energy while he works: habits give herraduras', () => {
    setTime(DAY0, 21)
    tick(2)
    actions.startWork()
    setTime(addDays(DAY0, 1), 4) // small hours: he is still out (started at 21:00)
    expect(workRemainingMs()).toBeGreaterThan(0)
    const r = actions.completeHabit('agua')
    expect(r).toMatchObject({ energy: 0, coins: EXTRA_HABIT_COINS })
    expect(s().energy).toBe(0)
  })
  it('undoing a tick takes its energy back out while the job has not started', () => {
    actions.completeHabit('agua')
    expect(s().energy).toBe(20)
    actions.uncompleteHabit('agua')
    expect(s().energy).toBe(10)
  })
  it('undoing the tick that filled the bar gives the bar and its 30 herraduras back', () => {
    tick(2)
    const coins = s().coins
    actions.uncompleteHabit('leer')
    expect(s()).toMatchObject({ energy: 20, work: { status: 'charging' }, lastFullDay: null })
    expect(s().coins).toBe(coins - FULL_ENERGY_COINS)
  })
})

describe('chargeTarget: when Paucho gathers energy', () => {
  it('while charging, with a job ahead, until the bar was filled today', () => {
    expect(chargeTarget(s())).toEqual({ goal: 30 })
    tick(2)
    expect(chargeTarget(s())).toBeNull()
  })
  it('not while he works', () => {
    patch({ work: { status: 'working', startedAt: timeOf(DAY0) } })
    expect(chargeTarget(s())).toBeNull()
  })
  it('also while a finished job waits to be seen, for the one after it (with that one\'s goal)', () => {
    patch({ jobsDone: 6, work: done(), lastFullDay: null })
    expect(chargeTarget(s())).toEqual({ goal: energyGoal(7) })
    expect(chargeTarget(s())!.goal).not.toBe(goalOf(s()))
  })
  it('not after the last job of the journey', () => {
    patch({ jobsDone: JOURNEY.length - 1, work: done(), lastFullDay: null })
    expect(chargeTarget(s())).toBeNull()
    patch({ jobsDone: JOURNEY.length, work: { status: 'charging', startedAt: null }, lastFullDay: null })
    expect(chargeTarget(s())).toBeNull()
    expect(actions.completeHabit('agua').coins).toBe(EXTRA_HABIT_COINS)
  })
})

describe('jobs: 8 hours, and a job counts only when seen', () => {
  it('a full bar starts the job: the bar empties and 8 hours start to run', () => {
    tick(2)
    setTime(DAY0, 10)
    actions.startWork()
    expect(s()).toMatchObject({ energy: 0, work: { status: 'working', startedAt: timeOf(DAY0, 10) } })
    expect(WORK_MS).toBe(8 * HOUR)
    expect(workRemainingMs()).toBe(8 * HOUR)
  })
  it('the job lasts 8 hours to the millisecond', () => {
    tick(2)
    setTime(DAY0, 10)
    actions.startWork()
    setClock(timeOf(DAY0, 10) + 8 * HOUR - 1)
    expect(workRemainingMs()).toBe(1)
    setClock(timeOf(DAY0, 10) + 8 * HOUR)
    expect(workRemainingMs()).toBe(0)
  })
  it('the test menu\'s workSkipMs makes it finish sooner', () => {
    tick(2)
    actions.startWork()
    actions.debugFinishWork()
    expect(workRemainingMs()).toBe(0)
  })
  it('startWork does nothing unless the bar is full', () => {
    actions.startWork()
    expect(s().work.status).toBe('charging')
  })
  it('finishing waits to be seen: jobsDone does not move yet', () => {
    tick(2)
    actions.startWork()
    actions.finishWork()
    expect(s()).toMatchObject({ jobsDone: 0, work: { status: 'done' } })
  })
  it('completeJob counts it only when it is done (seen), and only once', () => {
    tick(2)
    actions.completeJob() // ready
    expect(s().jobsDone).toBe(0)
    actions.startWork()
    actions.completeJob() // working
    expect(s().jobsDone).toBe(0)
    actions.finishWork()
    actions.completeJob()
    expect(s()).toMatchObject({ jobsDone: 1, work: { status: 'charging' } })
    actions.completeJob() // already counted
    expect(s().jobsDone).toBe(1)
  })
  it('energy gathered while the finished job waits makes the next one ready the moment it is seen', () => {
    tick(2)
    actions.startWork()
    setTime(addDays(DAY0, 1), 8)
    actions.finishWork()
    const coins = s().coins
    tick(3) // the bar for the job after this one, still unseen
    expect(s()).toMatchObject({ energy: 30, work: { status: 'done' }, lastFullDay: todayKey() })
    expect(s().coins).toBe(coins + FULL_ENERGY_COINS)
    actions.completeJob()
    expect(s()).toMatchObject({ jobsDone: 1, work: { status: 'ready' } })
  })
  it('seeing the first obra opens the Casita, the last of each area opens Áreas and pays AREA_COINS', () => {
    JOURNEY.forEach((job, i) => {
      newGame()
      patch({ jobsDone: i, work: done(), coins: 0, unlocked: ['inicio'], unlockQueue: [] })
      actions.completeJob()
      const lastOfArea =
        job.kind === 'build' && !(JOURNEY[i + 1]?.kind === 'build' && (JOURNEY[i + 1] as { area: number }).area === job.area)
      const expected = (lastOfArea ? AREA_COINS : 0) + (job.kind === 'trip' ? TRIP.coins : 0)
      expect(s().coins, `job ${i}`).toBe(expected)
      expect(s().unlocked.includes('casita'), `job ${i} casita`).toBe(i === 0)
      expect(s().unlocked.includes('areas'), `job ${i} areas`).toBe(lastOfArea)
      expect(s().unlocked.includes('aventuras'), `job ${i} aventuras`).toBe(i + 1 === TRIP_JOB)
    })
  })
  it('La cucha brings the dog', () => {
    const cucha = JOURNEY.findIndex((j) => j.kind === 'build' && j.area === 1 && j.obra === 0)
    patch({ jobsDone: cucha, work: done() })
    expect(s().dog.arrived).toBe(false)
    actions.completeJob()
    expect(s().dog.arrived).toBe(true)
  })
})

describe('the streak: a day counts if its mate was cebado, a habit was done, or it was saved', () => {
  const dayN = (n: number) => addDays(DAY0, n)
  beforeEach(() => {
    // three days kept before today (DAY0 .. DAY0+2), today is DAY0+3
    patch({ completions: { [dayN(0)]: ['agua'], [dayN(1)]: ['agua'], [dayN(2)]: ['agua'] }, mates: [dayN(0), dayN(1), dayN(2)] })
    setTime(dayN(3))
  })
  it('a habit done counts', () => {
    actions.completeHabit('agua')
    expect(streakNow(s())).toBe(4)
  })
  it('the morning mate alone counts', () => {
    expect(mateDue(s())).toBe(true)
    actions.cebarMate()
    expect(mateDue(s())).toBe(false)
    expect(streakNow(s())).toBe(4)
  })
  it('a saved day counts (termo or recalentado) and keeps the chain', () => {
    patch({ savedDays: { [dayN(3)]: 'termo' } })
    setTime(dayN(4))
    actions.cebarMate()
    expect(Object.keys(keptDays(s()))).toContain(dayN(3))
    expect(streakNow(s())).toBe(5)
  })
  it('today is not yet lost when it has nothing: the streak shows yesterday\'s', () => {
    expect(streakNow(s())).toBe(3)
  })
})

describe('missed days: termo, rescue, or starting over', () => {
  // kept DAY0 (the onboarding day, mate + gift habit); the morning that opens is `back`
  const back = (n: number) => {
    setTime(addDays(DAY0, n), 9)
    actions.openDay()
  }
  it('a termo covers one missed day by itself, and the day is saved as "termo"', () => {
    patch({ termos: 1 })
    back(2)
    expect(s().termos).toBe(0)
    expect(s().savedDays).toEqual({ [addDays(DAY0, 1)]: 'termo' })
    expect(s().dayStart).toMatchObject({ termo: [addDays(DAY0, 1)], rescue: null })
    actions.cebarMate()
    expect(streakNow(s())).toBe(3)
  })
  it('TERMOS_MAX termos cover that many days in a row', () => {
    expect(TERMOS_MAX).toBe(2)
    patch({ termos: TERMOS_MAX })
    back(3)
    expect(s().termos).toBe(0)
    expect(Object.keys(s().savedDays)).toHaveLength(2)
    actions.cebarMate()
    expect(streakNow(s())).toBe(4)
  })
  it('more days missed than termos (up to 3) offers a rescue and spends no termo', () => {
    patch({ termos: 1 })
    back(3) // 2 missed
    expect(s().termos).toBe(1)
    expect(s().savedDays).toEqual({})
    expect(s().dayStart?.rescue).toEqual({ missed: [addDays(DAY0, 1), addDays(DAY0, 2)], days: 1, offered: false })
  })
  it('three missed days with two termos is still a rescue (the termos do not cover them)', () => {
    patch({ termos: 2 })
    back(4)
    expect(s().termos).toBe(2)
    expect(s().dayStart?.rescue?.missed).toHaveLength(3)
  })
  it('no termos and one missed day: the rescue', () => {
    back(2)
    expect(s().dayStart?.rescue).toMatchObject({ missed: [addDays(DAY0, 1)], offered: false })
  })
  it(`the third habit of the day recalienta the mate: the missed days count`, () => {
    back(3)
    actions.cebarMate()
    expect(streakNow(s())).toBe(1)
    expect(actions.completeHabit('agua').recalentado).toBeNull()
    expect(actions.completeHabit('leer').recalentado).toBeNull()
    const r = actions.completeHabit('ejercicio')
    expect(RESCUE_HABITS).toBe(3)
    expect(r.recalentado).toBe(4)
    expect(Object.values(s().savedDays)).toEqual(['recalentado', 'recalentado'])
    expect(s().dayStart?.rescue).toBeNull()
    expect(streakNow(s())).toBe(4)
  })
  it('answering "no" starts the streak over', () => {
    back(2)
    actions.answerRescue(false)
    actions.cebarMate()
    expect(s().dayStart?.rescue).toBeNull()
    expect(streakNow(s())).toBe(1)
    tick(3)
    expect(s().savedDays).toEqual({})
  })
  it('answering "yes" marks the rescue as offered and keeps it open', () => {
    back(2)
    actions.answerRescue(true)
    expect(s().dayStart?.rescue).toMatchObject({ offered: true })
  })
  it('more than 3 missed days starts over: Paucho welcomes you back, with no termo spent', () => {
    patch({ termos: 2 })
    back(5) // 4 missed
    expect(s().termos).toBe(2)
    expect(s().dayStart).toMatchObject({ rescue: null, away: 4 })
    actions.welcomedBack()
    expect(s().dayStart?.away).toBe(0)
    actions.cebarMate()
    expect(streakNow(s())).toBe(1)
  })
  it('openDay runs once a day', () => {
    patch({ termos: 1 })
    back(2)
    actions.openDay()
    expect(s().termos).toBe(0)
    expect(Object.keys(s().savedDays)).toHaveLength(1)
  })
  it('nothing is missed when yesterday was kept', () => {
    back(1)
    expect(s().dayStart).toEqual({ day: addDays(DAY0, 1), termo: [], rescue: null })
  })
})

describe('streak goals: 7 → 14 → 30 → 50 → 100 → 365', () => {
  it('is that ladder, and each goal pays its herraduras', () => {
    expect(STREAK_GOALS).toEqual([7, 14, 30, 50, 100, 365])
    expect(STREAK_GOALS.map(goalCoins)).toEqual([50, 100, 150, 200, 300, 500])
    expect(goalCoins(21)).toBe(30)
  })
  it('the next goal is the next rung, then a year further', () => {
    expect(nextGoal(7)).toBe(14)
    expect(nextGoal(100)).toBe(365)
    expect(nextGoal(365)).toBe(730)
  })
  it('reaching the goal pays goalCoins and a termo, and proposes the next goal', () => {
    patch({ coins: 10, termos: 0, streakGoal: 7 })
    actions.reachGoal()
    expect(s()).toMatchObject({ coins: 10 + goalCoins(7), termos: 1, streakGoal: 14 })
  })
  it('a termo from a goal never goes past TERMOS_MAX', () => {
    patch({ termos: TERMOS_MAX, streakGoal: 14 })
    actions.reachGoal()
    expect(s().termos).toBe(TERMOS_MAX)
  })
  it('the termo is sold for TERMO_PRICE, up to TERMOS_MAX', () => {
    expect(TERMO_PRICE).toBe(60)
    patch({ coins: TERMO_PRICE - 1 })
    expect(actions.buyTermo()).toBe(false)
    patch({ coins: 200, termos: 0 })
    expect(actions.buyTermo()).toBe(true)
    expect(s()).toMatchObject({ coins: 200 - TERMO_PRICE, termos: 1 })
    expect(actions.buyTermo()).toBe(true)
    expect(actions.buyTermo()).toBe(false)
    expect(s().termos).toBe(TERMOS_MAX)
  })
})

describe('habit plans: times a day, some days, N a week', () => {
  it('a habit with a plan of 3 times is ticked 3 times, each a whole habit with its 10 energy', () => {
    patch({ energy: 0, work: { status: 'charging', startedAt: null }, completions: {}, lastFullDay: null })
    actions.setPlan('agua', { ...DEFAULT_PLAN, times: 3 })
    actions.completeHabit('agua')
    expect(finished(s(), 'agua')).toBe(false)
    actions.completeHabit('agua')
    expect(s().energy).toBe(20)
    expect(actions.completeHabit('agua')).toMatchObject({ energy: 10, coins: FULL_ENERGY_COINS, full: true })
    expect(timesDone(s(), 'agua')).toBe(3)
    expect(finished(s(), 'agua')).toBe(true)
    // a fourth time does not exist
    expect(actions.completeHabit('agua')).toMatchObject({ energy: 0, coins: 0 })
    expect(timesDone(s(), 'agua')).toBe(3)
  })
  it('times are kept between 1 and MAX_TIMES', () => {
    actions.setPlan('agua', { ...DEFAULT_PLAN, times: 99 })
    expect(s().habitPlans.agua.times).toBe(MAX_TIMES)
    actions.setPlan('agua', { ...DEFAULT_PLAN, times: 0 })
    expect(s().habitPlans.agua.times).toBe(1)
  })
  it('a habit on some days only shows up on those days (0 = Sunday)', () => {
    actions.setPlan('agua', { ...DEFAULT_PLAN, when: { kind: 'days', days: [1, 3] } }) // Monday, Wednesday
    setTime(addDays(DAY0, 0)) // Monday
    expect(habitsToday(s())).toContain('agua')
    setTime(addDays(DAY0, 1)) // Tuesday
    expect(habitsToday(s())).not.toContain('agua')
    setTime(addDays(DAY0, 2)) // Wednesday
    expect(habitsToday(s())).toContain('agua')
  })
  it('a habit N times a week stops being due once the week has them (Monday first)', () => {
    actions.setPlan('agua', { ...DEFAULT_PLAN, when: { kind: 'week', times: 2 } })
    patch({ completions: { [addDays(DAY0, 0)]: ['agua'], [addDays(DAY0, 1)]: ['agua'] } })
    setTime(addDays(DAY0, 2)) // Wednesday
    expect(habitsToday(s())).not.toContain('agua')
    expect(weekCount(s(), 'agua')).toBe(2)
    setTime(addDays(DAY0, 7)) // next Monday: a new week
    expect(habitsToday(s())).toContain('agua')
  })
})

describe('«Hoy no puedo»', () => {
  it('sets the habit aside for today: no energy, and it can come back', () => {
    const energy = s().energy
    actions.skipHabit('agua')
    expect(skippedToday(s())).toEqual(['agua'])
    expect(s().energy).toBe(energy)
    actions.skipHabit('agua', true)
    expect(skippedToday(s())).toEqual([])
  })
  it('does not harm the streak: a day of skips with its mate keeps the chain', () => {
    patch({ completions: { [addDays(DAY0, 0)]: ['agua'], [addDays(DAY0, 1)]: ['agua'] }, mates: [addDays(DAY0, 0), addDays(DAY0, 1)] })
    setTime(addDays(DAY0, 2))
    actions.openDay()
    expect(s().dayStart).toMatchObject({ termo: [], rescue: null })
    for (const id of HABIT_IDS) actions.skipHabit(id)
    actions.cebarMate()
    expect(streakNow(s())).toBe(3)
  })
  it('is only for that day', () => {
    actions.skipHabit('agua')
    setTime(addDays(DAY0, 1))
    expect(skippedToday(s())).toEqual([])
  })
})

describe('the save', () => {
  it('survives export and import unchanged, mid-game', () => {
    tick(2)
    actions.startWork()
    actions.setPlan('agua', { ...DEFAULT_PLAN, times: 2 })
    const raw = actions.exportData()
    expect(actions.importData(raw)).toBe(true)
    expect(JSON.parse(actions.exportData())).toEqual(JSON.parse(raw))
  })
  it('refuses a file that is not a Gauchito save', () => {
    expect(actions.importData('{"version":1}')).toBe(false)
    expect(actions.importData('nope')).toBe(false)
  })
  it('keeps the day string format YYYY-MM-DD', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(streak({ '2026-01-05': ['a'], '2026-01-04': ['a'] }, '2026-01-05')).toBe(2)
  })
})
