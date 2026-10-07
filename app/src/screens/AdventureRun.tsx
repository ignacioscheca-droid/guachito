import { Button } from '../components/ui'
import { ADVENTURE, ADVENTURE_MS, art } from '../game/content'
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

const GALLOP = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `ride_${i}`)
const DOG_RUN = [1, 2, 3, 4].map((i) => `dog_run_${i}`)

/** A pampas layer that scrolls forever: the image followed by its mirror, so the seam always matches. */
function Layer({ name, seconds, className = '' }: { name: string; seconds: number; className?: string }) {
  return (
    <div className={`run__layer ${className}`} style={{ animationDuration: `${seconds}s` }}>
      <img src={art(name)} alt="" />
      <img src={art(name)} alt="" className="run__mirror" />
    </div>
  )
}

/** Flip-book: all frames stacked, CSS shows one at a time (no JS timers, all preloaded). */
function FlipBook({ frames, fps, className }: { frames: string[]; fps: number; className: string }) {
  const cycle = frames.length / fps
  return (
    <div className={`flipbook ${className}`}>
      {frames.map((f, i) => (
        <img
          key={f}
          src={art(f)}
          alt=""
          style={{ animationDuration: `${cycle}s`, animationDelay: `${-cycle + i / fps}s` }}
        />
      ))}
    </div>
  )
}

export function AdventureRun({ remainingMs, onHome }: { remainingMs: number; onHome: () => void }) {
  const name = useGame((s) => s.name)
  const episode = useGame(currentEpisode)
  const progress = 1 - remainingMs / ADVENTURE_MS
  const beat = episode.beats[Math.min(episode.beats.length - 1, Math.floor(progress * episode.beats.length))]

  return (
    <div className="screen run">
      <div className="run__world">
        {/* The sky layer's clouds sit at mountain height; it is lifted so they stay above them. */}
        <Layer name="ride_bg_sky" seconds={140} className="run__layer--sky" />
        <Layer name="ride_bg_mountains" seconds={60} />
        <Layer name="ride_bg_fields" seconds={11} />
        <div className="run__riders">
          <FlipBook className="run__dog" frames={DOG_RUN} fps={7} />
          <FlipBook className="run__horse" frames={GALLOP} fps={8} />
        </div>
      </div>

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
