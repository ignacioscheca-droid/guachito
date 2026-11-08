// Encargos' rules (Claude Doc "Gauchito — Encargos"): four a day from day 1, six weekly lines,
// every habit after the full bar moves something, cobrar by hand, never 7 of 7.
import { beforeEach, describe, expect, it } from 'vitest'
import { dailyView, LINES, lineView, LEVEL_COINS } from './encargos'
import { actions, encargosToCobrar, getState, navOpen, todayKey } from './store'
import { addDays, DAY0, newGame, setTime, tick } from '../test/helpers'

const s = getState
/** Day n after the onboarding, its mate cebado and its encargos open. */
function day(n: number, hour = 9) {
  setTime(addDays(DAY0, n), hour)
  actions.openDay()
  actions.cebarMate()
  actions.openEncargos()
}
const progress = () => [...dailyView(s()).map((d) => d.count), ...lineView(s(), todayKey(s())).map((l) => l.count)].reduce((a, b) => a + b, 0)

beforeEach(() => newGame())

describe('encargos', () => {
  it('none on day 0; from day 1, four a day and the week, and their tab opens', () => {
    actions.openEncargos()
    expect(s().encargos).toBeNull()
    expect(navOpen(s())).not.toContain('encargos')
    day(1)
    expect(s().encargos?.daily).toHaveLength(4)
    expect(s().encargos?.week.lines.length).toBeGreaterThanOrEqual(5)
    expect(s().unlocked).toContain('encargos')
    expect(s().unlockQueue).toContain('encargos')
  })

  it('day 1 starts with the mate already cumplido, to cobrar by hand once', () => {
    day(1)
    const mate = dailyView(s()).find((d) => d.pick.id === 'mate')!
    expect(mate.done).toBe(true)
    expect(encargosToCobrar(s())).toBeGreaterThanOrEqual(1)
    const coins = s().coins
    expect(actions.cobrarDaily(mate.i)).toBe(LEVEL_COINS.toque)
    expect(s().coins).toBe(coins + LEVEL_COINS.toque)
    expect(actions.cobrarDaily(mate.i)).toBe(0)
  })

  it('every habit after the full bar moves at least one encargo', () => {
    day(1)
    tick(3) // the day's gift was day 0's; three fill the bar
    expect(s().lastFullDay).toBe(todayKey(s()))
    for (let k = 0; k < 3; k++) {
      // a player in the tab cobra what is cumplido: weekly lines move on to their next step
      dailyView(s()).forEach((d) => actions.cobrarDaily(d.i))
      Object.keys(LINES).forEach((id) => actions.cobrarLine(id))
      const before = progress()
      tick(1)
      expect(progress(), `habit ${k + 4}`).toBeGreaterThan(before)
    }
  })

  it('"con Paucho trabajando" never asks more habits than are left after the bar', () => {
    // day 0's gift left 10 energy: two habits fill the bar and none is left after it
    newGame({ habits: ['levantarme', 'agua'] })
    day(1)
    expect(dailyView(s()).some((d) => d.pick.id === 'trabajando')).toBe(false)
  })

  it('a weekly line cobrado moves on to its next step', () => {
    day(1)
    tick(5)
    const line = lineView(s(), todayKey(s())).find((l) => l.line.id === 'habitos')!
    expect(line.done).toBe(true)
    expect(actions.cobrarLine('habitos')).toBe(line.line.coins[0])
    expect(s().encargos?.week.lines.find((l) => l.id === 'habitos')?.step).toBe(1)
  })

  it('cumplidos not cobrados are cobrados for you when the day renews', () => {
    day(1)
    const owed = dailyView(s()).filter((d) => d.done && !d.paid).reduce((n, d) => n + d.coins, 0)
    expect(owed).toBeGreaterThan(0)
    const coins = s().coins
    day(2)
    expect(s().coins).toBe(coins + owed)
    expect(s().encargos?.kept).toBe(owed)
  })

  it('no line asks for 7 days out of 7 (the streak counts days in a row)', () => {
    for (const def of Object.values(LINES)) if (def.days) expect(Math.max(...def.steps), def.id).toBeLessThanOrEqual(6)
    for (let n = 1; n <= 20; n++) {
      day(n)
      tick(4)
      for (const l of s().encargos!.week.lines) if (LINES[l.id].days) expect(Math.max(...l.steps), `day ${n} ${l.id}`).toBeLessThanOrEqual(6)
    }
  })

  it('week 1 is days 1 to 7; then weeks end on Sunday', () => {
    day(1)
    expect(s().encargos?.week).toMatchObject({ no: 1, start: addDays(DAY0, 1), end: addDays(DAY0, 7) })
    day(8)
    const w = s().encargos!.week
    expect(w.no).toBe(2)
    expect(new Date(`${w.end}T12:00:00`).getDay()).toBe(0)
  })

  it('the Mapa tab opens with Áreas', () => {
    expect(navOpen(s())).not.toContain('mapa')
    actions.importData(JSON.stringify({ ...s(), unlocked: [...s().unlocked, 'areas'] }))
    expect(navOpen(s())).toContain('mapa')
  })
})
