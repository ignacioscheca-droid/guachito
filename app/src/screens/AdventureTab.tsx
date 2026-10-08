import { Button, EnergyBar } from '../components/ui'
import { ADVENTURE, art, EPISODES, itemById } from '../game/content'
import { currentEpisode, useGame } from '../game/store'
import { formatClock } from './AdventureRun'

export function AdventureTab({ remainingMs, onOpen }: { remainingMs: number; onOpen: () => void }) {
  const s = useGame((g) => g)
  const { status, runs } = s.adventure
  const next = currentEpisode(s)

  return (
    <div className="advtab">
      <div className="advtab__hero">
        <img src={art('ill_adventure_ready')} alt="" />
        <div>
          <small>{ADVENTURE.name} · semana de aventuras</small>
          <h1>{status === 'returned' ? '¡Volvió!' : next.title}</h1>
        </div>
      </div>
      <div className="panel advtab__panel">
        <EnergyBar energy={s.energy} />
        {status === 'charging' && <p className="advtab__status">Con 3 hábitos hechos, {s.name} tiene energía para salir a explorar.</p>}
        {status === 'ready' && <Button onClick={onOpen}>Empezar aventura</Button>}
        {status === 'running' && <Button variant="light" onClick={onOpen}>Ver la aventura · {formatClock(remainingMs)}</Button>}
        {status === 'returned' && <Button variant="gold" onClick={onOpen}>¡Volvió! Escuchar su historia</Button>}

        <h3 className="advtab__title">Diario de aventuras</h3>
        {runs === 0 && <p className="advtab__empty">Todavía no salió de aventura. ¡La primera está cerca!</p>}
        <ul className="diary">
          {Array.from({ length: runs }, (_, i) => runs - 1 - i).map((i) => {
            const ep = EPISODES[i % EPISODES.length]
            return (
              <li key={i}>
                <img className="diary__pic" src={art(ep.image)} alt="" />
                <div>
                  <strong>
                    Día {i + 1} · {ep.title}
                  </strong>
                  <p>{ep.story}</p>
                  <small className="diary__item">
                    <img src={art(itemById(ep.itemId).image)} alt="" /> {itemById(ep.itemId).name}
                  </small>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
