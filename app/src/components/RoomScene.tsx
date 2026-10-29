import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { art } from '../game/content'
import { roomOption } from '../game/room'
import { ROOM_BOXES, SPRITE_PX } from '../game/roomArt'

// Paucho's room in layers: the empty room (ChatGPT's cuarto_vacio) and, in each place, the
// cut-out of the option there (design/tools/import_room.py). Paucho, the dog and Michi are
// loose sprites with their eyes-closed twins for blinking. The art is 1024 × 1536; only its
// top shows, as much as the shop leaves room for.

const AW = 1024
const AH = 1536

type Box = [number, number, number, number]

/** A sprite placed by its bottom centre: x %, bottom %, height % (of the art's height). */
type Foot = { x: number; bottom: number; h: number }

const PAUCHO: Foot = { x: 51, bottom: 71, h: 21.5 }
const DOG: Foot = { x: 33, bottom: 75, h: 7.8 }
const MICHI: Foot = { x: 48.8, bottom: 27.7, h: 6.6 }
const MICHI_ASLEEP: Foot = { x: 49, bottom: 27.9, h: 4.6 }
/** Where what is on the table stands, on each table: x %, bottom %. */
const TABLE_TOP: Record<number, [number, number]> = { 1: [82, 35.6], 2: [82, 38.2], 3: [84, 38.6] }
const TOP_H: Record<number, number> = { 1: 6.2, 2: 4.2, 3: 4.3 }
/** The pendulum hangs in the case of reloj_3: pivot x %, y %, length %. */
const PENDULUM = { x: 77.2, y: 13.4, h: 3.9 }
/** The gramophone's horn (estante_3) and the candle's flame (ventana_bajo_1). */
const HORN = { x: 23.5, y: 6 }
const CANDLE = { x: 51, y: 31.6 }

function boxStyle([l, t, w, h]: Box, z: number): CSSProperties {
  return { left: `${l}%`, top: `${(t / 100) * (AH / AW) * 100}cqw`, width: `${w}%`, zIndex: z, aspectRatio: `${w * AW} / ${h * AH}` }
}

function footStyle(f: Foot, aspect: number, z: number): CSSProperties {
  const hCqw = (f.h / 100) * (AH / AW) * 100
  return {
    left: `calc(${f.x}% - ${(hCqw * aspect) / 2}cqw)`,
    top: `${((f.bottom - f.h) / 100) * (AH / AW) * 100}cqw`,
    height: `${hCqw}cqw`,
    zIndex: z,
  }
}

const at = (x: number, y: number): CSSProperties => ({ left: `${x}%`, top: `${(y / 100) * (AH / AW) * 100}cqw` })

/** z for floor things: the nearer (lower) the bottom, the later it is drawn. */
const zOf = (bottom: number) => Math.round(bottom * 10)

const aspectOf = (name: string) => {
  const [w, h] = SPRITE_PX[name]
  return w / h
}

/** A sprite and its eyes-closed twin, blinking now and then. */
function Blinker({ name, style, className = '', delay = 0, onClick }: { name: string; style: CSSProperties; className?: string; delay?: number; onClick?: () => void }) {
  return (
    <span className={`rblink ${className}`} style={{ ...style, aspectRatio: aspectOf(name) }} onClick={onClick}>
      <img src={art(name)} alt="" />
      <img className="rblink__shut" src={art(`${name}_ojos`)} alt="" style={{ animationDelay: `${delay}s` }} />
    </span>
  )
}

export type PauchoRoomPose = 'parado' | 'festeja' | 'senala'

type Props = {
  placed: Record<string, string>
  /** The option just bought, to make it arrive. */
  fresh?: string | null
  pose: PauchoRoomPose
  dog: boolean
  onTap?: (slot: string) => void
  /** What Paucho says from the room: a bubble over his head, with its button if it has one. */
  say?: string | null
  sayAction?: ReactNode
  /** Tapping a bubble with no button sends it away. */
  onSayTap?: () => void
  children?: ReactNode
}

export function RoomScene({ placed, fresh, pose, dog, onTap, say, sayAction, onSayTap, children }: Props) {
  // tapping a thing makes it jump (and the mecedora rock)
  const [tapped, setTapped] = useState<{ slot: string; n: number } | null>(null)
  const tap = (slot: string) => {
    setTapped((t) => ({ slot, n: (t?.n ?? 0) + 1 }))
    onTap?.(slot)
  }

  // Michi naps: awake a while, asleep a while; a tap wakes him
  const [michiAsleep, setMichiAsleep] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setMichiAsleep((a) => !a), michiAsleep ? 22_000 : 14_000)
    return () => clearTimeout(t)
  }, [michiAsleep])
  // the dog dozes off now and then
  const [dogAsleep, setDogAsleep] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setDogAsleep((a) => !a), dogAsleep ? 16_000 : 26_000)
    return () => clearTimeout(t)
  }, [dogAsleep])

  const pieces = Object.entries(placed)
    .map(([slot, id]) => ({ slot, id, o: roomOption(id) }))
    .filter((p) => p.o && p.slot !== 'mesa_top' && p.id !== 'alfeizar_3' && ROOM_BOXES[p.id])

  const table = placed.mesa ? roomOption(placed.mesa)!.k : 0
  const top = placed.mesa_top && table ? roomOption(placed.mesa_top)! : null
  const michi = placed.alfeizar === 'alfeizar_3'
  const paucho = `paucho_room_${pose}`
  const jump = (slot: string) => (tapped?.slot === slot ? ` rpiece--tap${tapped.n % 2}` : '')

  return (
    <div className="rscene">
      <div className="rscene__stage">
        <img className="rscene__base" src={art('room_base')} alt="" />

        {pieces.map(({ slot, id }) => {
          const b = ROOM_BOXES[id]
          const wall = ['estante', 'pared', 'reloj', 'cuadro', 'perchero', 'cortinas', 'alfeizar'].includes(slot)
          // rugs lie flat: everything stands on them
          const z = slot === 'alfombra' ? 2 : wall ? 5 : zOf(b[1] + b[3])
          return (
            <button
              key={slot}
              className={`rpiece rpiece--${slot} rpiece--${id}${fresh === id ? ' rpiece--fresh' : ''}${jump(slot)}`}
              style={boxStyle(b, z)}
              onClick={() => tap(slot)}
              aria-label={roomOption(id)?.name}
            >
              <img src={art(`room_${id}`)} alt="" />
            </button>
          )
        })}

        {top && (
          <button
            className={`rpiece rpiece--top${fresh === top.id ? ' rpiece--fresh' : ''}${jump('mesa_top')}`}
            style={footStyle({ x: TABLE_TOP[table][0], bottom: TABLE_TOP[table][1], h: TOP_H[top.k] }, aspectOf(`room_top_${['mate', 'cartas', 'libreta'][top.k - 1]}`), zOf(ROOM_BOXES[placed.mesa][1] + ROOM_BOXES[placed.mesa][3]) + 1)}
            onClick={() => tap('mesa_top')}
            aria-label={top.name}
          >
            <img src={art(`room_top_${['mate', 'cartas', 'libreta'][top.k - 1]}`)} alt="" />
            {top.k === 1 && (
              <span className="rsteam" aria-hidden>
                <i />
                <i />
              </span>
            )}
          </button>
        )}

        {placed.reloj === 'reloj_3' && (
          <img
            className="rpendulum"
            src={art('room_pendulo')}
            alt=""
            style={{ ...at(PENDULUM.x, PENDULUM.y), height: `${(PENDULUM.h / 100) * (AH / AW) * 100}cqw`, aspectRatio: aspectOf('room_pendulo') }}
          />
        )}
        {placed.estante === 'estante_3' && (
          <span className="rnotes" style={at(HORN.x, HORN.y)} aria-hidden>
            {[1, 2, 3].map((n) => (
              <img key={n} src={art(`room_nota_${n}`)} alt="" />
            ))}
          </span>
        )}
        {placed.ventana_bajo === 'ventana_bajo_1' && <i className="rflame" style={at(CANDLE.x, CANDLE.y)} aria-hidden />}

        {michi &&
          (michiAsleep ? (
            <img
              className={`rmichi rmichi--asleep${fresh === 'alfeizar_3' ? ' rpiece--fresh' : ''}`}
              src={art('michi_duerme')}
              alt="Michi"
              style={footStyle(MICHI_ASLEEP, aspectOf('michi_duerme'), 6)}
              onClick={() => {
                setMichiAsleep(false)
                tap('alfeizar')
              }}
            />
          ) : (
            <Blinker
              name="michi_sentado"
              className={`rmichi${fresh === 'alfeizar_3' ? ' rpiece--fresh' : ''}${jump('alfeizar')}`}
              style={footStyle(MICHI, aspectOf('michi_sentado'), 6)}
              delay={1.3}
              onClick={() => tap('alfeizar')}
            />
          ))}

        {dog &&
          (dogAsleep ? (
            <img className="rdog rdog--asleep" src={art('perro_room_duerme')} alt="" style={footStyle({ ...DOG, h: DOG.h * 0.8 }, aspectOf('perro_room_duerme'), zOf(DOG.bottom))} />
          ) : (
            <span className="rdog" style={{ ...footStyle(DOG, aspectOf('perro_room_a'), zOf(DOG.bottom)), aspectRatio: aspectOf('perro_room_a') }}>
              <Blinker name="perro_room_a" style={{ position: 'absolute', inset: 0 }} delay={2.1} />
              <Blinker name="perro_room_b" className="rdog__wag" style={{ position: 'absolute', inset: 0 }} delay={2.1} />
            </span>
          ))}

        <Blinker key={pose} name={paucho} className={`rpaucho rpaucho--${pose}`} style={footStyle(PAUCHO, aspectOf(paucho), zOf(PAUCHO.bottom))} />

        {say && (
          <span
            key={say}
            className={`rscene__say${onSayTap ? ' rscene__say--tap' : ''}`}
            style={{ left: `${PAUCHO.x}%`, top: `${((PAUCHO.bottom - PAUCHO.h) / 100) * (AH / AW) * 100}cqw` }}
            onClick={onSayTap}
          >
            {say}
            {sayAction}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
