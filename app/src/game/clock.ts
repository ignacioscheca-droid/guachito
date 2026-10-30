// The game's only clock: store.ts reads the time here, so tests can move it.
let override: (() => number) | null = null

/** Milliseconds since the epoch (the real clock unless a test set its own). */
export const now = () => (override ? override() : Date.now())

/** Test-only: a fixed time (ms), a function, or null to go back to the real clock. */
export function setClock(t: number | (() => number) | null) {
  override = t == null ? null : typeof t === 'number' ? () => t : t
}
