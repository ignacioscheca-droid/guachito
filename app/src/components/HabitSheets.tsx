import { useState } from 'react'
import { sfx } from '../game/sound'
import { actions, findHabit, finished, habitsToday, MAX_TIMES, planOf, skippedToday, timesDone, useGame, type HabitPlan, type Moment } from '../game/store'
import { HabitPicker } from './HabitPicker'
import { Button, HabitIcon, Segmented, Sheet, Stepper } from './ui'

/** The week Monday first, as Date.getDay numbers them. */
const WEEK: [number, string][] = [
  [1, 'L'],
  [2, 'M'],
  [3, 'M'],
  [4, 'J'],
  [5, 'V'],
  [6, 'S'],
  [0, 'D'],
]
export const MOMENTS: [Moment, string][] = [
  ['morning', 'Al arrancar'],
  ['any', 'Cuando sea'],
  ['night', 'A la noche'],
]

/** "8 veces · L · M · V", what a habit's plan says in a line. */
export function planLine(plan: HabitPlan) {
  const times = plan.times > 1 ? `${plan.times} veces por día` : ''
  const when =
    plan.when.kind === 'days'
      ? WEEK.filter(([d]) => (plan.when as { days: number[] }).days.includes(d))
          .map(([, l]) => l)
          .join(' · ')
      : plan.when.kind === 'week'
        ? `${plan.when.times} ${plan.when.times === 1 ? 'vez' : 'veces'} por semana`
        : times
          ? ''
          : 'Todos los días'
  return [times, when].filter(Boolean).join(' · ')
}

/**
 * One habit's sheet: how many times a day, which days, and its moment (the groups on Home).
 * From here too: «Hoy no puedo», and taking it off the list.
 */
export function PlanSheet({ id, onClose, onSkip }: { id: string; onClose: () => void; onSkip?: () => void }) {
  const s = useGame((g) => g)
  const h = findHabit(s, id)
  const [plan, setPlan] = useState<HabitPlan>(planOf(s, id))
  const kind = plan.when.kind
  const days = plan.when.kind === 'days' ? plan.when.days : [1, 3, 5]
  const week = plan.when.kind === 'week' ? plan.when.times : 3
  const canSkip = onSkip && habitsToday(s).includes(id) && !finished(s, id) && !skippedToday(s).includes(id)
  return (
    <Sheet title={h.name} onClose={onClose}>
      <div className="habitplan">
        <p className="habitplan__label">¿Cuántas veces por día?</p>
        <Stepper value={plan.times} min={1} max={MAX_TIMES} unit={plan.times === 1 ? 'vez' : 'veces'} onChange={(times) => setPlan({ ...plan, times })} />
        <p className="habitplan__hint">{plan.times === 1 ? 'Con 1 es un tilde común.' : `Cada vez suma: lo vas llenando de a una, hasta ${plan.times}.`}</p>
        <p className="habitplan__label">¿Cuándo?</p>
        <Segmented
          value={kind}
          options={[
            ['daily', 'Todos los días'],
            ['days', 'Algunos días'],
            ['week', 'Veces por semana'],
          ]}
          onChange={(k) => setPlan({ ...plan, when: k === 'days' ? { kind: 'days', days } : k === 'week' ? { kind: 'week', times: week } : { kind: 'daily' } })}
        />
        {kind === 'days' && (
          <>
            <div className="habitplan__days">
              {WEEK.map(([d, l]) => (
                <button
                  key={d}
                  className={days.includes(d) ? 'on' : ''}
                  aria-pressed={days.includes(d)}
                  onClick={() => {
                    const next = days.includes(d) ? days.filter((x) => x !== d) : [...days, d]
                    if (next.length) setPlan({ ...plan, when: { kind: 'days', days: next } })
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="habitplan__hint">Los otros días no aparece en Inicio.</p>
          </>
        )}
        {kind === 'week' && (
          <>
            <Stepper value={week} min={1} max={6} unit={week === 1 ? 'vez por semana' : 'veces por semana'} onChange={(times) => setPlan({ ...plan, when: { kind: 'week', times } })} />
            <p className="habitplan__hint">Aparece todos los días hasta que completás las de la semana.</p>
          </>
        )}
        <p className="habitplan__label">¿En qué momento?</p>
        <Segmented value={plan.moment} options={MOMENTS} onChange={(moment) => setPlan({ ...plan, moment })} />
        <Button
          variant="gold"
          onClick={() => {
            actions.setPlan(id, plan)
            sfx('place')
            onClose()
          }}
        >
          Guardar
        </Button>
        {canSkip && (
          <Button
            variant="light"
            onClick={() => {
              onSkip()
              onClose()
            }}
          >
            💤 Hoy no puedo
          </Button>
        )}
        <button
          className="habitplan__remove"
          onClick={() => {
            if (!confirm(`¿Sacar «${h.name}» de tus hábitos?`)) return
            actions.removeHabit(id)
            onClose()
          }}
        >
          Sacar este hábito
        </button>
      </div>
    </Sheet>
  )
}

/** ✏️: your habits, each opening its sheet, and the catalog to pick others. */
export function HabitsSheet({ onClose, onSkip }: { onClose: () => void; onSkip: (id: string) => void }) {
  const s = useGame((g) => g)
  const [open, setOpen] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)
  const [picked, setPicked] = useState(s.habits)
  if (open) return <PlanSheet id={open} onClose={() => setOpen(null)} onSkip={() => onSkip(open)} />
  if (picking)
    return (
      <Sheet title="Elegí tus hábitos" onClose={() => setPicking(false)}>
        <div className="bsheet__scroll">
          <HabitPicker picked={picked} onChange={setPicked} />
        </div>
        <Button
          variant="gold"
          disabled={picked.length === 0}
          onClick={() => {
            actions.setHabits(picked)
            setPicking(false)
          }}
        >
          Guardar
        </Button>
      </Sheet>
    )
  return (
    <Sheet title="Tus hábitos" onClose={onClose}>
      <p className="bsheet__lead">Tocá uno para elegir cuántas veces, qué días y en qué momento.</p>
      <div className="bsheet__scroll">
        {s.habits.map((id) => {
          const h = findHabit(s, id)
          return (
            <button key={id} className="hrowlist" onClick={() => setOpen(id)}>
              <span className="hcard__icon">
                <HabitIcon habit={h} />
              </span>
              <span className="hrowlist__text">
                <b>{h.name}</b>
                <small>{planLine(planOf(s, id))}</small>
              </span>
              <span className="hrowlist__go" aria-hidden>
                ›
              </span>
            </button>
          )
        })}
      </div>
      <Button variant="light" onClick={() => setPicking(true)}>
        Elegir de la lista
      </Button>
    </Sheet>
  )
}

/** ✓ N: what you did today; tapping one unticks it (its last time). */
export function DoneSheet({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const s = useGame((g) => g)
  return (
    <Sheet title="Hechos hoy" onClose={onClose}>
      <p className="bsheet__lead">Tocá uno para desmarcarlo.</p>
      <div className="bsheet__scroll">
        {ids.map((id) => {
          const h = findHabit(s, id)
          const n = timesDone(s, id)
          return (
            <button
              key={id}
              className="hrowlist"
              onClick={() => {
                sfx('uncheck')
                actions.uncompleteHabit(id)
              }}
            >
              <span className="hcard__icon">
                <HabitIcon habit={h} />
              </span>
              <span className="hrowlist__text">
                <b>{h.name}</b>
                {planOf(s, id).times > 1 && <small>{n} de {planOf(s, id).times}</small>}
              </span>
              <span className="hcard__tick hcard__tick--on">✓</span>
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}

/** 💤 N: the habits set aside today; each can come back. */
export function SkippedSheet({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const s = useGame((g) => g)
  return (
    <Sheet title="Hoy no" onClose={onClose}>
      <p className="bsheet__lead">No dan energía, pero tampoco cortan la racha. Si al final podés, traelos de vuelta.</p>
      <div className="bsheet__scroll">
        {ids.map((id) => {
          const h = findHabit(s, id)
          return (
            <button
              key={id}
              className="hrowlist"
              onClick={() => {
                sfx('tap')
                actions.skipHabit(id, true)
                if (ids.length === 1) onClose()
              }}
            >
              <span className="hcard__icon">
                <HabitIcon habit={h} />
              </span>
              <span className="hrowlist__text">
                <b>{h.name}</b>
                <small>Volver a la lista</small>
              </span>
              <span className="hrowlist__go" aria-hidden>
                ↩
              </span>
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}
