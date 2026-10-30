import { useEffect, useState, type ReactNode } from 'react'
import { PauchoFace } from '../components/Paucho'
import { Button } from '../components/ui'
import { art } from '../game/content'
import { daysTogether } from '../game/friendship'
import { AREAS, areaName, areaView, JOURNEY, jobInfo, TRIP, TRIP_JOB } from '../game/journey'
import { enableReminders } from '../game/push'
import { haptic, sfx } from '../game/sound'
import { actions, PAUCHO_TAB_DAYS, useGame, type GameState, type TabId } from '../game/store'
import { PauchoTalk } from '../components/PauchoTalk'
import { Confetti } from '../components/Confetti'

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
  // no «Más tarde»: what just opened is worth a look now
  const go = () => {
    actions.dismissUnlock()
    onGo(tab)
  }
  return (
    <div className="overlay unlock">
      <div className="modal unlock__box">
        <span className="unlock__icon">{c.icon}</span>
        <small>¡Desbloqueaste!</small>
        <h2>{c.title}</h2>
        <p>{c.text}</p>
        <Button variant="gold" onClick={go}>
          {c.go}
        </Button>
      </div>
    </div>
  )
}

/** Criollo names for the dice. */
const DOG_NAMES = ['Pampa', 'Facón', 'Tero', 'Ñandú', 'Chimichurri', 'Chamamé', 'Malambo', 'Baqueano', 'Locro', 'Alfajor', 'Mate', 'Chispa', 'Canela', 'Tango', 'Bandido', 'Ombú']

type DogStep = 'ruido' | 'asoma' | 'mira' | 'corre' | 'cerca' | 'nombre' | 'feliz'
/** How long each beat holds before the next (the close-up and the naming wait for you). */
const DOG_BEATS: Partial<Record<DogStep, [number, DogStep]>> = {
  ruido: [1400, 'asoma'],
  asoma: [1300, 'mira'],
  mira: [1500, 'corre'],
  corre: [1300, 'cerca'],
}

/**
 * The dog came with La cucha, and he gets an entrance: the new cucha shakes, a nose peeks
 * out, then his whole head, and he runs off. Up close he looks at you, tilts his head and
 * barks; then Paucho holds him (PauchoTalk) and asks what to call him, with a dice of
 * criollo names, and the puppy loves it. A tap before the naming skips to it. Art: Claude Doc
 * "Gauchito — Llega el perro" (design/tools/import_perro.py).
 */
export function DogArrival() {
  const s = useGame((g) => g)
  const you = s.playerName ? `, ${s.playerName}` : ''
  const [step, setStep] = useState<DogStep>('ruido')
  const [name, setName] = useState(DOG_NAMES[0])
  const [face, setFace] = useState('perro_b1_mira')
  const [run, setRun] = useState(1)

  useEffect(() => {
    const beat = DOG_BEATS[step]
    if (step === 'ruido') sfx('rumble')
    if (step === 'mira') {
      sfx('unlock')
      haptic('success')
    }
    if (!beat) return
    const t = window.setTimeout(() => setStep(beat[1]), beat[0])
    return () => clearTimeout(t)
  }, [step])

  // running: the four frames of his gallop
  useEffect(() => {
    if (step !== 'corre') return
    const id = window.setInterval(() => setRun((r) => (r % 4) + 1), 90)
    return () => clearInterval(id)
  }, [step])

  // up close: he looks at you, blinks, tilts his head, and barks
  useEffect(() => {
    if (step !== 'cerca') return
    const seq: [number, string][] = [
      [700, 'perro_b1_parpadeo'],
      [850, 'perro_b1_mira'],
      [1500, 'perro_b2_ladea'],
      [2500, 'perro_b3_ladra'],
      [3300, 'perro_b1_mira'],
    ]
    const ts = seq.map(([ms, f]) =>
      window.setTimeout(() => {
        setFace(f)
        if (f === 'perro_b3_ladra') {
          sfx('cheer')
          haptic('celebrate')
        }
      }, ms),
    )
    ts.push(window.setTimeout(() => setStep('nombre'), 4300))
    return () => ts.forEach(clearTimeout)
  }, [step])

  const skip = () => {
    if (step !== 'nombre' && step !== 'feliz') setStep('nombre')
  }

  if (step === 'nombre')
    return (
      <PauchoTalk pose="b9_perro" text={`¡Se quiere quedar con nosotros${you}! ¿Cómo le ponemos?`}>
        <form
          className="mi-form perro__form"
          onSubmit={(e) => {
            e.preventDefault()
            sfx('check')
            haptic('celebrate')
            setStep('feliz')
          }}
        >
          <label className="field">
            <input value={name} maxLength={14} onChange={(e) => setName(e.target.value)} aria-label="Nombre del perro" />
            <button type="button" className="mi-dice" aria-label="Otro nombre" onClick={() => setName((n) => otherName(n))}>
              🎲
            </button>
          </label>
          <Button variant="gold" type="submit" disabled={!name.trim()}>
            ¡Ese!
          </Button>
        </form>
      </PauchoTalk>
    )

  return (
    <div className={`perro perro--${step}`} onClick={skip}>
      {(step === 'ruido' || step === 'asoma' || step === 'mira' || step === 'corre') && (
        <div className="perro__cucha">
          <img src={art(step === 'asoma' ? 'cucha_asoma' : step === 'mira' ? 'cucha_asoma_mira' : 'cucha_vacia')} alt="" />
          {step === 'ruido' && <span className="perro__ruido">¿?</span>}
          {step === 'corre' && <img className="perro__run" src={art(`dog_run_${run}`)} alt="" />}
        </div>
      )}
      {(step === 'cerca' || step === 'feliz') && (
        <div className="perro__cerca">
          {step === 'feliz' && <Confetti burstKey={1} count={30} />}
          <img src={art(step === 'feliz' ? 'perro_b4_feliz' : face)} alt="" />
          {face === 'perro_b3_ladra' && step === 'cerca' && <span className="perro__guau mi-bubble">¡Guau!</span>}
          {step === 'feliz' && (
            <span className="perro__hearts" aria-hidden>
              <i>❤️</i>
              <i>❤️</i>
              <i>❤️</i>
            </span>
          )}
        </div>
      )}
      {step === 'feliz' && (
        <div className="perro__end">
          <p className="mi-bubble">¡A {name.trim()} le encantó!</p>
          <Button
            variant="gold"
            onClick={(e) => {
              e.stopPropagation()
              actions.nameDog(name)
            }}
          >
            ¡Bienvenido, {name.trim()}!
          </Button>
        </div>
      )}
      {step !== 'feliz' && <span className="ptalk__hint ptalk__hint--on">Tocá para seguir</span>}
    </div>
  )
}

/** Another name off the dice, never the same one twice in a row. */
function otherName(now: string) {
  const rest = DOG_NAMES.filter((n) => n !== now)
  return rest[Math.floor(Math.random() * rest.length)]
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

/** What a locked tab waits for, and how far along you are, in Paucho's words. */
function lockLine(s: GameState, tab: TabId) {
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
  if (tab === 'casita') return `¡Ahí va a estar mi casita! Cuando terminemos ${jobInfo(JOURNEY[0]).the}, es mía y te la muestro.`
  if (tab === 'paucho') {
    const left = Math.max(1, PAUCHO_TAB_DAYS - daysTogether(s.completions))
    return `Eso es para cuando seamos compañeros. Nos ${left === 1 ? 'falta un día' : `faltan ${left} días`} con hábitos.`
  }
  if (tab === 'areas') {
    const { area, built } = areaView(s.jobsDone)
    const left = AREAS[area].obras.length - built
    return `Ahí van las áreas que terminemos. A ${areaName(area, s.name, true)} le ${left === 1 ? 'falta una obra' : `faltan ${plural(left, 'obra', 'obras')}`}.`
  }
  const galpon = areaName(1, s.name, true)
  const left = Math.max(1, TRIP_JOB - s.jobsDone)
  return `Eso es para mis viajes. Cuando terminemos ${galpon} me voy de aventura: ${left === 1 ? 'falta una obra' : `faltan ${left} obras`}.`
}

/** A locked tab tapped: Paucho says what it waits for, up close. */
export function LockedTab({ tab, onClose }: { tab: TabId; onClose: () => void }) {
  const s = useGame((g) => g)
  return (
    <PauchoTalk compact pose="b8_curioso" text={`¡Todavía no! ${lockLine(s, tab)}`}>
      <Button variant="gold" onClick={onClose}>
        ¡Dale!
      </Button>
    </PauchoTalk>
  )
}
