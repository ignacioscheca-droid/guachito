import { useEffect, useRef, useState } from 'react'
import { art } from '../game/content'

// Gauchito taking notes in his libreta, like Duo with his clipboard (libreta_*.webp, from
// design/tools/import_libreta.py). Every pose is the base with one part changed, so the
// app brings him to life by swapping them: he writes, blinks and looks around on his own,
// talks while a question appears, and reacts when you answer.

const POSES = [
  'base',
  'escribe_2',
  'escribe_3',
  'parpadeo',
  'habla',
  'mira_libreta',
  'mira_pregunta',
  'mira_arriba',
  'contento',
  'curioso',
  'sorprendido',
  'asiente',
  'anotado',
] as const
type Pose = (typeof POSES)[number]
export type Reaction = 'contento' | 'curioso' | 'sorprendido' | 'asiente' | 'anotado'

/** A run of poses, each for so many ms. */
type Steps = [Pose, number][]

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)]
const between = (a: number, b: number) => a + Math.random() * (b - a)

/** One thing to do while nobody answers: write a line, look somewhere, or rest and blink. */
function idle(): Steps {
  const r = Math.random()
  if (r < 0.55) {
    // a scribbled line: the pencil goes back and forth, lifts at the end and starts over
    const strokes = 2 + Math.floor(Math.random() * 3)
    const line: Steps = []
    for (let k = 0; k < strokes; k++) line.push(['escribe_2', 150], ['base', 150])
    return [...line, ['escribe_3', 260], ['base', between(300, 700)]]
  }
  if (r < 0.8)
    return [
      [pick(['mira_libreta', 'mira_pregunta', 'mira_arriba'] as const), between(800, 1400)],
      ['base', between(300, 600)],
    ]
  return [
    ['base', between(500, 900)],
    ['parpadeo', 140],
    ['base', between(400, 900)],
  ]
}

/**
 * `talking` moves his mouth; a new `reaction.key` plays that reaction for a moment, then
 * he goes back to his notes.
 */
export function Libreta({ talking, reaction }: { talking: boolean; reaction: { key: number; pose: Reaction } | null }) {
  const [pose, setPose] = useState<Pose>('base')
  const [reacting, setReacting] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!reaction) return
    setReacting(true)
    setPose(reaction.pose)
    // a little hop with each reaction
    box.current?.animate(
      [
        { transform: 'none' },
        { transform: 'translateY(-8px) scale(1.04, 0.97)', offset: 0.35 },
        { transform: 'translateY(0) scale(0.98, 1.02)', offset: 0.7 },
        { transform: 'none' },
      ],
      { duration: 420, easing: 'ease-out' },
    )
    const t = window.setTimeout(() => setReacting(false), 1100)
    return () => clearTimeout(t)
  }, [reaction])

  useEffect(() => {
    if (reacting) return
    let t = 0
    let steps: Steps = []
    const play = () => {
      if (steps.length === 0)
        steps = talking
          ? [
              ['habla', 140],
              ['base', 140],
            ]
          : idle()
      const [p, ms] = steps.shift()!
      setPose(p)
      t = window.setTimeout(play, ms)
    }
    play()
    return () => clearTimeout(t)
  }, [talking, reacting])

  // All poses stacked: switching is only visibility, so nothing flickers while decoding.
  return (
    <div className="libreta" ref={box}>
      {POSES.map((p) => (
        <img key={p} src={art(`libreta_${p}`)} alt="" style={{ opacity: p === pose ? 1 : 0 }} draggable={false} />
      ))}
    </div>
  )
}
