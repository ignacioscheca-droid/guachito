import { useEffect, useState } from 'react'
import { Scene } from '../components/Scene'
import { CoinPill } from '../components/ui'
import { art, ITEMS, itemById } from '../game/content'
import { actions, useGame } from '../game/store'

export function Ranch({ width }: { width: number }) {
  const coins = useGame((s) => s.coins)
  const owned = useGame((s) => s.ownedItems)
  const newItemId = useGame((s) => s.newItemId)
  const away = useGame((s) => s.adventure.status === 'running')
  const [toast, setToast] = useState<string | null>(null)
  const [bump, setBump] = useState(0)

  // Spotlight a freshly earned/bought item, then let it settle.
  useEffect(() => {
    if (!newItemId) return
    setToast(`¡${itemById(newItemId).name} ya está en el rancho!`)
    const t = window.setTimeout(() => {
      setToast(null)
      actions.clearNewItem()
    }, 3200)
    return () => clearTimeout(t)
  }, [newItemId])

  const buy = (id: string) => {
    if (actions.buyItem(id)) setBump((b) => b + 1)
  }

  return (
    <div className="ranch">
      <Scene width={width} height={Math.round(width * 0.78)} view="ranch" items={owned} highlightId={newItemId} away={away}>
        <div className="ranch__top">
          <h1>Tu rancho</h1>
          <CoinPill coins={coins} bump={bump > 0} key={bump} />
        </div>
        {toast && <div className="toast">{toast}</div>}
      </Scene>

      <div className="panel ranch__panel">
        <p className="ranch__hint">
          {owned.length === 0
            ? 'Cada aventura trae algo nuevo. Con las monedas podés sumar más cosas.'
            : `${owned.length} de ${ITEMS.length} cosas en el rancho`}
        </p>
        <div className="shop">
          {ITEMS.map((it) => {
            const have = owned.includes(it.id)
            const short = it.price - coins
            return (
              <button key={it.id} className={`shop__item${have ? ' shop__item--have' : ''}`} disabled={have || short > 0} onClick={() => buy(it.id)}>
                <img src={art(it.image)} alt="" />
                <span className="shop__name">{it.name}</span>
                {have ? (
                  <span className="shop__price shop__price--have">En el rancho</span>
                ) : (
                  <span className="shop__price">
                    <img src={art('ui_moneda')} alt="" />
                    {it.price}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
