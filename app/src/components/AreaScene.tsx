import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { art, type Spot } from '../game/content'
import { AREAS, type Area, type Box, type Obra } from '../game/journey'
import type { Slot } from '../game/shop'
import { Paucho, PAUCHO_ASPECT, PAUCHO_FILL, type PauchoPose } from './Paucho'

/**
 * How the obra under way looks: `plan` = not started; `charging` = the bar filling
 * (`progress` 0..1); `working` = Paucho building it (`progress` = the eight hours gone by);
 * `reveal` = the build transition (the pile shakes, dust, the obra pops up).
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

const place = (s: Spot): CSSProperties => ({
  left: `${s.x}%`,
  bottom: `${100 - s.y}%`,
  height: `${s.h}%`,
  zIndex: s.z ?? Math.round(s.y),
})
const boxStyle = (b: Box): CSSProperties => ({ left: `${b.left}%`, top: `${b.top}%`, width: `${b.width}%` })

const DOG_BOX = 720 / 630
const DOG_FILL = 0.875

/** A fixed pseudo-random sequence, so the dust and sparkles land in the same places each time. */
function seeded(n: number) {
  let s = 7
  return Array.from({ length: n }, () => (s = (s * 9301 + 49297) % 233280) / 233280)
}

/**
 * The obra of a staged area while it is being built, and its build transition: the pile
 * (already in the stage) shakes, dust covers it, the obra pops up from the ground, then
 * sparkles, a gold ring and confetti. Positions in % of the art.
 */
function StagedObra({ piece, look }: { piece: { obra: string; pile: string; box: Box }; look: ObraLook }) {
  const b = piece.box
  if (look.mode === 'working') {
    // Paucho at work: a little dust now and then from the pile
    const r = seeded(6)
    return (
      <div className="sobra" aria-hidden>
        {r.map((v, i) => (
          <i
            key={i}
            className="sobra__work"
            style={{ left: `${b.left + b.width * (0.2 + 0.6 * v)}%`, top: `${b.top + b.width * 0.35}%`, animationDelay: `${-i * 0.9}s` }}
          />
        ))}
      </div>
    )
  }
  if (look.mode !== 'reveal') return null
  const r = seeded(60)
  const n = 9
  return (
    <div className="sobra" aria-hidden>
      <img className="sobra__pile" src={art(piece.pile)} style={boxStyle(b)} alt="" />
      <img className="sobra__obra" src={art(piece.obra)} style={boxStyle(b)} alt="" />
      {Array.from({ length: n * 2 }, (_, i) => {
        const along = (i % n) / (n - 1)
        const low = i < n
        const size = b.width * (0.16 + 0.08 * r[i])
        return (
          <i
            key={i}
            className="sobra__dust"
            style={
              {
                left: `${b.left + along * b.width - size / 2}%`,
                top: `calc(${b.top}% + ${b.width * (low ? 0.5 : 0.28 + 0.12 * r[i + 20])}cqw)`,
                width: `${size}%`,
                '--dx': `${(along - 0.5) * 22}cqw`,
                '--dy': `${-5 - 6 * r[i + 30]}cqw`,
                animationDelay: `${(r[i + 40] * 0.12).toFixed(2)}s`,
              } as CSSProperties
            }
          />
        )
      })}
      <i className="sobra__ring" style={{ left: `${b.left + b.width * 0.15}%`, top: `calc(${b.top}% + ${b.width * 0.5}cqw)`, width: `${b.width * 0.7}%` }} />
      {r.slice(0, 9).map((v, i) => (
        <svg
          key={i}
          className="sobra__spark"
          viewBox="0 0 24 24"
          style={{ left: `${b.left + v * b.width}%`, top: `calc(${b.top}% + ${b.width * 0.45 * r[i + 10]}cqw)`, animationDelay: `${(r[i + 50] * 0.5).toFixed(2)}s` }}
        >
          <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" />
        </svg>
      ))}
    </div>
  )
}

/** Wooden signs and cut-outs for areas still on stand-ins. */
function PieceArt({ obra, look }: { obra: Obra; look?: ObraLook }) {
  const p = obra.piece
  if ('obra' in p) return look ? <StagedObra piece={p} look={look} /> : null
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
 * Área 1 alive, over its stage: once the casa stands, chimney smoke and the lanterns'
 * light; once the fogón does, its fire (three flame frames) and the pava's steam.
 */
function CasaLife({ built }: { built: number }) {
  const casa = built >= 1
  const fogon = built >= 2
  return (
    <div className="alife">
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
          <Glow x={22.6} y={57.4} r={7} fire />
          <div className="alife__flame" style={{ left: '19.6%', top: '54.6%', width: '6.2%' }}>
            {[1, 2, 3].map((k) => (
              <img key={k} src={art(`area1_flame_${k}`)} alt="" />
            ))}
          </div>
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

/** The art's layers: sky, clouds crossing it, the stage (or base), and the trees swaying. */
function Layers({ a, built }: { a: Area; built: number }) {
  const l = a.layers
  if (!l) return <img className="scene__bg" src={art(a.base)} alt="" />
  return (
    <>
      <img className="ascene__sky" src={art(l.sky)} style={{ height: `${l.skyHeight}%` }} alt="" />
      {l.clouds.map((c, k) => (
        <img
          key={c.image}
          className="ascene__cloud"
          src={art(c.image)}
          style={{ top: `${c.top}%`, width: `${c.width}%`, animationDuration: `${c.seconds}s`, animationDelay: `${-c.seconds * (0.25 + 0.3 * k)}s` }}
          alt=""
        />
      ))}
      <img className="scene__bg" src={art(l.stages[Math.min(built, l.stages.length - 1)])} alt="" />
      {l.trees.map((t, k) => (
        <img key={t.image} className="ascene__tree" src={art(t.image)} style={{ ...boxStyle(t.box), animationDelay: `${-k * 2.1}s` }} alt="" />
      ))}
    </>
  )
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
  // past the art, above and below: its sky and its ground
  const seam = Math.max(0, Math.min(size.h, top + (width * a.aspect) / 2))

  return (
    <div className={`scene ascene ${className}`} ref={box} style={{ background: `linear-gradient(${a.skyTop} ${seam}px, ${a.ground} ${seam}px)` }}>
      <div className="scene__stage ascene__stage" style={{ width, height: width * a.aspect, aspectRatio: 'auto', transform: `translate(${left}px, ${top}px)` }}>
        <Layers a={a} built={built} />
        {a.life === 'casa' && <CasaLife built={built} />}
        {!a.layers && a.obras.slice(0, built).map((o) => <PieceArt key={o.id} obra={o} />)}
        {cur && <PieceArt obra={a.obras[built]} look={cur} />}
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
