import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { art, type Spot } from '../game/content'
import { AREAS, type Area, type Obra } from '../game/journey'
import type { Slot } from '../game/shop'
import { Paucho, PAUCHO_ASPECT, PAUCHO_FILL, type PauchoPose } from './Paucho'

/**
 * How the obra under way looks: `plan` = not started; `charging` = the bar filling
 * (`progress` 0..1); `working` = Paucho building it (`progress` = the eight hours gone by);
 * `reveal` = turning into its real colours (the reveal screen).
 */
export type ObraLook = { mode: 'plan' | 'charging' | 'working' | 'reveal'; progress?: number }

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
  /**
   * Px from the top of the scene where Home's habit cards begin: the art's `cardsAt` lands
   * there. Defaults to the scene's own bottom.
   */
  cardsTop?: number
  /** Show the art cropped around its obras (Áreas cards) instead of Home's camera. */
  whole?: boolean
  className?: string
  onTapPaucho?: () => void
  children?: ReactNode
}

type Box = { left: number; top: number; width: number }

const place = (s: Spot): CSSProperties => ({
  left: `${s.x}%`,
  bottom: `${100 - s.y}%`,
  height: `${s.h}%`,
  zIndex: s.z ?? Math.round(s.y),
})
const boxStyle = (b: Box): CSSProperties => ({ left: `${b.left}%`, top: `${b.top}%`, width: `${b.width}%` })

/** A window onto the art (left, top, width, height in % of it), drawn at the same place. */
const artWindow = (src: string, left: number, top: number, w: number, h: number): CSSProperties => ({
  left: `${left}%`,
  top: `${top}%`,
  width: `${w}%`,
  height: `${h}%`,
  backgroundImage: `url(${art(src)})`,
  backgroundSize: `${(100 / w) * 100}% ${(100 / h) * 100}%`,
  backgroundPosition: `${(left / (100 - w)) * 100}% ${(top / (100 - h)) * 100}%`,
})

const DOG_BOX = 720 / 630
const DOG_FILL = 0.875
/** While Paucho builds, the colour comes back up to this much of the obra; the reveal does the rest. */
const WORK_SHARE = 85

function PieceArt({ obra, look }: { obra: Obra; look?: ObraLook }) {
  const p = obra.piece
  if ('cut' in p) {
    // In the art already: built, there is nothing to add. Otherwise its faded copy goes
    // on top, and the colour comes back from the ground up as Paucho builds it.
    if (!look) return null
    const progress = look.progress ?? 0
    const style: CSSProperties = { ...boxStyle(p.box), zIndex: 40 }
    if (look.mode === 'reveal')
      return (
        <>
          <img className="apiece apiece--flash" src={art(p.cut)} style={style} alt="" />
          <img className="apiece apiece--faded apiece--fading" src={art(p.cut)} style={style} alt="" />
        </>
      )
    const cut = look.mode === 'working' ? progress * WORK_SHARE : 0
    const opacity = look.mode === 'charging' ? 1 - 0.3 * progress : 1
    return <img className="apiece apiece--faded" src={art(p.cut)} style={{ ...style, clipPath: `inset(0 0 ${cut}% 0)`, opacity }} alt="" />
  }
  const cls = look ? `apiece apiece--${look.mode}` : 'apiece'
  if ('sign' in p) {
    return (
      <div className={`asign ${cls}`} style={place(p.sign)}>
        <div className="asign__board">
          <b>{obra.emoji}</b>
          {look?.mode === 'charging' && <i style={{ width: `${(look.progress ?? 0) * 100}%` }} />}
        </div>
        <div className="asign__post" />
      </div>
    )
  }
  const style: CSSProperties = 'box' in p ? { ...boxStyle(p.box), zIndex: 40 } : { ...place(p.spot), translate: '-50% 0' }
  if (!look || look.mode === 'reveal') return <img className={cls} src={art(p.image)} style={style} alt="" />
  const cut = look.mode === 'working' ? 0 : look.mode === 'plan' ? 100 : (1 - (look.progress ?? 0)) * 100
  return (
    <>
      <img className="apiece apiece--ghost" src={art(p.image)} style={style} alt="" />
      <img className="apiece apiece--raw" src={art(p.image)} style={{ ...style, clipPath: `inset(${cut}% 0 0 0)` }} alt="" />
    </>
  )
}

/** Paucho cebando mate (the onboarding's mate scene), on a 10-second loop. */
const MATE_FRAMES = ['mate_a1_base', 'mate_a2_cebando_1', 'mate_a2_cebando_2', 'mate_a3_sorbo', 'mate_a4_ahh']
function PauchoMate({ spot, onTap }: { spot: Spot; onTap?: () => void }) {
  return (
    <div className="pmate" style={{ ...place(spot), aspectRatio: 640 / 990 }} onClick={onTap}>
      {MATE_FRAMES.map((n, k) => (
        <img key={n} src={art(n)} alt="" className={`pmate__f${k}`} draggable={false} />
      ))}
      <div className="pmate__steam" aria-hidden>
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}

/** Puffs of smoke or steam rising from a point (x, y in % of the art; size, dx, dy in % of its width). */
function Puffs({ x, y, n, size, dx, dy, seconds }: { x: number; y: number; n: number; size: number; dx: number; dy: number; seconds: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, k) => (
        <i
          key={k}
          className="alife__puff"
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}%`,
              '--dx': `${dx}cqw`,
              '--dy': `${dy}cqw`,
              animationDuration: `${seconds}s`,
              animationDelay: `${(-seconds * k) / n}s`,
            } as CSSProperties
          }
        />
      ))}
    </>
  )
}

/** A soft warm light breathing at (x, y), r in % of the art's width. */
const Glow = ({ x, y, r, delay = 0, fire }: { x: number; y: number; r: number; delay?: number; fire?: boolean }) => (
  <i className={`alife__glow${fire ? ' alife__glow--fire' : ''}`} style={{ left: `${x - r}%`, top: `calc(${y}% - ${r}cqw)`, width: `${2 * r}%`, animationDelay: `${delay}s` }} />
)

/**
 * Área 1 alive: tree crowns swaying, and once built, smoke from the chimney and the
 * lanterns' light (the casa), the fire and the pava's steam (the fogón). All drawn over
 * the still art, in % of it.
 */
function CasaLife({ a, built }: { a: Area; built: number }) {
  const scene = a.layers?.scene ?? a.base
  const casa = built >= 1
  const fogon = built >= 2
  return (
    <div className="alife">
      <div className="alife__sway" style={{ ...artWindow(scene, 0, 9.8, 18.5, 15), transformOrigin: '15% 100%' }} />
      <div className="alife__sway" style={{ ...artWindow(scene, 83, 8.8, 17, 16.6), transformOrigin: '85% 100%', animationDelay: '-2.1s' }} />
      {casa && (
        <>
          <Puffs x={29} y={14.4} n={5} size={4.2} dx={3.5} dy={-18} seconds={4.2} />
          <Glow x={36.4} y={33.5} r={5.4} />
          <Glow x={62.8} y={33.5} r={5.4} delay={-0.8} />
          <Glow x={54.4} y={37.6} r={3.4} delay={-1.5} />
        </>
      )}
      {fogon && (
        <>
          <Glow x={22.3} y={57.4} r={7} fire />
          <div className="alife__fire" style={artWindow(a.base, 18.1, 56.15, 8.8, 2.85)} />
          <Puffs x={23.2} y={52.1} n={3} size={2.2} dx={1.2} dy={-6} seconds={2.2} />
        </>
      )}
    </div>
  )
}

/** True for a moment after `key` changes (Paucho jumps up to celebrate, then sits again). */
function useCheer(key: number | undefined) {
  const [on, setOn] = useState(false)
  const last = useRef(key)
  useEffect(() => {
    if (key === last.current) return
    last.current = key
    setOn(true)
    const t = window.setTimeout(() => setOn(false), 1100)
    return () => clearTimeout(t)
  }, [key])
  return on
}

/** One of the areas: its art (in layers if it has them), the obras, Paucho and the dog. */
export function AreaScene({ area, built, current, pose = 'idle', outfit, celebrateKey, dog, cardsTop, whole, className = '', onTapPaucho, children }: Props) {
  const a = AREAS[area]
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 390, h: 340 })
  const cheering = useCheer(celebrateKey)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Camera: as wide as the scene, the art's `cardsAt` on the habit cards (or the bottom).
  let width: number
  let top: number
  if (whole) {
    width = Math.max(size.w, size.h / a.aspect)
    top = Math.min(0, Math.max(size.h - width * a.aspect, size.h / 2 - a.focusY * width * a.aspect))
  } else {
    width = size.w
    top = (cardsTop ?? size.h) - a.cardsAt * width * a.aspect
  }
  const left = (size.w - width) / 2
  const cur = current && a.obras[built] ? current : null
  const sitting = !!a.sit && pose === 'idle' && !cheering
  const hero = a.hero

  return (
    <div className={`scene ascene ${className}`} ref={box} style={{ background: a.skyTop }}>
      <div className="scene__stage ascene__stage" style={{ width, height: width * a.aspect, aspectRatio: 'auto', transform: `translate(${left}px, ${top}px)` }}>
        {a.layers ? (
          <>
            <img className="ascene__sky" src={art(a.layers.sky)} style={{ height: `${a.layers.skyHeight}%` }} alt="" />
            {a.layers.clouds.map((c, k) => (
              <img key={c.image} className="ascene__cloud" src={art(c.image)} style={{ ...boxStyle(c.box), animationDelay: `${-k * 17}s` }} alt="" />
            ))}
            <img className="scene__bg" src={art(a.layers.scene)} alt="" />
          </>
        ) : (
          <img className="scene__bg" src={art(a.base)} alt="" />
        )}
        {a.life === 'casa' && <CasaLife a={a} built={built} />}
        {a.obras.slice(0, built).map((o) => (
          <PieceArt key={o.id} obra={o} />
        ))}
        {/* not built yet: obras drawn in the art go faded; the next one shows how it's going */}
        {a.obras.slice(built).map((o, k) =>
          'cut' in o.piece ? (
            <PieceArt key={o.id} obra={o} look={k === 0 && cur ? cur : { mode: 'plan' }} />
          ) : k === 0 && cur ? (
            <PieceArt key={o.id} obra={o} look={cur} />
          ) : null,
        )}
        {dog && (
          <div className="scene__dog" style={{ ...place({ ...a.dog, h: a.dog.h / DOG_FILL }), aspectRatio: DOG_BOX }}>
            <img src={art(a.life === 'casa' ? 'dog_sleep' : 'dog_sit')} alt="" />
          </div>
        )}
        {pose && sitting && a.sit && <PauchoMate spot={a.sit} onTap={onTapPaucho} />}
        {pose && !sitting && (
          <Paucho
            pose={cheering && a.sit ? 'celebrate' : pose}
            outfit={outfit}
            celebrateKey={a.sit ? undefined : celebrateKey}
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
