import { useEffect, useRef, useState } from 'react'
import { PauchoTalk } from '../components/PauchoTalk'
import { Button } from '../components/ui'
import { art } from '../game/content'
import { jobInfo, TRIP, WORK_MS } from '../game/journey'
import { haptic, sfx } from '../game/sound'
import { scheduleDonePush } from '../game/push'
import { actions, getState, nextJob, useGame } from '../game/store'
import { returnTime } from './TripRun'

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]

/** Herraduras from Paucho's hand (his mate hand, on the right) to the counter on top. */
function flyFromHand(n: number) {
  const guy = document.querySelector('.ptalk__guy')?.getBoundingClientRect()
  const to = document.querySelector('.home3__top .coins, .coins')?.getBoundingClientRect()
  if (!guy || !to) return
  const x0 = guy.left + guy.width * 0.78
  const y0 = guy.top + guy.height * 0.6
  for (let i = 0; i < n; i++) {
    const el = document.createElement('img')
    el.src = art('ui_herradura')
    el.className = 'flyer'
    el.style.zIndex = '95'
    el.style.left = `${x0 - 14}px`
    el.style.top = `${y0 - 14}px`
    document.body.appendChild(el)
    const dx = to.left + 14 - x0
    const dy = to.top + to.height / 2 - y0
    el.animate(
      [
        { transform: 'translate(0, 0) scale(0.4)', opacity: 0 },
        { transform: `translate(${dx * 0.15 + 20 - i * 10}px, ${dy * 0.25 - 40}px) scale(1.15)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.75)`, opacity: 1 },
      ],
      { duration: 850, delay: i * 130, easing: 'cubic-bezier(0.5, 0, 0.6, 1)', fill: 'backwards' },
    ).onfinish = () => el.remove()
  }
}

/**
 * The bar is full and Paucho tells you so himself, up close like with the mate: he thanks
 * you and hands you the day's herraduras (`thanks`), then says what he'll build and until
 * when (`work`), and "¡Dale, Paucho!" sets him off. From Home's bar (already full) it
 * starts at `work`.
 */
export function FullTalk({ start, onCoinsLanded, onDone }: { start: 'thanks' | 'work'; onCoinsLanded: () => void; onDone: (started: boolean) => void }) {
  const s = useGame((g) => g)
  const [step, setStep] = useState(start)
  // read once: after "¡Dale!" the store moves on
  const [job] = useState(() => nextJob(s))
  const you = s.playerName.trim()
  const [lines] = useState(() => ({
    thanks: pick([
      `¡Ahora sí que tengo energía! ¡Gracias${you ? `, ${you}` : ''}!`,
      `¡Qué pila de energía! ¡Gracias${you ? `, ${you}` : ''}!`,
      '¡Con esto levanto cualquier cosa! Gracias por cuidarte.',
    ]),
    gift: pick(['Y tomá, te junté unas herraduras para la casita 🧉', 'Y esto es para vos: herraduras para la casita.', '¡Mirá lo que encontré! Para la casita.']),
    work: (the: string, at: string) =>
      pick([`Me pongo a trabajar en ${the}. ¡Para las ${at} está listo!`, `¡A trabajar! A las ${at} te muestro ${the}.`, `Voy con ${the}. Vos seguí con lo tuyo, que yo te aviso.`]),
  }))
  const landed = useRef(false)

  // he hands over the herraduras while he thanks you
  useEffect(() => {
    if (step !== 'thanks') return
    sfx('full')
    haptic('celebrate')
    const fly = window.setTimeout(() => {
      flyFromHand(6)
      for (let i = 0; i < 6; i++) {
        sfx('coin', 0, 820 + i * 130)
        haptic('tick', 820 + i * 130)
      }
    }, 1100)
    const land = window.setTimeout(() => {
      landed.current = true
      onCoinsLanded()
    }, 1100 + 820 + 5 * 130)
    return () => {
      clearTimeout(fly)
      clearTimeout(land)
      if (!landed.current) onCoinsLanded()
    }
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!job) return null
  const trip = job.kind === 'trip'
  const at = returnTime(WORK_MS)

  if (step === 'thanks') {
    // a finished obra still waits to be seen: first that, then he'll start the next one
    const waiting = s.work.status === 'done'
    return (
      <PauchoTalk
        pose="b4_contento"
        text={waiting ? `${lines.thanks} ${lines.gift} ¡Y mirá, ya terminé ${jobInfo(job).the}!` : `${lines.thanks} ${lines.gift}`}
        onNext={() => (waiting ? onDone(false) : setStep('work'))}
      />
    )
  }
  return (
    <PauchoTalk
      pose="b2_habla"
      text={trip ? `Me voy de viaje al sur a buscar ${TRIP.brings}. ¡Vuelvo a las ${at}!` : lines.work(jobInfo(job).the, at)}
    >
      <Button
        variant="gold"
        onClick={() => {
          actions.startWork()
          // the phone gets a notification when he's done
          const now = getState()
          if (now.work.startedAt != null) scheduleDonePush(now.pushSubscription, now.work.startedAt + WORK_MS)
          sfx('start')
          haptic('heavy')
          onDone(true)
        }}
      >
        {trip ? `¡Buen viaje, ${s.name}!` : `¡Dale, ${s.name}! 🔨`}
      </Button>
    </PauchoTalk>
  )
}
