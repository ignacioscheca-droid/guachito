import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Button } from '../components/ui'
import { art } from '../game/content'

// The three screens that open day 1, after the starter plan (Finch's 32-34).

/** "¡Jueves genial!": one alliteration per weekday (Sunday first, like Date.getDay). */
const DAY_TITLES = [
  '¡Domingo dorado!',
  '¡Lunes luminoso!',
  '¡Martes maravilloso!',
  '¡Miércoles magnífico!',
  '¡Jueves genial!',
  '¡Viernes vibrante!',
  '¡Sábado soñado!',
]
const DAY_INITIALS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

/** Day 1's card: a gentle reminder and what today is about. */
export function DayOneCard({ companion, onNext }: { companion: string; onNext: () => void }) {
  return (
    <div className="screen d1">
      <p className="d1-kicker">Día 1</p>
      <h2 className="d1-day">{DAY_TITLES[new Date().getDay()]}</h2>
      <figure className="d1-card">
        <img src={art('ill_onboarding')} alt="" />
        <figcaption>
          <small>Un recordatorio amable</small>
          Un poquito <em>cada día</em> también es avanzar.
        </figcaption>
      </figure>
      <div className="d1-bolt" aria-hidden>
        ⚡
      </div>
      <p className="d1-text">Ayudá a {companion} a juntar toda la energía hoy para que construya su casita.</p>
      <div className="d1-foot">
        <Button variant="light" onClick={onNext}>
          Empezar hoy
        </Button>
      </div>
    </div>
  )
}

/** Four-point sparkle, in a 24×24 box. */
const SPARKLE = 'M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z'
/** A yerba leaf, centred on 0,0. */
const LEAF = 'M0-20C10-8 9 8 0 20C-9 8-10-8 0-20Z'
/** A wisp of steam, rising from 0,0. */
const WISP = 'M0 0C-9-10 9-18 0-28C-9-38 7-46 0-56'

/** Seeded scatter, so every viewing throws the same leaves (and React renders stay pure). */
function scatter<T>(n: number, seed: number, make: (r: () => number, i: number) => T): T[] {
  let x = seed
  const r = () => {
    x = (x * 16807) % 2147483647
    return (x - 1) / 2147483646
  }
  return Array.from({ length: n }, (_, i) => make(r, i))
}
const polar = (deg: number, dist: number) => [Math.cos((deg * Math.PI) / 180) * dist, Math.sin((deg * Math.PI) / 180) * dist]

/** Yerba falling into the mate while you pour. */
const POUR = scatter(14, 5, (r) => ({ x: r() * 26 - 13, size: 4 + r() * 4, delay: r() * -0.7, spin: r() * 360 }))
/** The burst once it's ready: yerba leaves and sparkles thrown out of the mate. */
const BURST = scatter(20, 7, (r, i) => {
  const [x, y] = polar((360 / 20) * i + r() * 14, 80 + r() * 110)
  return { x, y: y - 30, leaf: i % 3 !== 0, size: 10 + r() * 12, delay: r() * 100, spin: r() * 540 - 270 }
})
/** The puff of steam he appears from. */
const PUFF = [
  [0, 0, 70],
  [-40, -30, 50],
  [38, -34, 54],
  [-48, 24, 48],
  [46, 26, 50],
  [0, -60, 46],
  [4, 52, 46],
  [-74, -4, 34],
  [76, -2, 36],
]
/** Soft clouds drifting over the morning sky: left, top, width, seconds. */
const CLOUDS = [
  [8, 14, 120, 70],
  [62, 8, 150, 90],
  [40, 26, 90, 60],
]

/** ms after the swipe; the CSS delays in the "sk" block follow the same beats. */
const TYPE_AT = 2650
const TYPE_STEP = 26
const READY_AT = 4600
const LINE = '¡Primer mate de la racha! Volvé mañana y nos cebamos otro.'

/**
 * "1 día de racha", Duolingo's streak screen as a morning on the campo: an empty mate
 * waits at dawn until you swipe it up and the yerba pours in; the bombilla drops, the sun
 * comes up, leaves fly, the grey 0 rolls to a 1, and Gauchito pops out of the steam with
 * the mate in his hand, sipping, while the week comes in and today gets its check.
 */
export function StreakDay({ onNext }: { onNext: () => void }) {
  const today = new Date().getDay()
  const screen = useRef<HTMLDivElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; pull: number } | null>(null)
  const [lit, setLit] = useState(false)
  const [typed, setTyped] = useState(0)
  const [ready, setReady] = useState(false)

  // Until it's full, the mate waits in the middle of the screen; then the group and the
  // campo behind it rise from there to their place (the CSS reads --drop).
  useLayoutEffect(() => {
    const sc = screen.current
    const f = slot.current
    if (!sc || !f) return
    const s = sc.getBoundingClientRect()
    const r = f.getBoundingClientRect()
    sc.style.setProperty('--drop', `${s.top + s.height * 0.5 - (r.top + r.height / 2)}px`)
  }, [])

  useEffect(() => {
    if (!lit) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let tick = 0
    const start = window.setTimeout(
      () => {
        if (calm) return setTyped(LINE.length)
        tick = window.setInterval(() => setTyped((n) => (n >= LINE.length ? (clearInterval(tick), n) : n + 1)), TYPE_STEP)
      },
      calm ? 0 : TYPE_AT,
    )
    const done = window.setTimeout(() => setReady(true), calm ? 0 : READY_AT)
    return () => {
      clearTimeout(start)
      clearTimeout(done)
      clearInterval(tick)
    }
  }, [lit])

  const setPull = (pull: number) => screen.current?.style.setProperty('--pull', pull.toFixed(3))
  const fill = () => {
    drag.current = null
    screen.current?.classList.remove('sk--held')
    setLit(true)
  }

  return (
    <div
      className={`screen sk${lit ? ' sk--lit' : ''}`}
      ref={screen}
      onPointerDown={(e) => {
        if (lit) return
        drag.current = { y: e.clientY, pull: 0 }
        screen.current?.classList.add('sk--held')
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d) return
        d.pull = Math.max(0, Math.min(1, (d.y - e.clientY) / 160))
        setPull(d.pull)
      }}
      onPointerUp={(e) => {
        const d = drag.current
        if (!d) return
        // a swipe up past halfway, or a plain tap on the mate itself
        if (d.pull > 0.45 || (d.pull < 0.03 && (e.target as Element).closest('.sk-mate'))) fill()
        else {
          drag.current = null
          screen.current?.classList.remove('sk--held')
          setPull(0)
        }
      }}
      onPointerCancel={() => {
        drag.current = null
        screen.current?.classList.remove('sk--held')
        setPull(0)
      }}
    >
      {/* the sky: night, turning to dawn as the mate fills, and to morning when it's ready */}
      <div className="sk-sky sk-sky--dawn" aria-hidden />
      <div className="sk-sky sk-sky--night" aria-hidden>
        <span className="sk-moon" />
        {scatter(30, 9, (r, i) => (
          <i key={i} style={{ left: `${r() * 100}%`, top: `${r() * 45}%`, animationDelay: `${r() * -3}s`, scale: `${0.5 + r()}` }} />
        ))}
      </div>
      {/* the campo, which rises with the group */}
      <div className="sk-land" aria-hidden>
        <div className="sk-sun" />
        {CLOUDS.map(([left, top, width, secs], i) => (
          <i key={i} className="sk-cloud" style={{ left: `${left}%`, top: `${top}%`, width, animationDuration: `${secs}s` }} />
        ))}
        <div className="sk-strip">
          <img src={art('ride_bg_mountains')} alt="" />
          <img src={art('ride_bg_fields')} alt="" />
        </div>
        <div className="sk-shade" />
      </div>

      <div className="sk-group">
        <p className="sk-bubble" aria-live="polite">
          <span>{LINE.slice(0, typed)}</span>
          <span className="sk-bubble__rest">{LINE.slice(typed)}</span>
        </p>
        <div className="sk-hero">
          <div className="sk-slot" ref={slot}>
            <p className="sk-hint">
              <span className="sk-hint__arrows" aria-hidden>
                <i />
                <i />
              </span>
              Deslizá para arriba para cebar tu primer mate
            </p>

            <div className="sk-pour" aria-hidden>
              {POUR.map((p, i) => (
                <i key={i} style={{ left: p.x, width: p.size, height: p.size, '--spin': `${p.spin}deg`, animationDelay: `${p.delay}s` } as CSSProperties} />
              ))}
            </div>

            <span className="sk-flash" aria-hidden />
            <button className="sk-mate" aria-label="Cebar el mate" disabled={lit}>
              <span className="sk-mate__glow" />
              <span className="sk-mate__body">
                {/* the icon in parts (design/tools/make_mate_parts.py): the yerba rises in the
                    dark mouth as you pour, then the icon itself takes over */}
                <img src={art('mate_empty')} alt="" />
                <svg viewBox="0 0 256 256">
                  <defs>
                    <clipPath id="sk-mouth">
                      <ellipse cx="116.5" cy="112.5" rx="47.5" ry="16" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#sk-mouth)">
                    <image className="sk-mate__yerba" href={art('mate_yerba')} width="256" height="256" />
                    <rect className="sk-mate__depth" x="60" y="90" width="120" height="40" />
                  </g>
                </svg>
                <img src={art('mate_bombilla')} alt="" />
                <img className="sk-mate__full" src={art('habit_mate')} alt="" />
              </span>
              <svg className="sk-steam" viewBox="-20 -60 60 64">
                <path d={WISP} />
                <path d={WISP} transform="translate(16 4)" />
                <path d={WISP} transform="translate(-14 6)" />
              </svg>
            </button>

            <div className="sk-fx" aria-hidden>
              {BURST.map((b, i) => (
                <svg
                  key={i}
                  className={`sk-spark${b.leaf ? ' sk-spark--leaf' : ''}`}
                  viewBox={b.leaf ? '-22 -22 44 44' : '0 0 24 24'}
                  style={{ '--x': `${b.x}px`, '--y': `${b.y}px`, '--s': b.size, '--spin': `${b.spin}deg`, animationDelay: `${980 + b.delay}ms` } as CSSProperties}
                >
                  <path d={b.leaf ? LEAF : SPARKLE} />
                </svg>
              ))}
            </div>
          </div>

          <div className="sk-guy" aria-hidden>
            <div className="sk-puff">
              {PUFF.map(([x, y, d], i) => (
                <i key={i} style={{ '--x': `${x}px`, '--y': `${y}px`, width: d, height: d, animationDelay: `${2300 + i * 25}ms` } as CSSProperties} />
              ))}
            </div>
            <div className="sk-guy__body">
              <img className="sk-guy__pose sk-guy__pose--sip" src={art('mate_a3_sorbo')} alt="" />
              <img className="sk-guy__pose sk-guy__pose--ahh" src={art('mate_a4_ahh')} alt="" />
              <img className="sk-guy__pose sk-guy__pose--look" src={art('mate_a1_base')} alt="" />
            </div>
          </div>
        </div>

        <div className="sk-count">
          <p className="sk-num" aria-label="1">
            <span className="sk-num__roll">
              <span className="sk-num__one">1</span>
              <span className="sk-num__zero">0</span>
            </span>
          </p>
          <p className="sk-label">día de racha</p>
        </div>
      </div>

      <div className="sk-week" aria-hidden>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => (
          <div key={k} className={`sk-day${k === 0 ? ' sk-day--today' : ''}`} style={{ animationDelay: `${3450 + k * 45}ms` }}>
            <span>{DAY_INITIALS[(today + k) % 7]}</span>
            <i>
              {k === 0 && (
                <>
                  <img className="sk-day__mate" src={art('habit_mate')} alt="" />
                  <svg className="sk-day__check" viewBox="0 0 24 24">
                    <path d="M6 12.5l4 4 8-9" />
                  </svg>
                </>
              )}
            </i>
          </div>
        ))}
      </div>

      <div className="sk-foot">
        <Button variant="gold" onClick={onNext} disabled={!ready} tabIndex={ready ? 0 : -1}>
          ¡Dale!
        </Button>
      </div>
    </div>
  )
}

const GOALS = [
  { days: 2, emoji: '🙌', label: 'Primeros pasos' },
  { days: 5, emoji: '💪', label: 'Buen arranque' },
  { days: 7, emoji: '🎯', label: 'Una semana entera' },
  { days: 14, emoji: '🔥', label: 'Racha imparable' },
]

/** "¿Cuántos días seguidos…?": the streak you commit to. */
export function StreakGoal({ companion, onCommit }: { companion: string; onCommit: (days: number) => void }) {
  const [days, setDays] = useState(GOALS[0].days)
  return (
    <div className="screen d1">
      <h2 className="d1-title">¿Cuántos días seguidos vas a cuidar a {companion}?</h2>
      <div className="d1-talk">
        <img className="d1-guy" src={art('g_thumbs')} alt="" />
        <p className="d1-bubble">¡Yujuuu! Cada paso cuenta.</p>
      </div>
      <div className="d1-goals" role="radiogroup">
        {GOALS.map((g) => (
          <button
            key={g.days}
            className={`d1-goal${g.days === days ? ' d1-goal--on' : ''}`}
            role="radio"
            aria-checked={g.days === days}
            onClick={() => setDays(g.days)}
          >
            <span className="d1-goal__emoji">{g.emoji}</span>
            <strong>{g.days} días</strong>
            <span className="d1-goal__label">{g.label}</span>
          </button>
        ))}
      </div>
      <div className="d1-foot">
        <Button variant="light" onClick={() => onCommit(days)}>
          ¡Me comprometo!
        </Button>
      </div>
    </div>
  )
}
