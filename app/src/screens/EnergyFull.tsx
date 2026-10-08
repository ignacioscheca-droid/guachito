import { useEffect, useRef, useState } from 'react'
import { AdventureTrack } from '../components/DayLoop'
import { RideWorld } from '../components/RideWorld'
import { Scene } from '../components/Scene'
import { Button, CoinPill } from '../components/ui'
import { ADVENTURE_MS, art, ENERGY_GOAL, FULL_ENERGY_COINS, ranchStage } from '../game/content'
import { actions, useGame } from '../game/store'
import { formatClock } from './AdventureRun'

export type FillStep = 'max' | 'grow' | 'leave'

const RAIN = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${-((i * 0.53) % 3)}s`,
  duration: `${2.6 + ((i * 0.41) % 1.6)}s`,
  color: ['#F2B33D', '#D6453D', '#7A9A4B', '#6FB8F9', '#F28C38', '#E86A92'][i % 6],
}))

/** Coins flying from the reward pill up to the coin counter, one after another. */
function flyCoins(from: Element | null, to: Element | null) {
  if (!from || !to) return
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('img')
    el.src = art('ui_moneda')
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
 * Finch's energy-full sequence: the bar counts up to the top ("¡Yujuuu!"), Gauchito
 * celebrates and earns coins; then his ranch grows a little (Finch: the bird grows up); then off he goes for eight
 * hours, and Home follows him on the pampas.
 */
export function EnergyFull({
  width,
  from,
  start,
  remainingMs,
  onDone,
}: {
  width: number
  from: number
  start: FillStep
  remainingMs: number
  onDone: () => void
}) {
  const s = useGame((g) => g)
  const [step, setStep] = useState<FillStep>(start)
  const [shown, setShown] = useState(start === 'max' ? Math.min(from, ENERGY_GOAL) : ENERGY_GOAL)
  const [cheer, setCheer] = useState(0)
  const [coins, setCoins] = useState(start === 'max' ? s.coins - FULL_ENERGY_COINS : s.coins)
  const pill = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const full = shown >= ENERGY_GOAL
  const sceneH = Math.round(Math.min(470, width * 1.12))

  // The bar counts the last of the energy in, one by one.
  useEffect(() => {
    if (step !== 'max' || full) return
    const t = window.setTimeout(() => setShown((v) => v + 1), 140)
    return () => clearTimeout(t)
  }, [step, shown, full])

  // At the top: he celebrates, then the coins fly to the counter and it counts up.
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

  const { stage, next, justGrew } = ranchStage(s.fullEnergyDays)
  const span = next ? next.days - stage.days : 1
  const done = next ? s.fullEnergyDays - stage.days : 1
  const left = next ? next.days - s.fullEnergyDays : 0

  return (
    <div className={`screen ef ef--${step}${full ? ' ef--full' : ''}`}>
      <div className="ef__top" style={{ height: sceneH }}>
        {step === 'leave' ? (
          <RideWorld className="run__world--home ef__ride" />
        ) : (
          <Scene width={width} height={sceneH} view="cheer" items={s.ownedItems} celebrateKey={cheer} />
        )}
        {step !== 'leave' && (
          <span className="ef__coins" ref={counter}>
            <CoinPill coins={coins} />
          </span>
        )}
      </div>

      {(step === 'grow' || (step === 'max' && full)) && (
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
              <i style={{ width: `${(shown / ENERGY_GOAL) * 100}%` }} />
              <span>{full ? '¡Al máximo!' : `${shown} / ${ENERGY_GOAL}`}</span>
              {full && <img className="ef__food" src={art('habit_mate')} alt="" />}
            </div>
            {full && (
              <>
                <h2 className="ef__in">¡Yujuuu!</h2>
                <p className="ef__in ef__in--2">
                  {s.name} se tomó unos mates y juntó energía para el día {Math.max(1, s.fullEnergyDays)}
                </p>
                <div className="ef__pill ef__in ef__in--3" ref={pill}>
                  <img src={art('ui_moneda')} alt="" />
                  <span>
                    <small>{s.name} ganó</small>+{FULL_ENERGY_COINS} monedas
                  </span>
                </div>
                <div className="ef__foot ef__in ef__in--4">
                  <Button variant="light" onClick={() => setStep('grow')}>
                    Continuar
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 'grow' && (
          <div className="ef__step" key="grow">
            <h2 className="ef__in ef__small">
              {justGrew ? `¡El rancho creció! Ahora es ${stage.a} 🎉` : `El rancho de ${s.name} está creciendo`}
            </h2>
            <div className="ef__card ef__in ef__in--2">
              <span className="ef__card-icon ef__card-icon--ranch">
                <img src={art('nav_rancho')} alt="" />
              </span>
              <div>
                <strong>{next ? `De ${stage.the.split(' ').pop()} a ${next.the.split(' ').pop()}` : `Tu rancho es ${stage.a}`}</strong>
                <small>{next ? `Lográ ${span} días con energía completa` : 'Llegaste a la última etapa'}</small>
                <div className="ef__progress">
                  <i style={{ width: `${(done / span) * 100}%` }} />
                  <span>{next ? `${done} / ${span}` : '¡Completo!'}</span>
                </div>
              </div>
            </div>
            {next && (
              <p className="ef__in ef__in--3 ef__note">
                Faltan {left} día{left > 1 ? 's' : ''} para que {stage.the} se convierta en <b>{next.a}</b>.
              </p>
            )}
            <p className="ef__in ef__in--4 ef__ready">{s.name} está listo para salir a recorrer las pampas y aprender algo nuevo.</p>
            <div className="ef__foot ef__in ef__in--5">
              <Button
                variant="light"
                onClick={() => {
                  actions.startAdventure()
                  setStep('leave')
                }}
              >
                ¡Salir de aventura!
              </Button>
            </div>
          </div>
        )}

        {step === 'leave' && (
          <div className="ef__step" key="leave">
            <h2 className="ef__in ef__small">¡Arrancó una nueva aventura!</h2>
            <div className="ef__track ef__in ef__in--2">
              <AdventureTrack progress={1 - remainingMs / ADVENTURE_MS} />
            </div>
            <p className="ef__in ef__in--2 ef__note">
              {s.name} va a tener algo para contarte cuando termine la aventura de hoy, en {formatClock(remainingMs)}.
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
