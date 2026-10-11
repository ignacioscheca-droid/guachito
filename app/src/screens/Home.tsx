import { useEffect, useRef, useState, type MouseEvent, type RefObject } from 'react'
import { AreaScene, type ObraLook } from '../components/AreaScene'
import { Confetti } from '../components/Confetti'
import { WorkTrack } from '../components/DayLoop'
import { HabitPicker } from '../components/HabitPicker'
import { RideWorld } from '../components/RideWorld'
import { Button, Check, CoinPill, HabitIcon } from '../components/ui'
import { art } from '../game/content'
import { AREAS, areaView, ENERGY_PER_HABIT, EXTRA_HABIT_COINS, jobInfo, TRIP, WORK_MS, type Job } from '../game/journey'
import { actions, doneToday, findHabit, goalOf, nextJob, restingToday, useGame, type GameState } from '../game/store'
import { formatClock } from './TripRun'

type Props = {
  celebrateKey: number
  remainingMs: number
  onCompleteHabit: (id: string) => void
  /** Full bar: on to "Paucho va a construir…". */
  onStartJob: () => void
  /** The job is finished: see it. */
  onReveal: () => void
  onWatchTrip: () => void
  onTapPaucho: () => void
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

/** "arranca la casita" / "sale al sur": what a full bar starts. */
const startsVerb = (job: Job) => (job.kind === 'trip' ? `sale de viaje al ${TRIP.place.replace('el ', '')}` : `arranca ${jobInfo(job).the}`)

function subline(s: GameState, open: number) {
  const job = nextJob(s)
  if (!job) return `${s.name} descansa: ¡terminaron todo lo que hay por ahora!`
  const info = jobInfo(job)
  const { status } = s.work
  if (status === 'done') return job.kind === 'trip' ? `¡${s.name} volvió del sur!` : `¡${s.name} terminó ${info.the}!`
  if (status === 'working') return job.kind === 'trip' ? `${s.name} está de viaje por el sur` : `${s.name} está construyendo ${info.the}`
  if (status === 'ready') return `¡${s.name} tiene toda la energía!`
  if (restingToday(s)) return `¡Hoy ya diste todo! Mañana ${s.name} ${startsVerb(job)}`
  if (open === 0) return '¡Día completo! Mañana seguimos.'
  const toGo = Math.ceil((goalOf(s) - s.energy) / ENERGY_PER_HABIT)
  if (toGo > open) return `${s.name} está listo para un gran día`
  return `Con ${toGo} hábito${toGo > 1 ? 's' : ''} más, ${s.name} ${startsVerb(job)}`
}

/** Moves the shown number towards `value` one unit at a time, like Finch's energy counter. */
function useCountTo(value: number, msPerStep = 45) {
  const [shown, setShown] = useState(value)
  useEffect(() => {
    if (shown === value) return
    const t = window.setTimeout(() => setShown((v) => v + Math.sign(value - v)), msPerStep)
    return () => clearTimeout(t)
  }, [shown, value, msPerStep])
  return shown
}

/** An energy bolt or a herradura flying from a habit to where it adds up. */
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

/** The job's picture for cards: a crop of its art, or its emoji. */
export function JobThumb({ job }: { job: Job }) {
  if (job.kind === 'build') {
    const p = AREAS[job.area].obras[job.obra].piece
    if ('image' in p) return <span className="jobthumb"><img src={art(p.image)} alt="" /></span>
  }
  return <span className="jobthumb jobthumb--emoji">{jobInfo(job).emoji}</span>
}

/** Where the job sits: "Área 1 · Obra 1 de 3", or the trip. */
export function jobLabel(job: Job) {
  if (job.kind === 'trip') return 'Entre áreas · un viaje'
  return `Área ${job.area + 1} · Obra ${job.obra + 1} de ${AREAS[job.area].obras.length}`
}

function ChargeCard({ s, job, foodRef }: { s: GameState; job: Job; foodRef: RefObject<HTMLDivElement | null> }) {
  const goal = goalOf(s)
  const shown = useCountTo(s.energy)
  const info = jobInfo(job)
  const steps = info.steps.slice(0, goal / ENERGY_PER_HABIT)
  return (
    <div className="ecard jobcard" ref={foodRef}>
      <JobThumb job={job} />
      <div className="ecard__body">
        <small>
          {jobLabel(job)} · <b>{info.name}</b>
        </small>
        <div className="ecard__bar">
          <i style={{ width: `${(shown / goal) * 100}%` }} />
          <span>
            {shown} / {goal}
          </span>
        </div>
        <div className="jobsteps">
          {steps.map((label, i) => (
            <span key={label} className={s.energy >= (i + 1) * ENERGY_PER_HABIT ? 'on' : ''}>
              {s.energy >= (i + 1) * ENERGY_PER_HABIT ? '✓ ' : ''}
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Home(p: Props) {
  const s = useGame((g) => g)
  const [editing, setEditing] = useState(false)
  const [leaving, setLeaving] = useState<string | null>(null)
  const [burst, setBurst] = useState({ key: 0, x: 0, y: 0 })
  const panel = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const coinsRef = useRef<HTMLSpanElement>(null)
  const taps = useRef<number[]>([])
  const done = doneToday(s)
  const open = s.habits.filter((h) => !done.includes(h))
  const doneIds = s.habits.filter((h) => done.includes(h))
  const job = nextJob(s)
  const { status } = s.work
  const resting = restingToday(s)
  const charging = status === 'charging' && job != null && !resting
  const traveling = job?.kind === 'trip' && status === 'working'
  const view = areaView(s.jobsDone)

  const secret = () => {
    const t = Date.now()
    taps.current = [...taps.current.filter((x) => t - x < 1500), t]
    if (taps.current.length >= 5) {
      taps.current = []
      p.onSecretTap()
    }
  }

  // Finch's tick: confetti on the habit, its energy (or herraduras) flies off, the row leaves.
  const tick = (id: string, e: MouseEvent<HTMLButtonElement>) => {
    if (leaving || !panel.current) return
    const row = e.currentTarget
    const r = row.getBoundingClientRect()
    const box = panel.current.getBoundingClientRect()
    setBurst((b) => ({ key: b.key + 1, x: r.right - 34 - box.left, y: r.top + r.height / 2 - box.top }))
    fly(row.querySelector('.row__reward') ?? row, charging ? card.current : coinsRef.current, charging ? 'ui_energia' : 'ui_herradura')
    setLeaving(id)
    window.setTimeout(() => {
      setLeaving(null)
      p.onCompleteHabit(id)
    }, 320)
  }

  // The obra under way, as it looks right now.
  let look: ObraLook | null = null
  if (job?.kind === 'build' && view.area === job.area) {
    const goal = goalOf(s)
    if (status === 'charging') look = { mode: s.energy === 0 ? 'plan' : 'charging', progress: s.energy / goal }
    else if (status === 'ready') look = { mode: 'charging', progress: 1 }
    else look = { mode: 'raw' }
  }
  const pose = status === 'working' ? 'build' : status === 'done' ? 'wave' : 'idle'

  const top = (
    <div className="home__top">
      <div className="home__greet" onClick={secret}>
        <h1>{greeting(s.playerName)}</h1>
        <p>{subline(s, open.length)}</p>
      </div>
      <span ref={coinsRef}>
        <CoinPill coins={s.coins} />
      </span>
      <button className="home__gear" onClick={p.onSettings} aria-label="Ajustes">
        ⚙️
      </button>
    </div>
  )

  return (
    <div className="home2">
      {traveling ? (
        <div className="scene scene--away home2__scene">
          <RideWorld dog={s.dog.arrived} className="run__world--home" />
          {top}
        </div>
      ) : (
        <AreaScene
          className="home2__scene"
          area={view.area}
          built={view.built}
          current={look}
          pose={pose}
          outfit={s.outfit}
          celebrateKey={p.celebrateKey}
          dog={s.dog.arrived}
          overlap={26}
          onTapPaucho={p.onTapPaucho}
        >
          {top}
        </AreaScene>
      )}

      <div className="panel home2__panel" ref={panel}>
        <div className="home__burst" style={{ left: burst.x, top: burst.y }}>
          <Confetti burstKey={burst.key} count={22} spread={0.7} />
        </div>

        {!job && (
          <div className="ecard jobcard">
            <span className="jobthumb jobthumb--emoji">🎉</span>
            <div className="ecard__body">
              <strong>¡Terminaron todo lo que hay por ahora!</strong>
              <small>Pronto, más áreas. Los hábitos siguen sumando herraduras.</small>
            </div>
          </div>
        )}
        {job && charging && <ChargeCard s={s} job={job} foodRef={card} />}
        {job && resting && (
          <div className="ecard jobcard">
            <JobThumb job={job} />
            <div className="ecard__body">
              <small>
                Mañana · <b>{jobInfo(job).name}</b>
              </small>
              <strong className="jobcard__rest">Hoy ya llenaste la energía</strong>
              <small>Lo que hagas ahora suma herraduras para la casita.</small>
            </div>
          </div>
        )}
        {job && status === 'ready' && (
          <button className="ecard ecard--ready jobcard" onClick={p.onStartJob}>
            <JobThumb job={job} />
            <div className="ecard__body">
              <small>
                {jobLabel(job)} · <b>{jobInfo(job).name}</b>
              </small>
              <div className="ecard__bar">
                <i style={{ width: '100%' }} />
                <span>¡Al máximo!</span>
              </div>
            </div>
            <span className="ecard__go">{job.kind === 'trip' ? '¡Salir!' : '¡A construir!'}</span>
          </button>
        )}
        {job && status === 'working' && (
          <button className="ecard ecard--away" onClick={job.kind === 'trip' ? p.onWatchTrip : undefined}>
            <div className="ecard__head">
              <strong>{job.kind === 'trip' ? 'De viaje al sur' : `Construyendo ${jobInfo(job).the}`}</strong>
              <span>
                {job.kind === 'trip' ? 'vuelve' : 'lista'} en {formatClock(p.remainingMs)}
              </span>
            </div>
            <WorkTrack
              progress={1 - p.remainingMs / WORK_MS}
              start={job.kind === 'trip' ? '🧉' : '🔨'}
              end={job.kind === 'trip' ? TRIP.bringsEmoji : jobInfo(job).emoji}
            />
          </button>
        )}
        {job && status === 'done' && (
          <button className="ecard ecard--done" onClick={p.onReveal}>
            <JobThumb job={job} />
            <div className="ecard__body">
              <strong>{job.kind === 'trip' ? '¡Volvió del sur!' : `¡Terminó ${jobInfo(job).the}!`}</strong>
              <small>{job.kind === 'trip' ? 'Escuchá lo que te cuenta' : '¡Vení a ver cómo quedó!'}</small>
            </div>
            <span className="ecard__go">Ver</span>
          </button>
        )}

        <section className="card today hlist">
          <h3>
            {open.length ? 'Tus hábitos de hoy' : '¡Hiciste todo por hoy! 🎉'}
            <span>
              <button className="today__edit" onClick={() => setEditing(true)}>
                Editar
              </button>
            </span>
          </h3>
          <ul className="hlist__open">
            {open.map((id, i) => {
              const h = findHabit(s, id)
              return (
                <li key={id} className={leaving === id ? 'today__leaving' : ''}>
                  <button className="row" onClick={(e) => tick(id, e)}>
                    <HabitIcon habit={h} />
                    <span>
                      {h.name}
                      {i === 0 && doneIds.length === 0 && <small className="hlist__easy">la más fácil, para arrancar</small>}
                    </span>
                    <em className="row__reward">
                      +{charging ? ENERGY_PER_HABIT : EXTRA_HABIT_COINS}
                      <img src={art(charging ? 'ui_energia' : 'ui_herradura')} alt="" />
                    </em>
                    <Check on={false} />
                  </button>
                </li>
              )
            })}
          </ul>
          {open.length > 4 && <p className="hlist__more">{open.length - 4} más ↓</p>}
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
        <p>Cada hábito le da {ENERGY_PER_HABIT} de energía a Paucho para la obra del día; cuando la barra se llena, los demás suman herraduras.</p>
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
