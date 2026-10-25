import { useRef, useState } from 'react'
import { HABIT_EMOJIS, HABIT_SUGGESTIONS } from '../game/content'
import { sfx } from '../game/sound'
import { actions } from '../game/store'
import { Button } from './ui'

/**
 * A habit of your own, like Finch's "new goal" screen: a card to write it (with its emoji,
 * for today only or every day) and suggestions below, by theme. A suggestion fills the card.
 */
export function AddHabit({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('⭐')
  const [everyDay, setEveryDay] = useState(false)
  const [picking, setPicking] = useState(false)
  const [theme, setTheme] = useState(HABIT_SUGGESTIONS[0].id)
  const input = useRef<HTMLInputElement>(null)
  const items = HABIT_SUGGESTIONS.find((t) => t.id === theme)!.items

  const add = () => {
    if (!name.trim()) return input.current?.focus()
    actions.addHabit(name, emoji, everyDay)
    sfx('check')
    onClose()
  }

  return (
    <div className="addhabit">
      <button className="addhabit__close" onClick={onClose} aria-label="Cerrar">
        ✕
      </button>
      <div className="addhabit__card">
        <button className="addhabit__emoji" onClick={() => setPicking((p) => !p)} aria-label="Elegir emoji">
          {emoji}
        </button>
        {picking && (
          <div className="addhabit__emojis">
            {['⭐', ...HABIT_EMOJIS].map((e) => (
              <button
                key={e}
                className={e === emoji ? 'on' : ''}
                onClick={() => {
                  setEmoji(e)
                  setPicking(false)
                }}
              >
                {e}
              </button>
            ))}
          </div>
        )}
        <input ref={input} value={name} maxLength={40} placeholder="Escribí un hábito nuevo…" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <div className="addhabit__when" role="radiogroup" aria-label="Cuándo">
          <button className={!everyDay ? 'on' : ''} onClick={() => setEveryDay(false)} role="radio" aria-checked={!everyDay}>
            📅 Solo hoy
          </button>
          <button className={everyDay ? 'on' : ''} onClick={() => setEveryDay(true)} role="radio" aria-checked={everyDay}>
            🔁 Todos los días
          </button>
        </div>
        <Button variant="gold" onClick={add} disabled={!name.trim()}>
          Agregar
        </Button>
      </div>

      <h3 className="addhabit__title">Ideas</h3>
      <div className="addhabit__list">
        {items.map(([e, n]) => (
          <button
            key={n}
            className="addhabit__idea"
            onClick={() => {
              setName(n)
              setEmoji(e)
            }}
          >
            <span>{e}</span>
            {n}
          </button>
        ))}
      </div>
      <div className="addhabit__themes">
        {HABIT_SUGGESTIONS.map((t) => (
          <button key={t.id} className={t.id === theme ? 'on' : ''} onClick={() => setTheme(t.id)}>
            {t.name}
          </button>
        ))}
      </div>
    </div>
  )
}
