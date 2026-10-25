import { useLayoutEffect, useRef, useState } from 'react'
import { AreaScene } from '../components/AreaScene'
import { Button } from '../components/ui'
import { art } from '../game/content'
import { AREAS, areaName, areasDone, areaView, TRIP } from '../game/journey'
import { useGame } from '../game/store'

/** The areas after the ones in the game, in the agreed order: locked tiles, so the road
 * keeps going up (Royal Match's grey rooms with a padlock). */
const COMING = ['La cocina', 'La laguna', 'La estación']

/** Royal Match's slow pan: from the top of the road down to the current area. */
function panTo(box: HTMLElement, target: number) {
  const from = box.scrollTop
  const ms = Math.min(2600, Math.max(1200, Math.abs(target - from) * 1.1))
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
  let start = 0
  let raf = 0
  const step = (now: number) => {
    start ||= now
    const t = Math.min(1, (now - start) / ms)
    box.scrollTop = from + (target - from) * ease(t)
    if (t < 1) raf = requestAnimationFrame(step)
  }
  const delay = window.setTimeout(() => (raf = requestAnimationFrame(step)), 350)
  // a touch takes over
  const stop = () => {
    clearTimeout(delay)
    cancelAnimationFrame(raf)
    box.removeEventListener('pointerdown', stop)
    box.removeEventListener('wheel', stop)
  }
  box.addEventListener('pointerdown', stop, { passive: true })
  box.addEventListener('wheel', stop, { passive: true })
  return stop
}

/**
 * The areas as a road that climbs (the owner's call, after Royal Match): area 1 at the
 * bottom, the next ones above. It opens on the current area, centred, with a bit of the
 * one before below and of the one after above.
 */
export function AreasTab({ onGoHome }: { onGoHome: () => void }) {
  const s = useGame((g) => g)
  const [visit, setVisit] = useState<number | null>(null)
  const finished = areasDone(s.jobsDone)
  const view = areaView(s.jobsDone)
  const focus = Math.min(finished, AREAS.length - 1)
  const road = useRef<HTMLDivElement>(null)
  const current = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const box = road.current
    const tile = current.current
    if (!box || !tile) return
    // it opens at the top, on the areas still to come, and glides down to the current one
    box.scrollTop = 0
    return panTo(box, tile.offsetTop + tile.offsetHeight / 2 - box.clientHeight / 2)
  }, [])

  const tiles = Array.from({ length: AREAS.length + COMING.length }, (_, i) => i).reverse()
  return (
    <div className="aroad" ref={road}>
      {tiles.map((i) => {
        const a = AREAS[i]
        const done = i < finished
        const now = i === focus && !done
        const building = now && view.area === i
        const known = done || now
        return (
          <section key={i} ref={i === focus ? current : undefined} className={`atile${now ? ' atile--now' : ''}${known ? '' : ' atile--locked'}`}>
            <header>
              <small>Área {i + 1}</small>
              <strong>{a ? areaName(i, s.name) : COMING[i - AREAS.length]}</strong>
            </header>
            <div className="atile__img">
              {known && a ? (
                <AreaScene area={i} built={done ? a.obras.length : view.area === i ? view.built : 0} pose={null} whole />
              ) : (
                // still to come: the empty place, in black and white, under a padlock
                <img className="atile__empty" src={art(a ? a.base : 'area3_0')} alt="" />
              )}
              {!known && <img className="atile__lock" src={art('ui_candado')} alt="Bloqueada" />}
              {known && (
                <div className="atile__foot">
                  {done && (
                    <>
                      <span>✅ Completa</span>
                      <Button variant="light" onClick={() => setVisit(i)}>
                        Ver
                      </Button>
                    </>
                  )}
                  {building && (
                    <>
                      <span>
                        🔨 Obra {Math.min(view.built + 1, a.obras.length)} de {a.obras.length}
                      </span>
                      <Button variant="gold" onClick={onGoHome}>
                        Seguir
                      </Button>
                    </>
                  )}
                  {now && !building && <span>{TRIP.emoji} Después del viaje al sur</span>}
                </div>
              )}
            </div>
          </section>
        )
      })}

      {visit != null && (
        <div className="overlay overlay--top avisit" onClick={() => setVisit(null)}>
          <div className="avisit__box" onClick={(e) => e.stopPropagation()}>
            <AreaScene area={visit} built={AREAS[visit].obras.length} outfit={s.outfit} dog={s.dog.arrived} whole />
            <p>
              <b>{areaName(visit, s.name)}</b> · {AREAS[visit].obras.map((o) => o.name.toLowerCase()).join(', ')}
            </p>
            <Button variant="light" onClick={() => setVisit(null)}>
              Volver
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
