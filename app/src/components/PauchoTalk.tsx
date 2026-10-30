import { useEffect, useState, type ReactNode } from 'react'
import { art } from '../game/content'
import { useTalk } from '../screens/Onboarding'

/** The close-ups of the onboarding's mate scene ("plano medio"), each with mouth open and shut. */
export type TalkPose = 'b1_saluda' | 'b2_habla' | 'b4_contento' | 'b5_ofrece' | 'b8_curioso' | 'b9_perro'

/**
 * Paucho talking to you up close, like when he offers you a mate in the onboarding: he
 * comes up over the screen (the scene dims behind him), and what he says types out in a
 * bubble that comes from him, his mouth moving while it does. `onNext` = tap anywhere to go
 * on (once the line is out); `children` = the buttons under the bubble instead.
 */
export function PauchoTalk({
  pose,
  text,
  onNext,
  compact,
  children,
}: {
  pose: TalkPose
  text: string
  onNext?: () => void
  /** Smaller, low on the screen, so the scene above stays in view (an obra just built). */
  compact?: boolean
  children?: ReactNode
}) {
  const { shown, talking, done } = useTalk(text, 300)
  // while he talks, his mouth opens and shuts
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!talking) return setOpen(false)
    const id = window.setInterval(() => setOpen((o) => !o), 130)
    return () => clearInterval(id)
  }, [talking])

  return (
    <div className={`ptalk${compact ? ' ptalk--compact' : ''}`} onClick={done && onNext ? onNext : undefined}>
      <div className="ptalk__guy mi-medio" key={pose}>
        <img src={art(`mate_${pose}_cerrada`)} alt="" />
        <img src={art(`mate_${pose}_abierta`)} alt="" style={{ opacity: open ? 1 : 0 }} />
      </div>
      <div className="ptalk__bubble mi-bubble" aria-live="polite">
        {shown}
        <span className="ptalk__rest">{text.slice(shown.length)}</span>
      </div>
      {children && <div className={`ptalk__actions${done ? ' ptalk__actions--on' : ''}`}>{children}</div>}
      {!children && onNext && <span className={`ptalk__hint${done ? ' ptalk__hint--on' : ''}`}>Tocá para seguir</span>}
    </div>
  )
}
