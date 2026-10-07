import { useEffect, useRef } from 'react'

const COLORS = ['#F2B33D', '#D6453D', '#7A9A4B', '#6FB8F9', '#F28C38', '#E86A92']

/** Fires a burst of confetti from the centre of its box every time `burstKey` changes. */
export function Confetti({ burstKey, count = 26, spread = 1 }: { burstKey: number; count?: number; spread?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host || burstKey === 0) return
    const pieces: HTMLElement[] = []
    for (let i = 0; i < count; i++) {
      const el = document.createElement('i')
      const star = i % 7 === 0
      el.className = star ? 'confetti__star' : 'confetti__bit'
      if (!star) el.style.background = COLORS[i % COLORS.length]
      host.appendChild(el)
      pieces.push(el)
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const dist = (90 + Math.random() * 90) * spread
      const dx = Math.cos(angle) * dist
      const dy = Math.sin(angle) * dist * 0.8 - 40
      const rot = Math.random() * 540 - 270
      el.animate(
        [
          { transform: 'translate(-50%,-50%) scale(0.4) rotate(0deg)', opacity: 1 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rot}deg)`, opacity: 1, offset: 0.6 },
          { transform: `translate(calc(-50% + ${dx * 1.1}px), calc(-50% + ${dy + 60}px)) scale(0.9) rotate(${rot * 1.4}deg)`, opacity: 0 },
        ],
        { duration: 1100 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' },
      )
    }
    const t = window.setTimeout(() => pieces.forEach((p) => p.remove()), 1700)
    return () => {
      clearTimeout(t)
      pieces.forEach((p) => p.remove())
    }
  }, [burstKey, count, spread])

  return <div ref={ref} className="confetti" aria-hidden />
}
