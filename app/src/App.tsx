import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { preloadGauchito } from './components/Gauchito'
import { HabitToast } from './components/DayLoop'
import { BottomNav, type Tab } from './components/ui'
import { ENERGY_GOAL } from './game/content'
import { actions, adventureRemainingMs, getState, useGame } from './game/store'
import { AdventureRun } from './screens/AdventureRun'
import { AdventureTab } from './screens/AdventureTab'
import { EnergyFull, type FillStep } from './screens/EnergyFull'
import { Home } from './screens/Home'
import { Onboarding } from './screens/Onboarding'
import { Ranch } from './screens/Ranch'
import { StoryReward } from './screens/StoryReward'
import { Settings } from './screens/Settings'
import { TestMenu } from './screens/TestMenu'

type View = 'tabs' | 'ready' | 'run' | 'story'

/** Finch's toasts after ticking a habit. */
const PRAISE = ['¡Sos un genio!', '¡Bien ahí!', '¡Qué crack!', '¡Increíble!', '¡Bravo!', '¡Así se hace!']

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
  const [toast, setToast] = useState<{ key: number; title: string; sub: string } | null>(null)
  const [fill, setFill] = useState<{ from: number; start: FillStep }>({ from: ENERGY_GOAL, start: 'grow' })
  const [celebrateKey, setCelebrateKey] = useState(0)
  const [testMenu, setTestMenu] = useState(false)
  const [settings, setSettings] = useState(false)
  const [replayOnboarding, setReplayOnboarding] = useState(false)
  const [arriving, setArriving] = useState(false)
  const remaining = useAdventureClock()
  const testMode = new URLSearchParams(location.search).has('test')

  useEffect(preloadGauchito, [])

  // Out of the onboarding into Home: the blue of the last screen fades away, the panel
  // comes up like Finch's, and Gauchito celebrates as he lands.
  const arrive = () => {
    setTab('home')
    setView('tabs')
    setArriving(true)
    window.setTimeout(() => setCelebrateKey((k) => k + 1), 450)
    window.setTimeout(() => setArriving(false), 1200)
  }
  const wasOnboarded = useRef(onboarded)
  useEffect(() => {
    if (onboarded && !wasOnboarded.current) arrive()
    wasOnboarded.current = onboarded
  }, [onboarded]) // eslint-disable-line react-hooks/exhaustive-deps

  // Every screen starts at the top (the story screen is long and scrolls).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view, tab, onboarded])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  // When the adventure ends while watching it, go straight to the story.
  useEffect(() => {
    if (status === 'returned' && view === 'run') setView('story')
  }, [status, view])

  const openAdventure = () => {
    if (status === 'ready') {
      setFill({ from: ENERGY_GOAL, start: 'grow' })
      setView('ready')
    } else if (status === 'running') setView('run')
    else if (status === 'returned') setView('story')
    else setTab('adventure')
  }

  // Like Finch: a toast for each habit, and when the bar fills, the full-energy sequence.
  const completeHabit = (id: string) => {
    const before = getState().energy
    const r = actions.completeHabit(id)
    setCelebrateKey((k) => k + 1)
    setToast({
      key: Date.now(),
      title: PRAISE[Math.floor(Math.random() * PRAISE.length)],
      sub: r.firstTime ? '¡Primera vez que lo completás!' : r.coins > 0 ? `+${r.coins} monedas` : `+${r.energy} de energía`,
    })
    if (r.full) {
      window.setTimeout(() => {
        setToast(null)
        setFill({ from: before, start: 'max' })
        setView('ready')
      }, 900)
    }
  }

  let content
  if (!onboarded) {
    content = <Onboarding />
  } else if (replayOnboarding) {
    content = (
      <Onboarding
        onPreviewDone={() => {
          setReplayOnboarding(false)
          arrive()
        }}
      />
    )
  } else if (view === 'ready') {
    content = (
      <EnergyFull
        width={width}
        from={fill.from}
        start={fill.start}
        remainingMs={remaining}
        onDone={() => {
          setTab('home')
          setView('tabs')
        }}
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
        <main className={`tabs${arriving ? ' tabs--arriving' : ''}`} key={tab}>
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
      {arriving && <div className="arrive-veil" aria-hidden />}
      {toast && view === 'tabs' && <HabitToast key={toast.key} title={toast.title} sub={toast.sub} />}
      {settings && (
        <Settings
          onClose={() => setSettings(false)}
          onTestMenu={() => {
            setSettings(false)
            setTestMenu(true)
          }}
        />
      )}
      {testMenu && <TestMenu onClose={() => setTestMenu(false)} onOnboarding={() => setReplayOnboarding(true)} />}
      {testMode && onboarded && !testMenu && !replayOnboarding && view === 'tabs' && (
        <button className="testfab" onClick={() => setTestMenu(true)} aria-label="Menú de prueba">
          🛠
        </button>
      )}
    </div>
  )
}
