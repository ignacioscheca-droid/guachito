import { useEffect, useRef, useState } from 'react'
import { AreaScene } from '../components/AreaScene'
import { WorkTrack } from '../components/DayLoop'
import { RideWorld } from '../components/RideWorld'
import { Button, CoinPill } from '../components/ui'
import { art } from '../game/content'
import { areaView, FULL_ENERGY_COINS, jobInfo, TRIP, WORK_MS } from '../game/journey'
import { actions, goalOf, nextJob, useGame } from '../game/store'
import { JobThumb, jobLabel } from './Home'
import { formatClock, returnTime } from './TripRun'

/** max: the bar reaches the top · job: what Paucho will do with it · leave: off he goes. */
export type FillStep = 'max' | 'job' | 'leave'

const RAIN = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${-((i * 0.53) % 3)}s`,
  duration: `${2.6 + ((i * 0.41) % 1.6)}s`,
  color: ['#F2B33D', '#D6453D', '#7A9A4B', '#6FB8F9', '#F28C38', '#E86A92'][i % 6],
}))

/** Herraduras flying from the reward pill up to the counter, one after another. */
function flyCoins(from: Element | null, to: Element | null) {
  if (!from || !to) return
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('img')
    el.src = art('ui_herradura')
    el.className = 'flyer'
    el.style.left = `${a.left + 22}px`
    el.style.top = `${a.top + a.height / 2 - 14}px`
    document.body.appendChild(el)
    const dx = b.left + 14 - (a.left + 22)
    const dy = b.top + b.height / 2 - (a.top + a.height / 2)
    el.animate(
      [
        { transform: 'translate(0, 0) scale(0.5)', opacity: 0 },
        { transform: `translate(${dx * 0.2 - 20 + i * 8}px, ${dy * 0.2 - 30}px) scale(1.1)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.8)`, opacity: 1 },
      ],
      { duration: 800, delay: i * 140, easing: 'cubic-bezier(0.5, 0, 0.6, 1)', fill: 'backwards' },
    ).onfinish = () => el.remove()
  }
}

/**
 * Finch's energy-full sequence: the bar counts up to the top ("¡Yujuuu!") and herraduras
 * fly in; then what Paucho will do with the energy (build the next obra, or travel);
 * then he starts, for eight hours.
 */
export function EnergyFull({ from, start, remainingMs, onDone }: { from: number; start: FillStep; remainingMs: number; onDone: () => void }) {
  const s = useGame((g) => g)
  const goal = goalOf(s)
  const [step, setStep] = useState<FillStep>(start)
  const [shown, setShown] = useState(start === 'max' ? Math.min(from, goal) : goal)
  const [cheer, setCheer] = useState(0)
  const [coins, setCoins] = useState(start === 'max' ? s.coins - FULL_ENERGY_COINS : s.coins)
  // the job is read once: after "¡A construir!" the store already moved on
  const [job] = useState(() => nextJob(s))
  const pill = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const full = shown >= goal

  // The bar counts the last of the energy in, one by one.
  useEffect(() => {
    if (step !== 'max' || full) return
    const t = window.setTimeout(() => setShown((v) => v + 1), 70)
    return () => clearTimeout(t)
  }, [step, shown, full])

  // At the top: he celebrates, then the herraduras fly to the counter and it counts up.
  useEffect(() => {
    if (step !== 'max' || !full) return
    setCheer((c) => c + 1)
    let tick = 0
    const fly = window.setTimeout(() => {
      flyCoins(pill.current, counter.current)
      tick = window.setInterval(() => setCoins((c) => (c < s.coins ? c + 1 : c)), 1200 / FULL_ENERGY_COINS)
    }, 1500)
    return () => {
      clearTimeout(fly)
      clearInterval(tick)
    }
  }, [step, full]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!job) return null
  const info = jobInfo(job)
  const trip = job.kind === 'trip'
  const view = areaView(s.jobsDone)
  const riding = trip && step === 'leave'

  return (
    <div className={`screen ef ef--${step}${full ? ' ef--full' : ''}`}>
      <div className="ef__top ef__top--area">
        {riding ? (
          <RideWorld dog={s.dog.arrived} className="run__world--home ef__ride" />
        ) : (
          <AreaScene
            area={view.area}
            built={view.built}
            current={trip ? null : { mode: step === 'leave' ? 'raw' : 'charging', progress: shown / goal }}
            pose={step === 'leave' ? 'build' : 'idle'}
            outfit={s.outfit}
            celebrateKey={cheer}
            dog={s.dog.arrived}
          />
        )}
        {!riding && (
          <span className="ef__coins" ref={counter}>
            <CoinPill coins={coins} />
          </span>
        )}
      </div>

      {(step === 'job' || (step === 'max' && full)) && (
        <div className="ef__rain" aria-hidden>
          {RAIN.map((r, i) => (
            <i key={i} style={{ left: r.left, animationDelay: r.delay, animationDuration: r.duration, background: r.color }} />
          ))}
        </div>
      )}

      <div className="ef__ground">
        {step === 'max' && (
          <div className="ef__step" key="max">
            <div className="ef__bar">
              <i style={{ width: `${(shown / goal) * 100}%` }} />
              <span>{full ? '¡Al máximo!' : `${shown} / ${goal}`}</span>
              {full && <img className="ef__food" src={art('habit_mate')} alt="" />}
            </div>
            {full && (
              <>
                <h2 className="ef__in">¡Yujuuu!</h2>
                <p className="ef__in ef__in--2">
                  {s.name} se tomó unos mates y juntó energía para {trip ? 'el viaje' : info.the}
                </p>
                <div className="ef__pill ef__in ef__in--3" ref={pill}>
                  <img src={art('ui_herradura')} alt="" />
                  <span>
                    <small>{s.name} ganó</small>+{FULL_ENERGY_COINS} herraduras
                  </span>
                </div>
                <div className="ef__foot ef__in ef__in--4">
                  <Button variant="light" onClick={() => setStep('job')}>
                    Continuar
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 'job' && (
          <div className="ef__step" key="job">
            <h2 className="ef__in ef__small">{trip ? `${s.name} se va de viaje al sur` : `${s.name} va a construir ${info.the}`}</h2>
            <div className="ef__card ef__in ef__in--2">
              <JobThumb job={job} />
              <div>
                <strong>{trip ? `Va a buscar ${TRIP.brings}` : info.name}</strong>
                <small>{trip ? TRIP.reason : jobLabel(job)}</small>
              </div>
            </div>
            <p className="ef__in ef__in--3 ef__note">
              {trip ? 'Vuelve' : 'Termina'} a las <b>{returnTime(WORK_MS)}</b>. Mientras, cada hábito que hagas suma herraduras.
            </p>
            <div className="ef__foot ef__in ef__in--4">
              <Button
                variant="light"
                onClick={() => {
                  actions.startWork()
                  setStep('leave')
                }}
              >
                {trip ? '¡Buen viaje!' : '¡A construir!'}
              </Button>
            </div>
          </div>
        )}

        {step === 'leave' && (
          <div className="ef__step" key="leave">
            <h2 className="ef__in ef__small">{trip ? '¡Arrancó el viaje!' : '¡Manos a la obra!'}</h2>
            <div className="ef__track ef__in ef__in--2">
              <WorkTrack progress={1 - remainingMs / WORK_MS} start={trip ? '🧉' : '🔨'} end={trip ? TRIP.bringsEmoji : info.emoji} />
            </div>
            <p className="ef__in ef__in--2 ef__note">
              {trip
                ? `${s.name} vuelve en ${formatClock(remainingMs)} con ${TRIP.brings} y algo para contarte.`
                : `${s.name} termina ${info.the} en ${formatClock(remainingMs)}. ¡Volvé a ver cómo quedó!`}
            </p>
            <div className="ef__foot ef__in ef__in--3">
              <Button variant="light" onClick={onDone}>
                ¡Entendido!
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
