import { useLayoutEffect, useRef, useState } from 'react'
import { PauchoFace } from '../components/Paucho'
import { RoomScene, type PauchoRoomPose } from '../components/RoomScene'
import { Button, CoinPill } from '../components/ui'
import { art } from '../game/content'
import { TRIP } from '../game/journey'
import { FIRST_BED, friendDays, optionArt, priceOf, ROOM_SLOTS, ROOM_TABS, type RoomOption, type RoomTab } from '../game/room'
import { CLOTHES, type Clothes } from '../game/shop'
import { feel, sfx } from '../game/sound'
import { actions, roomLock, southOpen, useGame, type GameState } from '../game/store'

type Tab = RoomTab | 'paucho'

/** A clothes icon until its art arrives: an emoji or a swatch of its colour. */
function ClothesIcon({ c }: { c: Clothes }) {
  if (c.swatch) return <span className="sicon sicon--swatch" style={{ background: c.swatch }} />
  return <span className="sicon">{c.emoji}</span>
}

type Popup = { kind: 'ask' } | { kind: 'thanks' } | { kind: 'locked'; o: RoomOption; why: 'premium' | 'south' | 'friend' | 'dog' }

/** What a room card says at its foot. */
function RoomPrice({ s, o }: { s: GameState; o: RoomOption }) {
  if (s.placed[o.slot] === o.id)
    return (
      <>
        <img src={art('ui_puesto')} alt="" />
        Puesto
      </>
    )
  if (s.room.includes(o.id)) return <>Poner</>
  const lock = roomLock(s, o)
  if (lock === 'south')
    return (
      <>
        <img src={art('ui_viaje')} alt="" />
        Del viaje
      </>
    )
  if (lock === 'friend' && o.source.kind === 'friend')
    return (
      <>
        <img src={art('ui_amistad')} alt="" />
        {friendDays(o.source.level)} días
      </>
    )
  if (lock === 'dog') return <>Con el perro</>
  if (priceOf(o) === 0) return <>¡Es tuyo!</>
  return (
    <>
      <img src={art('ui_herradura')} alt="" />
      {priceOf(o)}
    </>
  )
}

/**
 * Paucho's room, with its shop below (the owner's call: one screen). The room has 16
 * places with three options each; what you buy goes straight to its place, and tapping a
 * thing in the room opens its place in the shop. The first time, a pop-up asks for help and
 * the shop leads to the catre, the first purchase; everything he says is said in pop-ups.
 */
export function Casita() {
  const s = useGame((g) => g)
  const [tab, setTab] = useState<Tab>('cama')
  const [fresh, setFresh] = useState<string | null>(null)
  const [cheer, setCheer] = useState(0)
  const [pose, setPose] = useState<PauchoRoomPose>('parado')
  const [flash, setFlash] = useState<string | null>(null)
  const screen = useRef<HTMLDivElement>(null)
  const cards = useRef<HTMLDivElement>(null)
  const bedCard = useRef<HTMLButtonElement>(null)
  const [spot, setSpot] = useState<DOMRect | null>(null)
  const tutorial = !s.room.includes(FIRST_BED)
  // the first visit opens with his ask; the bed, with his thanks
  const [popup, setPopup] = useState<Popup | null>(tutorial ? { kind: 'ask' } : null)
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

  const celebrate = () => {
    setCheer((c) => c + 1)
    setPose('festeja')
    window.setTimeout(() => setPose('parado'), 2200)
  }

  const pickRoom = (o: RoomOption) => {
    if (s.placed[o.slot] === o.id) {
      sfx('unplace')
      return actions.placeRoom(o.slot, null)
    }
    if (s.room.includes(o.id)) {
      sfx('place')
      return actions.placeRoom(o.slot, o.id)
    }
    const why = roomLock(s, o)
    if (why) {
      feel('locked', 'warning')
      return setPopup({ kind: 'locked', o, why })
    }
    if (!actions.buyRoom(o.id)) return
    feel('buy', 'success')
    sfx('place', 0, 250)
    setFresh(o.id)
    celebrate()
    if (o.id === FIRST_BED) {
      setPopup({ kind: 'thanks' })
      sfx('unlock', 0, 300)
    }
  }
  const buyClothes = (c: Clothes) => {
    if (!actions.buyClothes(c.id)) return
    feel('buy', 'success')
    celebrate()
  }

  // a thing tapped in the room: its place opens in the shop
  const openSlot = (slotId: string) => {
    if (tutorial) return
    const sl = ROOM_SLOTS.find((x) => x.id === slotId)
    if (!sl) return
    setTab(sl.tab)
    setFlash(slotId)
    window.setTimeout(() => {
      const el = cards.current?.querySelector<HTMLElement>(`[data-slot="${slotId}"]`)
      if (el && cards.current) cards.current.scrollTo({ left: el.offsetLeft - 16, behavior: 'smooth' })
    }, 30)
    window.setTimeout(() => setFlash(null), 1400)
  }

  const southLocked = !southOpen(s)
  const slots = ROOM_SLOTS.filter((sl) => sl.tab === tab && (!sl.needsDog || s.dog.arrived))

  return (
    <div className="casita" ref={screen}>
      <RoomScene placed={s.placed} fresh={fresh} pose={tutorial && !popup ? 'senala' : pose} dog={s.dog.arrived} onTap={openSlot}>
        <div className="casita__top">
          <CoinPill coins={s.coins} bump={cheer > 0} key={cheer} />
        </div>
      </RoomScene>

      <section className="shopstrip">
        <div className="shopstrip__tabs" role="tablist">
          {ROOM_TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)} disabled={tutorial && t.id !== 'cama'}>
              <img src={art(t.icon)} alt="" />
              {t.name}
            </button>
          ))}
          <button className={tab === 'paucho' ? 'on' : ''} onClick={() => setTab('paucho')} disabled={tutorial}>
            <PauchoFace outfit={s.outfit} className="shopstrip__face" />
            {s.name}
          </button>
        </div>
        <div className="shopstrip__cards" ref={cards}>
          {tab !== 'paucho' &&
            slots.map((sl) => (
              <div key={sl.id} className={`sgroup${flash === sl.id ? ' sgroup--flash' : ''}`} data-slot={sl.id}>
                <span className="sgroup__name">{sl.name}</span>
                <div className="sgroup__cards">
                  {sl.options.map((o) => {
                    const placed = s.placed[o.slot] === o.id
                    const have = s.room.includes(o.id)
                    const lock = roomLock(s, o)
                    const short = !have && !lock && s.coins < priceOf(o)
                    return (
                      <button
                        key={o.id}
                        ref={o.id === FIRST_BED ? bedCard : undefined}
                        className={`scard${have ? ' scard--have' : ''}${placed ? ' scard--on' : ''}${lock ? ' scard--locked' : ''}${o.source.kind === 'premium' ? ' scard--premium' : ''}`}
                        disabled={short || (tutorial && o.id !== FIRST_BED)}
                        onClick={() => pickRoom(o)}
                      >
                        {o.source.kind === 'premium' && <img className="scard__star" src={art('ui_premium')} alt="Premium" />}
                        <span className={`scard__pic${optionArt(o).startsWith('thumb_') ? ' scard__pic--photo' : ''}`}>
                          <img src={art(optionArt(o))} alt="" />
                          {lock && <img className="scard__lock" src={art('ui_candado')} alt="" />}
                        </span>
                        <b>{o.name}</b>
                        <span className="scard__price">
                          <RoomPrice s={s} o={o} />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
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
                  onClick={() => {
                    if (!have) return buyClothes(c)
                    sfx(wearing ? 'unplace' : 'place')
                    actions.wear(c.slot, wearing ? null : c.id)
                  }}
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
            {popup.kind === 'locked' ? (
              <>
                <span className="unlock__icon">
                  <img src={art(optionArt(popup.o))} alt="" className="unlock__thing" />
                </span>
                <h2>{popup.o.name}</h2>
                <p>
                  {popup.why === 'premium' && 'Es de Gauchito Premium: cuando te suscribas, la vas a poder comprar con tus herraduras.'}
                  {popup.why === 'south' && `Esto lo traigo del viaje al sur ${TRIP.emoji}. ¡Cuando vuelva es tuyo!`}
                  {popup.why === 'friend' &&
                    popup.o.source.kind === 'friend' &&
                    `Te lo doy cuando seamos ${popup.o.source.level}: ${friendDays(popup.o.source.level)} días juntos.`}
                  {popup.why === 'dog' && 'Primero tiene que llegar el perro.'}
                </p>
                <Button variant="gold" onClick={() => setPopup(null)}>
                  Bueno
                </Button>
              </>
            ) : (
              <>
                <span className="unlock__icon">
                  <PauchoFace outfit={s.outfit} className="unlock__face" />
                </span>
                {popup.kind === 'ask' ? (
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
                    <p>Esta noche duermo como un rey 👑. Todo lo que compres en la tienda va directo a la casita. Y si tocás algo del cuarto, lo podés cambiar.</p>
                    <Button variant="gold" onClick={() => setPopup(null)}>
                      ¡De nada!
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
