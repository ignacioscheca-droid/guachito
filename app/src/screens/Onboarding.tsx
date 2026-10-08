import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { HabitPicker } from '../components/HabitPicker'
import { BLINKS, Medio, MEDIO } from '../components/Medio'
import { Button } from '../components/ui'
import type { AboutYou } from '../game/aboutYou'
import { art, HABITS_TO_PICK } from '../game/content'
import { actions } from '../game/store'
import { Questionnaire } from './Questionnaire'

// First open: Gauchito se ceba un mate, te mira y charla con vos (see CLAUDE.md).
type Step = 'scene' | 'name' | 'purpose' | 'player' | 'mate' | 'reply' | 'about' | 'quiz' | 'habits'
type TalkStep = Exclude<Step, 'scene' | 'quiz'>

/**
 * The opening, frame by frame. `steam` = the yerba, in % of the frame.
 * After pouring he goes back to A1: A2·3 says the same but has a smoky halo baked in.
 */
const SCENE: { pose: string; ms: number; steam?: [number, number] }[] = [
  { pose: 'a1_base', ms: 1100, steam: [73.6, 43.6] },
  { pose: 'a2_cebando_1', ms: 450 },
  { pose: 'a2_cebando_2', ms: 1300 },
  { pose: 'a1_base', ms: 500, steam: [73.6, 43.6] },
  { pose: 'a3_sorbo', ms: 1300 },
  { pose: 'a4_ahh', ms: 1100, steam: [72.7, 45.2] },
  { pose: 'a5_te_mira', ms: 1400, steam: [73.1, 43.6] },
]
const SCENE_POSES = [...new Set(SCENE.map((f) => f.pose))]

const PURPOSE = 'Soy tu compañero para cuidarte un poquito cada día. ¡Y cuando vos te cuidás, a mí también me hace bien!'
const GAUCHO_NAMES = ['Pancho', 'Tito', 'Chacho', 'Lalo', 'Cholo', 'Beto', 'Nino', 'Coco', 'Toto', 'Rulo', 'Fermín', 'Ramón']

function preload() {
  const names = [
    ...SCENE_POSES.map((p) => `mate_${p}`),
    ...MEDIO.flatMap((p) => [`mate_${p}_cerrada`, `mate_${p}_abierta`]),
    ...[...BLINKS].map((p) => `mate_${p}_parpadeo`),
  ]
  names.forEach((n) => {
    new Image().src = art(n)
  })
}

/** Types `text` out after `delayMs`; `talking` is true while letters are appearing. */
function useTalk(text: string, delayMs = 0) {
  // The count belongs to one text: a new line starts from zero on its very first render.
  const [typed, setTyped] = useState({ text, count: 0 })
  useEffect(() => {
    let id = 0
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        setTyped((t) => {
          const c = t.text === text ? t.count : 0
          if (c >= text.length) {
            clearInterval(id)
            return t
          }
          return { text, count: c + 1 }
        })
      }, 32)
    }, delayMs)
    return () => {
      clearTimeout(start)
      clearInterval(id)
    }
  }, [text, delayMs])
  const count = typed.text === text ? typed.count : 0
  return { shown: text.slice(0, count), talking: count > 0 && count < text.length, done: count >= text.length }
}

function Bubble({ children }: { children: ReactNode }) {
  return (
    <div className="mi-bubble" aria-live="polite">
      {children}
    </div>
  )
}

/** `onPreviewDone`: replay from the test menu; the end goes back instead of saving anything. */
export function Onboarding({ onPreviewDone }: { onPreviewDone?: () => void }) {
  const [step, setStep] = useState<Step>('scene')
  const [companion, setCompanion] = useState('')
  const [player, setPlayer] = useState('')
  const [wantsMate, setWantsMate] = useState(true)
  const [habits, setHabits] = useState<string[]>([])
  const [answers, setAnswers] = useState<AboutYou>({})

  useEffect(preload, [])
  const toAbout = useCallback(() => setStep('about'), [])

  if (step === 'scene') return <Scene onDone={() => setStep('name')} />
  if (step === 'quiz') {
    return (
      <Questionnaire player={player} answers={answers} onChange={setAnswers} onDone={() => setStep('habits')} onBack={() => setStep('about')} />
    )
  }

  return (
    <div className={`screen mi mi--${step}${step === 'reply' && wantsMate ? ' mi--hand' : ''}`}>
      <Talk step={step} companion={companion} player={player} wantsMate={wantsMate} onReplyDone={toAbout} />

      <div className="mi-sheet">
        {step === 'name' && (
          <form
            className="mi-form"
            onSubmit={(e) => {
              e.preventDefault()
              if (companion.trim()) setStep('purpose')
            }}
          >
            <label className="field">
              <input
                value={companion}
                maxLength={16}
                placeholder="Ponele un nombre"
                onChange={(e) => setCompanion(e.target.value)}
                aria-label="Nombre de tu Gauchito"
              />
              <button
                type="button"
                className="mi-dice"
                aria-label="Otro nombre"
                onClick={() => setCompanion(GAUCHO_NAMES[Math.floor(Math.random() * GAUCHO_NAMES.length)])}
              >
                🎲
              </button>
            </label>
            <small className="mi-hint">Lo podés cambiar después en Ajustes.</small>
            <Button type="submit" disabled={!companion.trim()}>
              Listo
            </Button>
          </form>
        )}

        {step === 'purpose' && <Button onClick={() => setStep('player')}>¡Dale!</Button>}

        {step === 'about' && <Button onClick={() => setStep('quiz')}>¡Dale!</Button>}

        {step === 'player' && (
          <form
            className="mi-form"
            onSubmit={(e) => {
              e.preventDefault()
              if (player.trim()) setStep('mate')
            }}
          >
            <label className="field">
              <input value={player} maxLength={24} placeholder="Tu nombre" onChange={(e) => setPlayer(e.target.value)} aria-label="Tu nombre" />
            </label>
            <Button type="submit" disabled={!player.trim()}>
              Continuar
            </Button>
          </form>
        )}

        {step === 'mate' && (
          <div className="mi-choices">
            <Button
              variant="gold"
              onClick={() => {
                setWantsMate(true)
                setStep('reply')
              }}
            >
              Sí 🧉
            </Button>
            <Button
              variant="light"
              onClick={() => {
                setWantsMate(false)
                setStep('reply')
              }}
            >
              No, gracias
            </Button>
          </div>
        )}

        {step === 'habits' && (
          <>
            <div className="mi-habits">
              <HabitPicker picked={habits} onChange={setHabits} />
            </div>
            <Button
              disabled={habits.length === 0}
              onClick={() => (onPreviewDone ? onPreviewDone() : actions.finishOnboarding(companion, habits, player, answers))}
            >
              {habits.length === 0 ? `Elegí ${HABITS_TO_PICK} hábitos` : 'Crear mis hábitos'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

type Line = { pose: string; text: string; lead?: { pose: string; ms: number } }

/** Gauchito on top and what he says, at each step. The bubble grows downwards, never over his face. */
function Talk({
  step,
  companion,
  player,
  wantsMate,
  onReplyDone,
}: {
  step: TalkStep
  companion: string
  player: string
  wantsMate: boolean
  onReplyDone: () => void
}) {
  const you = player.trim()
  const lines: Record<TalkStep, Line> = {
    name: { pose: 'b1_saluda', text: '¡Hola! Soy el Gauchito' },
    purpose: { pose: 'b2_habla', text: PURPOSE, lead: { pose: 'b4_contento', ms: 900 } },
    player: { pose: 'b3_escucha', text: '¿Cómo te llamás?' },
    mate: { pose: 'b5_ofrece', text: `¡Un gusto, ${you}! ¿Querés un mate?` },
    reply: wantsMate ? { pose: 'b6_toma', text: '¡Tomá, está muy rico!' } : { pose: 'b7_mas_para_mi', text: '¡Más para mí!' },
    about: { pose: 'b2_habla', text: 'Bueno, y ahora contame un poco de vos.' },
    habits: { pose: 'b2_habla', text: `¡Gracias por contarme, ${you}! Ahora elegí ${HABITS_TO_PICK} hábitos para empezar.`, lead: { pose: 'b4_contento', ms: 900 } },
  }
  const line = lines[step]
  const leadMs = line.lead?.ms ?? 0
  const { shown, talking, done } = useTalk(line.text, leadMs + 250)
  // A line with a `lead` opens with that pose for a moment.
  const [ledStep, setLedStep] = useState<Step | null>(null)
  const hasLead = !!line.lead
  useEffect(() => {
    if (!hasLead) return
    const t = window.setTimeout(() => setLedStep(step), leadMs)
    return () => clearTimeout(t)
  }, [step, hasLead, leadMs])

  // After answering about the mate, he moves on by himself.
  useEffect(() => {
    if (step !== 'reply' || !done) return
    const t = window.setTimeout(onReplyDone, 1400)
    return () => clearTimeout(t)
  }, [step, done, onReplyDone])

  const pose = line.lead && ledStep !== step ? line.lead.pose : line.pose
  return (
    <>
      <div className="mi-top">
        <img className="mi-bg" src={art('bg_patio')} alt="" />
        <Medio pose={pose} talking={talking} />
      </div>
      <Bubble>
        {shown}
        {step === 'name' && done && <span className="mi-blank">{companion.trim() || ' '.repeat(12)}</span>}
      </Bubble>
    </>
  )
}

/** The opening, without words: he ceba, sips, says "ahh" and looks at you. Tap to skip. */
function Scene({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (leaving) return
    const last = i >= SCENE.length - 1
    const t = window.setTimeout(() => (last ? setLeaving(true) : setI(i + 1)), SCENE[i].ms)
    return () => clearTimeout(t)
  }, [i, leaving])

  useEffect(() => {
    if (!leaving) return
    const t = window.setTimeout(onDone, 450)
    return () => clearTimeout(t)
  }, [leaving, onDone])

  const frame = SCENE[i]
  return (
    <div className={`screen mi-scene${leaving ? ' mi-scene--leaving' : ''}`} onClick={() => setLeaving(true)}>
      <img className="mi-scene__bg" src={art('bg_patio')} alt="" />
      <div className="mi-scene__guy">
        {SCENE_POSES.map((p) => (
          <img key={p} src={art(`mate_${p}`)} alt="" style={{ opacity: p === frame.pose ? 1 : 0 }} draggable={false} />
        ))}
        {frame.steam && (
          <div className="mi-steam" style={{ left: `${frame.steam[0]}%`, top: `${frame.steam[1]}%` }} aria-hidden>
            <i />
            <i />
            <i />
          </div>
        )}
      </div>
      <small className="mi-skip">Tocá para seguir</small>
    </div>
  )
}
