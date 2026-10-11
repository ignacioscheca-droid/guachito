import { useState } from 'react'
import { AreaScene } from '../components/AreaScene'
import { Button } from '../components/ui'
import { art } from '../game/content'
import { AREAS, areaName, areasDone, areaView } from '../game/journey'
import { useGame } from '../game/store'

/** Royal Match's areas: the ones finished (to visit again), the one under way, and what comes. */
export function AreasTab({ onGoHome }: { onGoHome: () => void }) {
  const s = useGame((g) => g)
  const [visit, setVisit] = useState<number | null>(null)
  const finished = areasDone(s.jobsDone)
  const view = areaView(s.jobsDone)

  return (
    <div className="areas">
      <h1>Áreas</h1>
      {AREAS.map((a, i) => {
        const done = i < finished
        const current = !done && i === view.area
        const locked = !done && !current
        return (
          <section key={a.id} className={`acard${locked ? ' acard--locked' : ''}`}>
            <header>
              <small>Área {i + 1}</small>
              <strong>{locked ? '???' : areaName(i, s.name)}</strong>
            </header>
            <div className="acard__img">
              {locked ? (
                <img className="acard__blur" src={art(a.base)} alt="" />
              ) : (
                <AreaScene area={i} built={done ? a.obras.length : view.built} pose={null} whole />
              )}
              <div className="acard__foot">
                {done && (
                  <>
                    <span>✅ ¡Completada!</span>
                    <Button variant="light" onClick={() => setVisit(i)}>
                      Ver
                    </Button>
                  </>
                )}
                {current && (
                  <>
                    <span>
                      🔨 Obra {Math.min(view.built + 1, a.obras.length)} de {a.obras.length}
                    </span>
                    <Button variant="gold" onClick={onGoHome}>
                      Seguir
                    </Button>
                  </>
                )}
              </div>
              {locked && <span className="acard__lock">🔒</span>}
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
