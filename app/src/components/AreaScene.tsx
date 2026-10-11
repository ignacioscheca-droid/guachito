import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { art, type Spot } from '../game/content'
import { AREAS, type Obra } from '../game/journey'
import type { Slot } from '../game/shop'
import { Paucho, PAUCHO_ASPECT, PAUCHO_FILL, type PauchoPose } from './Paucho'

/**
 * How the obra under way looks: `plan` = only its outline; `charging` = rising from the
 * ground as the bar fills (`progress` 0..1); `raw` = all up but unpainted (the eight hours);
 * `reveal` = turning into its real colours (the reveal screen).
 */
export type ObraLook = { mode: 'plan' | 'charging' | 'raw' | 'reveal'; progress?: number }

type Props = {
  area: number
  /** Obras of the area standing (0..all). */
  built: number
  /** The next obra, drawn as `look` (none when the area is done or Paucho travels). */
  current?: ObraLook | null
  pose?: PauchoPose | null
  outfit?: Partial<Record<Slot, string>>
  celebrateKey?: number
  dog?: boolean
  /** Px of the scene's bottom hidden under the card that overlaps it. */
  overlap?: number
  /** Show the whole square (Áreas cards) instead of Home's camera. */
  whole?: boolean
  className?: string
  onTapPaucho?: () => void
  children?: ReactNode
}

const place = (s: Spot): CSSProperties => ({
  left: `${s.x}%`,
  bottom: `${100 - s.y}%`,
  height: `${s.h}%`,
  zIndex: s.z ?? Math.round(s.y),
})

const DOG_BOX = 720 / 630
const DOG_FILL = 0.875

function PieceArt({ obra, look }: { obra: Obra; look?: ObraLook }) {
  const p = obra.piece
  const cls = look ? `apiece apiece--${look.mode}` : 'apiece'
  if ('sign' in p) {
    return (
      <div className={`asign ${cls}`} style={place(p.sign)}>
        <div className="asign__board">
          <b>{obra.emoji}</b>
          <span>{obra.name}</span>
          {look?.mode === 'charging' && <i style={{ width: `${(look.progress ?? 0) * 100}%` }} />}
        </div>
        <div className="asign__post" />
      </div>
    )
  }
  const style: CSSProperties =
    'box' in p
      ? { left: `${p.box.left}%`, top: `${p.box.top}%`, width: `${p.box.width}%`, zIndex: 40 }
      : { ...place(p.spot), translate: '-50% 0' }
  if (!look || look.mode === 'reveal') return <img className={cls} src={art(p.image)} style={style} alt="" />
  // under way: the outline, and what is built so far rising from the ground
  const cut = look.mode === 'raw' ? 0 : look.mode === 'plan' ? 100 : (1 - (look.progress ?? 0)) * 100
  return (
    <>
      <img className="apiece apiece--ghost" src={art(p.image)} style={style} alt="" />
      <img className="apiece apiece--raw" src={art(p.image)} style={{ ...style, clipPath: `inset(${cut}% 0 0 0)` }} alt="" />
    </>
  )
}

/** One of the areas, framed for the phone: its base, the obras standing, Paucho and the dog. */
export function AreaScene({ area, built, current, pose = 'idle', outfit, celebrateKey, dog, overlap = 0, whole, className = '', onTapPaucho, children }: Props) {
  const a = AREAS[area]
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 390, h: 340 })
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Camera: wide enough to fill the box, with the ground line just above the card.
  let side: number
  let left: number
  let top: number
  if (whole) {
    side = Math.max(size.w, size.h)
    left = (size.w - side) / 2
    top = (size.h - side) / 2
  } else {
    const { focusX, screenX, groundY, minZoom } = a.camera
    const h = size.h + overlap
    side = Math.max(size.w * minZoom, h / (groundY / 100))
    left = Math.min(0, Math.max(size.w - side, (screenX / 100) * size.w - (focusX / 100) * side))
    top = Math.min(0, h - (groundY / 100) * side)
  }

  const hero = a.hero
  return (
    <div className={`scene ascene ${className}`} ref={box}>
      <div className="scene__stage" style={{ width: side, transform: `translate(${left}px, ${top}px)` }}>
        <img className="scene__bg" src={art(a.base)} alt="" />
        {a.obras.slice(0, built).map((o) => (
          <PieceArt key={o.id} obra={o} />
        ))}
        {current && a.obras[built] && <PieceArt obra={a.obras[built]} look={current} />}
        {dog && (
          <div className="scene__dog" style={{ ...place({ ...a.dog, h: a.dog.h / DOG_FILL }), aspectRatio: DOG_BOX }}>
            <img src={art('dog_sit')} alt="" />
          </div>
        )}
        {pose && (
          <Paucho
            pose={pose}
            outfit={outfit}
            celebrateKey={celebrateKey}
            className="ascene__paucho"
            style={{ ...place({ ...hero, y: hero.y + 0.2, h: hero.h / PAUCHO_FILL }), aspectRatio: PAUCHO_ASPECT }}
            onTap={onTapPaucho}
          />
        )}
      </div>
      {children}
    </div>
  )
}
