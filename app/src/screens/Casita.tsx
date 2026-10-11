import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Room, RoomThing } from '../components/Room'
import { CoinPill } from '../components/ui'
import { art } from '../game/content'
import { TRIP } from '../game/journey'
import { CLOTHES, ROOM_ITEMS, type Clothes } from '../game/shop'
import { actions, southOpen, useGame } from '../game/store'

type Tab = 'pieza' | 'paucho'

/** A clothes icon until its art arrives: an emoji or a swatch of its colour. */
function ClothesIcon({ c }: { c: Clothes }) {
  if (c.swatch) return <span className="sicon sicon--swatch" style={{ background: c.swatch }} />
  return <span className="sicon">{c.emoji}</span>
}

/**
 * Paucho's room, with its shop below (the owner's call: one screen). The first time,
 * he asks for help setting it up and the shop leads to the bed, the first purchase.
 */
export function Casita() {
  const s = useGame((g) => g)
  const [tab, setTab] = useState<Tab>('pieza')
  const [fresh, setFresh] = useState<string | null>(null)
  const [cheer, setCheer] = useState(0)
  const [say, setSay] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const screen = useRef<HTMLDivElement>(null)
  const bedCard = useRef<HTMLButtonElement>(null)
  const [spot, setSpot] = useState<DOMRect | null>(null)
  const tutorial = !s.room.includes('cama')
  const you = s.playerName ? `, ${s.playerName}` : ''

  // The first visit: everything waits for the bed.
  useLayoutEffect(() => {
    if (!tutorial) return setSpot(null)
    const place = () => {
      const a = bedCard.current?.getBoundingClientRect()
      const b = screen.current?.getBoundingClientRect()
      if (a && b) setSpot(new DOMRect(a.left - b.left, a.top - b.top, a.width, a.height))
    }
    place()
    const t = window.setTimeout(place, 300)
    window.addEventListener('resize', place)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', place)
    }
  }, [tutorial, tab])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])
  useEffect(() => {
    if (!say) return
    const t = window.setTimeout(() => setSay(null), 3600)
    return () => clearTimeout(t)
  }, [say])

  const buyThing = (id: string) => {
    const item = ROOM_ITEMS.find((i) => i.id === id)!
    if (!actions.buyRoomItem(id)) return
    setFresh(id)
    setCheer((c) => c + 1)
    setToast(`−${item.price} herraduras`)
    setSay(id === 'cama' ? `¡Gracias${you}! Esta noche duermo como un rey 👑` : '¡Me encanta cómo va quedando!')
  }
  const buyClothes = (c: Clothes) => {
    if (!actions.buyClothes(c.id)) return
    setCheer((k) => k + 1)
    setToast(`−${c.price} herraduras`)
    setSay('¿Cómo me queda? ¡Me siento un señor!')
  }

  const showInShop = (id: string) => {
    setTab('pieza')
    setFlash(id)
    window.setTimeout(() => setFlash(null), 1200)
    document.getElementById(`shop-${id}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  const southLocked = !southOpen(s)
  const bubble = tutorial ? '¿Me ayudás a armarla? Arranquemos por una cama.' : say

  return (
    <div className="casita" ref={screen}>
      <Room
        items={s.room}
        slots={tutorial ? [] : ROOM_ITEMS.map((i) => i.id).filter((id) => !s.room.includes(id))}
        onSlot={showInShop}
        fresh={fresh}
        pose={tutorial ? 'wave' : 'idle'}
        outfit={s.outfit}
        celebrateKey={cheer}
      >
        <div className="casita__top">
          <h1>La casita de {s.name}</h1>
          <CoinPill coins={s.coins} />
        </div>
        {bubble && <p className={`casita__say${tutorial ? ' casita__say--up' : ''}`}>{bubble}</p>}
        {toast && <div className="casita__toast">{toast}</div>}
      </Room>

      <section className="shopstrip">
        <header>
          <strong>Tienda</strong>
          <span>Las herraduras se ganan con los hábitos de más</span>
        </header>
        <div className="shopstrip__tabs" role="tablist">
          <button className={tab === 'pieza' ? 'on' : ''} onClick={() => setTab('pieza')} disabled={tutorial}>
            Para la pieza
          </button>
          <button className={tab === 'paucho' ? 'on' : ''} onClick={() => setTab('paucho')} disabled={tutorial}>
            Para {s.name}
          </button>
        </div>
        <div className="shopstrip__cards">
          {tab === 'pieza' &&
            ROOM_ITEMS.map((item) => {
              const have = s.room.includes(item.id)
              const off = !have && (s.coins < item.price || (tutorial && item.id !== 'cama'))
              return (
                <button
                  key={item.id}
                  id={`shop-${item.id}`}
                  ref={item.id === 'cama' ? bedCard : undefined}
                  className={`scard${have ? ' scard--have' : ''}${flash === item.id ? ' scard--flash' : ''}`}
                  disabled={have || off}
                  onClick={() => buyThing(item.id)}
                >
                  <span className="scard__pic">
                    <RoomThing id={item.id} />
                  </span>
                  <b>{item.name}</b>
                  <span className="scard__price">
                    {have ? (
                      'En la pieza'
                    ) : (
                      <>
                        <img src={art('ui_herradura')} alt="" />
                        {item.price}
                      </>
                    )}
                  </span>
                </button>
              )
            })}
          {tab === 'paucho' &&
            CLOTHES.map((c) => {
              const have = s.clothes.includes(c.id)
              const wearing = s.outfit[c.slot] === c.id
              const locked = c.south && southLocked
              return (
                <button
                  key={c.id}
                  className={`scard${have ? ' scard--have' : ''}${wearing ? ' scard--on' : ''}`}
                  disabled={!have && (locked || s.coins < c.price)}
                  onClick={() => (have ? actions.wear(c.slot, wearing ? null : c.id) : buyClothes(c))}
                >
                  <span className="scard__pic">
                    <ClothesIcon c={c} />
                  </span>
                  <b>{c.name}</b>
                  <span className="scard__price">
                    {locked ? (
                      `${TRIP.emoji} Del viaje`
                    ) : have ? (
                      wearing ? 'Puesto' : 'Ponérselo'
                    ) : (
                      <>
                        <img src={art('ui_herradura')} alt="" />
                        {c.price}
                      </>
                    )}
                  </span>
                </button>
              )
            })}
        </div>
      </section>

      {tutorial && spot && (
        <>
          <div className="tspot" style={{ left: spot.x - 5, top: spot.y - 5, width: spot.width + 10, height: spot.height + 10 }} />
          <div className="ttip" style={{ left: Math.max(12, spot.x), top: spot.y - 92 }}>
            Tocá la cama para comprarla
            <small>Tenés {s.coins} herraduras: las ganaste con tus hábitos</small>
          </div>
          <span className="thand" style={{ left: spot.x + spot.width - 30, top: spot.y + spot.height - 58 }}>
            👆
          </span>
        </>
      )}
    </div>
  )
}
