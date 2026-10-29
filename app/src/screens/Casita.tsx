import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PauchoFace } from '../components/Paucho'
import { RoomScene, type PauchoRoomPose } from '../components/RoomScene'
import { Button, CoinPill } from '../components/ui'
import { art } from '../game/content'
import { daysTogether } from '../game/friendship'
import { AREA_COINS, EXTRA_HABIT_COINS, TRIP, TRIP_JOB } from '../game/journey'
import { FIRST_BED, friendDays, optionArt, priceOf, roomOption, ROOM_SLOTS, ROOM_TABS, type RoomOption, type RoomTab } from '../game/room'
import { CLOTHES, type Clothes } from '../game/shop'
import { feel, sfx } from '../game/sound'
import { actions, roomLock, southOpen, TERMO_PRICE, TERMOS_MAX, useGame, type GameState } from '../game/store'

type Tab = RoomTab | 'paucho'

/** A clothes icon until its art arrives: an emoji or a swatch of its colour. */
function ClothesIcon({ c }: { c: Clothes }) {
  if (c.swatch) return <span className="sicon sicon--swatch" style={{ background: c.swatch }} />
  return <span className="sicon">{c.emoji}</span>
}

/** What Paucho says from the room: a bubble over his head. `then` is what he says once this one is done. */
type Say = { text: string; pose?: PauchoRoomPose; ttl?: number; action?: { label: string; onClick: () => void }; then?: Say | null }

/** Three ways to say it, so it doesn't sound like a machine. */
let turn = 0
const pick = (xs: string[]) => xs[turn++ % xs.length]

/** Where herraduras come from, as he tells it. */
const earnTip = () =>
  pick([
    `Con la barra llena, cada hábito de más suma +${EXTRA_HABIT_COINS}. Y al terminar una obra, ¡más!`,
    `Seguí con tus hábitos: pasada la barra llena, cada uno da +${EXTRA_HABIT_COINS}. Una obra terminada trae ${AREA_COINS}.`,
    `Con la barra llena, cada hábito de más da +${EXTRA_HABIT_COINS}. ¡Y cuando terminemos una obra, llegan más!`,
  ])

/** Why a locked thing isn't his yet, and how far away it is. */
function lockSay(s: GameState, o: RoomOption, why: 'premium' | 'south' | 'friend' | 'dog'): string {
  if (why === 'premium') return 'Esa es de Gauchito Premium: cuando te suscribas, la comprás con tus herraduras.'
  if (why === 'south') return southSay(s)
  if (why === 'dog') return 'Primero tiene que llegar el perro, y ahí le armamos su rincón.'
  if (o.source.kind !== 'friend') return ''
  const left = friendDays(o.source.level) - daysTogether(s.completions)
  return `Te lo doy cuando seamos ${o.source.level}, en ${left === 1 ? 'un día' : `${left} días`} de venir a verme. ¡Vos seguí así!`
}

function southSay(s: GameState) {
  const left = TRIP_JOB - s.jobsDone
  return left > 0
    ? `Eso llega con el viaje al sur ${TRIP.emoji}, después de ${left === 1 ? 'una obra más' : `${left} obras más`}.`
    : `Eso llega con el viaje al sur ${TRIP.emoji}: ya lo estoy preparando. ¡Cuando vuelva es tuyo!`
}

/** The cheapest thing he could still buy, wherever it is: a room option or clothes. */
type Want = { name: string; price: number; tab: Tab; id: string }
function cheapestWant(s: GameState): Want | null {
  const room: Want[] = ROOM_SLOTS.flatMap((sl) => sl.options)
    .filter((o) => !s.room.includes(o.id) && !roomLock(s, o) && priceOf(o) > 0)
    .map((o) => ({ name: o.name, price: priceOf(o), tab: ROOM_SLOTS.find((x) => x.id === o.slot)!.tab, id: o.id }))
  const clothes: Want[] = CLOTHES.filter((c) => !s.clothes.includes(c.id) && !(c.south && !southOpen(s))).map((c) => ({ name: c.name, price: c.price, tab: 'paucho', id: c.id }))
  return [...room, ...clothes].sort((x, y) => x.price - y.price)[0] ?? null
}

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
        en {friendDays(o.source.level) - daysTogether(s.completions)} {friendDays(o.source.level) - daysTogether(s.completions) === 1 ? 'día' : 'días'}
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
 * thing in the room opens its place in the shop. Everything he has to say, he says from the
 * room in a bubble over his head: the ask the first time, the thanks for the bed, what a
 * locked thing waits for, how many herraduras you're short. With none, the shop leads to the
 * cheapest thing and he tells you how to earn them.
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
  const you = s.playerName ? `, ${s.playerName}` : ''
  // the first visit opens with his ask (the shop waits); then he points at the bed
  const [asked, setAsked] = useState(false)
  const [say, setSay] = useState<Say | null>(null)
  const want = cheapestWant(s)
  const broke = !tutorial && !!want && s.coins < want.price
  const nudged = useRef(false)

  const speak = (next: Say | null) => setSay(next)
  const nudge = (w: Want): Say => ({ text: `${w.name}: te faltan ${w.price - s.coins}${you}. ${earnTip()}`, pose: 'senala', ttl: 10_000 })

  // a bubble with a time to live goes away by itself (and gives way to its `then`)
  useEffect(() => {
    if (!say?.ttl) return
    const t = window.setTimeout(() => setSay(say.then ?? null), say.ttl)
    return () => clearTimeout(t)
  }, [say])

  // the first visit: everything waits for the bed
  useLayoutEffect(() => {
    if (!tutorial || !asked) return setSpot(null)
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
  }, [tutorial, asked, tab])

  // with nothing he can pay for, the shop opens where the cheapest thing is, and he says so
  useEffect(() => {
    if (!broke || !want || nudged.current || say) return
    nudged.current = true
    setTab(want.tab)
    setSay(nudge(want))
    window.setTimeout(() => {
      const el = cards.current?.querySelector<HTMLElement>(`[data-want="${want.id}"]`)
      if (el && cards.current) cards.current.scrollTo({ left: el.offsetLeft - 16, behavior: 'smooth' })
    }, 60)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broke, want?.id, say])

  const celebrate = () => {
    setCheer((c) => c + 1)
    setPose('festeja')
    window.setTimeout(() => setPose('parado'), 2200)
  }

  const short = (name: string, price: number): Say => ({ text: `${name}: te faltan ${price - s.coins} herraduras. ${earnTip()}`, pose: 'senala', ttl: 9000 })

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
      return speak({ text: lockSay(s, o, why), pose: 'senala', ttl: 8000 })
    }
    if (s.coins < priceOf(o)) {
      feel('locked', 'warning')
      return speak(short(o.name, priceOf(o)))
    }
    if (!actions.buyRoom(o.id)) return
    feel('buy', 'success')
    sfx('place', 0, 250)
    setFresh(o.id)
    celebrate()
    if (o.id === FIRST_BED) {
      sfx('unlock', 0, 300)
      return speak({ text: `¡Gracias${you}! Esta noche duermo como un rey. Tocá cualquier cosa del cuarto para cambiarla.`, ttl: 7000 })
    }
    speak({ text: pick([`¡Qué lindo quedó${you}!`, `¡Mirá eso${you}! Me encanta.`, `¡Gracias${you}! Ahora sí parece mi casa.`]), ttl: 3200 })
  }
  // a termo keeps a missed day in the streak; he holds up to TERMOS_MAX
  const buyTermo = () => {
    if (s.termos >= TERMOS_MAX) {
      feel('locked', 'warning')
      return speak({ text: `Ya tengo ${TERMOS_MAX} termos llenos${you}: con eso cubrimos ${TERMOS_MAX} días. ¡Más no me entran en la alforja!`, ttl: 6000 })
    }
    if (s.coins < TERMO_PRICE) {
      feel('locked', 'warning')
      return speak(short('El termo', TERMO_PRICE))
    }
    if (!actions.buyTermo()) return
    feel('buy', 'success')
    celebrate()
    speak({ text: `¡Termo lleno${you}! Si un día no podés venir, con esto no se nos enfría el mate.`, ttl: 5000 })
  }
  const buyClothes = (c: Clothes) => {
    if (!actions.buyClothes(c.id)) return
    feel('buy', 'success')
    celebrate()
    speak({ text: pick([`¡Qué facha${you}!`, '¡Me queda bárbaro!', `¡Mirá cómo me queda${you}!`]), ttl: 3200 })
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

  // what he says now: the first visit's ask, then pointing at the bed, or whatever he's saying
  const ask = tutorial && !asked
  const bedPrice = priceOf(roomOption(FIRST_BED)!)
  const bubble: Say | null = ask
    ? { text: `¡Mi casita${you}! Gracias a vos tengo techo… pero no tengo dónde dormir. ¿Me ayudás a armarla?`, action: { label: '¡Dale!', onClick: () => setAsked(true) } }
    : tutorial && !say
      ? { text: s.coins >= bedPrice ? `Arranquemos por la cama. ¡Con tus ${s.coins} herraduras te alcanza justo!` : 'Arranquemos por la cama.', pose: 'senala' }
      : say
  const talkPose = bubble?.pose ?? pose

  const priceTag = (id: string, price: number) =>
    broke && want?.id === id ? (
      <>Te faltan {price - s.coins}</>
    ) : null

  return (
    <div className="casita" ref={screen}>
      <RoomScene
        placed={s.placed}
        fresh={fresh}
        pose={talkPose}
        dog={s.dog.arrived}
        onTap={openSlot}
        say={bubble?.text}
        sayAction={bubble?.action && <Button variant="gold" onClick={bubble.action.onClick}>{bubble.action.label}</Button>}
        onSayTap={bubble && !bubble.action ? () => setSay(bubble.then ?? null) : undefined}
      >
        <div className="casita__top">
          <CoinPill coins={s.coins} bump={cheer > 0} key={cheer} />
        </div>
      </RoomScene>

      {!ask && (
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
                    const poor = !have && !lock && s.coins < priceOf(o)
                    const glow = broke && want?.id === o.id
                    return (
                      <button
                        key={o.id}
                        ref={o.id === FIRST_BED ? bedCard : undefined}
                        data-want={o.id}
                        className={`scard${have ? ' scard--have' : ''}${placed ? ' scard--on' : ''}${lock ? ' scard--locked' : ''}${poor ? ' scard--short' : ''}${glow ? ' scard--glow' : ''}${o.source.kind === 'premium' ? ' scard--premium' : ''}`}
                        disabled={tutorial && o.id !== FIRST_BED}
                        onClick={() => pickRoom(o)}
                      >
                        {o.source.kind === 'premium' && <img className="scard__star" src={art('ui_premium')} alt="Premium" />}
                        <span className={`scard__pic${optionArt(o).startsWith('thumb_') ? ' scard__pic--photo' : ''}`}>
                          <img src={art(optionArt(o))} alt="" />
                          {lock && <img className="scard__lock" src={art('ui_candado')} alt="" />}
                        </span>
                        <b>{o.name}</b>
                        <span className="scard__price">{glow ? priceTag(o.id, priceOf(o)) : <RoomPrice s={s} o={o} />}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          {tab === 'paucho' && (
            <button className={`scard scard--termo${s.termos >= TERMOS_MAX ? ' scard--have' : s.coins < TERMO_PRICE ? ' scard--short' : ''}`} onClick={buyTermo}>
              <span className="scard__pic">
                <span className="sicon">🧉</span>
                <span className="scard__count">{s.termos}/{TERMOS_MAX}</span>
              </span>
              <b>Termo</b>
              <span className="scard__price">
                {s.termos >= TERMOS_MAX ? (
                  'Lleno'
                ) : (
                  <>
                    <img src={art('ui_herradura')} alt="" />
                    {TERMO_PRICE}
                  </>
                )}
              </span>
            </button>
          )}
          {tab === 'paucho' &&
            CLOTHES.map((c) => {
              const have = s.clothes.includes(c.id)
              const wearing = s.outfit[c.slot] === c.id
              const locked = c.south && southLocked
              const poor = !have && !locked && s.coins < c.price
              const glow = broke && want?.id === c.id
              return (
                <button
                  key={c.id}
                  data-want={c.id}
                  className={`scard${have ? ' scard--have' : ''}${wearing ? ' scard--on' : ''}${poor ? ' scard--short' : ''}${glow ? ' scard--glow' : ''}`}
                  onClick={() => {
                    if (!have && locked) {
                      feel('locked', 'warning')
                      return speak({ text: southSay(s), pose: 'senala', ttl: 8000 })
                    }
                    if (!have && poor) {
                      feel('locked', 'warning')
                      return speak(short(c.name, c.price))
                    }
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
                    ) : glow ? (
                      priceTag(c.id, c.price)
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
      )}

      {tutorial && asked && spot && (
        <>
          <div className="tspot" style={{ left: spot.x - 5, top: spot.y - 5, width: spot.width + 10, height: spot.height + 10 }} />
          <span className="thand" style={{ left: spot.x + spot.width - 30, top: spot.y + spot.height - 58 }}>
            👆
          </span>
        </>
      )}
    </div>
  )
}
