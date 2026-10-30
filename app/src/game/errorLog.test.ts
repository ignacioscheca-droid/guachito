import { beforeEach, describe, expect, it } from 'vitest'
import { setClock } from './clock'
import { clearErrors, ERROR_LIMIT, errorLogAsText, logError, logNote, postErrorLogToWorker, readErrors, setErrorScreen, trimStack } from './errorLog'
import { newGame, tick, timeOf } from '../test/helpers'

beforeEach(() => {
  newGame()
  clearErrors()
  setErrorScreen('inicio')
})

describe('error log', () => {
  it('keeps the last 30 entries, newest last', () => {
    for (let i = 0; i < ERROR_LIMIT + 5; i++) {
      setClock(timeOf('2026-03-02', 10) + i * 10_000)
      logError('error', `boom ${i}`)
    }
    const list = readErrors()
    expect(list).toHaveLength(ERROR_LIMIT)
    expect(list[0].message).toBe('boom 5')
    expect(list[list.length - 1].message).toBe(`boom ${ERROR_LIMIT + 4}`)
  })
  it('is saved on the device under its own key', () => {
    logError('rejection', 'nope')
    expect(JSON.parse(localStorage.getItem('gauchito.v2.errors')!)).toHaveLength(1)
  })
  it('notes where it happened and how the game stood', () => {
    tick(1)
    setErrorScreen('casita')
    logError('error', 'x')
    expect(readErrors()[0]).toMatchObject({ screen: 'casita', kind: 'error', state: { day: '2026-03-02', energy: '20/30', work: 'charging', coins: 0, jobsDone: 0, streak: 1 } })
  })
  it('the same failure twice in a row is one entry', () => {
    logError('react', 'render broke')
    logError('react', 'render broke')
    expect(readErrors()).toHaveLength(1)
  })
  it('trims long messages and stacks', () => {
    logError('error', 'm'.repeat(1000), Array.from({ length: 30 }, () => 'at f'.repeat(100)).join('\n'))
    const e = readErrors()[0]
    expect(e.message).toHaveLength(300)
    expect(e.stack.split('\n')).toHaveLength(8)
    expect(trimStack(null)).toBe('')
  })
  it('a note from the test menu is an entry of its own kind', () => {
    logNote('  el botón se corta  ')
    expect(readErrors()[0]).toMatchObject({ kind: 'note', message: 'el botón se corta' })
  })
  it('copies as readable text', () => {
    logNote('algo se ve mal')
    const text = errorLogAsText()
    expect(text).toContain('errores (1)')
    expect(text).toContain('Nota · inicio · algo se ve mal')
    expect(text).toContain('energía 10/30')
  })
  it('clears', () => {
    logNote('a')
    clearErrors()
    expect(readErrors()).toEqual([])
    expect(JSON.parse(localStorage.getItem('gauchito.v2.errors')!)).toEqual([])
  })
  it('sends nothing: the worker is not wired yet', async () => {
    logNote('a')
    expect(await postErrorLogToWorker()).toBe(false)
  })
})
