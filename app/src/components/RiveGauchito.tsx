import { useEffect, useRef, useState } from 'react'
import { Alignment, EventType, Fit, Layout, useRive } from '@rive-app/react-canvas'

// Contract with public/rive/guachito.riv (see design/rive/README.md):
//   artboard "Guachito" (ARTBOARD_W x ARTBOARD_H): the 906 x 990 pose box sits at its
//   bottom (boots 7.5 px above the bottom edge), the space above is for the jump.
//   Linear animations: "idle" (loop), "habit_completed", "celebrate", "return_to_idle".
// The file also has a "Guachito" state machine driven by view-model triggers, but
// free-plan exports drop view models, so the app plays the animations by name.
const ARTBOARD = 'Guachito' // artboard name inside the .riv (old spelling)
const ARTBOARD_W = 906
const ARTBOARD_H = 1210

let rivBuffer: ArrayBuffer | null = null
const rivReady: Promise<boolean> = fetch(`${import.meta.env.BASE_URL}rive/guachito.riv`)
  .then(async (r) => {
    if (!r.ok) return false
    const buf = await r.arrayBuffer()
    // Dev servers answer missing files with index.html; a real .riv starts with "RIVE".
    const magic = new TextDecoder().decode(new Uint8Array(buf, 0, 4))
    if (magic !== 'RIVE') return false
    rivBuffer = buf
    return true
  })
  .catch(() => false)

export function useRiveAvailable() {
  const [ok, setOk] = useState(rivBuffer != null)
  useEffect(() => {
    let alive = true
    rivReady.then((v) => alive && setOk(v))
    return () => {
      alive = false
    }
  }, [])
  return ok
}

type Props = {
  celebrateKey?: number
  onFrame?: (frame: string) => void
  width: number | string
  onTap?: () => void
}

/** What plays after each one-shot animation ends. */
const NEXT: Record<string, string> = {
  habit_completed: 'return_to_idle',
  celebrate: 'return_to_idle',
  return_to_idle: 'idle',
}

export function RiveGauchito({ celebrateKey = 0, onFrame, width, onTap }: Props) {
  const { rive, RiveComponent } = useRive({
    buffer: rivBuffer ?? undefined,
    artboard: ARTBOARD,
    animations: 'idle',
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
  })
  const lastKey = useRef(celebrateKey)

  // Chain the one-shots back to the idle loop.
  useEffect(() => {
    if (!rive) return
    const onStop = (e: { data?: unknown }) => {
      const names = Array.isArray(e.data) ? (e.data as string[]) : []
      const next = names.map((n) => NEXT[n]).find(Boolean)
      if (next) rive.play(next)
    }
    rive.on(EventType.Stop, onStop)
    return () => rive.off(EventType.Stop, onStop)
  }, [rive])

  useEffect(() => {
    // Only react to real changes (StrictMode re-runs effects on mount).
    if (celebrateKey === lastKey.current || !rive) return
    lastKey.current = celebrateKey
    rive.stop(['idle', 'return_to_idle', 'celebrate'])
    rive.play('habit_completed')
    // The .riv draws its own confetti; tell the scene only so the dog can join in.
    const t1 = window.setTimeout(() => onFrame?.('rive-party'), 200)
    const t2 = window.setTimeout(() => onFrame?.('idle'), 1600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrateKey, rive])

  // The box keeps the pose-box footprint in layout (same as the stills); the taller
  // canvas overflows upward for the jump.
  return (
    <div className="guachito guachito--rive" style={{ width }} onClick={onTap}>
      <div className="guachito__rive" style={{ aspectRatio: `${ARTBOARD_W} / ${ARTBOARD_H}` }}>
        <RiveComponent />
      </div>
    </div>
  )
}
