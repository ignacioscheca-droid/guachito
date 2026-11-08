import { useEffect, useState } from 'react'
import { EncargoCard } from '../components/EncargoCard'
import { Libreta, type Reaction } from '../components/Libreta'
import { Button, CoinPill } from '../components/ui'
import { now } from '../game/clock'
import { art } from '../game/content'
import { coinsOf, dailyView, daysLeft, lineView, type LineView } from '../game/encargos'
import { haptic, sfx } from '../game/sound'
import { actions, getState, todayKey, useGame } from '../game/store'

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]

/** Herraduras from what was cobrado (a card, or «¡Cobrar todo!») to the counter on top. */
function flyToCounter(from: HTMLElement, n: number) {
  const a = from.getBoundingClientRect()
  const to = document.querySelector('.encargos .coins')?.getBoundingClientRect()
  if (!to) return
  const x0 = a.left + a.width * 0.8
  const y0 = a.top + a.height / 2
  for (let i = 0; i < n; i++) {
    const el = document.createElement('img')
    el.src = art('ui_herradura')
    el.className = 'flyer'
    el.style.left = `${x0 - 14}px`
    el.style.top = `${y0 - 14}px`
    document.body.appendChild(el)
    const dx = to.left + 14 - x0
    const dy = to.top + to.height / 2 - y0
    el.animate(
      [
        { transform: 'translate(0, 0) scale(0.5)', opacity: 0 },
        { transform: `translate(${dx * 0.3 - 20 + i * 12}px, ${dy * 0.35 - 30}px) scale(1.15)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.75)`, opacity: 1 },
      ],
      { duration: 700, delay: i * 110, easing: 'cubic-bezier(0.5, 0, 0.6, 1)', fill: 'backwards' },
    ).onfinish = () => el.remove()
  }
}

/** Herraduras of every step a weekly line reached and isn't cobrado («¡Cobrar todo!» takes them all). */
function reached(l: LineView) {
  let coins = 0
  for (let k = l.line.step; k < l.line.steps.length && l.total >= l.line.steps[k]; k++) coins += coinsOf(l.line.coins[k])
  return coins
}

/** "Se renuevan en 7 h": until midnight. */
function renewsIn(dayOffset: number) {
  const t = now() + dayOffset * 86_400_000
  const midnight = new Date(t)
  midnight.setHours(24, 0, 0, 0)
  const h = Math.floor((midnight.getTime() - t) / 3_600_000)
  return h >= 1 ? `Se renuevan en ${h} h` : 'Se renuevan en un rato'
}

/** What Paucho says over his libreta when you open the tab. */
function greeting(toCobrar: number, allPaid: boolean, player: string) {
  const you = player ? `, ${player}` : ''
  if (toCobrar > 1) return pick([`¡Tenés ${toCobrar} para cobrar!`, `¡Hay ${toCobrar} encargos cumplidos${you}!`, `¡Mirá, ${toCobrar} listos para cobrar!`])
  if (toCobrar === 1) return pick(['¡Tenés uno para cobrar!', `¡Uno cumplido${you}! Cobralo.`, '¡Ese ya está! Pasá a cobrar.'])
  if (allPaid) return pick([`¡Todo lo de hoy${you}! Mañana te anoto más.`, '¡Libreta del día completa!', '¡Qué día! Mañana anoto otros.'])
  return pick(['Hoy anoté cuatro cositas.', `Mirá lo que anoté para hoy${you}.`, '¿Arrancamos por el primero?'])
}

/**
 * The Encargos tab (Claude Doc "Gauchito — Encargos"): Paucho with his libreta on top, today's
 * four in a line like Finch's daily quests, and the week's lines below, each on its step.
 */
export function Encargos() {
  const s = useGame((g) => g)
  const today = todayKey(s)
  const daily = dailyView(s)
  const lines = lineView(s, today)
  const waiting = daily.filter((d) => d.done && !d.paid).length + lines.filter((l) => l.done).length
  const total = daily.filter((d) => d.done && !d.paid).reduce((n, d) => n + d.coins, 0) + lines.reduce((n, l) => n + reached(l), 0)
  const [line, setLine] = useState(() => {
    const kept = getState().encargos?.kept ?? 0
    if (kept) return `Te guardé ${kept} herraduras de encargos que no cobraste. ¡Ya están en tu bolsa!`
    return greeting(waiting, daily.length > 0 && daily.every((d) => d.paid), s.playerName)
  })
  const [talking, setTalking] = useState(true)
  const [reaction, setReaction] = useState<{ key: number; pose: Reaction } | null>(null)
  const [bump, setBump] = useState(0)

  useEffect(() => {
    actions.keptSeen()
    const t = window.setTimeout(() => setTalking(false), 1600)
    return () => clearTimeout(t)
  }, [])

  const cobrado = (coins: number, card: HTMLElement) => {
    if (!coins) return
    flyToCounter(card, Math.min(6, Math.max(2, Math.round(coins / 5))))
    sfx('coin')
    haptic('success')
    setReaction((r) => ({ key: (r?.key ?? 0) + 1, pose: 'contento' }))
    window.setTimeout(() => setBump((b) => b + 1), 750)
    setLine(pick([`¡${coins} herraduras para vos!`, '¡Cobrado!', '¡Eso, a la bolsa!']))
  }

  // cobrados go to the end of their list
  const dailySorted = [...daily].sort((a, b) => Number(a.paid) - Number(b.paid))
  const linesSorted = [...lines].sort((a, b) => Number(a.finished) - Number(b.finished))
  const left = daysLeft(s, today)

  return (
    <div className="encargos">
      <header className="encargos__head">
        <div className="encargos__paucho">
          <Libreta talking={talking} reaction={reaction} />
        </div>
        <p className="encargos__say mi-bubble" key={line}>
          {line}
        </p>
        <div className="encargos__coins">
          <CoinPill coins={s.coins} bump={bump > 0} key={bump} />
        </div>
      </header>

      {waiting > 1 && (
        <Button variant="gold" className="encargos__all" onClick={(e) => cobrado(actions.cobrarTodo(), e.currentTarget)}>
          ¡Cobrar todo!
          <img src={art('ui_herradura')} alt="" />
          {total}
        </Button>
      )}

      <section className="encargos__sec">
        <h2>
          Del día <small>{renewsIn(s.dayOffset)}</small>
        </h2>
        <ol className="etl">
          {dailySorted.map((d) => (
            <li key={d.i} className={d.paid ? 'etl--paid' : d.done ? 'etl--done' : ''}>
              <EncargoCard
                icon={d.def.icon}
                text={d.text}
                count={d.count}
                target={d.pick.target}
                coins={d.coins}
                state={d.paid ? 'paid' : d.done ? 'done' : 'going'}
                onCobrar={(card) => cobrado(actions.cobrarDaily(d.i), card)}
              />
            </li>
          ))}
        </ol>
      </section>

      <section className="encargos__sec">
        <h2>
          De la semana <small>{left <= 1 ? 'Último día' : `Quedan ${left} días`}</small>
        </h2>
        <div className="encargos__list">
          {linesSorted.map((l) => (
            <EncargoCard
              key={l.line.id}
              icon={l.def.icon}
              text={l.text}
              count={l.finished ? l.target : l.count}
              target={l.target}
              coins={l.coins}
              state={l.finished ? 'paid' : l.done ? 'done' : 'going'}
              steps={{ at: l.line.step, of: l.line.steps.length }}
              onCobrar={(card) => cobrado(actions.cobrarLine(l.line.id), card)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
