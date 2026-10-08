import { art } from '../game/content'

// Gauchito out on the pampas: scrolling layers and the gallop flip-book (the adventure's world).

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

/** `dog`: the dog runs along (the adventure screen); at home he stays behind. */
export function RideWorld({ dog = true, className = '' }: { dog?: boolean; className?: string }) {
  return (
    <div className={`run__world ${className}`}>
      {/* The sky layer's clouds sit at mountain height; it is lifted so they stay above them. */}
      <Layer name="ride_bg_sky" seconds={140} className="run__layer--sky" />
      <Layer name="ride_bg_mountains" seconds={60} />
      <Layer name="ride_bg_fields" seconds={11} />
      <div className="run__riders">
        {dog && <FlipBook className="run__dog" frames={DOG_RUN} fps={7} />}
        <FlipBook className="run__horse" frames={GALLOP} fps={8} />
      </div>
    </div>
  )
}
