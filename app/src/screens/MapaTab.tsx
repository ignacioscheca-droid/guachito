import { Segmented } from '../components/ui'
import { useGame } from '../game/store'
import { AreasTab } from './AreasTab'
import { AventurasTab } from './AventurasTab'

export type MapaView = 'estancia' | 'viajes'

/**
 * Áreas and Aventuras in one tab (mockups M1–M2, design/mockups/ronda2/): La estancia, the road
 * of areas, and Los viajes, the trips. The switch shows once both are open.
 */
export function MapaTab({
  view,
  onView,
  remainingMs,
  onGoHome,
  onStart,
  onWatch,
  onStory,
}: {
  view: MapaView
  onView: (v: MapaView) => void
  remainingMs: number
  onGoHome: () => void
  onStart: () => void
  onWatch: () => void
  onStory: () => void
}) {
  const areas = useGame((s) => s.unlocked.includes('areas'))
  const trips = useGame((s) => s.unlocked.includes('aventuras'))
  const shown: MapaView = !trips ? 'estancia' : !areas ? 'viajes' : view
  return (
    <div className={`mapa mapa--${shown}`}>
      {areas && trips && (
        <div className="mapa__top">
          <Segmented
            value={shown}
            options={[
              ['estancia', 'La estancia'],
              ['viajes', 'Los viajes'],
            ]}
            onChange={onView}
          />
        </div>
      )}
      {shown === 'estancia' ? (
        <AreasTab onGoHome={onGoHome} />
      ) : (
        <AventurasTab remainingMs={remainingMs} onStart={onStart} onWatch={onWatch} onStory={onStory} />
      )}
    </div>
  )
}
