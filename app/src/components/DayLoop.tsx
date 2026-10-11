import type { ReactNode } from 'react'
import { art } from '../game/content'

// Pieces of the day loop shared by Home and the energy-full sequence.

/** "¡Sos un genio! · ¡Primera vez que lo completás!": the dark toast after ticking a habit. */
export function HabitToast({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="htoast" role="status">
      <img className="htoast__face" src={art('g_avatar')} alt="" />
      <div>
        <strong>{title}</strong>
        <small>{sub}</small>
      </div>
    </div>
  )
}

/** The eight hours: what he set off with, his face moving along the dots, what waits at the end. */
export function WorkTrack({ progress, start, end }: { progress: number; start: ReactNode; end: ReactNode }) {
  const p = Math.max(0, Math.min(1, progress))
  return (
    <div className="track" aria-hidden>
      <span className="track__food track__emoji">{start}</span>
      <div className="track__road">
        <span className="track__dots" />
        <img className="track__face" src={art('g_avatar')} alt="" style={{ left: `${p * 100}%` }} />
      </div>
      <span className="track__end track__end--soft">{end}</span>
    </div>
  )
}
