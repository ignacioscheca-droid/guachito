import { RideWorld } from '../components/RideWorld'
import { Button } from '../components/ui'
import { TRIP, WORK_MS } from '../game/journey'
import { useGame } from '../game/store'

/** Countdown: "1:42:05", or "4:05" under an hour. */
export const formatClock = (ms: number) => {
  const s = Math.ceil(ms / 1000)
  const h = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(mm).padStart(2, '0')}:${ss}` : `${mm}:${ss}`
}

/** Wall-clock time he is back, e.g. "18:40". */
export const returnTime = (remainingMs: number) =>
  new Date(Date.now() + remainingMs).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** Paucho riding south: the pampas going by and how the trip is going. */
export function TripRun({ remainingMs, onHome }: { remainingMs: number; onHome: () => void }) {
  const name = useGame((s) => s.name)
  const dog = useGame((s) => s.dog.arrived)
  const progress = 1 - remainingMs / WORK_MS
  const beat = TRIP.beats[Math.min(TRIP.beats.length - 1, Math.floor(progress * TRIP.beats.length))]

  return (
    <div className="screen run">
      <RideWorld dog={dog} />

      <div className="run__text">
        <h1>{name} está de viaje…</h1>
        <p>
          {TRIP.name} · busca {TRIP.brings}
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
          Esperarlo en casa
        </Button>
      </div>
    </div>
  )
}
