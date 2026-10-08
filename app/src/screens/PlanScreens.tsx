import { useEffect, useState } from 'react'
import { Medio } from '../components/Medio'
import { Button, HabitIcon } from '../components/ui'
import { findHabit, useGame } from '../game/store'

/** How long "armando tus metas" takes: the ring fills up in this time. */
const GENERATING_MS = 4500

// Placeholder reviews for the loading screen (Finch shows real ones there).
const REVIEWS = [
  { title: '¡La mejor app!', text: 'Nunca pensé que un gauchito con bigote me iba a hacer tomar agua. Ahora no fallo un día.' },
  { title: 'Mis mañanas', text: 'Cebo el mate, marco mis hábitos y mi Gauchito sale de aventura. Re lindo.' },
  { title: '¡Por fin!', text: 'Probé mil apps de hábitos. Esta es la primera que me dura más de una semana.' },
  { title: '¡Qué ternura!', text: 'Me saluda a la mañana y a la noche. Siento que alguien me acompaña.' },
  { title: 'Las historias', text: 'Cuento las horas para que vuelva de la aventura y me cuente qué le pasó.' },
  { title: 'Recomendada', text: 'Mi Gauchito se llama Tito y ya tiene medio rancho armado gracias a mí.' },
]

function Review({ title, text }: { title: string; text: string }) {
  return (
    <div className="gen-review">
      <div className="gen-review__head">
        <strong>{title}</strong>
        <span className="gen-review__stars" aria-label="5 estrellas">
          ★★★★★
        </span>
      </div>
      <p>{text}</p>
    </div>
  )
}

/** Finch's "Generating your self-care goals": a filling ring with Gauchito, and reviews going by. */
export function Generating({ companion, onDone }: { companion: string; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, GENERATING_MS)
    return () => clearTimeout(t)
  }, [onDone])

  // Two rows going by at different speeds; each row is doubled so the loop is seamless.
  const rows = [REVIEWS.slice(0, 3), REVIEWS.slice(3)]
  return (
    <div className="screen gen">
      <h2 className="gen-title">Armando tus metas de autocuidado con {companion}…</h2>
      <div className="gen-ring" style={{ ['--gen-ms' as string]: `${GENERATING_MS}ms` }}>
        <svg viewBox="0 0 100 100" aria-hidden>
          <circle className="gen-ring__track" cx="50" cy="50" r="46" />
          <circle className="gen-ring__fill" cx="50" cy="50" r="46" pathLength="100" />
        </svg>
        <div className="gen-ring__guy">
          <Medio pose="b4_contento" talking={false} />
        </div>
      </div>
      <div className="gen-reviews">
        {rows.map((row, r) => (
          <div key={r} className={`gen-row gen-row--${r}`}>
            {[...row, ...row].map((rev, k) => (
              <Review key={k} {...rev} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Finch's "starter plan": Gauchito cheering and the plan in a notebook. */
export function StarterPlan({
  player,
  companion,
  plan,
  onAccept,
}: {
  player: string
  companion: string
  plan: string[]
  onAccept: () => void
}) {
  const state = useGame((s) => s)
  const [talking, setTalking] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setTalking(false), 900)
    return () => clearTimeout(t)
  }, [])

  const you = player.trim()
  return (
    <div className="screen plan">
      <div className="plan-top">
        <div className="plan-bubble">¡Vos podés{you ? `, ${you}` : ''}!</div>
        <div className="plan-guy">
          <Medio pose="b2_habla" talking={talking} />
        </div>
      </div>
      <div className="plan-card">
        <div className="plan-card__rings" aria-hidden>
          {[0, 1, 2, 3, 4].map((k) => (
            <i key={k} />
          ))}
        </div>
        <h2>{you ? `El plan de ${you}` : 'Tu plan'}</h2>
        <p>¡Probá estas metas con {companion}!</p>
        <ul>
          {plan.map((id, k) => {
            const h = findHabit(state, id)
            return (
              <li key={id} style={{ animationDelay: `${200 + k * 90}ms` }}>
                <HabitIcon habit={h} className="plan-icon" />
                <span>{h.name}</span>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="plan-foot">
        <Button onClick={onAccept}>¡Vamos!</Button>
      </div>
    </div>
  )
}
