import { useState } from 'react'
import { HABIT_EMOJIS, HABITS, MAX_HABITS } from '../game/content'
import { actions, useGame } from '../game/store'
import { Button, HabitIcon } from './ui'

type Props = { picked: string[]; onChange: (ids: string[]) => void }

/** Grid of catalog + own habits, with "Otro hábito" to create one. */
export function HabitPicker({ picked, onChange }: Props) {
  const custom = useGame((s) => s.customHabits)
  const [shake, setShake] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const full = picked.length >= MAX_HABITS

  const toggle = (id: string) => {
    if (picked.includes(id)) return onChange(picked.filter((p) => p !== id))
    if (full) {
      setShake(id)
      window.setTimeout(() => setShake(null), 400)
      return
    }
    onChange([...picked, id])
  }

  // The player's own habits first: they are the ones they came for.
  const all = [...custom, ...HABITS]

  return (
    <>
      <div className="habits__grid">
        {all.map((h) => {
          const on = picked.includes(h.id)
          return (
            <button
              key={h.id}
              className={`pick${on ? ' pick--on' : ''}${full && !on ? ' pick--dim' : ''}${shake === h.id ? ' pick--shake' : ''}`}
              onClick={() => toggle(h.id)}
            >
              {on && <span className="pick__tick">{picked.indexOf(h.id) + 1}</span>}
              <HabitIcon habit={h} />
              <span>{h.name}</span>
            </button>
          )
        })}
        <button className="pick pick--new" onClick={() => setCreating(true)} disabled={full}>
          <span className="pick__plus">+</span>
          <span>Otro hábito</span>
        </button>
      </div>
      {creating && (
        <NewHabit
          onCancel={() => setCreating(false)}
          onCreate={(name, emoji) => {
            const id = actions.addCustomHabit(name, emoji)
            onChange([...picked, id])
            setCreating(false)
          }}
        />
      )}
    </>
  )
}

function NewHabit({ onCreate, onCancel }: { onCreate: (name: string, emoji: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0])
  return (
    <div className="overlay" onClick={onCancel}>
      <form
        className="modal newhabit"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          if (name.trim()) onCreate(name, emoji)
        }}
      >
        <h2>Tu hábito</h2>
        <label className="field">
          <span className="newhabit__emoji">{emoji}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Ej: Jugar con mi hija" autoFocus aria-label="Nombre del hábito" />
        </label>
        <div className="emojis" role="radiogroup" aria-label="Ícono">
          {HABIT_EMOJIS.map((e) => (
            <button type="button" key={e} role="radio" aria-checked={e === emoji} className={`emojis__opt${e === emoji ? ' emojis__opt--on' : ''}`} onClick={() => setEmoji(e)}>
              {e}
            </button>
          ))}
        </div>
        <Button type="submit" disabled={!name.trim()}>
          Agregar
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </form>
    </div>
  )
}
