import { art } from '../game/content'

// Pieces of Finch's day loop shared by Home and the energy-full sequence.

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

/** Paucho on his way: the mate he set off with, his face moving along the dots, and "?" at the end. */
export function AdventureTrack({ progress }: { progress: number }) {
  const p = Math.max(0, Math.min(1, progress))
  return (
    <div className="track" aria-hidden>
      <img className="track__food" src={art('habit_mate')} alt="" />
      <div className="track__road">
        <span className="track__dots" />
        <img className="track__face" src={art('g_avatar')} alt="" style={{ left: `${p * 100}%` }} />
      </div>
      <span className="track__end">?</span>
    </div>
  )
}
