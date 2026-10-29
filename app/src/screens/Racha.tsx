import { useState } from 'react'
import { Confetti } from '../components/Confetti'
import { PauchoTalk } from '../components/PauchoTalk'
import { Button, CoinPill } from '../components/ui'
import { art } from '../game/content'
import { haptic, sfx } from '../game/sound'
import { actions, goalCoins, nextGoal, RESCUE_HABITS, useGame } from '../game/store'

/** What each goal is called on its big day. */
const GOAL_NAMES: Record<number, string> = {
  7: '¡Una semana entera!',
  14: '¡Dos semanas!',
  30: '¡Un mes de mates!',
  50: '¡Cincuenta días!',
  100: '¡Cien días!',
  365: '¡Un año juntos!',
}
const goalName = (g: number) => GOAL_NAMES[g] ?? `¡${g} días seguidos!`
const goalWords = (g: number) => (g === 7 ? 'una semana' : g === 14 ? 'dos semanas' : g === 30 ? 'un mes' : `${g} días`)

/**
 * The streak goal reached (Duolingo's milestone): the big number with confetti, Paucho hands
 * over its herraduras and a termo, then proposes the next goal of the ladder, saying what
 * it brings. Seeing it is what grants it (actions.reachGoal), so it is never lost.
 */
export function GoalDone({ goal, onDone }: { goal: number; onDone: () => void }) {
  const s = useGame((g) => g)
  const you = s.playerName.trim()
  const [step, setStep] = useState<'prize' | 'next'>('prize')
  const [paid, setPaid] = useState(false)
  const next = nextGoal(goal)
  const after = nextGoal(next)

  const thanks = () => {
    actions.reachGoal()
    setPaid(true)
    sfx('coin')
    haptic('success')
    window.setTimeout(() => setStep('next'), 700)
  }
  const pick = (g: number) => {
    actions.setStreakGoal(g)
    onDone()
  }

  return (
    <div className="screen racha racha--gold">
      <div className="racha__top">
        <CoinPill coins={s.coins} bump={paid} key={String(paid)} />
      </div>
      <div className="racha__burst" aria-hidden>
        <Confetti burstKey={1} count={40} />
      </div>
      <p className="racha__num">{goal}</p>
      <p className="racha__name">{goalName(goal)}</p>
      {step === 'prize' ? (
        <PauchoTalk pose="b4_contento" text={`¡Llegamos a tu meta${you ? `, ${you}` : ''}! ${goal} mates seguidos. Tomá, te lo ganaste.`}>
          <div className="racha__prizes">
            <span>
              <img src={art('ui_herradura')} alt="" />+{goalCoins(goal)}
            </span>
            <span>
              <b aria-hidden>🧉</b>+1 termo
            </span>
          </div>
          <Button variant="gold" onClick={thanks} disabled={paid}>
            ¡Gracias, {s.name}!
          </Button>
        </PauchoTalk>
      ) : (
        <PauchoTalk pose="b2_habla" text={`¿Y si vamos por ${goalWords(next)}? Si llegamos a ${next}, te regalo otro termo y ${goalCoins(next)} herraduras.`}>
          <Button variant="gold" onClick={() => pick(next)}>
            ¡Vamos por {next}!
          </Button>
          <Button variant="light" onClick={() => pick(after)}>
            Mejor {after} días
          </Button>
        </PauchoTalk>
      )}
    </div>
  )
}

/**
 * The streak went cold (more days missed than termos, but only a few): no scolding, Paucho
 * offers to recalentar it with RESCUE_HABITS habits today. Otherwise it starts over, and
 * the record stays.
 */
export function Rescue({ days, onDone }: { days: number; onDone: () => void }) {
  const s = useGame((g) => g)
  const you = s.playerName.trim()
  const answer = (yes: boolean) => {
    actions.answerRescue(yes)
    onDone()
  }
  return (
    <div className="screen racha racha--cold">
      <img className="racha__mate" src={art('mate_empty')} alt="" />
      <PauchoTalk
        pose="b8_curioso"
        text={`Se nos enfrió el mate${you ? `, ${you}` : ''}… ¡pero lo recalentamos! Hacé ${RESCUE_HABITS} hábitos hoy y recuperamos ${days === 1 ? 'el día' : `los ${days} días`}.`}
      >
        <Button variant="gold" onClick={() => answer(true)}>
          ¡Lo recalentamos! 🔥
        </Button>
        <Button variant="ghost" onClick={() => answer(false)}>
          Arrancar de nuevo
        </Button>
      </PauchoTalk>
    </div>
  )
}
