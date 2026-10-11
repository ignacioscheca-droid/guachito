import { useLayoutEffect, useRef, useState } from 'react'
import { PauchoFace } from '../components/Paucho'
import { Room, RoomThing } from '../components/Room'
import { Button, CoinPill } from '../components/ui'
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
 * Paucho's room, with its shop below (the owner's call: one screen). Whatever you buy
 * goes straight to its place in the room. The first time, a pop-up asks for help and the
 * shop leads to the bed, the first purchase; everything he says is said in pop-ups.
 */
export function Casita() {
  const s = useGame((g) => g)
  const [tab, setTab] = useState<Tab>('pieza')
  const [fresh, setFresh] = useState<string | null>(null)
  const [cheer, setCheer] = useState(0)
  const screen = useRef<HTMLDivElement>(null)
  const bedCard = useRef<HTMLButtonElement>(null)
  const [spot, setSpot] = useState<DOMRect | null>(null)
  const tutorial = !s.room.includes('cama')
  // the first visit opens with his ask; the bed, with his thanks
  const [popup, setPopup] = useState<'ask' | 'thanks' | null>(tutorial ? 'ask' : null)
  const you = s.playerName ? `, ${s.playerName}` : ''

  // The first visit: everything waits for the bed.
  useLayoutEffect(() => {
    if (!tutorial || popup) return setSpot(null)
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
  }, [tutorial, tab, popup])

  const buyThing = (id: string) => {
    const item = ROOM_ITEMS.find((i) => i.id === id)!
    if (!actions.buyRoomItem(id)) return
    setFresh(id)
    setCheer((c) => c + 1)
    if (item.id === 'cama') setPopup('thanks')
  }
  const buyClothes = (c: Clothes) => {
    if (!actions.buyClothes(c.id)) return
    setCheer((k) => k + 1)
  }

  const southLocked = !southOpen(s)

  return (
    <div className="casita" ref={screen}>
      <Room items={s.room} fresh={fresh} pose={tutorial ? 'wave' : 'idle'} outfit={s.outfit} celebrateKey={cheer}>
        <div className="casita__top">
          <CoinPill coins={s.coins} bump={cheer > 0} key={cheer} />
        </div>
      </Room>

      <section className="shopstrip">
        <header>
          <strong>Tienda</strong>
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
                  className={`scard${have ? ' scard--have' : ''}`}
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
          <span className="thand" style={{ left: spot.x + spot.width - 30, top: spot.y + spot.height - 58 }}>
            👆
          </span>
        </>
      )}

      {popup && (
        <div className="overlay unlock">
          <div className="modal unlock__box">
            <span className="unlock__icon">
              <PauchoFace outfit={s.outfit} className="unlock__face" />
            </span>
            {popup === 'ask' ? (
              <>
                <h2>¿Me ayudás a armarla?</h2>
                <p>Arranquemos por una cama. Está en la tienda y la pagás con las {s.coins} herraduras que ganaste con tus hábitos.</p>
                <Button variant="gold" onClick={() => setPopup(null)}>
                  ¡Dale!
                </Button>
              </>
            ) : (
              <>
                <h2>¡Gracias{you}!</h2>
                <p>Esta noche duermo como un rey 👑. Todo lo que compres en la tienda va directo a la casita.</p>
                <Button variant="gold" onClick={() => setPopup(null)}>
                  ¡De nada!
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
