import { useEffect, useRef, useState } from 'react'
import { art } from '../game/content'
import { RiveGauchito, useRiveAvailable } from './RiveGauchito'

/** Poses from the artist's delivery. All share one box (1208 × 1320) with the boots on its baseline. */
export type Pose = 'idle' | 'wave' | 'thumbs' | 'mate' | 'sleep' | 'think' | 'surprised' | 'sad' | 'map' | 'pet'

type Frame = Pose | 'squash' | 'jump' | 'celebrate' | 'land'

const FRAME_ART: Record<Frame, string> = {
  idle: 'g_idle',
  squash: 'g_idle',
  jump: 'g_jump',
  celebrate: 'g_celebrate',
  land: 'g_thumbs',
  wave: 'g_wave',
  thumbs: 'g_thumbs',
  mate: 'g_mate',
  sleep: 'g_sleep',
  think: 'g_think',
  surprised: 'g_surprised',
  sad: 'g_sad',
  map: 'g_map',
  pet: 'g_pet',
}

/** Width / height of the shared pose box, and how much of its height the idle pose fills. */
export const BOX_ASPECT = 1208 / 1320
export const IDLE_HEIGHT_IN_BOX = 0.895

// habit_completed: smile -> anticipation -> jump -> celebration -> settle (RIG_SPEC, 1.2-1.8 s)
const CELEBRATION: [Frame, number][] = [
  ['squash', 160],
  ['jump', 480],
  ['celebrate', 520],
  ['land', 380],
]

export function preloadGauchito() {
  new Set(Object.values(FRAME_ART)).forEach((name) => {
    const img = new Image()
    img.src = art(name)
  })
}

type Props = {
  pose?: Pose
  /** Increment to play the habit-completed celebration once. */
  celebrateKey?: number
  /** Called on each celebration frame change (lets the scene sync confetti, dog, etc). */
  onFrame?: (frame: string) => void
  /** Rendered width of the pose box (px, or any CSS length). */
  width: number | string
  shadow?: boolean
  onTap?: () => void
}

export function Gauchito(props: Props) {
  const rive = useRiveAvailable()
  // The Rive master covers idle + celebration; other poses still use the stills.
  if (rive && (props.pose ?? 'idle') === 'idle') return <RiveGauchito {...props} />
  return <SpriteGauchito {...props} />
}

function SpriteGauchito({ pose = 'idle', celebrateKey = 0, onFrame, width, shadow = true, onTap }: Props) {
  const [frame, setFrame] = useState<Frame>(pose)
  const lastKey = useRef(celebrateKey)

  useEffect(() => {
    setFrame(pose)
  }, [pose])

  useEffect(() => {
    // Only react to real changes (StrictMode re-runs effects on mount).
    if (celebrateKey === lastKey.current) return
    lastKey.current = celebrateKey
    let t = 0
    const timers = CELEBRATION.map(([f, ms]) => {
      const at = t
      t += ms
      return window.setTimeout(() => {
        setFrame(f)
        onFrame?.(f)
      }, at)
    })
    timers.push(
      window.setTimeout(() => {
        setFrame(pose)
        onFrame?.('idle')
      }, t),
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrateKey])

  return (
    <div className={`guachito guachito--${frame}`} style={{ width }} onClick={onTap}>
      {shadow && <div className="guachito__shadow" />}
      <img className="guachito__img" src={art(FRAME_ART[frame])} alt="" draggable={false} />
    </div>
  )
}
