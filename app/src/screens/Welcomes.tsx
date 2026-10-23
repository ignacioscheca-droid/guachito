import { useEffect, useState, type ReactNode } from 'react'
import { PauchoFace } from '../components/Paucho'
import { Button } from '../components/ui'
import { art } from '../game/content'
import { daysTogether } from '../game/friendship'
import { TRIP } from '../game/journey'
import { enableReminders } from '../game/push'
import { haptic, sfx } from '../game/sound'
import { actions, useGame, type TabId } from '../game/store'

/** Royal Match-style welcome when a tab opens: what it is, and a button to go there. */
export function UnlockWelcome({ tab, onGo }: { tab: TabId; onGo: (t: TabId) => void }) {
  const s = useGame((g) => g)
  const you = s.playerName ? `, ${s.playerName}` : ''
  const copy: Partial<Record<TabId, { icon: ReactNode; title: string; text: string; go: string }>> = {
    casita: {
      icon: <img src={art('nav_inicio')} alt="" />,
      title: `La casita de ${s.name}`,
      text: `¡Grande${you}! Gracias a vos ahora tengo mi casita. ¿Me ayudás a armarla?`,
      go: '¡Vamos!',
    },
    paucho: {
      icon: <PauchoFace outfit={s.outfit} className="unlock__face" />,
      title: s.name,
      text: `¡Ya somos compañeros! Van ${daysTogether(s.completions)} días juntos. Acá ves nuestra amistad, tu racha y mi ropa.`,
      go: 'Ver',
    },
    areas: {
      icon: <img src={art('nav_rancho')} alt="" />,
      title: 'Áreas',
      text: '¡Terminamos el rancho! En Áreas vas a ver lo que hicimos juntos y lo que viene.',
      go: 'Ver las áreas',
    },
    aventuras: {
      icon: <img src={art('nav_aventura')} alt="" />,
      title: 'Aventuras',
      text: `${TRIP.reason} Cuando llenes la energía, salgo de viaje.`,
      go: 'Ver el viaje',
    },
  }
  const c = copy[tab]
  useEffect(() => {
    sfx('unlock')
    haptic('celebrate')
  }, [tab])
  if (!c) return null
  const close = (go: boolean) => {
    actions.dismissUnlock()
    if (go) onGo(tab)
  }
  return (
    <div className="overlay unlock">
      <div className="modal unlock__box">
        <span className="unlock__icon">{c.icon}</span>
        <small>¡Desbloqueaste!</small>
        <h2>{c.title}</h2>
        <p>{c.text}</p>
        <Button variant="gold" onClick={() => close(true)}>
          {c.go}
        </Button>
        <Button variant="ghost" onClick={() => close(false)}>
          Más tarde
        </Button>
      </div>
    </div>
  )
}

const DOG_NAMES = ['Tero', 'Pampa', 'Chispa', 'Lobo', 'Mate', 'Tango', 'Canela', 'Ñandú', 'Pirata', 'Negro']

/** The dog came with La cucha: you name him. */
export function DogName() {
  const [name, setName] = useState(DOG_NAMES[0])
  useEffect(() => {
    sfx('unlock')
    haptic('celebrate')
  }, [])
  return (
    <div className="overlay unlock">
      <form
        className="modal unlock__box"
        onSubmit={(e) => {
          e.preventDefault()
          actions.nameDog(name)
        }}
      >
        <span className="unlock__icon">
          <img src={art('dog_happy')} alt="" />
        </span>
        <small>¡Llegó un perro!</small>
        <h2>¿Cómo le ponemos?</h2>
        <p>Se quedó en la cucha nueva y no se quiere ir más.</p>
        <label className="field">
          <input value={name} maxLength={14} onChange={(e) => setName(e.target.value)} aria-label="Nombre del perro" />
          <button type="button" className="mi-dice" aria-label="Otro nombre" onClick={() => setName(DOG_NAMES[Math.floor(Math.random() * DOG_NAMES.length)])}>
            🎲
          </button>
        </label>
        <Button variant="gold" type="submit" disabled={!name.trim()}>
          ¡Listo!
        </Button>
      </form>
    </div>
  )
}

/**
 * Paucho asks before the phone does: the phone's own dialog only shows after "¡Sí,
 * avisame!" (and it can be shown only once, so it's worth asking well). "Ahora no" asks
 * again another day (shouldAskPush in push.ts).
 */
export function NotifAsk({ onClose }: { onClose: () => void }) {
  const s = useGame((g) => g)
  const [step, setStep] = useState<'ask' | 'on' | 'off'>('ask')
  const [reason, setReason] = useState('')
  useEffect(() => {
    actions.pushAsked()
    sfx('unlock')
    haptic('success')
  }, [])
  const you = s.playerName ? `, ${s.playerName}` : ''

  const yes = async () => {
    const r = await enableReminders()
    if (r.ok) {
      actions.setPushSubscription(r.subscription)
      sfx('check')
      haptic('success')
      setStep('on')
    } else {
      setReason(r.reason)
      setStep('off')
    }
  }

  return (
    <div className="overlay unlock">
      <div className="modal unlock__box">
        <span className="unlock__icon">
          <PauchoFace outfit={s.outfit} className="unlock__face" />
        </span>
        {step === 'ask' && (
          <>
            <h2>¿Te aviso{you}?</h2>
            <p>
              Te escribo un buen día a las 9, a las 16 te cuento cómo va todo y qué te falta, y a las 21 las buenas noches. Así no se nos pasa
              ningún día.
            </p>
            <Button variant="gold" onClick={yes}>
              ¡Sí, avisame!
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Ahora no
            </Button>
          </>
        )}
        {step === 'on' && (
          <>
            <h2>¡Trato hecho!</h2>
            <p>Mañana a las 9 te escribo. Si algún día preferís que no, lo cambiás en Ajustes.</p>
            <Button variant="gold" onClick={onClose}>
              ¡Dale!
            </Button>
          </>
        )}
        {step === 'off' && (
          <>
            <h2>No pude activarlas</h2>
            <p>{reason}</p>
            <Button variant="light" onClick={onClose}>
              Bueno
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
