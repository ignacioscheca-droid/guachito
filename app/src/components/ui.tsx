import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { art, ENERGY_GOAL, type HabitDef } from '../game/content'

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'light' | 'ghost' | 'gold' }) {
  return <button className={`btn btn--${variant} ${className}`} {...rest} />
}

export function EnergyBar({ energy, compact }: { energy: number; compact?: boolean }) {
  const pct = Math.min(100, (energy / ENERGY_GOAL) * 100)
  return (
    <div className={`energy${compact ? ' energy--compact' : ''}${pct >= 100 ? ' energy--full' : ''}`}>
      <img className="energy__icon" src={art('ui_energia')} alt="Energía" />
      <div className="energy__track">
        <div className="energy__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="energy__label">
        {energy} / {ENERGY_GOAL}
      </span>
    </div>
  )
}

export function CoinPill({ coins, bump }: { coins: number; bump?: boolean }) {
  return (
    <div className={`coins${bump ? ' coins--bump' : ''}`}>
      <img src={art('ui_moneda')} alt="" />
      <span>{coins}</span>
    </div>
  )
}

export function Check({ on }: { on: boolean }) {
  return (
    <span className={`check${on ? ' check--on' : ''}`} aria-hidden>
      <svg viewBox="0 0 24 24">
        <path d="M6 12.5l4 4 8-9" />
      </svg>
    </span>
  )
}

export type Tab = 'home' | 'adventure' | 'ranch'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Inicio', icon: 'nav_inicio' },
  { id: 'adventure', label: 'Aventura', icon: 'nav_aventura' },
  { id: 'ranch', label: 'Rancho', icon: 'nav_rancho' },
]

export function BottomNav({ tab, onTab, badges }: { tab: Tab; onTab: (t: Tab) => void; badges?: Partial<Record<Tab, boolean>> }) {
  return (
    <nav className="nav">
      {TABS.map((t) => (
        <button key={t.id} className={`nav__tab${tab === t.id ? ' nav__tab--on' : ''}`} onClick={() => onTab(t.id)}>
          <span className="nav__icon">
            <img src={art(t.icon)} alt="" />
            {badges?.[t.id] && <i className="nav__badge" />}
          </span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}

/** A habit's icon: the artist's art for catalog habits, an emoji for the player's own. */
export function HabitIcon({ habit, className = '' }: { habit: HabitDef; className?: string }) {
  if (habit.icon) return <img className={`habit-icon ${className}`} src={art(habit.icon)} alt="" />
  return (
    <span className={`habit-icon habit-icon--emoji ${className}`} aria-hidden>
      {habit.emoji ?? '⭐'}
    </span>
  )
}
