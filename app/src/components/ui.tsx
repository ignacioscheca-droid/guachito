import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { art, type HabitDef } from '../game/content'
import type { TabId } from '../game/store'

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'light' | 'ghost' | 'gold' }) {
  return <button className={`btn btn--${variant} ${className}`} {...rest} />
}

export function CoinPill({ coins, bump }: { coins: number; bump?: boolean }) {
  return (
    <div className={`coins${bump ? ' coins--bump' : ''}`}>
      <img src={art('ui_herradura')} alt="Herraduras" />
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

/**
 * Royal Match's bar: icons only; the chosen tab is wider and lit, its icon raised over its
 * name. Inicio sits in the middle; the rest open as the game goes on.
 */
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'areas', label: 'Áreas', icon: 'nav_rancho' },
  { id: 'aventuras', label: 'Aventuras', icon: 'nav_aventura' },
  { id: 'inicio', label: 'Inicio', icon: 'habit_mate' },
  { id: 'paucho', label: 'Paucho', icon: 'g_avatar' },
  { id: 'casita', label: 'Casita', icon: 'nav_inicio' },
]

export function BottomNav({
  tab,
  open,
  name,
  face,
  badges,
  onTab,
  onLocked,
}: {
  tab: TabId
  open: TabId[]
  /** Paucho's tab is labelled with his name, and shows his (dressed) face. */
  name: string
  face: ReactNode
  badges?: Partial<Record<TabId, boolean>>
  onTab: (t: TabId) => void
  onLocked: () => void
}) {
  return (
    <nav className="nav nav5">
      {TABS.map((t) => {
        const unlocked = open.includes(t.id)
        return (
          <button
            key={t.id}
            className={`nav__tab${tab === t.id ? ' nav__tab--on' : ''}${unlocked ? '' : ' nav5__locked'}`}
            onClick={() => (unlocked ? onTab(t.id) : onLocked())}
            aria-label={unlocked ? undefined : 'Se desbloquea más adelante'}
          >
            <span className="nav__icon">
              {t.id === 'paucho' && unlocked ? face : <img src={art(t.icon)} alt="" />}
              {badges?.[t.id] && <i className="nav__badge" />}
            </span>
            {tab === t.id && <b className="nav5__label">{t.id === 'paucho' ? name : t.label}</b>}
          </button>
        )
      })}
    </nav>
  )
}

/** A sheet that comes up from the bottom over a dimmed screen: editing, lists, choices. */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="bsheet-back" onClick={onClose}>
      <div className="bsheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <i className="bsheet__grip" aria-hidden />
        <h2 className="bsheet__title">{title}</h2>
        {children}
      </div>
    </div>
  )
}

/** One choice out of a few, side by side. */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="radiogroup">
      {options.map(([v, label]) => (
        <button key={v} className={v === value ? 'on' : ''} role="radio" aria-checked={v === value} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  )
}

/** − N + for a small count. */
export function Stepper({ value, min, max, unit, onChange }: { value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Menos">
        −
      </button>
      <strong>{value}</strong>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Más">
        +
      </button>
      <span>{unit}</span>
    </div>
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
