import { useEffect, useRef, useState } from 'react'
import { AreaScene } from '../components/AreaScene'
import { Confetti } from '../components/Confetti'
import { PauchoTalk } from '../components/PauchoTalk'
import { Button, CoinPill } from '../components/ui'
import { art } from '../game/content'
import { AREA_COINS, AREAS, areaName, areaView, JOURNEY, TRIP, TRIP_JOB } from '../game/journey'
import { haptic, sfx } from '../game/sound'
import { actions, useGame } from '../game/store'

/**
 * The morning after: the obra Paucho finished, turning from unpainted to its colours; if
 * it closed an area, the area's celebration and what comes next. Seeing it is what makes
 * it count (actions.completeJob), and what it unlocks shows up back home.
 */
export function Reveal({ onDone, startAt = 'obra' }: { onDone: () => void; startAt?: 'obra' | 'area' }) {
  const s = useGame((g) => g)
  // read once: completeJob moves the store on
  const [at] = useState(s.jobsDone)
  // Home shows the obra itself now; it comes here only for the area's celebration
  const [step, setStep] = useState<'obra' | 'area'>(startAt)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (startAt === 'area') return
    const t = window.setTimeout(() => {
      setShown(true)
      // in step with the build transition (4.2 s): the pile shakes, then the obra pops at ~1.4 s
      sfx('rumble')
      ;[0, 120, 240, 360, 480, 600].forEach((ms) => haptic('tick', ms))
      sfx('build', 0, 1350)
      haptic('heavy', 1350)
      haptic('success', 1700)
    }, 900)
    return () => clearTimeout(t)
  }, [startAt])

  const job = JOURNEY[at]
  if (!job || job.kind !== 'build') return null
  const area = AREAS[job.area]
  const obra = area.obras[job.obra]
  const view = areaView(at)
  const lastOfArea = job.obra === area.obras.length - 1

  const finish = () => {
    actions.completeJob()
    onDone()
  }
  if (step === 'area') return <AreaDone area={job.area} onDone={finish} />

  return (
    <div className="screen reveal">
      <AreaScene
        className="reveal__scene"
        area={job.area}
        built={view.built}
        current={shown ? { mode: 'reveal' } : { mode: 'working', progress: 1 }}
        pose={shown ? 'celebrate' : 'idle'}
        outfit={s.outfit}
        dog={s.dog.arrived || (job.area === 1 && job.obra === 0 && shown)}
      />
      {shown && (
        <div className="reveal__burst" aria-hidden>
          <Confetti burstKey={1} count={34} />
        </div>
      )}

      <div className="sheet reveal__sheet">
        <div className="reveal__step" key="obra">
          <small className="reveal__kicker">
            Área {job.area + 1} · {areaName(job.area, s.name)}
          </small>
          <h2>¡Terminó {obra.the}!</h2>
          <p className="reveal__say">
            <img src={art('g_avatar')} alt="" />
            <span>{obra.done}</span>
          </p>
          <Button variant="gold" disabled={!shown} onClick={() => (lastOfArea ? setStep('area') : finish())}>
            {lastOfArea ? '¡Seguir!' : '¡Qué lindo quedó!'}
          </Button>
        </div>
      </div>
    </div>
  )
}

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]

/** What comes after an area: the trip, the next area, or nothing yet. */
function afterArea(area: number): number | 'trip' | null {
  const last = JOURNEY.findLastIndex((j) => j.kind === 'build' && j.area === area)
  if (last + 1 === TRIP_JOB) return 'trip'
  return AREAS[area + 1] ? area + 1 : null
}
/** Herraduras that fly from his hand to the counter, AREA_COINS among them. */
const FLIERS = 5

/**
 * An area finished, told in beats rather than all at once: the camera opens on the whole
 * area (0), the title drops (1), Paucho jumps in with confetti (2), the herraduras fly from
 * his hand to the counter (3), and then he comes up close to invite you on (4). A tap skips
 * to him. The test menu plays it on its own (it saves nothing: completeJob does).
 */
export function AreaDone({ area, onDone }: { area: number; onDone: () => void }) {
  const s = useGame((g) => g)
  const next = afterArea(area)
  const [beat, setBeat] = useState(0)
  const [landed, setLanded] = useState(0)
  const guy = useRef<HTMLImageElement>(null)
  const coins = useRef<HTMLDivElement>(null)
  const a = AREAS[area]
  const you = s.playerName.trim()
  const [line] = useState(() => {
    const the = areaName(area, s.name, true)
    const done = pick([`¡Terminamos ${the}! Gracias a vos.`, `¡Listo, terminamos ${the}! Lo hicimos juntos.`, `¡Mirá lo lindo que nos quedó todo! Gracias${you ? `, ${you}` : ''}.`])
    const then = next === 'trip' ? `${TRIP.reason} Cuando llenes la energía, salgo.` : next != null ? AREAS[next].intro : 'Por ahora no hay más para construir… ¡pero pronto, sí!'
    return `${done} ${then}`
  })

  const skipped = useRef(false)
  useEffect(() => {
    // each beat only moves forward, and a tap that skipped to Paucho silences the rest
    const at = (ms: number, f: () => void) => window.setTimeout(() => skipped.current || f(), ms)
    const ts = [
      at(1300, () => {
        setBeat(1)
        sfx('area')
        haptic('celebrate')
      }),
      at(2300, () => {
        setBeat(2)
        sfx('cheer')
      }),
      at(3300, () => {
        setBeat(3)
        flyFromHand(guy.current, coins.current)
      }),
      ...Array.from({ length: FLIERS }, (_, i) =>
        at(3300 + FLY_MS + i * FLY_GAP, () => {
          setLanded(i + 1)
          sfx('coin')
          haptic('tick')
        }),
      ),
      at(5000, () => setBeat(4)),
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  const skip = () => {
    if (beat >= 4) return
    skipped.current = true
    setLanded(FLIERS)
    setBeat(4)
  }
  // the reward is in the store only once completeJob runs: count it on top until then
  const shownCoins = s.coins + Math.round((AREA_COINS * landed) / FLIERS)

  return (
    <div className="screen adone" onClick={skip}>
      <div className="adone__cam">
        <AreaScene className="adone__scene" area={area} built={a.obras.length} current={null} pose={null} dog={s.dog.arrived} cardsTop={Math.round(window.innerHeight * 0.68)} />
        <div className="adone__glow" aria-hidden />
      </div>
      <div className="adone__top" ref={coins}>
        <CoinPill coins={shownCoins} bump={landed > 0} key={landed} />
      </div>
      {beat >= 1 && (
        <div className="adone__head">
          <h1 className="adone__title">¡Área completada!</h1>
          <div className="adone__name">
            {areaName(area, s.name)}
            <span className="adone__dots" aria-hidden>
              {a.obras.map((o, i) => (
                <i key={o.id} className={i === a.obras.length - 1 ? 'adone__dot--last' : ''} />
              ))}
            </span>
          </div>
        </div>
      )}
      {beat >= 2 && (
        <>
          <div className="reveal__burst" aria-hidden>
            <Confetti burstKey={1} count={34} />
          </div>
          <div className={`adone__paucho${beat >= 4 ? ' adone__paucho--out' : ''}`}>
            <img ref={guy} src={art('g_jump')} alt="" draggable={false} />
          </div>
        </>
      )}
      {beat === 3 && landed < FLIERS && <div className="adone__plus">+{AREA_COINS}</div>}
      {beat >= 4 && (
        <PauchoTalk pose="b4_contento" text={line}>
          <Button variant="gold" onClick={onDone}>
            {next === 'trip' ? '¡Vamos al sur! 🏔️' : next != null ? '¡Arranquemos!' : `¡Gracias, ${s.name}!`}
          </Button>
        </PauchoTalk>
      )}
    </div>
  )
}

const FLY_MS = 850
const FLY_GAP = 120

/** Herraduras from his raised hand (on the right of the picture) to the counter on top. */
function flyFromHand(from: Element | null, to: Element | null) {
  const a = from?.getBoundingClientRect()
  const b = to?.querySelector('.coins')?.getBoundingClientRect()
  if (!a || !b) return
  const x0 = a.left + a.width * 0.82
  const y0 = a.top + a.height * 0.22
  for (let i = 0; i < FLIERS; i++) {
    const el = document.createElement('img')
    el.src = art('ui_herradura')
    el.className = 'flyer'
    el.style.left = `${x0 - 14}px`
    el.style.top = `${y0 - 14}px`
    document.body.appendChild(el)
    const dx = b.left + 14 - x0
    const dy = b.top + b.height / 2 - y0
    el.animate(
      [
        { transform: 'translate(0, 0) scale(0.4)', opacity: 0 },
        { transform: `translate(${(i - 2) * 22}px, -40px) scale(1.15)`, opacity: 1, offset: 0.2 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.7)`, opacity: 1 },
      ],
      { duration: FLY_MS, delay: i * FLY_GAP, easing: 'cubic-bezier(0.5, 0, 0.6, 1)', fill: 'backwards' },
    ).onfinish = () => el.remove()
  }
}
