import { actions, todayKey, useGame } from '../game/store'

/** Playtest helpers. Open by tapping the Home greeting 5 times, or with ?test in the URL. */
export function TestMenu({ onClose, onOnboarding }: { onClose: () => void; onOnboarding: () => void }) {
  const s = useGame((g) => g)
  const run = (fn: () => void) => () => {
    fn()
    onClose()
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal testmenu" onClick={(e) => e.stopPropagation()}>
        <h2>Menú de prueba</h2>
        <p>
          Día: {todayKey(s)} · Energía {s.energy} · Aventura: {s.adventure.status} · Monedas {s.coins}
        </p>
        <button onClick={run(actions.debugNextDay)}>Pasar al día siguiente</button>
        <button onClick={run(actions.debugFillEnergy)}>Llenar la energía</button>
        <button onClick={run(actions.debugFinishAdventure)}>Terminar la aventura ya</button>
        <button onClick={run(actions.debugCoins)}>+100 monedas</button>
        <button onClick={run(onOnboarding)}>Ver el onboarding (no borra nada)</button>
        <button
          className="testmenu__danger"
          onClick={run(() => {
            if (confirm('¿Borrar todo y empezar de cero?')) actions.debugReset()
          })}
        >
          Empezar de cero
        </button>
        <button className="testmenu__close" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
