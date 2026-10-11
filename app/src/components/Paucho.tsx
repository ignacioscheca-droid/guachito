import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { art } from '../game/content'
import { WEAR, type Slot, type WearPose } from '../game/shop'

/**
 * Paucho as stills (906 × 990 boxes, boots on the baseline), dressed: the plain pose
 * with an overlay per piece of clothing that has art for it. Pieces without art yet
 * don't show (see the art brief).
 */
export type PauchoPose = 'idle' | 'celebrate' | 'thumbs' | 'wave' | 'think' | 'mate' | 'build' | 'map'

const POSE_ART: Record<PauchoPose, string> = {
  idle: 'g_idle',
  celebrate: 'g_celebrate',
  thumbs: 'g_thumbs',
  wave: 'g_wave',
  think: 'g_think',
  mate: 'g_mate',
  // until ChatGPT's "Paucho construyendo"
  build: 'g_thumbs',
  map: 'g_map',
}

/** Box of the pose stills, and how much of its height the idle pose fills. */
export const PAUCHO_ASPECT = 906 / 990
export const PAUCHO_FILL = 0.895

const SLOT_ORDER: Slot[] = ['cuerpo', 'cuello', 'cabeza']

function overlays(pose: WearPose, outfit: Partial<Record<Slot, string>>) {
  return SLOT_ORDER.map((slot) => outfit[slot])
    .filter((id): id is string => !!id)
    .map((id) => WEAR[id]?.[pose])
    .filter((name): name is string => !!name)
}

export function preloadPaucho() {
  Object.values(POSE_ART).forEach((n) => (new Image().src = art(n)))
}

type Props = {
  pose?: PauchoPose
  outfit?: Partial<Record<Slot, string>>
  /** Increment to play a short celebration (arms up and a hop). */
  celebrateKey?: number
  className?: string
  style?: CSSProperties
  onTap?: () => void
}

export function Paucho({ pose = 'idle', outfit = {}, celebrateKey = 0, className = '', style, onTap }: Props) {
  const [cheering, setCheering] = useState(false)
  const last = useRef(celebrateKey)
  useEffect(() => {
    if (celebrateKey === last.current) return
    last.current = celebrateKey
    setCheering(true)
    const t = window.setTimeout(() => setCheering(false), 950)
    return () => clearTimeout(t)
  }, [celebrateKey])

  const shown: PauchoPose = cheering ? 'celebrate' : pose
  const wearPose: WearPose | null = shown === 'idle' ? 'idle' : shown === 'celebrate' ? 'celebrate' : null
  return (
    <div className={`paucho${cheering ? ' paucho--hop' : ''}${pose === 'idle' && !cheering ? ' paucho--breathe' : ''} ${className}`} style={style} onClick={onTap}>
      <img src={art(POSE_ART[shown])} alt="" draggable={false} />
      {wearPose && overlays(wearPose, outfit).map((n) => <img key={n} src={art(n)} alt="" draggable={false} />)}
    </div>
  )
}

/** His face, dressed (the nav icon, the profile). */
export function PauchoFace({ outfit = {}, className = '' }: { outfit?: Partial<Record<Slot, string>>; className?: string }) {
  return (
    <span className={`pface ${className}`}>
      <img src={art('g_avatar')} alt="" />
      {overlays('avatar', outfit).map((n) => (
        <img key={n} src={art(n)} alt="" />
      ))}
    </span>
  )
}
