import { useState, type CSSProperties, type ReactNode } from 'react'
import { art, itemById } from '../game/content'
import { Confetti } from './Confetti'
import { BOX_ASPECT, Guachito, IDLE_HEIGHT_IN_BOX } from './Guachito'

/** Which part of the patio the camera frames. */
export type SceneView = 'home' | 'ranch'

type Props = {
  width: number
  height: number
  view: SceneView
  items: string[]
  highlightId?: string | null
  celebrateKey?: number
  /** Guachito is out on the adventure: the patio waits with the dog asleep. */
  away?: boolean
  onTapGuachito?: () => void
  children?: ReactNode
}

// Everything is placed on the square patio image, in % of its side, so items stay
// on the same spot of the backdrop whatever the screen size. A camera per screen
// decides which part of that square the scene shows.

// Layout follows the reference rancho_completo_unlocked.png (see design/tools/ranch_preview.py).
/** Guachito's height and where his boots touch the patio. */
const HERO = { x: 20.9, y: 71.3, h: 25.1 }
/** The dog, sitting on Guachito's left (height of the sitting pose). */
const DOG = { x: 7.9, y: 72.8, h: 11.3 }
const DOG_ASLEEP = { x: 21, y: 72.5, h: 9 }

/**
 * Camera per screen: zoom, and which patio point (in %) sits where on screen.
 * Home frames Guachito up close; Rancho shows the whole patio.
 */
type Camera = {
  zoom: number
  /** Patio x (%) that lands at screen x (% of the scene width). */
  focusX: number
  screenX: number
  /** Home: Guachito's boots this far from the top (in scene widths). */
  bootsAt?: number
  /** Rancho: patio y (%) at the scene's bottom edge. */
  bottomY?: number
}
const CAMERA: Record<SceneView, Camera> = {
  home: { zoom: 1.6, focusX: HERO.x, screenX: 34, bootsAt: 0.76 },
  ranch: { zoom: 1.04, focusX: 50, screenX: 50, bottomY: 92 },
}

/** Bottom-centre anchored placement on the patio square. */
const place = (x: number, y: number, h: number): CSSProperties => ({
  left: `${x}%`,
  bottom: `${100 - y}%`,
  height: `${h}%`,
  zIndex: Math.round(y),
})

// Box sizes of the web poses: the idle fills 89.5% of its box height; the sitting
// dog fills 87.5% of a 720 x 630 box.
const HERO_BOX_H = HERO.h / IDLE_HEIGHT_IN_BOX
const DOG_BOX_ASPECT = 720 / 630
const DOG_FILL = 0.875

/** Stage transform (px) for a camera, given the scene's size. */
function cameraStyle(view: SceneView, width: number, height: number): CSSProperties {
  const { zoom, focusX, screenX, bootsAt, bottomY = 100 } = CAMERA[view]
  const side = width * zoom
  // horizontal: focus point under screenX, but never show past the patio's edges
  const left = Math.min(0, Math.max(width - side, (screenX / 100) * width - (focusX / 100) * side))
  const top = bootsAt != null ? bootsAt * width - (HERO.y / 100) * side : height - (bottomY / 100) * side
  return { width: side, transform: `translate(${left}px, ${Math.min(0, top)}px)` }
}

/** The estancia patio: the artist's patio backdrop, ranch items, Guachito and the dog. */
export function Scene({ width, height, view, items, highlightId, celebrateKey = 0, away, onTapGuachito, children }: Props) {
  const [frame, setFrame] = useState('idle')
  const [burst, setBurst] = useState(0)
  const onFrame = (f: string) => {
    setFrame(f)
    if (f === 'celebrate') setBurst((b) => b + 1)
  }
  const partying = ['celebrate', 'jump', 'land', 'rive-party'].includes(frame)
  const dog = away ? 'dog_sleep' : partying ? 'dog_happy' : 'dog_sit'
  const dogSpot = away ? DOG_ASLEEP : DOG
  const dogBoxH = dogSpot.h / DOG_FILL

  return (
    <div className="scene" style={{ height }}>
      <div className="scene__stage" style={cameraStyle(view, width, height)}>
        <img className="scene__bg" src={art('bg_patio')} alt="" />

        {items.map((id) => {
          const item = itemById(id)
          const spot = item.needs && !items.includes(item.needs) && item.alt ? item.alt : item.spot
          const style = place(spot.x, spot.y, spot.h)
          if (spot.w) style.width = `${spot.w}%`
          if (spot.z != null) style.zIndex = spot.z
          return (
            <img
              key={id}
              className={`scene__item${spot.w ? ' scene__item--flat' : ''}${id === highlightId ? ' scene__item--new' : ''}`}
              src={art(item.image)}
              style={style}
              alt={item.name}
            />
          )
        })}

        <div
          className={`scene__dog${partying ? ' scene__dog--hop' : ''}`}
          style={{ ...place(dogSpot.x, dogSpot.y, dogBoxH), aspectRatio: DOG_BOX_ASPECT }}
        >
          <img src={art(dog)} alt="" />
        </div>

        {!away && (
          <div className="scene__guachito" style={{ ...place(HERO.x, HERO.y + 0.2, HERO_BOX_H), aspectRatio: BOX_ASPECT }}>
            <Guachito width="100%" celebrateKey={celebrateKey} onFrame={onFrame} onTap={onTapGuachito} />
            <div className="scene__confetti">
              <Confetti burstKey={burst} />
            </div>
          </div>
        )}
      </div>

      {children}
    </div>
  )
}
