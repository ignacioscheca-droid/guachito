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
      <p className="d1-text">Ayudá a {companion} a juntar toda la energía hoy para que salga de aventura.</p>
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
/** The unlit flame waiting in the dark, in a 100×120 box. */
const EMBER = 'M50 4C60 24 86 40 86 74C86 100 70 117 50 117C30 117 14 100 14 74C14 55 25 42 32 29C37 41 41 47 47 49C45 33 45 19 50 4Z'
/** One flame petal, centred on 0,0. */
const PETAL = 'M0-22C11-9 11 9 0 22C-11 9-11-9 0-22Z'

/** Seeded scatter, so every viewing throws the same sparks (and React renders stay pure). */
function scatter<T>(n: number, seed: number, make: (r: () => number, i: number) => T): T[] {
  let x = seed
  const r = () => {
    x = (x * 16807) % 2147483647
    return (x - 1) / 2147483646
  }
  return Array.from({ length: n }, (_, i) => make(r, i))
}
const polar = (deg: number, dist: number) => [Math.cos((deg * Math.PI) / 180) * dist, Math.sin((deg * Math.PI) / 180) * dist]

/** The ignition burst: sparkles and embers thrown out of the light. */
const BURST = scatter(22, 7, (r, i) => {
  const [x, y] = polar((360 / 22) * i + r() * 14, 70 + r() * 110)
  return { x, y, star: i % 3 === 0, size: 8 + r() * 12, delay: r() * 90, spin: r() * 360 - 180 }
})
/** Petals flying in from all around to build the flame. */
const PETALS = scatter(7, 3, (r, i) => {
  const [x, y] = polar((360 / 7) * i + r() * 30 - 90, 150 + r() * 70)
  return { x, y, rot: r() * 540 - 270, scale: 0.7 + r() * 0.8, gold: i % 3 === 0, delay: r() * 140 }
})
/** Little embers that pop off the flame when it lands and hang in the air. */
const EMBERS = scatter(9, 11, (r, i) => {
  const [x, y] = polar((360 / 9) * i + r() * 20, 85 + r() * 45)
  return { x, y: y - 20, size: 6 + r() * 6, delay: r() * 120, drift: 10 + r() * 14 }
})
/** The puff of smoke he appears from. */
const PUFF = [
  [0, 0, 64],
  [-38, -26, 46],
  [36, -30, 50],
  [-44, 22, 44],
  [42, 24, 46],
  [0, -50, 40],
  [4, 46, 42],
  [-66, -4, 30],
  [68, -2, 32],
]

/** ms after the swipe; the CSS delays in the "sk" block follow the same beats. */
const TYPE_AT = 2550
const TYPE_STEP = 24
const READY_AT = 4500
const LINE = '¡Prendimos el fogón de tu racha! Volvé cada día para que no se apague.'

/**
 * "1 día de racha", Duolingo-style: a dark flame waits in the night until you swipe it
 * up; it streaks up and bursts into light, petals fly in and build the fogón's flame
 * while the grey 0 rolls to an orange 1, Gauchito pops out of a puff of smoke beside it
 * and says his line, then the week comes in and today's day gets its check.
 */
export function StreakDay({ onNext }: { onNext: () => void }) {
  const today = new Date().getDay()
  const screen = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLDivElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; pull: number } | null>(null)
  const [lit, setLit] = useState(false)
  const [typed, setTyped] = useState(0)
  const [ready, setReady] = useState(false)

  // Until it's lit, the flame waits in the middle of the screen; when it's lit the group
  // rises from there to its place (the CSS reads --drop).
  useLayoutEffect(() => {
    const sc = screen.current
    const g = group.current
    const f = slot.current
    if (!sc || !g || !f) return
    const s = sc.getBoundingClientRect()
    const r = f.getBoundingClientRect()
    g.style.setProperty('--drop', `${s.top + s.height * 0.46 - (r.top + r.height / 2)}px`)
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
  const ignite = () => {
    drag.current = null
    setPull(0)
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
        d.pull = Math.max(0, Math.min(1, (d.y - e.clientY) / 140))
        setPull(d.pull)
      }}
      onPointerUp={(e) => {
        const d = drag.current
        screen.current?.classList.remove('sk--held')
        if (!d) return
        // a swipe up, or a plain tap on the flame itself
        if (d.pull > 0.4 || (d.pull < 0.03 && (e.target as Element).closest('.sk-ember'))) ignite()
        else {
          drag.current = null
          setPull(0)
        }
      }}
      onPointerCancel={() => {
        drag.current = null
        screen.current?.classList.remove('sk--held')
        setPull(0)
      }}
    >
      {/* the night, with its stars, that the light washes away */}
      <div className="sk-night" aria-hidden>
        {scatter(26, 5, (r, i) => (
          <i key={i} style={{ left: `${r() * 100}%`, top: `${r() * 70}%`, animationDelay: `${r() * -3}s`, scale: `${0.5 + r()}` }} />
        ))}
      </div>
      <div className="sk-bloom" aria-hidden />

      <div className="sk-group" ref={group}>
        <p className="sk-bubble" aria-live="polite">
          <span>{LINE.slice(0, typed)}</span>
          <span className="sk-bubble__rest">{LINE.slice(typed)}</span>
        </p>
        <div className="sk-hero">
          <div className="sk-slot" ref={slot}>
            {/* before: the dark flame and its glowing heart */}
            <button className="sk-ember" aria-label="Prender la racha" disabled={lit}>
              <span className="sk-ember__glow" />
              <svg viewBox="0 0 100 120">
                <path d={EMBER} />
              </svg>
              <span className="sk-ember__heart" />
            </button>
            <p className="sk-hint">
              <span className="sk-hint__arrows" aria-hidden>
                <i />
                <i />
              </span>
              Deslizá para arriba para prender tu racha
            </p>

            {/* the ignition: a streak of light shooting up, then a burst */}
            <span className="sk-streak" aria-hidden />
            <span className="sk-flash" aria-hidden />
            <div className="sk-fx" aria-hidden>
              {BURST.map((b, i) => (
                <svg
                  key={i}
                  className={`sk-spark${b.star ? ' sk-spark--star' : ''}`}
                  viewBox="0 0 24 24"
                  style={{ '--x': `${b.x}px`, '--y': `${b.y}px`, '--s': b.size, '--spin': `${b.spin}deg`, animationDelay: `${520 + b.delay}ms` } as CSSProperties}
                >
                  {b.star ? <path d={SPARKLE} /> : <rect x="6" y="6" width="12" height="12" rx="3" />}
                </svg>
              ))}
              {PETALS.map((p, i) => (
                <svg
                  key={i}
                  className={`sk-petal${p.gold ? ' sk-petal--gold' : ''}`}
                  viewBox="-24 -24 48 48"
                  style={{ '--x': `${p.x}px`, '--y': `${p.y}px`, '--rot': `${p.rot}deg`, '--s': p.scale, animationDelay: `${1080 + p.delay}ms` } as CSSProperties}
                >
                  <path d={PETAL} />
                </svg>
              ))}
              {EMBERS.map((m, i) => (
                <i
                  key={i}
                  className="sk-bit"
                  style={{ '--x': `${m.x}px`, '--y': `${m.y}px`, '--drift': `${m.drift}px`, width: m.size, height: m.size, animationDelay: `${1560 + m.delay}ms` } as CSSProperties}
                />
              ))}
            </div>

            {/* after: the fogón's flame, built from the petals */}
            <div className="sk-flame" aria-hidden>
              <img src={art('item_fogon_flame_1')} alt="" />
            </div>
          </div>

          <div className="sk-guy" aria-hidden>
            <div className="sk-puff">
              {PUFF.map(([x, y, d], i) => (
                <i key={i} style={{ '--x': `${x}px`, '--y': `${y}px`, width: d, height: d, animationDelay: `${2200 + i * 25}ms` } as CSSProperties} />
              ))}
            </div>
            <div className="sk-guy__body">
              <img className="sk-guy__pose sk-guy__pose--cheer" src={art('g_celebrate')} alt="" />
              <img className="sk-guy__pose sk-guy__pose--thumbs" src={art('g_thumbs')} alt="" />
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
          <div key={k} className={`sk-day${k === 0 ? ' sk-day--today' : ''}`} style={{ animationDelay: `${3350 + k * 45}ms` }}>
            <span>{DAY_INITIALS[(today + k) % 7]}</span>
            <i>
              {k === 0 && (
                <>
                  <img className="sk-day__flame" src={art('item_fogon_flame_3')} alt="" />
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
