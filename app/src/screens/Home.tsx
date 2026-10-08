import { useEffect, useRef, useState, type MouseEvent, type RefObject } from 'react'
import { Confetti } from '../components/Confetti'
import { AdventureTrack } from '../components/DayLoop'
import { HabitPicker } from '../components/HabitPicker'
import { RideWorld } from '../components/RideWorld'
import { Scene } from '../components/Scene'
import { Button, Check, CoinPill, HabitIcon } from '../components/ui'
import { ADVENTURE_MS, art, ENERGY_GOAL, ENERGY_PER_HABIT, EPISODES, EXTRA_HABIT_COINS } from '../game/content'
import { actions, doneToday, findHabit, useGame, type GameState } from '../game/store'
import { formatClock } from './AdventureRun'

type Props = {
  width: number
  celebrateKey: number
  remainingMs: number
  onCompleteHabit: (id: string) => void
  onAdventure: () => void
  onTapGauchito: () => void
  onSecretTap: () => void
  onSettings: () => void
}

function greeting(player: string) {
  const h = new Date().getHours()
  const to = player ? `, ${player}` : ''
  if (h >= 5 && h < 12) return `¡Buen día${to}!`
  if (h >= 12 && h < 20) return `¡Buenas tardes${to}!`
  return `¡Buenas noches${to}!`
}

/** How many more habits fill the bar (0 once it is full; null: not enough habits left today). */
function habitsToGo(s: GameState, open: string[]) {
  if (s.adventure.status !== 'charging') return 0
  const need = Math.ceil((ENERGY_GOAL - s.energy) / ENERGY_PER_HABIT)
  return need <= open.length ? need : null
}

function subline(s: GameState, left: number, toGo: number | null) {
  const { status } = s.adventure
  if (status === 'running') return `${s.name} está recorriendo las pampas`
  if (status === 'returned') return `¡${s.name} volvió y tiene algo para contarte!`
  if (status === 'ready') return `¡${s.name} tiene energía para salir de aventura!`
  if (left === 0) return '¡Día completo! Mañana, nueva aventura.'
  if (doneToday(s).length === 0) return `${s.name} está listo para un gran día`
  if (toGo == null) return '¡Bien! Mañana seguimos juntando energía.'
  return `¡Vamos! Con ${toGo} hábito${toGo > 1 ? 's' : ''} más ${s.name} sale de aventura`
}

/** Moves the shown number towards `value` one unit at a time, like Finch's energy counter. */
function useCountTo(value: number, msPerStep = 90) {
  const [shown, setShown] = useState(value)
  useEffect(() => {
    if (shown === value) return
    const t = window.setTimeout(() => setShown((v) => v + Math.sign(value - v)), msPerStep)
    return () => clearTimeout(t)
  }, [shown, value, msPerStep])
  return shown
}

/** An energy bolt or a coin flying from a habit to where it adds up. */
function fly(from: Element, to: Element | null, icon: string) {
  if (!to) return
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  const el = document.createElement('img')
  el.src = art(icon)
  el.className = 'flyer'
  el.style.left = `${a.left + a.width / 2 - 14}px`
  el.style.top = `${a.top + a.height / 2 - 14}px`
  document.body.appendChild(el)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  el.animate(
    [
      { transform: 'translate(0, 0) scale(0.6)', opacity: 0 },
      { transform: `translate(${dx * 0.3}px, ${dy * 0.3 - 46}px) scale(1.2)`, opacity: 1, offset: 0.35 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.7)`, opacity: 1 },
    ],
    { duration: 650, easing: 'cubic-bezier(0.5, 0, 0.6, 1)' },
  ).onfinish = () => el.remove()
}

function EnergyCard({ energy, label, foodRef }: { energy: number; label: string; foodRef: RefObject<HTMLSpanElement | null> }) {
  const shown = useCountTo(energy)
  return (
    <div className="ecard">
      <span className="ecard__food" ref={foodRef}>
        <img src={art('habit_mate')} alt="" />
      </span>
      <div className="ecard__body">
        <small>{label}</small>
        <div className="ecard__bar">
          <i style={{ width: `${(shown / ENERGY_GOAL) * 100}%` }} />
          <span>
            {shown} / {ENERGY_GOAL}
          </span>
        </div>
      </div>
    </div>
  )
}

export function Home({ width, celebrateKey, remainingMs, onCompleteHabit, onAdventure, onTapGauchito, onSecretTap, onSettings }: Props) {
  const s = useGame((g) => g)
  const [editing, setEditing] = useState(false)
  const [leaving, setLeaving] = useState<string | null>(null)
  const [burst, setBurst] = useState({ key: 0, x: 0, y: 0 })
  const panel = useRef<HTMLDivElement>(null)
  const food = useRef<HTMLSpanElement>(null)
  const coinsRef = useRef<HTMLSpanElement>(null)
  const done = doneToday(s)
  const open = s.habits.filter((h) => !done.includes(h))
  const doneIds = s.habits.filter((h) => done.includes(h))
  const toGo = habitsToGo(s, open)
  const status = s.adventure.status
  const charging = status === 'charging'
  const label = s.adventure.runs === 0 ? '1ª aventura' : `Aventura del día ${s.adventure.runs + 1}`
  const taps = useRef<number[]>([])

  const secret = () => {
    const t = Date.now()
    taps.current = [...taps.current.filter((x) => t - x < 1500), t]
    if (taps.current.length >= 5) {
      taps.current = []
      onSecretTap()
    }
  }

  // Finch's tick: confetti on the habit, its energy (or coins) flies off, the row leaves the list.
  const tick = (id: string, e: MouseEvent<HTMLButtonElement>) => {
    if (leaving || !panel.current) return
    const row = e.currentTarget
    const r = row.getBoundingClientRect()
    const p = panel.current.getBoundingClientRect()
    setBurst((b) => ({ key: b.key + 1, x: r.right - 34 - p.left, y: r.top + r.height / 2 - p.top }))
    fly(row.querySelector('.row__reward') ?? row, charging ? food.current : coinsRef.current, charging ? 'ui_energia' : 'ui_moneda')
    setLeaving(id)
    window.setTimeout(() => {
      setLeaving(null)
      onCompleteHabit(id)
    }, 320)
  }

  const sceneH = Math.round(Math.min(420, Math.max(300, width * 0.98)))
  const top = (
    <div className="home__top">
      <div className="home__greet" onClick={secret}>
        <h1>{greeting(s.playerName)}</h1>
        <p>{subline(s, open.length, toGo)}</p>
      </div>
      <span ref={coinsRef}>
        <CoinPill coins={s.coins} />
      </span>
    </div>
  )

  return (
    <div className="home">
      {status === 'running' ? (
        // While he is away, Home shows where he is (Finch: the bird walking in the forest).
        <div className="scene scene--away" style={{ height: sceneH }}>
          <RideWorld className="run__world--home" />
          {top}
        </div>
      ) : (
        <Scene
          width={width}
          height={sceneH}
          view="home"
          items={s.ownedItems}
          celebrateKey={celebrateKey}
          onTapGauchito={onTapGauchito}
        >
          {top}
        </Scene>
      )}

      <div className="panel home__panel" ref={panel}>
        <div className="home__burst" style={{ left: burst.x, top: burst.y }}>
          <Confetti burstKey={burst.key} count={22} spread={0.7} />
        </div>

        {charging && <EnergyCard energy={s.energy} label={label} foodRef={food} />}
        {status === 'ready' && (
          <button className="ecard ecard--ready" onClick={onAdventure}>
            <span className="ecard__food">
              <img src={art('habit_mate')} alt="" />
            </span>
            <div className="ecard__body">
              <small>{label}</small>
              <div className="ecard__bar">
                <i style={{ width: '100%' }} />
                <span>¡Al máximo!</span>
              </div>
            </div>
            <span className="ecard__go">¡Salir!</span>
          </button>
        )}
        {status === 'running' && (
          <button className="ecard ecard--away" onClick={onAdventure}>
            <div className="ecard__head">
              <strong>De aventura</strong>
              <span>vuelve en {formatClock(remainingMs)}</span>
            </div>
            <AdventureTrack progress={1 - remainingMs / ADVENTURE_MS} />
          </button>
        )}
        {status === 'returned' && (
          <button className="adv adv--returned" onClick={onAdventure}>
            <img className="adv__thumb" src={art(EPISODES[(s.adventure.runs - 1) % EPISODES.length].image)} alt="" />
            <span className="adv__text">
              <small>Aventura de hoy · día {((s.adventure.runs - 1) % EPISODES.length) + 1}</small>
              <strong>{EPISODES[(s.adventure.runs - 1) % EPISODES.length].title}</strong>
              <em>¡Volvió! Escuchá su historia</em>
            </span>
            <svg className="adv__chev" viewBox="0 0 24 24" aria-hidden>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <section className="card today">
          <h3>
            {open.length > 1 ? `Te quedan ${open.length} hábitos para hoy` : open.length === 1 ? 'Te queda 1 hábito para hoy' : '¡Hiciste todo por hoy! 🎉'}
            <span>
              <button className="today__edit" onClick={() => setEditing(true)}>
                Editar
              </button>
            </span>
          </h3>
          <ul>
            {open.map((id) => {
              const h = findHabit(s, id)
              return (
                <li key={id} className={leaving === id ? 'today__leaving' : ''}>
                  <button className="row" onClick={(e) => tick(id, e)}>
                    <HabitIcon habit={h} />
                    <span>{h.name}</span>
                    <em className="row__reward">
                      +{charging ? ENERGY_PER_HABIT : EXTRA_HABIT_COINS}
                      <img src={art(charging ? 'ui_energia' : 'ui_moneda')} alt="" />
                    </em>
                    <Check on={false} />
                  </button>
                </li>
              )
            })}
          </ul>
          {doneIds.length > 0 && (
            <details className="today__done">
              <summary>Hechos hoy · {doneIds.length}</summary>
              <ul>
                {doneIds.map((id) => {
                  const h = findHabit(s, id)
                  return (
                    <li key={id}>
                      <button className="row row--done" onClick={() => actions.uncompleteHabit(id)} aria-pressed>
                        <HabitIcon habit={h} />
                        <span>{h.name}</span>
                        <Check on />
                      </button>
                    </li>
                  )
                })}
              </ul>
              <p className="today__hint">Tocá uno para desmarcarlo.</p>
            </details>
          )}
        </section>

        <button className="settings-link" onClick={onSettings}>
          Ajustes · notificaciones, copia de seguridad
        </button>
      </div>

      {editing && <EditHabits onClose={() => setEditing(false)} />}
    </div>
  )
}

function EditHabits({ onClose }: { onClose: () => void }) {
  const current = useGame((g) => g.habits)
  const [picked, setPicked] = useState(current)
  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div className="modal edithabits" onClick={(e) => e.stopPropagation()}>
        <h2>Tus hábitos</h2>
        <p>Con 3 se llena la energía de la aventura; los demás suman monedas.</p>
        <div className="edithabits__list">
          <HabitPicker picked={picked} onChange={setPicked} />
        </div>
        <Button
          disabled={picked.length === 0}
          onClick={() => {
            actions.setHabits(picked)
            onClose()
          }}
        >
          Guardar
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
