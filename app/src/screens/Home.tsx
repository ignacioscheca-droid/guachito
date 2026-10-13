import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { AreaScene, type ObraLook } from '../components/AreaScene'
import { Confetti } from '../components/Confetti'
import { HabitPicker } from '../components/HabitPicker'
import { RideWorld } from '../components/RideWorld'
import { Button, CoinPill, HabitIcon } from '../components/ui'
import { art } from '../game/content'
import { AREAS, areaView, ENERGY_PER_HABIT, EXTRA_HABIT_COINS, jobInfo, WORK_MS, type Job } from '../game/journey'
import { actions, doneToday, findHabit, goalOf, nextJob, restingToday, useGame } from '../game/store'
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
  onSettings: () => void
}

/** Room each habit card takes (Finch's size: 70 px and a gap), and how many show whole. */
const CARD_STEP = 78
const CARDS_IN_VIEW = 3.5

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

/** The job's picture: a crop of its art, or its emoji. */
export function JobThumb({ job }: { job: Job }) {
  if (job.kind === 'build') {
    const p = AREAS[job.area].obras[job.obra].piece
    const src = 'obra' in p ? p.obra : 'image' in p ? p.image : null
    if (src)
      return (
        <span className="jobthumb">
          <img src={art(src)} alt="" />
        </span>
      )
  }
  return <span className="jobthumb jobthumb--emoji">{jobInfo(job).emoji}</span>
}

/** Where the job sits: "Área 1 · Obra 1 de 3", or the trip. */
export function jobLabel(job: Job) {
  if (job.kind === 'trip') return 'Entre áreas · un viaje'
  return `Área ${job.area + 1} · Obra ${job.obra + 1} de ${AREAS[job.area].obras.length}`
}

/**
 * Royal Match's top bar: what Paucho is up to, in one bar: the day's energy filling, then
 * the eight hours, with the obra at its end. Ready to start, or done, it is a button.
 */
function ProgressBar({ p, barRef }: { p: Props; barRef: RefObject<HTMLButtonElement | null> }) {
  const s = useGame((g) => g)
  const job = nextJob(s)
  const goal = goalOf(s)
  const energy = useCountTo(s.energy)
  const { status } = s.work
  let fill = 0
  let label = ''
  let start: ReactNode = <img src={art('ui_energia')} alt="" />
  let action: (() => void) | undefined
  let go = false
  if (!job) {
    fill = 1
    label = '¡Todo listo!'
    start = '🎉'
  } else if (status === 'ready') {
    fill = 1
    label = job.kind === 'trip' ? '¡A viajar!' : '¡A construir!'
    action = p.onStartJob
    go = true
  } else if (status === 'working') {
    fill = 1 - p.remainingMs / WORK_MS
    label = formatClock(p.remainingMs)
    start = job.kind === 'trip' ? '🧉' : '🔨'
    if (job.kind === 'trip') action = p.onWatchTrip
  } else if (status === 'done') {
    fill = 1
    label = job.kind === 'trip' ? '¡Volvió!' : '¡Terminó!'
    action = p.onReveal
    go = true
  } else if (restingToday(s)) {
    label = 'Sigue mañana'
    start = '🌙'
  } else {
    fill = energy / goal
    label = `${energy}/${goal}`
  }
  return (
    <button ref={barRef} className={`pbar${go ? ' pbar--go' : ''}`} onClick={action} disabled={!action}>
      <span className="pbar__track">
        <i style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }} />
        <span>{label}</span>
      </span>
      <span className="pbar__start">{start}</span>
      <span className="pbar__end">{job ? <JobThumb job={job} /> : <span className="jobthumb jobthumb--emoji">🏡</span>}</span>
    </button>
  )
}

/**
 * Home, laid out like Royal Match's: the area fills the screen, the progress bar on top,
 * and the habits where Royal Match has its level button, as Finch-sized cards that run
 * on under the tab bar. No text floats over the scene (the owner's call).
 */
export function Home(p: Props) {
  const s = useGame((g) => g)
  const [editing, setEditing] = useState(false)
  const [showDone, setShowDone] = useState(false)
  const [leaving, setLeaving] = useState<string | null>(null)
  const [burst, setBurst] = useState({ key: 0, x: 0, y: 0 })
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLButtonElement>(null)
  const coinsRef = useRef<HTMLSpanElement>(null)
  const [cardsTop, setCardsTop] = useState(470)
  const done = doneToday(s)
  const open = s.habits.filter((h) => !done.includes(h))
  const doneIds = s.habits.filter((h) => done.includes(h))
  const job = nextJob(s)
  const { status } = s.work
  const charging = status === 'charging' && job != null && !restingToday(s)
  const traveling = job?.kind === 'trip' && status === 'working'
  const view = areaView(s.jobsDone)

  // The cards start where three and a half fit above the tab bar: the last one is cut by it.
  useLayoutEffect(() => {
    const measure = () => {
      const h = root.current?.clientHeight ?? window.innerHeight
      const nav = document.querySelector('.nav')?.getBoundingClientRect().height ?? 98
      setCardsTop(Math.round(h - nav - CARDS_IN_VIEW * CARD_STEP + 8))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Finch's tick: confetti on the habit, its energy (or herraduras) flies off, the card leaves.
  const tick = (id: string, e: MouseEvent<HTMLButtonElement>) => {
    if (leaving || !root.current) return
    const card = e.currentTarget
    const r = card.getBoundingClientRect()
    const box = root.current.getBoundingClientRect()
    setBurst((b) => ({ key: b.key + 1, x: r.right - 40 - box.left, y: r.top + r.height / 2 - box.top }))
    fly(card.querySelector('.hcard__reward') ?? card, charging ? bar.current : coinsRef.current, charging ? 'ui_energia' : 'ui_herradura')
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
    else if (status === 'working') look = { mode: 'working', progress: 1 - p.remainingMs / WORK_MS }
    else look = { mode: 'working', progress: 1 }
  }
  const pose = status === 'working' ? 'build' : status === 'done' ? 'wave' : 'idle'

  return (
    <div className="home3" ref={root}>
      {traveling ? (
        <div className="scene scene--away home3__scene">
          <RideWorld dog={s.dog.arrived} className="run__world--home" />
        </div>
      ) : (
        <AreaScene
          className="home3__scene"
          area={view.area}
          built={view.built}
          current={look}
          pose={pose}
          outfit={s.outfit}
          celebrateKey={p.celebrateKey}
          dog={s.dog.arrived}
          cardsTop={cardsTop}
          onTapPaucho={p.onTapPaucho}
        />
      )}

      <div className="home3__top">
        <span ref={coinsRef}>
          <CoinPill coins={s.coins} />
        </span>
        <button className="home__gear" onClick={p.onSettings} aria-label="Ajustes">
          ⚙️
        </button>
      </div>
      <ProgressBar p={p} barRef={bar} />

      <div className="home3__chips" style={{ top: cardsTop - 46 }}>
        {doneIds.length > 0 && (
          <button className="hchip" onClick={() => setShowDone(true)} aria-label="Hechos hoy">
            ✓ {doneIds.length}
          </button>
        )}
        <button className="hchip" onClick={() => setEditing(true)} aria-label="Editar hábitos">
          ✏️
        </button>
      </div>

      <div className="home3__cards" style={{ top: cardsTop }}>
        {open.length === 0 && (
          <div className="hcard hcard--all">
            <span className="hcard__icon">🎉</span>
            <b>¡Hiciste todo por hoy!</b>
          </div>
        )}
        {open.map((id) => {
          const h = findHabit(s, id)
          return (
            <button key={id} className={`hcard${leaving === id ? ' hcard--leaving' : ''}`} onClick={(e) => tick(id, e)}>
              <span className="hcard__icon">
                <HabitIcon habit={h} />
              </span>
              <b>{h.name}</b>
              <em className="hcard__reward">
                +{charging ? ENERGY_PER_HABIT : EXTRA_HABIT_COINS}
                <img src={art(charging ? 'ui_energia' : 'ui_herradura')} alt="" />
              </em>
              <span className="hcard__tick">✓</span>
            </button>
          )
        })}
      </div>

      <div className="home__burst" style={{ left: burst.x, top: burst.y }}>
        <Confetti burstKey={burst.key} count={22} spread={0.7} />
      </div>

      {showDone && (
        <div className="overlay overlay--top" onClick={() => setShowDone(false)}>
          <div className="modal donelist" onClick={(e) => e.stopPropagation()}>
            <h2>Hechos hoy</h2>
            <p>Tocá uno para desmarcarlo.</p>
            {doneIds.map((id) => {
              const h = findHabit(s, id)
              return (
                <button key={id} className="hcard hcard--done" onClick={() => actions.uncompleteHabit(id)}>
                  <span className="hcard__icon">
                    <HabitIcon habit={h} />
                  </span>
                  <b>{h.name}</b>
                  <span className="hcard__tick hcard__tick--on">✓</span>
                </button>
              )
            })}
            <Button variant="light" onClick={() => setShowDone(false)}>
              Listo
            </Button>
          </div>
        </div>
      )}
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
