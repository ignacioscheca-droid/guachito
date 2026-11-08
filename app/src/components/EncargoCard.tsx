import { art } from '../game/content'
import { Button, Check } from './ui'

/** An icon from app/public/a by name, or an emoji until its art arrives. */
function EncargoIcon({ icon }: { icon: string }) {
  if (/^[a-z0-9_]+$/.test(icon)) return <img src={art(icon)} alt="" />
  return <span aria-hidden>{icon}</span>
}

/**
 * One encargo, like Finch's quest cards: its icon, Paucho's note, a small bar with "3 / 5"
 * and what it pays. Cumplido, the herraduras become «Cobrar» (light: the screen's one gold
 * button is «¡Cobrar todo!»); cobrado, it is ticked and lighter. A weekly line shows its
 * steps as dots (●●○○).
 */
export function EncargoCard({
  icon,
  text,
  count,
  target,
  coins,
  state,
  steps,
  onCobrar,
}: {
  icon: string
  text: string
  count: number
  target: number
  coins: number
  state: 'going' | 'done' | 'paid'
  steps?: { at: number; of: number }
  onCobrar: (card: HTMLElement) => void
}) {
  return (
    <div className={`ecard ecard--${state}`}>
      <span className="ecard__icon">
        <EncargoIcon icon={icon} />
      </span>
      <div className="ecard__body">
        <strong>{text}</strong>
        {state !== 'paid' && (
          <span className="ecard__bar" role="progressbar" aria-valuemin={0} aria-valuemax={target} aria-valuenow={count}>
            <i style={{ width: `${(count / target) * 100}%` }} />
            <b>
              {count} / {target}
            </b>
          </span>
        )}
        {steps && steps.of > 1 && (
          <span className="ecard__steps" aria-label={`Escalón ${Math.min(steps.at + 1, steps.of)} de ${steps.of}`}>
            {Array.from({ length: steps.of }, (_, k) => (
              <i key={k} className={k < steps.at ? 'on' : ''} />
            ))}
          </span>
        )}
      </div>
      <div className="ecard__end">
        {state === 'done' ? (
          <Button variant="light" className="ecard__cobrar" onClick={(e) => onCobrar(e.currentTarget.closest('.ecard') as HTMLElement)}>
            <span>Cobrar</span>
            <b>
              <img src={art('ui_herradura')} alt="" />
              {coins}
            </b>
          </Button>
        ) : state === 'paid' ? (
          <Check on />
        ) : (
          <span className="ecard__coins">
            <img src={art('ui_herradura')} alt="Herraduras" />
            {coins}
          </span>
        )}
      </div>
    </div>
  )
}
