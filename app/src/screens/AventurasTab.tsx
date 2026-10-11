import { WorkTrack } from '../components/DayLoop'
import { Button } from '../components/ui'
import { art } from '../game/content'
import { REGIONS, TRIP, TRIP_JOB, WORK_MS } from '../game/journey'
import { goalOf, useGame } from '../game/store'
import { formatClock } from './TripRun'

/** The trips diary: the trip that is next or under way, the ones made, and the map of regions. */
export function AventurasTab({ remainingMs, onStart, onWatch, onStory }: { remainingMs: number; onStart: () => void; onWatch: () => void; onStory: () => void }) {
  const s = useGame((g) => g)
  const isNext = s.jobsDone === TRIP_JOB
  const made = s.jobsDone > TRIP_JOB
  const { status } = s.work

  return (
    <div className="advtab">
      <div className="advtab__hero">
        <img src={art('ill_adventure_ready')} alt="" />
        <div>
          <small>Diario de viaje</small>
          <h1>{made ? 'Ya conoce el sur' : TRIP.name}</h1>
        </div>
      </div>
      <div className="panel advtab__panel">
        {isNext && (
          <div className="card trip">
            <strong>
              {TRIP.emoji} {TRIP.name}
            </strong>
            <p>{TRIP.reason}</p>
            {status === 'charging' && (
              <p className="trip__status">
                Sale cuando llenes la energía: {s.energy} / {goalOf(s)}.
              </p>
            )}
            {status === 'ready' && <Button onClick={onStart}>¡Salir de viaje!</Button>}
            {status === 'working' && (
              <>
                <WorkTrack progress={1 - remainingMs / WORK_MS} start="🧉" end={TRIP.bringsEmoji} />
                <Button variant="light" onClick={onWatch}>
                  Ver el viaje · vuelve en {formatClock(remainingMs)}
                </Button>
              </>
            )}
            {status === 'done' && (
              <Button variant="gold" onClick={onStory}>
                ¡Volvió! Escuchá su historia
              </Button>
            )}
          </div>
        )}

        {made && (
          <ul className="diary">
            <li>
              <img className="diary__pic" src={art(TRIP.image)} alt="" />
              <div>
                <strong>{TRIP.name}</strong>
                <p>{TRIP.story}</p>
                <small className="diary__item">
                  {TRIP.bringsEmoji} Trajo {TRIP.brings} y ropa de lana
                </small>
              </div>
            </li>
          </ul>
        )}

        <h3 className="advtab__title">Regiones</h3>
        <ul className="regions">
          {REGIONS.map((r) => (
            <li key={r.id} className={r.id === 'sur' && made ? 'on' : r.id === 'sur' ? 'next' : ''}>
              <span>{r.emoji}</span>
              <b>{r.name}</b>
              <small>{r.id === 'sur' ? (made ? 'Visitada' : 'Próximo viaje') : 'Próximamente'}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
