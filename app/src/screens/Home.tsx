import { useRef, useState } from 'react'
import { HabitPicker } from '../components/HabitPicker'
import { Scene } from '../components/Scene'
import { Button, Check, CoinPill, EnergyBar, HabitIcon } from '../components/ui'
import { art, ENERGY_GOAL, energyShare, EPISODES } from '../game/content'
import { actions, currentEpisode, doneToday, findHabit, useGame, type GameState } from '../game/store'
import { formatClock, returnTime } from './AdventureRun'

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

function greeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return '¡Buen día!'
  if (h >= 12 && h < 20) return '¡Buenas tardes!'
  return '¡Buenas noches!'
}

/** How many of today's open habits are still needed to fill the bar (null: not enough left today). */
function habitsToGo(s: GameState, open: string[]) {
  let need = ENERGY_GOAL - s.energy
  const shares = open.map((id) => energyShare(s.habits, id)).sort((a, b) => b - a)
  for (let i = 0; i < shares.length; i++) {
    need -= shares[i]
    if (need <= 0) return i + 1
  }
  return need <= 0 ? 0 : null
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

export function Home({ width, celebrateKey, remainingMs, onCompleteHabit, onAdventure, onTapGauchito, onSecretTap, onSettings }: Props) {
  const s = useGame((g) => g)
  const [editing, setEditing] = useState(false)
  const done = doneToday(s)
  const open = s.habits.filter((h) => !done.includes(h))
  const toGo = habitsToGo(s, open)
  const status = s.adventure.status
  const episode = currentEpisode(s)
  const day = (s.adventure.runs % EPISODES.length) + 1
  const taps = useRef<number[]>([])

  const secret = () => {
    const t = Date.now()
    taps.current = [...taps.current.filter((x) => t - x < 1500), t]
    if (taps.current.length >= 5) {
      taps.current = []
      onSecretTap()
    }
  }

  const sceneH = Math.round(Math.min(420, Math.max(300, width * 0.98)))

  return (
    <div className="home">
      <Scene
        width={width}
        height={sceneH}
        view="home"
        items={s.ownedItems}
        celebrateKey={celebrateKey}
        away={status === 'running'}
        onTapGauchito={onTapGauchito}
      >
        <div className="home__top">
          <div className="home__greet" onClick={secret}>
            <h1>{greeting()}</h1>
            <p>{subline(s, open.length, toGo)}</p>
          </div>
          <CoinPill coins={s.coins} />
        </div>
        {status === 'running' && (
          <div className="home__away">
            <img src={art('ride_2')} alt="" />
            <span>De aventura · vuelve a las {returnTime(remainingMs)}</span>
          </div>
        )}
      </Scene>

      <div className="panel home__panel">
        <EnergyBar energy={s.energy} />

        <button className={`adv adv--${status}`} onClick={onAdventure}>
          <img className="adv__thumb" src={art(episode.image)} alt="" />
          <span className="adv__text">
            <small>
              {status === 'returned' ? 'Aventura de hoy' : 'Próxima aventura'} · día {status === 'returned' ? ((s.adventure.runs - 1) % EPISODES.length) + 1 : day}
            </small>
            <strong>{status === 'returned' ? EPISODES[(s.adventure.runs - 1) % EPISODES.length].title : episode.title}</strong>
            <em>
              {status === 'charging' && (toGo == null ? 'Mañana seguimos juntando energía' : `Faltan ${toGo} hábito${toGo > 1 ? 's' : ''} para salir`)}
              {status === 'ready' && '¡Lista para salir!'}
              {status === 'running' && `Vuelve en ${formatClock(remainingMs)}`}
              {status === 'returned' && '¡Volvió! Escuchá su historia'}
            </em>
          </span>
          <svg className="adv__chev" viewBox="0 0 24 24" aria-hidden>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <section className="card today">
          <h3>
            Tus hábitos de hoy
            <span>
              {done.filter((d) => s.habits.includes(d)).length}/{s.habits.length}
              <button className="today__edit" onClick={() => setEditing(true)}>
                Editar
              </button>
            </span>
          </h3>
          <ul>
            {s.habits.map((id) => {
              const h = findHabit(s, id)
              const on = done.includes(id)
              return (
                <li key={id}>
                  <button
                    className={`row${on ? ' row--done' : ''}`}
                    onClick={() => (on ? actions.uncompleteHabit(id) : onCompleteHabit(id))}
                    aria-pressed={on}
                  >
                    <HabitIcon habit={h} />
                    <span>{h.name}</span>
                    <Check on={on} />
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="today__hint">Tocá un hábito hecho para desmarcarlo.</p>
        </section>

        <button className="settings-link" onClick={onSettings}>
          Ajustes · recordatorio, copia de seguridad
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
        <p>Entre todos llenan la energía del día.</p>
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
