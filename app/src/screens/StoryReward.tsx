import { useEffect, useRef, useState } from 'react'
import { Confetti } from '../components/Confetti'
import { Button } from '../components/ui'
import { art, EPISODES, itemById } from '../game/content'
import { useGame } from '../game/store'

export function StoryReward({ onClaim }: { onClaim: () => void }) {
  const name = useGame((s) => s.name)
  const reward = useGame((s) => s.pendingReward)
  const [reply, setReply] = useState<number | null>(null)
  const rewardRef = useRef<HTMLDivElement>(null)

  // The reward slides in after Gauchito answers; bring it on screen.
  useEffect(() => {
    if (reply == null) return
    const t = window.setTimeout(() => rewardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 1150)
    return () => clearTimeout(t)
  }, [reply])

  if (!reward) return null
  const ep = EPISODES[reward.episode]
  const item = reward.itemId ? itemById(reward.itemId) : null

  return (
    <div className="screen story">
      <div className="story__photo">
        <img src={art(ep.image)} alt="" />
      </div>
      <div className="story__body">
        <small className="story__day">
          Día {reward.episode + 1} · {ep.title}
        </small>
        <h2>¡{name} volvió de la aventura!</h2>
        <p className="story__text">“{ep.story}”</p>

        {reply == null ? (
          <>
            <h3>¿Qué le decís?</h3>
            <div className="story__replies">
              {ep.replies.map((r, i) => (
                <button key={r.label} className={`chip${i === 0 ? ' chip--main' : ''}`} onClick={() => setReply(i)}>
                  {r.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="chat">
            <p className="chat__me">{ep.replies[reply].label}</p>
            <p className="chat__him">
              <img src={art('g_avatar')} alt="" />
              <span>{ep.replies[reply].answer}</span>
            </p>
          </div>
        )}

        {reply != null && (
          <div className="reward" ref={rewardRef}>
            <Confetti burstKey={1} count={22} />
            <h3>Por la aventura, ganaste:</h3>
            <div className="reward__row">
              <div className="reward__tile">
                <img src={art('ui_moneda')} alt="" />
                <strong>+{reward.coins}</strong>
                <small>monedas</small>
              </div>
              {item && (
                <div className="reward__tile reward__tile--item">
                  <img src={art(item.image)} alt="" />
                  <strong>{item.name}</strong>
                  <small>nuevo para el rancho</small>
                </div>
              )}
            </div>
            <Button variant="gold" onClick={onClaim}>
              {item ? 'Ponerlo en el rancho' : 'Guardar monedas'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
