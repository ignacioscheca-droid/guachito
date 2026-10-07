import { useEffect, useState } from 'react'
import { HabitPicker } from '../components/HabitPicker'
import { Button } from '../components/ui'
import { art, HABITS, HABITS_TO_PICK } from '../game/content'
import { actions } from '../game/store'

const LOOP = [
  { icon: 'ui_check', text: 'Cumplís tus hábitos' },
  { icon: 'ui_energia', text: 'Él junta energía' },
  { icon: 'nav_aventura', text: 'Sale de aventura' },
  { icon: 'nav_rancho', text: 'Trae regalos al rancho' },
]

export function Onboarding() {
  const [step, setStep] = useState<'intro' | 'name' | 'habits'>('intro')
  const [name, setName] = useState('Gauchito')

  if (step === 'intro') return <Intro onNext={() => setStep('name')} />
  if (step === 'name') return <NameStep name={name} setName={setName} onNext={() => setStep('habits')} />
  return <HabitsStep name={name} onBack={() => setStep('name')} onDone={(habits) => actions.finishOnboarding(name, habits)} />
}

function Intro({ onNext }: { onNext: () => void }) {
  // Warm the next two steps so they don't pop in.
  useEffect(() => {
    ;['ill_name', ...HABITS.flatMap((h) => (h.icon ? [h.icon] : []))].forEach((n) => {
      new Image().src = art(n)
    })
  }, [])
  return (
    <div className="screen intro">
      <img className="intro__bg" src={art('ill_onboarding')} alt="" />
      <div className="intro__text">
        <h1>
          Conocé a<br />
          tu Gauchito
        </h1>
        <p>Tu compañero de hábitos para una vida más linda.</p>
      </div>
      <div className="sheet intro__sheet">
        <ol className="loop">
          {LOOP.map((s) => (
            <li key={s.text}>
              <img src={art(s.icon)} alt="" />
              <span>{s.text}</span>
            </li>
          ))}
        </ol>
        <Button onClick={onNext}>Empezar</Button>
      </div>
    </div>
  )
}

function NameStep({ name, setName, onNext }: { name: string; setName: (n: string) => void; onNext: () => void }) {
  return (
    <div className="screen name">
      <img className="name__bg" src={art('ill_name')} alt="" />
      <form
        className="sheet name__sheet"
        onSubmit={(e) => {
          e.preventDefault()
          onNext()
        }}
      >
        <h2>¿Cómo se llama tu Gauchito?</h2>
        <label className="field">
          <input value={name} maxLength={16} onChange={(e) => setName(e.target.value)} onFocus={(e) => e.target.select()} aria-label="Nombre" />
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />
          </svg>
        </label>
        <Button type="submit" disabled={!name.trim()}>
          Continuar
        </Button>
      </form>
    </div>
  )
}

function HabitsStep({ name, onBack, onDone }: { name: string; onBack: () => void; onDone: (ids: string[]) => void }) {
  const [picked, setPicked] = useState<string[]>([])
  const short = HABITS_TO_PICK - picked.length

  return (
    <div className="screen habits">
      <button className="back" onClick={onBack} aria-label="Volver">
        <svg viewBox="0 0 24 24">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <header className="habits__head">
        <h2>¿Qué hábitos querés mejorar?</h2>
        <p>
          Elegí {HABITS_TO_PICK} (o creá los tuyos). Juntos llenan la energía de {name.trim() || 'Gauchito'} cada día.
        </p>
      </header>
      <HabitPicker picked={picked} onChange={setPicked} />
      <div className="habits__cta">
        <Button disabled={picked.length === 0} onClick={() => onDone(picked)}>
          {short > 0 && picked.length > 0 ? `Crear con ${picked.length} (sugerimos ${HABITS_TO_PICK})` : picked.length === 0 ? `Elegí ${HABITS_TO_PICK} hábitos` : 'Crear mis hábitos'}
        </Button>
      </div>
    </div>
  )
}
