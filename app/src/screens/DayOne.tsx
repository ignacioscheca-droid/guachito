import { useState } from 'react'
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

/** "1 día de racha": today ticked, tomorrow waiting. */
export function StreakDay({ companion, onNext }: { companion: string; onNext: () => void }) {
  const today = new Date().getDay()
  return (
    <div className="screen d1">
      <div className="d1-hero">
        {/* Finch's sunburst: light rays turning slowly behind him */}
        <div className="d1-burst" aria-hidden />
        <img className="d1-guy d1-guy--big" src={art('g_celebrate')} alt="" />
      </div>
      <p className="d1-big">1</p>
      <p className="d1-big-label">Día de racha</p>
      <div className="d1-week" aria-hidden>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => (
          <div key={k} className={`d1-week__day${k === 0 ? ' d1-week__day--done' : k === 1 ? ' d1-week__day--next' : ''}`}>
            <span>{DAY_INITIALS[(today + k) % 7]}</span>
            <i>{k === 0 ? '✓' : ''}</i>
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
