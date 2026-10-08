import { RideWorld } from '../components/RideWorld'
import { Button } from '../components/ui'
import { ADVENTURE, ADVENTURE_MS } from '../game/content'
import { currentEpisode, useGame } from '../game/store'

/** Countdown: "1:42:05", or "4:05" under an hour. */
export const formatClock = (ms: number) => {
  const s = Math.ceil(ms / 1000)
  const h = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(mm).padStart(2, '0')}:${ss}` : `${mm}:${ss}`
}

/** Wall-clock time Gauchito gets back, e.g. "18:40". */
export const returnTime = (remainingMs: number) =>
  new Date(Date.now() + remainingMs).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

export function AdventureRun({ remainingMs, onHome }: { remainingMs: number; onHome: () => void }) {
  const name = useGame((s) => s.name)
  const episode = useGame(currentEpisode)
  const progress = 1 - remainingMs / ADVENTURE_MS
  const beat = episode.beats[Math.min(episode.beats.length - 1, Math.floor(progress * episode.beats.length))]

  return (
    <div className="screen run">
      <RideWorld />

      <div className="run__text">
        <h1>{name} está de aventura…</h1>
        <p>
          {episode.title} · {ADVENTURE.name}
        </p>
      </div>

      <div className="sheet run__sheet">
        <p key={beat} className="run__beat">
          {beat}
        </p>
        <div className="run__progress">
          <div style={{ width: `${Math.min(100, progress * 100)}%` }} />
        </div>
        <small>
          Vuelve a las {returnTime(remainingMs)} · faltan {formatClock(remainingMs)}
        </small>
        <Button variant="ghost" onClick={onHome}>
          Esperarlo en el rancho
        </Button>
      </div>
    </div>
  )
}
