import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { AreaScene, type ObraLook } from '../components/AreaScene'
import { Confetti } from '../components/Confetti'
import { HabitPicker } from '../components/HabitPicker'
import { RideWorld } from '../components/RideWorld'
import { Button, CoinPill, HabitIcon } from '../components/ui'
import { art } from '../game/content'
import { AREAS, areaView, ENERGY_PER_HABIT, EXTRA_HABIT_COINS, FULL_ENERGY_COINS, jobInfo, WORK_MS, type Job } from '../game/journey'
import { actions, doneToday, findHabit, getState, goalOf, nextJob, restingToday, useGame } from '../game/store'
import { haptic, sfx } from '../game/sound'
import { PauchoTalk } from '../components/PauchoTalk'
import { formatClock } from './TripRun'

type Props = {
  celebrateKey: number
  remainingMs: number
  onCompleteHabit: (id: string) => void
  /** The habit just done filled the bar: Home keeps showing the bar counting up (not "¡A
   * construir!") and the herraduras of before, until the full-energy sequence takes over. */
  fullPending: boolean
  /** Paucho is up close (talking): the one in the field steps out. */
  hidePaucho?: boolean
  /** What Paucho says in the field for a moment. */
  say?: string | null
  /** A finished obra seen here closed its area: on to the area's celebration. */
  onAreaDone: () => void
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

/** The shown number glides to `value` (ease-out, `ms`), in step with the bar's width. */
function useTween(value: number, ms = 700) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = performance.now()
    const v0 = from.current
    let raf = 0
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / ms)
      const v = v0 + (value - v0) * (1 - (1 - k) ** 3)
      from.current = v
      setShown(v)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
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
  const energy = Math.round(useTween(s.energy))
  const pending = p.fullPending
  const { status } = s.work
  // the bar ticks up as it fills: a rising blip and a haptic every other step
  const last = useRef(energy)
  useEffect(() => {
    if (energy > last.current) {
      sfx('tick', energy / goal)
      if (energy % 2 === 0) haptic('tick')
    }
    last.current = energy
  }, [energy, goal])
  // a gain landing: the start icon jumps, a "+N" pops up and a shine runs along the fill
  const [gain, setGain] = useState<{ n: number; key: number } | null>(null)
  const lastEnergy = useRef(s.energy)
  useEffect(() => {
    const n = s.energy - lastEnergy.current
    if (n > 0) setGain((g) => ({ n, key: (g?.key ?? 0) + 1 }))
    lastEnergy.current = s.energy
  }, [s.energy])

  let fill = 0
  let label = ''
  let start: ReactNode = <img src={art('ui_energia')} alt="" />
  let action: (() => void) | undefined
  let go = false
  let full = false
  let charging = false
  if (!job) {
    fill = 1
    label = '¡Todo listo!'
    start = '🎉'
  } else if (pending) {
    // the fill follows the store (the width glides by itself); the number glides with it
    fill = s.energy / goal
    label = `${energy} / ${goal}`
    full = energy >= goal
    charging = true
  } else if (status === 'ready') {
    fill = 1
    label = job.kind === 'trip' ? '¡A viajar!' : '¡A construir!'
    action = p.onStartJob
    go = true
    full = true
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
    full = true
  } else if (restingToday(s)) {
    label = 'Sigue mañana'
    start = '🌙'
  } else {
    fill = s.energy / goal
    label = `${energy} / ${goal}`
    charging = true
  }
  return (
    <button ref={barRef} className={`pbar${go ? ' pbar--go' : ''}${full ? ' pbar--full' : ''}${charging ? ' pbar--charging' : ''}`} onClick={action} disabled={!action}>
      <span className="pbar__track">
        <i className="pbar__fill" style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }}>
          {gain && <b key={gain.key} className="pbar__shine" />}
        </i>
        <span className="pbar__label">{label}</span>
      </span>
      <span key={gain?.key ?? 0} className={`pbar__start${gain ? ' pbar__start--bump' : ''}`}>
        {start}
      </span>
      {gain && charging && (
        <span key={`plus${gain.key}`} className="pbar__plus">
          +{gain.n}
        </span>
      )}
      {full && (
        <span className="pbar__sparks" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </span>
      )}
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
  const [leaving, setLeaving] = useState<{ id: string; folding: boolean } | null>(null)
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
  const charging = (status === 'charging' && job != null && !restingToday(s)) || p.fullPending
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
    if (leaving || p.fullPending || !root.current) return
    const card = e.currentTarget
    const r = card.getBoundingClientRect()
    const box = root.current.getBoundingClientRect()
    setBurst((b) => ({ key: b.key + 1, x: r.right - 40 - box.left, y: r.top + r.height / 2 - box.top }))
    sfx('check')
    haptic('success')
    // the card shows its tick for a moment, then folds so the next ones slide up (no gap)
    setLeaving({ id, folding: false })
    window.setTimeout(() => setLeaving({ id, folding: true }), 380)
    // its energy (or herraduras) flies off and counts when it lands (fly: 650 ms)
    fly(card.querySelector('.hcard__reward') ?? card, charging ? (bar.current?.querySelector('.pbar__start') ?? bar.current) : coinsRef.current, charging ? 'ui_energia' : 'ui_herradura')
    if (!charging) sfx('coin', 0, 620)
    window.setTimeout(() => {
      setLeaving(null)
      p.onCompleteHabit(id)
    }, 650)
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
  // Back with an obra finished: it waits in the field, you tap it, it rises where it is and
  // Paucho tells you about it; then what comes next glows (Home's own little sequence).
  const [phase, setPhase] = useState<'reveal' | 'tell' | 'next' | null>(null)
  const [nextSay, setNextSay] = useState<string | null>(null)
  const area = AREAS[view.area]
  const doneObra = status === 'done' && job?.kind === 'build' && view.area === job.area ? area.obras[view.built] : null
  const waiting = !!doneObra && phase == null
  const openObra = () => {
    if (!doneObra || phase) return
    setPhase('reveal')
    sfx('rumble')
    ;[0, 120, 240, 360, 480, 600].forEach((ms) => haptic('tick', ms))
    sfx('build', 0, 1350)
    haptic('heavy', 1350)
    haptic('success', 1700)
    window.setTimeout(() => {
      const r = root.current?.getBoundingClientRect()
      setBurst((b) => ({ key: b.key + 1, x: (r?.width ?? 390) / 2, y: (r?.height ?? 844) * 0.38 }))
    }, 1400)
    window.setTimeout(() => setPhase('tell'), 2300)
  }
  const finishObra = () => {
    if (!doneObra || !job || job.kind !== 'build') return
    if (job.obra === area.obras.length - 1) {
      setPhase(null)
      return p.onAreaDone()
    }
    actions.completeJob()
    const next = area.obras[job.obra + 1]
    setNextSay(restingToday(getState()) ? `Mañana arrancamos ${next.the}, ¿me ayudás?` : `¡Ahora vamos con ${next.the}! ¿Me ayudás con tus hábitos?`)
    setPhase('next')
    window.setTimeout(() => setPhase((ph) => (ph === 'next' ? null : ph)), 6500)
  }
  if (phase === 'reveal' || phase === 'tell') look = { mode: 'reveal' }
  const greet = s.playerName ? `¡Volviste, ${s.playerName}! Mirá lo que armé 🧉` : '¡Volviste! Mirá lo que armé 🧉'
  const fieldSay = p.say ?? (waiting ? greet : phase === 'next' ? nextSay : null)
  const pose = p.hidePaucho || phase === 'tell' ? null : phase === 'reveal' ? 'celebrate' : status === 'working' ? 'build' : status === 'done' ? 'wave' : 'idle'
  const dots = area.obras.map((_, i) => i < view.built + (phase === 'tell' ? 1 : 0))

  return (
    <div className={`home3${waiting ? ' home3--waiting' : ''}`} ref={root}>
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
          say={phase === 'reveal' || phase === 'tell' ? null : fieldSay}
          mark={waiting ? 'ready' : phase === 'next' ? 'next' : null}
          onTapObra={openObra}
        />
      )}

      <div className="home3__top">
        <span ref={coinsRef}>
          <CoinPill coins={p.fullPending ? s.coins - FULL_ENERGY_COINS : s.coins} />
        </span>
        <button className="home__gear" onClick={p.onSettings} aria-label="Ajustes">
          ⚙️
        </button>
      </div>
      <ProgressBar p={{ ...p, onReveal: doneObra ? openObra : p.onReveal }} barRef={bar} />
      {phase && (
        <div className="home3__area" aria-label="Progreso del área">
          Área {view.area + 1} ·{' '}
          {dots.map((on, i) => (
            <i key={i} className={on ? 'on' : ''} />
          ))}
        </div>
      )}
      {phase === 'tell' && doneObra && <PauchoTalk compact pose="b4_contento" text={`¡Mirá cómo quedó ${doneObra.the}! ${doneObra.done}`} onNext={finishObra} />}

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
            <button
              key={id}
              className={`hcard${leaving?.id === id ? ` hcard--ticked${leaving.folding ? ' hcard--folding' : ''}` : ''}`}
              onClick={(e) => tick(id, e)}
            >
              <span className="hcard__icon">
                <HabitIcon habit={h} />
              </span>
              <b>{h.name}</b>
              <em className="hcard__reward">
                +{charging ? ENERGY_PER_HABIT : EXTRA_HABIT_COINS}
                <img src={art(charging ? 'ui_energia' : 'ui_herradura')} alt="" />
              </em>
              <span className={`hcard__tick${leaving?.id === id ? ' hcard__tick--on' : ''}`}>✓</span>
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
                <button
                  key={id}
                  className="hcard hcard--done"
                  onClick={() => {
                    sfx('uncheck')
                    actions.uncompleteHabit(id)
                  }}
                >
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
  const name = useGame((g) => g.name)
  const [picked, setPicked] = useState(current)
  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div className="modal edithabits" onClick={(e) => e.stopPropagation()}>
        <h2>Tus hábitos</h2>
        <p>Cada hábito le da {ENERGY_PER_HABIT} de energía a {name} para la obra del día; cuando la barra se llena, los demás suman herraduras.</p>
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
