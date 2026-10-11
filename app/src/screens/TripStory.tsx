import { useEffect, useRef, useState } from 'react'
import { Confetti } from '../components/Confetti'
import { Button } from '../components/ui'
import { art } from '../game/content'
import { TRIP } from '../game/journey'
import { CLOTHES } from '../game/shop'
import { actions, useGame } from '../game/store'

/** Back from the south: his story, your answer, and what he brought. */
export function TripStory({ onDone }: { onDone: () => void }) {
  const name = useGame((s) => s.name)
  const [reply, setReply] = useState<number | null>(null)
  const rewardRef = useRef<HTMLDivElement>(null)
  const south = CLOTHES.filter((c) => c.south)

  // The reward slides in after he answers; bring it on screen.
  useEffect(() => {
    if (reply == null) return
    const t = window.setTimeout(() => rewardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 1150)
    return () => clearTimeout(t)
  }, [reply])

  return (
    <div className="screen story">
      <div className="story__photo">
        <img src={art(TRIP.image)} alt="" />
      </div>
      <div className="story__body">
        <small className="story__day">{TRIP.name}</small>
        <h2>¡{name} volvió del sur!</h2>
        <p className="story__text">“{TRIP.story}”</p>

        {reply == null ? (
          <>
            <h3>¿Qué le decís?</h3>
            <div className="story__replies">
              {TRIP.replies.map((r, i) => (
                <button key={r.label} className={`chip${i === 0 ? ' chip--main' : ''}`} onClick={() => setReply(i)}>
                  {r.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="chat">
            <p className="chat__me">{TRIP.replies[reply].label}</p>
            <p className="chat__him">
              <img src={art('g_avatar')} alt="" />
              <span>{TRIP.replies[reply].answer}</span>
            </p>
          </div>
        )}

        {reply != null && (
          <div className="reward" ref={rewardRef}>
            <Confetti burstKey={1} count={22} />
            <h3>Del viaje trajo:</h3>
            <div className="reward__row">
              <div className="reward__tile">
                <b className="reward__emoji">{TRIP.bringsEmoji}</b>
                <strong>Madera de lenga</strong>
                <small>para la pulpería</small>
              </div>
              <div className="reward__tile">
                <b className="reward__emoji">🧶</b>
                <strong>Ropa del sur</strong>
                <small>{south.map((c) => c.name.toLowerCase()).join(' y ')}, en la tienda</small>
              </div>
              <div className="reward__tile">
                <img src={art('ui_herradura')} alt="" />
                <strong>+{TRIP.coins}</strong>
                <small>herraduras</small>
              </div>
            </div>
            <Button
              variant="gold"
              onClick={() => {
                actions.completeJob()
                onDone()
              }}
            >
              ¡A arreglar la pulpería!
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
