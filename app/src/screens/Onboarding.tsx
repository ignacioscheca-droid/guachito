import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { HabitPicker } from '../components/HabitPicker'
import { BLINKS, Medio, MEDIO } from '../components/Medio'
import { Button } from '../components/ui'
import { buildPlan, calmPicks, CALM_NOTE, type AboutYou } from '../game/aboutYou'
import { art, HABITS_TO_PICK, PLAN_SIZE } from '../game/content'
import { actions } from '../game/store'
import { StreakDay } from './DayOne'
import { FirstGift, Generating, StarterPlan, StreakGoal } from './PlanScreens'
import { Questionnaire } from './Questionnaire'

// First open: Gauchito se ceba un mate, te mira y charla con vos (see CLAUDE.md). In this
// build it happens on the empty lot where he is about to build his casita (area1_etapa0: stage 0, the piles of materials).
// The only mate is the streak's: you cebás it ('mate'), and that is day 1 of the streak.
type TalkStep = 'name' | 'purpose' | 'player' | 'about' | 'habits'
type Step = 'scene' | TalkStep | 'mate' | 'quiz' | 'generating' | 'plan' | 'gift' | 'goal'

/**
 * The opening, frame by frame. `steam` = the yerba, in % of the frame.
 * After pouring he goes back to A1: A2·3 says the same but has a smoky halo baked in.
 */
const SCENE: { pose: string; ms: number; steam?: [number, number] }[] = [
  { pose: 'a1_base', ms: 1100, steam: [79, 43.7] },
  { pose: 'a2_cebando_1', ms: 450 },
  { pose: 'a2_cebando_2', ms: 1300 },
  { pose: 'a1_base', ms: 500, steam: [79, 43.7] },
  { pose: 'a3_sorbo', ms: 1300 },
  { pose: 'a4_ahh', ms: 1100, steam: [78, 45.3] },
  { pose: 'a5_te_mira', ms: 1400, steam: [79, 43.7] },
]
const SCENE_POSES = [...new Set(SCENE.map((f) => f.pose))]

const PURPOSE = 'Soy tu compañero para cuidarte un poquito cada día. ¡Y cuando vos te cuidás, a mí también me hace bien!'
/** He is Paucho unless you call him something else. */
const DEFAULT_NAME = 'Paucho'
const GAUCHO_NAMES = ['Paucho', 'Tito', 'Chacho', 'Lalo', 'Cholo', 'Beto', 'Nino', 'Coco', 'Toto', 'Rulo', 'Fermín', 'Ramón']

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
export function useTalk(text: string, delayMs = 0) {
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
  const [companion, setCompanion] = useState(DEFAULT_NAME)
  const [player, setPlayer] = useState('')
  const [habits, setHabits] = useState<string[]>([])
  const [answers, setAnswers] = useState<AboutYou>({})
  const [plan, setPlan] = useState<string[]>([])

  useEffect(preload, [])
  // Stable, because Scene, Talk and Generating time their exit from them: a new function on
  // every render (Home's clock re-renders us four times a second while Paucho works) would
  // restart their timers forever and leave the screen blank.
  const toName = useCallback(() => setStep('name'), [])
  const toPlan = useCallback(() => setStep('plan'), [])

  if (step === 'scene') return <Scene onDone={toName} />
  if (step === 'mate') {
    return <StreakDay hint={`¡Un gusto, ${player.trim()}! Deslizá para arriba y cebamos el primer mate`} onNext={() => setStep('about')} />
  }
  if (step === 'quiz') {
    return (
      <Questionnaire player={player} answers={answers} onChange={setAnswers} onDone={() => setStep('habits')} onBack={() => setStep('about')} />
    )
  }
  const him = companion.trim() || DEFAULT_NAME
  if (step === 'generating') return <Generating companion={him} onDone={toPlan} />
  if (step === 'plan') {
    const built = buildPlan(habits, answers, PLAN_SIZE)
    const notes = Object.fromEntries(calmPicks(habits, answers).filter((id) => built.includes(id)).map((id) => [id, CALM_NOTE]))
    return (
      <StarterPlan
        player={player}
        companion={him}
        plan={built}
        notes={notes}
        onAccept={() => {
          setPlan(built)
          setStep('gift')
        }}
      />
    )
  }
  if (step === 'gift') return <FirstGift player={player} companion={him} onNext={() => setStep('goal')} />
  if (step === 'goal') {
    return (
      <StreakGoal
        player={player}
        onCommit={(streakGoal) =>
          onPreviewDone ? onPreviewDone() : actions.finishOnboarding({ name: companion, playerName: player, habits: plan, aboutYou: answers, streakGoal })
        }
      />
    )
  }

  return (
    <div className={`screen mi mi--${step}`}>
      <Talk step={step} companion={companion} player={player} />

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

        {step === 'habits' && (
          <>
            <div className="mi-habits">
              <HabitPicker picked={habits} onChange={setHabits} max={HABITS_TO_PICK} />
            </div>
            <Button onClick={() => setStep('generating')}>{habits.length === 0 ? 'Seguir sin elegir' : 'Armar mi plan'}</Button>
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
}: {
  step: TalkStep
  companion: string
  player: string
}) {
  const you = player.trim()
  const lines: Record<TalkStep, Line> = {
    name: { pose: 'b1_saluda', text: '¡Hola! Soy el Gauchito' },
    purpose: { pose: 'b2_habla', text: PURPOSE, lead: { pose: 'b4_contento', ms: 900 } },
    player: { pose: 'b3_escucha', text: '¿Cómo te llamás?' },
    about: { pose: 'b2_habla', text: 'Bueno, y ahora contame un poco de vos.' },
    habits: { pose: 'b2_habla', text: `¡Gracias por contarme, ${you}! Elegí hasta ${HABITS_TO_PICK} hábitos para tu plan.`, lead: { pose: 'b4_contento', ms: 900 } },
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

  const pose = line.lead && ledStep !== step ? line.lead.pose : line.pose
  return (
    <>
      <div className="mi-top">
        <img className="mi-bg" src={art('area1_etapa0')} alt="" />
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
      <img className="mi-scene__bg" src={art('area1_etapa0')} alt="" />
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
