import { nextJob, actions, todayKey, useGame } from '../game/store'
import { jobInfo } from '../game/journey'

/** Playtest helpers. Open by tapping the Home greeting 5 times, or with ?test in the URL. */
export function TestMenu({
  onClose,
  onOnboarding,
  onAskPush,
  onStreak,
  onArea,
}: {
  onClose: () => void
  onOnboarding: () => void
  onAskPush: () => void
  onStreak: () => void
  onArea: () => void
}) {
  const s = useGame((g) => g)
  const job = nextJob(s)
  const run = (fn: () => void) => () => {
    fn()
    onClose()
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal testmenu" onClick={(e) => e.stopPropagation()}>
        <h2>Menú de prueba</h2>
        <p>
          Día: {todayKey(s)} · Trabajo {s.jobsDone + 1}: {job ? jobInfo(job).name : 'nada'} ({s.work.status}) · Energía {s.energy} · Herraduras{' '}
          {s.coins}
        </p>
        <button onClick={run(actions.debugNextDay)}>Pasar al día siguiente</button>
        <button onClick={run(actions.debugMissDay)}>Faltar un día (pasa a pasado mañana)</button>
        <button onClick={run(actions.debugTermo)}>+1 termo (tenés {s.termos})</button>
        <button onClick={run(actions.debugGoalTomorrow)}>Que mañana se cumpla la meta (hoy {s.streakGoal ?? '—'})</button>
        <button onClick={run(actions.debugFillEnergy)}>Llenar la energía</button>
        <button onClick={run(actions.debugFinishWork)}>Terminar el trabajo ya</button>
        <button onClick={run(actions.debugSkipJob)}>Saltar a la obra terminada</button>
        <button onClick={run(actions.debugCoins)}>+100 herraduras</button>
        <button onClick={run(actions.debugPremium)}>Gauchito Premium: {s.premium ? 'sí (sacarlo)' : 'no (activarlo)'}</button>
        <button onClick={run(onOnboarding)}>Ver el onboarding (no borra nada)</button>
        <button onClick={run(onStreak)}>Ver la racha del día 1</button>
        <button onClick={run(onArea)}>Ver «¡Área completada!» (no suma nada)</button>
        <button onClick={run(onAskPush)}>Ver el «¿Te aviso?» de Paucho</button>
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
