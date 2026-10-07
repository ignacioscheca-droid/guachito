import { useEffect, useState } from 'react'
import { Confetti } from '../components/Confetti'
import { Button, EnergyBar } from '../components/ui'
import { art } from '../game/content'
import { findHabit, useGame } from '../game/store'

type Props = { habitId: string; gained: number; onClose: () => void; onAdventure: () => void }

export function HabitDone({ habitId, gained, onClose, onAdventure }: Props) {
  const energy = useGame((s) => s.energy)
  const ready = useGame((s) => s.adventure.status === 'ready')
  const name = useGame((s) => s.name)
  const habitName = useGame((s) => findHabit(s, habitId).name)
  // Start the bar at the old value so the gain visibly fills in.
  const [shown, setShown] = useState(energy - gained)
  const [burst, setBurst] = useState(0)

  useEffect(() => {
    const t1 = window.setTimeout(() => setBurst(1), 120)
    const t2 = window.setTimeout(() => setShown(energy), 650)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [energy])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal done" onClick={(e) => e.stopPropagation()}>
        <h2>¡Bien ahí!</h2>
        <p>Completaste: {habitName}</p>
        <div className="done__hero">
          <Confetti burstKey={burst} count={30} spread={1.2} />
          <img className="done__char" src={art('g_jump')} alt="" />
          <div className="done__shadow" />
        </div>
        {gained > 0 ? (
          <div className="done__gain">
            <img src={art('ui_energia')} alt="" />
            <strong>+{gained}</strong> energía
          </div>
        ) : (
          <div className="done__gain done__gain--muted">{name} ya tiene la energía al máximo</div>
        )}
        <EnergyBar energy={shown} compact />
        {ready ? (
          <Button variant="gold" onClick={onAdventure}>
            ¡{name} está listo para la aventura!
          </Button>
        ) : (
          <Button onClick={onClose}>¡Seguí así!</Button>
        )}
      </div>
    </div>
  )
}
