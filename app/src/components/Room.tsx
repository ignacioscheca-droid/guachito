import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { art } from '../game/content'
import type { Slot } from '../game/shop'
import { Paucho, type PauchoPose } from './Paucho'

// Paucho's room, drawn at 390 × 470 and scaled to the screen. Walls, window and the six
// things are stand-ins until ChatGPT's "pieza_amueblada / pieza_vacia" (then each thing
// becomes a cut-out at the same place).

const W = 390
const H = 470
const FLOOR = H - 96

/** Where each thing goes, in room px: left, top, width, height. */
export const ROOM_SPOTS: Record<string, [number, number, number, number]> = {
  cama: [14, 306, 180, 104],
  matra: [112, 410, 176, 54],
  mesita: [196, 290, 62, 96],
  baul: [20, 400, 78, 52],
  cuadro: [40, 168, 74, 60],
  estante: [118, 214, 84, 40],
}

/** A catre de madera with a matra for a blanket. */
export const BED = (
  <svg viewBox="0 0 180 104" width="100%" height="100%" aria-hidden>
    <defs>
      <clipPath id="room-blanket">
        <path d="M36 50 H176 V84 Q106 92 36 84 Z" />
      </clipPath>
    </defs>
    <rect x="6" y="6" width="12" height="96" rx="4" fill="#6e452a" />
    <rect x="18" y="16" width="26" height="54" rx="6" fill="#8a5a36" />
    <rect x="164" y="40" width="12" height="62" rx="4" fill="#6e452a" />
    <rect x="10" y="70" width="166" height="16" rx="5" fill="#7a4c2e" />
    <rect x="16" y="46" width="160" height="30" rx="12" fill="#f4ecdc" />
    <rect x="22" y="38" width="40" height="22" rx="10" fill="#fffaf0" stroke="#e5d6bb" strokeWidth="2" />
    <image href={art('item_alfombra')} x="20" y="34" width="170" height="70" preserveAspectRatio="xMidYMid slice" clipPath="url(#room-blanket)" />
  </svg>
)

const CHEST = (
  <svg viewBox="0 0 78 52" width="100%" height="100%" aria-hidden>
    <rect x="3" y="16" width="72" height="34" rx="5" fill="#8a4f2a" />
    <path d="M3 18 Q39 0 75 18 V22 H3 Z" fill="#a0612f" />
    <rect x="3" y="20" width="72" height="4" fill="#5e3519" />
    <rect x="16" y="14" width="6" height="36" fill="#5e3519" />
    <rect x="56" y="14" width="6" height="36" fill="#5e3519" />
    <rect x="34" y="26" width="10" height="10" rx="2" fill="#e2b34a" />
  </svg>
)

/** How each thing looks until its art arrives. */
export function RoomThing({ id }: { id: string }) {
  if (id === 'cama') return BED
  if (id === 'baul') return CHEST
  if (id === 'matra') return <img src={art('item_alfombra')} alt="" />
  if (id === 'mesita')
    return (
      <span className="rthing__stack">
        <img src={art('item_farol')} alt="" style={{ height: '38%' }} />
        <img src={art('item_mesa')} alt="" style={{ height: '62%' }} />
      </span>
    )
  if (id === 'cuadro')
    return (
      <span className="rthing__frame">
        <img src={art('story_1')} alt="" />
      </span>
    )
  return (
    <span className="rthing__shelf">
      <img src={art('habit_mate')} alt="" />
      <b>🫖</b>
    </span>
  )
}

type Props = {
  /** Things bought: each has its own place in the room (the player never picks it). */
  items: string[]
  /** The thing just bought, to make it pop. */
  fresh?: string | null
  pose?: PauchoPose
  outfit?: Partial<Record<Slot, string>>
  celebrateKey?: number
  children?: ReactNode
}

export function Room({ items, fresh, pose = 'idle', outfit, celebrateKey, children }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(W)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const k = w / W
  const d = FLOOR - 310

  return (
    <div className="room" ref={box} style={{ height: H * k }}>
      <div className="room__stage" style={{ width: W, height: H, transform: `scale(${k})` }}>
        <svg className="room__walls" viewBox={`0 0 ${W} ${H}`} aria-hidden>
          <defs>
            <linearGradient id="room-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f6ecdb" />
              <stop offset="1" stopColor="#ead7b8" />
            </linearGradient>
            <linearGradient id="room-floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b98a5c" />
              <stop offset="1" stopColor="#cfa274" />
            </linearGradient>
            <clipPath id="room-win">
              <rect x="214" y={120 + d} width="92" height="80" rx="4" />
            </clipPath>
          </defs>
          <rect width={W} height={H} fill="url(#room-wall)" />
          <g fill="#e3cfae" opacity="0.55">
            <rect x="330" y={240 + d} width="40" height="18" rx="7" />
            <rect x="250" y={250 + d} width="26" height="12" rx="5" />
          </g>
          <rect width={W} height="64" fill="#d9c08f" />
          <g stroke="#c4a671" strokeWidth="2">
            {Array.from({ length: 40 }, (_, i) => (
              <line key={i} x1={i * 10} y1="0" x2={i * 10 + 4} y2="64" />
            ))}
          </g>
          <rect y="56" width={W} height="18" fill="#6e452a" />
          <rect y="70" width={W} height="5" fill="#5a3720" opacity="0.6" />
          {[40, 150, 260, 370].map((x) => (
            <rect key={x} x={x - 9} y="0" width="18" height="60" fill="#7a4c2e" />
          ))}
          <image href={art('area1_0')} x="-200" y={20 + d} width="520" height="520" clipPath="url(#room-win)" preserveAspectRatio="xMidYMid slice" />
          <rect x="214" y={120 + d} width="92" height="80" rx="4" fill="none" stroke="#7a4a2c" strokeWidth="9" />
          <line x1="260" y1={120 + d} x2="260" y2={200 + d} stroke="#7a4a2c" strokeWidth="6" />
          <line x1="214" y1={160 + d} x2="306" y2={160 + d} stroke="#7a4a2c" strokeWidth="6" />
          <rect x="206" y={198 + d} width="108" height="10" rx="3" fill="#8a5a36" />
          <rect y={FLOOR} width={W} height="96" fill="url(#room-floor)" />
          <g stroke="#9c7046" strokeWidth="2" opacity="0.6">
            {[0, 20, 44, 72].map((y) => (
              <line key={y} x1="0" y1={FLOOR + y} x2={W} y2={FLOOR + y} />
            ))}
          </g>
          <rect y={FLOOR - 4} width={W} height="6" fill="#d8c09b" />
        </svg>

        {Object.entries(ROOM_SPOTS).map(([id, [x, y, sw, sh]]) => {
          const style = { left: x, top: y, width: sw, height: sh }
          if (!items.includes(id)) return null
          return (
            <div key={id} className={`rthing rthing--${id}${fresh === id ? ' rthing--fresh' : ''}`} style={style}>
              <RoomThing id={id} />
            </div>
          )
        })}

        <Paucho pose={pose} outfit={outfit} celebrateKey={celebrateKey} className="room__paucho" />
      </div>
      {children}
    </div>
  )
}
