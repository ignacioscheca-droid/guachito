import { useEffect, useRef, useState } from 'react'
import { Medio } from '../components/Medio'
import { Button } from '../components/ui'
import { QUESTIONS, SECTIONS, type AboutYou, type Option } from '../game/aboutYou'

type Props = {
  player: string
  answers: AboutYou
  onChange: (answers: AboutYou) => void
  onDone: () => void
  /** Back from the first question. */
  onBack: () => void
}

/** "Contame un poco de vos": one question per screen. A tap answers, or pick several and "Siguiente". */
export function Questionnaire({ player, answers, onChange, onDone, onBack }: Props) {
  const [i, setI] = useState(0)
  const [asking, setAsking] = useState(true)
  const moving = useRef(false)
  const q = QUESTIONS[i]
  const picked = answers[q.id] ?? []

  // He says each question: the mouth moves for a moment when it appears.
  useEffect(() => {
    moving.current = false
    setAsking(true)
    const t = window.setTimeout(() => setAsking(false), 900)
    return () => clearTimeout(t)
  }, [i])

  const go = (dir: 1 | -1, a: AboutYou) => {
    let k = i + dir
    while (k >= 0 && k < QUESTIONS.length && QUESTIONS[k].skip?.(a)) k += dir
    if (k < 0) onBack()
    else if (k >= QUESTIONS.length) onDone()
    else setI(k)
  }

  const choose = (o: Option) => {
    if (moving.current) return
    if (!q.multi) {
      const next = { ...answers, [q.id]: [o.id] }
      onChange(next)
      moving.current = true
      window.setTimeout(() => go(1, next), 280) // long enough to see the pick
      return
    }
    const isNone = (id: string) => q.options.find((x) => x.id === id)?.none
    const ids = picked.includes(o.id) ? picked.filter((id) => id !== o.id) : o.none ? [o.id] : [...picked.filter((id) => !isNone(id)), o.id]
    onChange({ ...answers, [q.id]: ids })
  }

  return (
    <div className="screen mq">
      <header className="mq-top">
        <button className="mq-back" onClick={() => go(-1, answers)} aria-label="Volver">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <Progress at={i} />
      </header>

      <div className="mq-body" key={q.id}>
        <p className="mq-section">{SECTIONS[q.section]}</p>
        <div className="mq-guy">
          <Medio pose={q.pose} talking={asking} />
          <span className="mq-ask" aria-hidden>
            ?
          </span>
        </div>
        <h2 className="mq-title">{q.title(player.trim())}</h2>
        {q.subtitle && <p className="mq-sub">{q.subtitle}</p>}
        <div className="mq-options">
          {q.options.map((o) => {
            const on = picked.includes(o.id)
            return (
              <button
                key={o.id}
                className={`mq-opt${on ? ' mq-opt--on' : ''}${o.emoji ? '' : ' mq-opt--plain'}`}
                onClick={() => choose(o)}
                aria-pressed={on}
              >
                {o.emoji && <span className="mq-opt__emoji">{o.emoji}</span>}
                <span className="mq-opt__text">
                  {o.label}
                  {o.hint && <small>{o.hint}</small>}
                </span>
                {q.multi && <span className="mq-opt__mark">{on ? '✓' : '+'}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {q.multi && (
        <div className="mq-foot">
          <Button disabled={picked.length === 0} onClick={() => go(1, answers)}>
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}

/** One segment per section; a finished section fills up and gets a tick. */
function Progress({ at }: { at: number }) {
  const current = QUESTIONS[at].section
  return (
    <div className="mq-progress" aria-label={`Pregunta ${at + 1} de ${QUESTIONS.length}`}>
      {SECTIONS.map((_, s) => {
        const ids = QUESTIONS.map((q, k) => (q.section === s ? k : -1)).filter((k) => k >= 0)
        const done = ids.filter((k) => k < at).length
        const fill = s < current ? 1 : s > current ? 0 : (done + 1) / (ids.length + 1)
        return (
          <span key={s} className={`mq-seg${s < current ? ' mq-seg--done' : ''}`}>
            <i style={{ width: `${fill * 100}%` }} />
          </span>
        )
      })}
    </div>
  )
}
