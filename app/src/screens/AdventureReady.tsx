import { Button, EnergyBar } from '../components/ui'
import { art } from '../game/content'
import { useGame } from '../game/store'

export function AdventureReady({ onStart, onLater }: { onStart: () => void; onLater: () => void }) {
  const name = useGame((s) => s.name)
  const energy = useGame((s) => s.energy)
  return (
    <div className="screen ready">
      <img className="ready__bg" src={art('ill_adventure_ready')} alt="" />
      <div className="ready__text">
        <h1>¡{name} está listo para salir!</h1>
        <p>Completaste tus hábitos y juntó toda la energía. Es hora de una nueva aventura.</p>
      </div>
      <div className="ready__cta">
        <EnergyBar energy={energy} />
        <Button onClick={onStart}>Empezar aventura</Button>
        <Button variant="ghost" onClick={onLater}>
          Más tarde
        </Button>
      </div>
    </div>
  )
}
