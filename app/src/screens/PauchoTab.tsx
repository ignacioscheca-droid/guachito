import { PauchoFace } from '../components/Paucho'
import { areaName, areasDone, TRIP, TRIP_JOB } from '../game/journey'
import { bestStreak, daysTogether, friendship, LEVELS } from '../game/friendship'
import { CLOTHES, SLOTS } from '../game/shop'
import { actions, keptDays, streakNow, useGame } from '../game/store'

/** Paucho's page (Finch's bird profile): your friendship, your streak, his clothes, your memories. */
export function PauchoTab({ onShop }: { onShop: () => void }) {
  const s = useGame((g) => g)
  const days = daysTogether(s.completions)
  const f = friendship(days)
  const now = streakNow(s)
  const best = Math.max(now, bestStreak(keptDays(s)))
  const finished = areasDone(s.jobsDone)

  const memories: { emoji: string; text: string }[] = []
  for (let a = 0; a < finished; a++) memories.push({ emoji: '🏡', text: `Terminaron ${areaName(a, s.name, true)}` })
  if (s.dog.arrived) memories.push({ emoji: '🐶', text: `Llegó ${s.dog.name || 'un perro'} a vivir en su cucha` })
  if (s.jobsDone > TRIP_JOB) memories.push({ emoji: TRIP.emoji, text: `${TRIP.name}: volvió con ${TRIP.brings}` })

  return (
    <div className="prof">
      <section className="prof__card">
        <div className="prof__head">
          <PauchoFace outfit={s.outfit} className="prof__face" />
          <div>
            <h1>{s.name}</h1>
            <p>
              {days} {days === 1 ? 'día' : 'días'} juntos
            </p>
          </div>
        </div>
        <dl className="prof__facts">
          <dt>Amistad</dt>
          <dd>
            {f.level.name}
            <span className="prof__hearts" aria-label={`Nivel ${f.index + 1} de ${LEVELS.length}`}>
              {LEVELS.map((l, i) => (
                <i key={l.name} className={i <= f.index ? 'on' : ''}>
                  ♥
                </i>
              ))}
            </span>
          </dd>
          <dt>Su humano</dt>
          <dd>{s.playerName || 'Vos'}</dd>
        </dl>
        {f.next && (
          <p className="prof__next">
            {f.toNext === 1 ? 'Falta 1 día' : `Faltan ${f.toNext} días`} con algún hábito para ser <b>{f.next.name.toLowerCase()}</b>.
          </p>
        )}
      </section>

      <section className="prof__streak">
        <span className="prof__sun">🔥</span>
        <div>
          <strong>
            {now} {now === 1 ? 'día' : 'días'} de racha
          </strong>
          <small>
            {best > now ? `Tu mejor racha: ${best} días` : now > 1 ? '¡Tu mejor racha!' : 'Volvé mañana para sumar otro día'}
            {s.streakGoal ? ` · Tu meta: ${s.streakGoal}` : ''}
          </small>
        </div>
      </section>

      <section className="prof__block">
        <h2>Su ropa</h2>
        {SLOTS.map((slot) => {
          const owned = CLOTHES.filter((c) => c.slot === slot.id && s.clothes.includes(c.id))
          return (
            <div key={slot.id} className="prof__slot">
              <small>{slot.name}</small>
              <div className="prof__chips">
                <button className={!s.outfit[slot.id] ? 'on' : ''} onClick={() => actions.wear(slot.id, null)}>
                  {slot.usual}
                </button>
                {owned.map((c) => (
                  <button key={c.id} className={s.outfit[slot.id] === c.id ? 'on' : ''} onClick={() => actions.wear(slot.id, c.id)}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
        {s.clothes.length === 0 && (
          <button className="prof__shop" onClick={onShop}>
            Comprale ropa en la tienda de la casita →
          </button>
        )}
      </section>

      <section className="prof__block">
        <h2>Recuerdos</h2>
        {memories.length === 0 ? (
          <p className="prof__empty">Todavía son pocos días. ¡Los recuerdos van a venir!</p>
        ) : (
          <ul className="prof__memories">
            {memories.map((m) => (
              <li key={m.text}>
                <span>{m.emoji}</span>
                {m.text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
