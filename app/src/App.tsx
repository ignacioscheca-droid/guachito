import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { preloadGauchito } from './components/Gauchito'
import { BottomNav, type Tab } from './components/ui'
import { actions, adventureRemainingMs, useGame } from './game/store'
import { AdventureReady } from './screens/AdventureReady'
import { AdventureRun } from './screens/AdventureRun'
import { AdventureTab } from './screens/AdventureTab'
import { HabitDone } from './screens/HabitDone'
import { Home } from './screens/Home'
import { Onboarding } from './screens/Onboarding'
import { Ranch } from './screens/Ranch'
import { StoryReward } from './screens/StoryReward'
import { Settings } from './screens/Settings'
import { TestMenu } from './screens/TestMenu'

type View = 'tabs' | 'ready' | 'run' | 'story'

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(390)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

/** Ticks while an adventure runs and lands it when time is up. */
function useAdventureClock() {
  const running = useGame((s) => s.adventure.status === 'running')
  const skip = useGame((s) => s.adventureSkipMs)
  const [remaining, setRemaining] = useState(adventureRemainingMs())
  useEffect(() => {
    if (!running) return
    const tick = () => {
      const ms = adventureRemainingMs()
      setRemaining(ms)
      if (ms <= 0) actions.returnFromAdventure()
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => clearInterval(id)
  }, [running, skip])
  return remaining
}

export default function App() {
  const onboarded = useGame((s) => s.onboarded)
  const status = useGame((s) => s.adventure.status)
  const [ref, width] = useWidth()
  const [tab, setTab] = useState<Tab>('home')
  const [view, setView] = useState<View>('tabs')
  const [done, setDone] = useState<{ habitId: string; gained: number } | null>(null)
  const [celebrateKey, setCelebrateKey] = useState(0)
  const [testMenu, setTestMenu] = useState(false)
  const [settings, setSettings] = useState(false)
  const remaining = useAdventureClock()
  const testMode = new URLSearchParams(location.search).has('test')

  useEffect(preloadGauchito, [])

  // Every screen starts at the top (the story screen is long and scrolls).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view, tab, onboarded])

  // When the adventure ends while watching it, go straight to the story.
  useEffect(() => {
    if (status === 'returned' && view === 'run') setView('story')
  }, [status, view])

  const openAdventure = () => {
    if (status === 'ready') setView('ready')
    else if (status === 'running') setView('run')
    else if (status === 'returned') setView('story')
    else setTab('adventure')
  }

  const completeHabit = (id: string) => {
    const gained = actions.completeHabit(id)
    setCelebrateKey((k) => k + 1)
    // Let Gauchito's jump land in the scene before the modal covers it.
    window.setTimeout(() => setDone({ habitId: id, gained }), 1250)
  }

  let content
  if (!onboarded) {
    content = <Onboarding />
  } else if (view === 'ready') {
    content = (
      <AdventureReady
        onStart={() => {
          actions.startAdventure()
          setView('run')
        }}
        onLater={() => setView('tabs')}
      />
    )
  } else if (view === 'run') {
    content = <AdventureRun remainingMs={remaining} onHome={() => setView('tabs')} />
  } else if (view === 'story') {
    content = (
      <StoryReward
        onClaim={() => {
          actions.claimReward()
          setTab('ranch')
          setView('tabs')
        }}
      />
    )
  } else {
    content = (
      <>
        <main className="tabs" key={tab}>
          {tab === 'home' && (
            <Home
              width={width}
              celebrateKey={celebrateKey}
              remainingMs={remaining}
              onCompleteHabit={completeHabit}
              onAdventure={openAdventure}
              onTapGauchito={() => setCelebrateKey((k) => k + 1)}
              onSecretTap={() => setTestMenu(true)}
              onSettings={() => setSettings(true)}
            />
          )}
          {tab === 'adventure' && <AdventureTab remainingMs={remaining} onOpen={openAdventure} />}
          {tab === 'ranch' && <Ranch width={width} />}
        </main>
        <BottomNav tab={tab} onTab={setTab} badges={{ adventure: status === 'ready' || status === 'returned' }} />
      </>
    )
  }

  return (
    <div className="app" ref={ref}>
      {content}
      {done && (
        <HabitDone
          {...done}
          onClose={() => setDone(null)}
          onAdventure={() => {
            setDone(null)
            setView('ready')
          }}
        />
      )}
      {settings && (
        <Settings
          onClose={() => setSettings(false)}
          onTestMenu={() => {
            setSettings(false)
            setTestMenu(true)
          }}
        />
      )}
      {testMenu && <TestMenu onClose={() => setTestMenu(false)} />}
      {testMode && onboarded && !testMenu && view === 'tabs' && (
        <button className="testfab" onClick={() => setTestMenu(true)} aria-label="Menú de prueba">
          🛠
        </button>
      )}
    </div>
  )
}
