import { useLayoutEffect, useRef, useState } from 'react'
import { AreaScene } from '../components/AreaScene'
import { Button } from '../components/ui'
import { art } from '../game/content'
import { AREAS, areaName, areasDone, areaView, TRIP } from '../game/journey'
import { useGame } from '../game/store'

/** Locked tiles above the last area, so the road keeps going up. */
const MORE_AREAS = 2

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
    box.scrollTop = tile.offsetTop + tile.offsetHeight / 2 - box.clientHeight / 2
  }, [])

  const tiles = Array.from({ length: AREAS.length + MORE_AREAS }, (_, i) => i).reverse()
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
              <strong>{known && a ? areaName(i, s.name) : '???'}</strong>
            </header>
            <div className="atile__img">
              {known && a ? (
                <AreaScene area={i} built={done ? a.obras.length : view.area === i ? view.built : 0} pose={null} whole />
              ) : (
                <img className="atile__blur" src={art(a ? a.base : 'area3_0')} alt="" />
              )}
              {!known && <span className="atile__lock">🔒</span>}
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
