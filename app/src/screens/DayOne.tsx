import { useLayoutEffect, useRef, useState } from 'react'
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

/** Tomorrow's wavy ring (Finch's streak screen): a circle with 12 soft waves. */
const WAVY_RING = (() => {
  const pts: string[] = []
  for (let k = 0; k <= 96; k++) {
    const a = (k / 96) * Math.PI * 2
    const r = 15 + 1.3 * Math.cos(12 * a)
    pts.push(`${(20 + r * Math.cos(a)).toFixed(2)},${(20 + r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
})()
const SPARKLE = 'M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z'

/** When he shows up, and when he and the number reach the top (ms from the screen showing up). */
const HERO_AT = 1030
const RISEN_AT = 1850

/**
 * "1 día de racha", timed like Finch's: a grey "0" alone in the middle, it turns into
 * "1" and the screen turns blue, he pops up and rises with the number to the top while
 * the sunburst, the week, the text and the button come in.
 */
export function StreakDay({ companion, onNext }: { companion: string; onNext: () => void }) {
  const today = new Date().getDay()
  const screen = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const sc = screen.current
    const g = group.current
    const c = count.current
    if (!sc || !g || !c) return
    const mid = sc.getBoundingClientRect().top + sc.clientHeight / 2
    const centre = (el: Element) => {
      const r = el.getBoundingClientRect()
      return r.top + r.height / 2
    }
    // First the number alone sits in the middle; when he pops up, the two of them do,
    // and then they rise together. One timeline from the screen showing up, like the CSS.
    const alone = `translateY(${mid - centre(c)}px)`
    const together = `translateY(${mid - centre(g)}px)`
    const pop = HERO_AT / RISEN_AT
    const rise = g.animate(
      [
        { transform: alone, offset: 0 },
        { transform: alone, offset: pop },
        { transform: together, offset: pop + 0.0005, easing: 'cubic-bezier(0.25, 0.8, 0.3, 1)' },
        { transform: 'none', offset: 1 },
      ],
      { duration: RISEN_AT, fill: 'both' },
    )
    return () => rise.cancel()
  }, [])

  return (
    <div className="screen d1 d1--streak" ref={screen}>
      <div className="d1-dark" aria-hidden />
      <div className="d1-group" ref={group}>
        <div className="d1-hero">
          {/* Finch's sunburst: light rays turning slowly behind him */}
          <div className="d1-burst" aria-hidden />
          <img className="d1-guy d1-guy--big" src={art('g_celebrate')} alt="" />
        </div>
        <div className="d1-count" ref={count}>
          <p className="d1-big">
            <span className="d1-big__zero">0</span>
            <span className="d1-big__one">1</span>
          </p>
          <p className="d1-big-label">Día de racha</p>
        </div>
      </div>
      <div className="d1-week" aria-hidden>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => (
          <div key={k} className={`d1-week__day${k === 0 ? ' d1-week__day--done' : k === 1 ? ' d1-week__day--next' : ''}`}>
            <span>{DAY_INITIALS[(today + k) % 7]}</span>
            <i>
              {k === 0 && '✓'}
              {k === 1 && (
                <>
                  <svg className="d1-ring" viewBox="0 0 40 40">
                    <circle className="d1-ring__dot" cx="20" cy="20" r="10" />
                    <path d={WAVY_RING} />
                  </svg>
                  <svg className="d1-spark d1-spark--big" viewBox="0 0 24 24">
                    <path d={SPARKLE} />
                  </svg>
                  <svg className="d1-spark d1-spark--small" viewBox="0 0 24 24">
                    <path d={SPARKLE} />
                  </svg>
                </>
              )}
            </i>
          </div>
        ))}
      </div>
      <p className="d1-text">¡Muy bien! Entrá todos los días para mantener tu racha de autocuidado con {companion}.</p>
      <div className="d1-foot">
        <Button variant="light" onClick={onNext}>
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
