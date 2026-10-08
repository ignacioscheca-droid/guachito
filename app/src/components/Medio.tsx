import { useEffect, useState } from 'react'
import { art } from '../game/content'

// The mate scene's plano medio (mate_b*.webp, from design/tools/import_mate_scene.py).

/** Plano medio poses; the ones in BLINKS also have a `_parpadeo` variant. */
export const MEDIO = ['b1_saluda', 'b2_habla', 'b3_escucha', 'b4_contento', 'b5_ofrece', 'b6_toma', 'b7_mas_para_mi', 'b8_curioso']
export const BLINKS = new Set(['b2_habla', 'b3_escucha'])

/** Gauchito in plano medio: the mouth moves while he talks and he blinks now and then. */
export function Medio({ pose, talking }: { pose: string; talking: boolean }) {
  const [open, setOpen] = useState(false)
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    if (!talking) {
      setOpen(false)
      return
    }
    const id = window.setInterval(() => setOpen((o) => !o), 140)
    return () => clearInterval(id)
  }, [talking])

  useEffect(() => {
    if (!BLINKS.has(pose)) return
    let t = 0
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true)
        window.setTimeout(() => setBlink(false), 150)
        loop()
      }, 2200 + Math.random() * 1800)
    }
    loop()
    return () => clearTimeout(t)
  }, [pose])

  const variants = ['cerrada', 'abierta', ...(BLINKS.has(pose) ? ['parpadeo'] : [])]
  const variant = open ? 'abierta' : blink && BLINKS.has(pose) ? 'parpadeo' : 'cerrada'
  // All variants stacked: switching is only visibility, so nothing flickers while decoding.
  return (
    <div className="mi-medio" key={pose}>
      {variants.map((v) => (
        <img key={v} src={art(`mate_${pose}_${v}`)} alt="" style={{ opacity: v === variant ? 1 : 0 }} draggable={false} />
      ))}
    </div>
  )
}
