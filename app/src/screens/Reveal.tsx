import { useEffect, useState } from 'react'
import { AreaScene } from '../components/AreaScene'
import { Confetti } from '../components/Confetti'
import { Button } from '../components/ui'
import { art } from '../game/content'
import { AREAS, areaName, areaView, JOURNEY, TRIP, TRIP_JOB } from '../game/journey'
import { actions, useGame } from '../game/store'

/**
 * The morning after: the obra Paucho finished, turning from unpainted to its colours; if
 * it closed an area, the area's celebration and what comes next. Seeing it is what makes
 * it count (actions.completeJob), and what it unlocks shows up back home.
 */
export function Reveal({ onDone }: { onDone: () => void }) {
  const s = useGame((g) => g)
  // read once: completeJob moves the store on
  const [at] = useState(s.jobsDone)
  const [step, setStep] = useState<'obra' | 'area'>('obra')
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setShown(true), 900)
    return () => clearTimeout(t)
  }, [])

  const job = JOURNEY[at]
  if (!job || job.kind !== 'build') return null
  const area = AREAS[job.area]
  const obra = area.obras[job.obra]
  const view = areaView(at)
  const lastOfArea = job.obra === area.obras.length - 1
  const nextArea = AREAS[job.area + 1]
  const tripNext = at + 1 === TRIP_JOB

  const finish = () => {
    actions.completeJob()
    onDone()
  }

  return (
    <div className="screen reveal">
      <AreaScene
        className="reveal__scene"
        area={job.area}
        built={step === 'area' ? area.obras.length : view.built}
        current={step === 'area' ? null : shown ? { mode: 'reveal' } : { mode: 'working', progress: 1 }}
        pose={shown ? 'celebrate' : 'idle'}
        outfit={s.outfit}
        dog={s.dog.arrived || (job.area === 1 && job.obra === 0 && shown)}
      />
      {shown && (
        <div className="reveal__burst" aria-hidden>
          <Confetti burstKey={step === 'area' ? 2 : 1} count={34} />
        </div>
      )}

      <div className="sheet reveal__sheet">
        {step === 'obra' ? (
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
        ) : (
          <div className="reveal__step" key="area">
            <small className="reveal__kicker">Área {job.area + 1} completa</small>
            <h2>¡Terminaron {areaName(job.area, s.name, true)}! 🎉</h2>
            {tripNext ? (
              <p className="reveal__next">
                <b>{TRIP.emoji} Lo que sigue: un viaje.</b> {TRIP.reason} Cuando llenes la energía, sale.
              </p>
            ) : nextArea ? (
              <p className="reveal__next">
                <b>Lo que sigue: {areaName(job.area + 1, s.name, true)}.</b> {nextArea.intro}
              </p>
            ) : (
              <p className="reveal__next">¡Gracias por acompañar a {s.name} en todo el camino! Pronto, más áreas.</p>
            )}
            <Button variant="gold" onClick={finish}>
              ¡Vamos!
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
