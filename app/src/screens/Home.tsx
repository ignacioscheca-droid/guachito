import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { AreaScene, type ObraLook } from '../components/AreaScene'
import { Confetti } from '../components/Confetti'
import { DoneSheet, HabitsSheet, MOMENTS, SkippedSheet } from '../components/HabitSheets'
import { RideWorld } from '../components/RideWorld'
import { Button, CoinPill, HabitIcon } from '../components/ui'
import { art } from '../game/content'
import { AREAS, areaView, ENERGY_PER_HABIT, EXTRA_HABIT_COINS, FULL_ENERGY_COINS, jobInfo, WORK_MS, type Job } from '../game/journey'
import {
  actions,
  chargeTarget,
  doneToday,
  findHabit,
  finished,
  getState,
  goalOf,
  habitsToday,
  nextJob,
  planOf,
  RESCUE_HABITS,
  restingToday,
  skippedToday,
  streakNow,
  timesDone,
  todayKey,
  useGame,
  weekCount,
  type GameState,
} from '../game/store'
import { haptic, sfx } from '../game/sound'
import { AddHabit } from '../components/AddHabit'
import { PauchoFace } from '../components/Paucho'
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
  const [adding, setAdding] = useState(false)
  const [showDone, setShowDone] = useState(false)
  const [showSkipped, setShowSkipped] = useState(false)
  // what Paucho says here for a moment (a habit set aside)
  const [homeSay, setHomeSay] = useState<string | null>(null)
  const [leaving, setLeaving] = useState<{ id: string; folding: boolean } | null>(null)
  // a habit of several times just ticked once: the card stays, the next tap waits for this one
  const [counting, setCounting] = useState<string | null>(null)
  const [burst, setBurst] = useState({ key: 0, x: 0, y: 0 })
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLButtonElement>(null)
  const coinsRef = useRef<HTMLSpanElement>(null)
  const [cardsTop, setCardsTop] = useState(470)
  const done = doneToday(s)
  const today = habitsToday(s)
  const skipped = skippedToday(s)
  const open = today.filter((h) => !finished(s, h) && !skipped.includes(h))
  const doneIds = today.filter((h) => finished(s, h))
  // Finch's groups: by the moment of the day, shown only when there's more than one
  const groups = MOMENTS.map(([m, label]) => ({ label, ids: open.filter((id) => planOf(s, id).moment === m) })).filter((g) => g.ids.length)
  const streakDays = streakNow(s)
  // the streak gone cold, which today's habits can recalentar
  const rescue = s.dayStart?.day === todayKey(s) && s.dayStart.rescue?.offered ? s.dayStart.rescue : null
  const job = nextJob(s)
  const { status } = s.work
  const charging = chargeTarget(s) != null || p.fullPending
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
    if (leaving || counting || p.fullPending || !root.current) return
    const card = e.currentTarget
    const r = card.getBoundingClientRect()
    const box = root.current.getBoundingClientRect()
    // a habit of several times only leaves with its last one
    const last = timesDone(s, id) + 1 >= planOf(s, id).times
    setBurst((b) => ({ key: b.key + 1, x: r.right - 40 - box.left, y: r.top + r.height / 2 - box.top }))
    sfx('check')
    haptic('success')
    if (last) {
      // the card shows its tick for a moment, then folds so the next ones slide up (no gap)
      setLeaving({ id, folding: false })
      window.setTimeout(() => setLeaving({ id, folding: true }), 380)
    } else setCounting(id)
    // its energy (or herraduras) flies off and counts when it lands (fly: 650 ms)
    fly(card.querySelector('.hcard__reward') ?? card, charging ? (bar.current?.querySelector('.pbar__start') ?? bar.current) : coinsRef.current, charging ? 'ui_energia' : 'ui_herradura')
    if (!charging) sfx('coin', 0, 620)
    window.setTimeout(() => {
      setLeaving(null)
      setCounting(null)
      p.onCompleteHabit(id)
    }, 650)
  }

  // «Hoy no puedo»: the card leaves for the 💤 chip, and Paucho takes it well
  const skip = (id: string) => {
    actions.skipHabit(id)
    sfx('tap')
    const after = getState()
    const left = habitsToday(after).filter((h) => !finished(after, h) && !skippedToday(after).includes(h))
    const target = chargeTarget(after)
    const short = target && after.energy + left.reduce((n, h) => n + (planOf(after, h).times - timesDone(after, h)) * ENERGY_PER_HABIT, 0) < target.goal
    const line = short ? 'Hoy juntamos lo que se pueda, y mañana seguimos. ¡Tranqui!' : pick(['¡Tranqui! Mañana le damos.', 'No pasa nada, hoy hacemos lo que se pueda.', 'Dale, ese queda para otro día.'])
    setHomeSay(line)
    window.setTimeout(() => setHomeSay((l) => (l === line ? null : l)), 4500)
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
  // he greets you up close as soon as you're back (the obra still under its pile behind him)
  const waiting = !!doneObra && phase == null && !p.hidePaucho
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
  const greet = doneObra ? `¡Volviste${s.playerName ? `, ${s.playerName}` : ''}! Terminé ${doneObra.the}. ¿La vemos? 🧉` : ''
  const fieldSay = p.say ?? (phase === 'next' ? nextSay : homeSay)
  const pose = p.hidePaucho || phase === 'tell' || waiting ? null : phase === 'reveal' ? 'celebrate' : status === 'working' ? 'build' : status === 'done' ? 'wave' : 'idle'
  const dots = area.obras.map((_, i) => i < view.built + (phase === 'tell' ? 1 : 0))

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
          say={phase === 'reveal' || phase === 'tell' ? null : fieldSay}
          mark={phase === 'next' ? 'next' : null}
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
      {waiting && (
        <PauchoTalk pose="b1_saluda" text={greet}>
          <Button variant="gold" onClick={openObra}>
            ¡A ver! ✨
          </Button>
        </PauchoTalk>
      )}
      {phase === 'tell' && doneObra && <PauchoTalk compact pose="b4_contento" text={doneObra.done.startsWith('¡Mirá') ? doneObra.done : `¡Mirá cómo quedó ${doneObra.the}! ${doneObra.done}`} onNext={finishObra} />}

      <div className="home3__chips" style={{ top: cardsTop - 46 }}>
        {rescue && (
          <span className="hchip hchip--rescue" aria-label={`${RESCUE_HABITS - done.length} hábitos para recalentar el mate`}>
            🔥 {done.length} / {RESCUE_HABITS}
          </span>
        )}
        {!rescue && streakDays > 0 && (
          <span className="hchip hchip--streak" aria-label={`${streakDays} días de racha`}>
            <img src={art('habit_mate')} alt="" />
            {streakDays}
          </span>
        )}
        {doneIds.length > 0 && (
          <button className="hchip" onClick={() => setShowDone(true)} aria-label="Hechos hoy">
            ✓ {doneIds.length}
          </button>
        )}
        {skipped.length > 0 && (
          <button className="hchip" onClick={() => setShowSkipped(true)} aria-label="Hoy no">
            💤 {skipped.length}
          </button>
        )}
        <button className="hchip" onClick={() => setEditing(true)} aria-label="Editar hábitos">
          ✏️
        </button>
      </div>

      <div className="home3__cards" style={{ top: cardsTop - 30 }}>
        {open.length === 0 && (
          <div className="hall">
            <span className="hall__face">
              <PauchoFace outfit={s.outfit} />
            </span>
            <p className="hall__say">
              {skipped.length ? `¡Listo por hoy${s.playerName ? `, ${s.playerName}` : ''}! Lo que no se pudo, mañana.` : `¡Cumpliste todo por hoy${s.playerName ? `, ${s.playerName}` : ''}! Estoy orgulloso de vos.`}
            </p>
            <button className="hall__add" onClick={() => setAdding(true)}>
              <b>＋</b> Agregar un hábito
            </button>
          </div>
        )}
        {groups.map((g) => (
          <div key={g.label} className="hgroup">
            {groups.length > 1 && <p className="hgroup__title">{g.label}</p>}
            {g.ids.map((id) => (
              <HabitCard
                key={id}
                id={id}
                s={s}
                charging={charging}
                leaving={leaving?.id === id ? leaving : null}
                counted={counting === id}
                onTick={(e) => tick(id, e)}
                onSkip={() => skip(id)}
              />
            ))}
          </div>
        ))}
        {open.length > 0 && (
          <button className="hcard hcard--add" onClick={() => setAdding(true)}>
            <span className="hcard__icon">＋</span>
            <b>Agregar un hábito</b>
          </button>
        )}
      </div>

      <div className="home__burst" style={{ left: burst.x, top: burst.y }}>
        <Confetti burstKey={burst.key} count={22} spread={0.7} />
      </div>

      {showDone && <DoneSheet ids={doneIds} onClose={() => setShowDone(false)} />}
      {showSkipped && <SkippedSheet ids={skipped} onClose={() => setShowSkipped(false)} />}
      {editing && <HabitsSheet onClose={() => setEditing(false)} onSkip={skip} />}
      {adding && <AddHabit onClose={() => setAdding(false)} />}
    </div>
  )
}

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
const WEEK_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

/** How far a card slides to show «Hoy no puedo». */
const SWIPE_OPEN = 112

/**
 * A habit, Finch-sized: its name, what's left of it (drops for one of several times, the
 * week's count, its days), what it gives, and the tick (a gold "+1" until its last time).
 * Slid to the left it shows «Hoy no puedo».
 */
function HabitCard({
  id,
  s,
  charging,
  leaving,
  counted,
  onTick,
  onSkip,
}: {
  id: string
  s: GameState
  charging: boolean
  leaving: { folding: boolean } | null
  counted: boolean
  onTick: (e: MouseEvent<HTMLButtonElement>) => void
  onSkip: () => void
}) {
  const h = findHabit(s, id)
  const plan = planOf(s, id)
  const n = timesDone(s, id)
  const [dx, setDx] = useState(0)
  const drag = useRef<{ x: number; y: number; from: number; moved: boolean } | null>(null)
  const swiped = useRef(false)
  const many = plan.times > 1
  const sub = many ? null : plan.when.kind === 'week' ? `${weekCount(s, id)} de ${plan.when.times} esta semana` : plan.when.kind === 'days' ? WEEK_LETTERS.filter((_, d) => (plan.when as { days: number[] }).days.includes(d)).join(' · ') : null
  return (
    <div className={`hrow${leaving ? ` hrow--leaving${leaving.folding ? ' hcard--folding' : ''}` : ''}`}>
      <button className="hrow__skip" onClick={onSkip} tabIndex={dx ? 0 : -1}>
        💤
        <span>Hoy no puedo</span>
      </button>
      <button
        className={`hcard${leaving ? ' hcard--ticked' : ''}${counted ? ' hcard--counted' : ''}`}
        style={{ transform: dx ? `translateX(${dx}px)` : undefined, transition: drag.current ? 'none' : undefined }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, from: dx, moved: false }
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d) return
          const mx = e.clientX - d.x
          if (!d.moved && Math.abs(mx) > 10 && Math.abs(mx) > Math.abs(e.clientY - d.y)) d.moved = true
          if (d.moved) setDx(Math.max(-SWIPE_OPEN - 20, Math.min(0, d.from + mx)))
        }}
        onPointerUp={() => {
          const d = drag.current
          drag.current = null
          if (!d?.moved) return
          swiped.current = true
          setDx((x) => (x < -SWIPE_OPEN / 2 ? -SWIPE_OPEN : 0))
        }}
        onPointerCancel={() => {
          drag.current = null
          setDx((x) => (x < -SWIPE_OPEN / 2 ? -SWIPE_OPEN : 0))
        }}
        onClick={(e) => {
          // a swipe isn't a tap; and with «Hoy no puedo» showing, a tap closes it
          if (swiped.current) return void (swiped.current = false)
          if (dx) return setDx(0)
          onTick(e)
        }}
      >
        <span className="hcard__icon">
          <HabitIcon habit={h} />
        </span>
        <span className="hcard__text">
          <b>{h.name}</b>
          {many && (
            <span className="hcard__drops" aria-label={`${n} de ${plan.times}`}>
              {Array.from({ length: plan.times }, (_, i) => (
                <i key={i} className={i < n ? 'on' : i === n && counted ? 'on hcard__drop--new' : ''} />
              ))}
            </span>
          )}
          {sub && <small>{sub}</small>}
        </span>
        <em className="hcard__reward">
          +{charging ? ENERGY_PER_HABIT : EXTRA_HABIT_COINS}
          <img src={art(charging ? 'ui_energia' : 'ui_herradura')} alt="" />
        </em>
        {many && n + 1 < plan.times && !leaving ? <span className="hcard__tick hcard__tick--plus">+1</span> : <span className={`hcard__tick${leaving ? ' hcard__tick--on' : ''}`}>✓</span>}
      </button>
    </div>
  )
}
