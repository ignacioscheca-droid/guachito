import { useEffect, useRef, useState } from 'react'
import { HabitToast } from './components/DayLoop'
import { PauchoFace, preloadPaucho } from './components/Paucho'
import { BottomNav, Button } from './components/ui'
import { actions, getState, goalOf, nextJob, useGame, workRemainingMs, type TabId } from './game/store'
import { FIRST_BED } from './game/room'
import { feel, sfx } from './game/sound'
import { AreasTab } from './screens/AreasTab'
import { AventurasTab } from './screens/AventurasTab'
import { Casita } from './screens/Casita'
import { EnergyFull, type FillStep } from './screens/EnergyFull'
import { Home } from './screens/Home'
import { Onboarding } from './screens/Onboarding'
import { PauchoTab } from './screens/PauchoTab'
import { Reveal } from './screens/Reveal'
import { Settings } from './screens/Settings'
import { TestMenu } from './screens/TestMenu'
import { TripRun } from './screens/TripRun'
import { TripStory } from './screens/TripStory'
import { DogName, UnlockWelcome } from './screens/Welcomes'

type View = 'tabs' | 'full' | 'reveal' | 'story' | 'trip'

/** Finch's toasts after ticking a habit. */
const PRAISE = ['¡Sos un genio!', '¡Bien ahí!', '¡Qué crack!', '¡Increíble!', '¡Bravo!', '¡Así se hace!']

/** Ticks while Paucho works and marks the job finished when the eight hours are up. */
function useWorkClock() {
  const working = useGame((s) => s.work.status === 'working')
  const skip = useGame((s) => s.workSkipMs)
  const [remaining, setRemaining] = useState(workRemainingMs())
  useEffect(() => {
    if (!working) return
    const tick = () => {
      const ms = workRemainingMs()
      setRemaining(ms)
      if (ms <= 0) {
        actions.finishWork()
        sfx('ready')
      }
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => clearInterval(id)
  }, [working, skip])
  return remaining
}

export default function App() {
  const s = useGame((g) => g)
  const [tab, setTab] = useState<TabId>('inicio')
  const [view, setView] = useState<View>('tabs')
  const [toast, setToast] = useState<{ key: number; title: string; sub: string } | null>(null)
  const [fill, setFill] = useState<{ from: number; start: FillStep }>({ from: 0, start: 'job' })
  const [celebrateKey, setCelebrateKey] = useState(0)
  const [testMenu, setTestMenu] = useState(false)
  const [settings, setSettings] = useState(false)
  const [replayOnboarding, setReplayOnboarding] = useState(false)
  const [arriving, setArriving] = useState(false)
  const [lockedTap, setLockedTap] = useState(false)
  const remaining = useWorkClock()
  const testMode = new URLSearchParams(location.search).has('test')

  useEffect(preloadPaucho, [])

  // Out of the onboarding into Home: the blue of the last screen fades away, the panel
  // comes up like Finch's, and Paucho celebrates as he lands.
  const arrive = () => {
    setTab('inicio')
    setView('tabs')
    setArriving(true)
    window.setTimeout(() => setCelebrateKey((k) => k + 1), 450)
    window.setTimeout(() => setArriving(false), 1200)
  }
  const wasOnboarded = useRef(s.onboarded)
  useEffect(() => {
    if (s.onboarded && !wasOnboarded.current) arrive()
    wasOnboarded.current = s.onboarded
  }, [s.onboarded]) // eslint-disable-line react-hooks/exhaustive-deps

  // Every screen starts at the top (the story screen is long and scrolls).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view, tab, s.onboarded])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  // Watching the trip when he gets back: straight to his story.
  useEffect(() => {
    if (s.work.status === 'done' && view === 'trip') setView('story')
  }, [s.work.status, view])

  const startJob = () => {
    setFill({ from: goalOf(getState()), start: 'job' })
    setView('full')
  }
  const reveal = () => setView(nextJob(getState())?.kind === 'trip' ? 'story' : 'reveal')

  // Like Finch: a toast for each habit, and when the bar fills, the full-energy sequence.
  const completeHabit = (id: string) => {
    const before = getState().energy
    const r = actions.completeHabit(id)
    feel('check', 'success')
    setCelebrateKey((k) => k + 1)
    setToast({
      key: Date.now(),
      title: PRAISE[Math.floor(Math.random() * PRAISE.length)],
      sub: r.firstTime ? '¡Primera vez que lo completás!' : r.coins > 0 ? `+${r.coins} herraduras` : `+${r.energy} de energía`,
    })
    if (r.full) {
      window.setTimeout(() => {
        setToast(null)
        setFill({ from: before, start: 'max' })
        setView('full')
      }, 900)
    }
  }

  const backHome = () => {
    setTab('inicio')
    setView('tabs')
  }

  let content
  if (!s.onboarded) {
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
  } else if (view === 'full') {
    content = <EnergyFull from={fill.from} start={fill.start} remainingMs={remaining} onDone={backHome} />
  } else if (view === 'reveal') {
    content = <Reveal onDone={backHome} />
  } else if (view === 'story') {
    content = <TripStory onDone={backHome} />
  } else if (view === 'trip') {
    content = <TripRun remainingMs={remaining} onHome={() => setView('tabs')} />
  } else {
    const status = s.work.status
    content = (
      <>
        <main className={`tabs${arriving ? ' tabs--arriving' : ''}`} key={tab}>
          {tab === 'inicio' && (
            <Home
              celebrateKey={celebrateKey}
              remainingMs={remaining}
              onCompleteHabit={completeHabit}
              onStartJob={startJob}
              onReveal={reveal}
              onWatchTrip={() => setView('trip')}
              onTapPaucho={() => {
                sfx('cheer')
                setCelebrateKey((k) => k + 1)
              }}
              onSettings={() => setSettings(true)}
            />
          )}
          {tab === 'casita' && <Casita />}
          {tab === 'paucho' && <PauchoTab onShop={() => setTab('casita')} />}
          {tab === 'areas' && <AreasTab onGoHome={() => setTab('inicio')} />}
          {tab === 'aventuras' && (
            <AventurasTab remainingMs={remaining} onStart={startJob} onWatch={() => setView('trip')} onStory={() => setView('story')} />
          )}
        </main>
        <BottomNav
          tab={tab}
          open={s.unlocked}
          name={s.name}
          face={<PauchoFace outfit={s.outfit} className="nav5__face" />}
          badges={{
            inicio: tab !== 'inicio' && (status === 'ready' || status === 'done'),
            casita: s.unlocked.includes('casita') && !s.room.includes(FIRST_BED),
          }}
          onTab={setTab}
          onLocked={() => {
            feel('locked', 'warning')
            setLockedTap(true)
          }}
        />
      </>
    )
  }

  const welcome = view === 'tabs' && s.onboarded && !replayOnboarding
  return (
    <div className="app">
      {content}
      {arriving && <div className="arrive-veil" aria-hidden />}
      {toast && view === 'tabs' && <HabitToast key={toast.key} title={toast.title} sub={toast.sub} />}
      {welcome && s.dog.arrived && !s.dog.name && <DogName />}
      {welcome && !(s.dog.arrived && !s.dog.name) && s.unlockQueue.length > 0 && <UnlockWelcome tab={s.unlockQueue[0]} onGo={setTab} />}
      {lockedTap && (
        <div className="overlay" onClick={() => setLockedTap(false)}>
          <div className="modal unlock__box unlock__box--small" onClick={(e) => e.stopPropagation()}>
            <h2>Todavía no 🔒</h2>
            <p>Se abre más adelante, a medida que {s.name} y vos avancen juntos.</p>
            <Button variant="light" onClick={() => setLockedTap(false)}>
              ¡Dale!
            </Button>
          </div>
        </div>
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
      {testMenu && <TestMenu onClose={() => setTestMenu(false)} onOnboarding={() => setReplayOnboarding(true)} />}
      {testMode && s.onboarded && !testMenu && !replayOnboarding && view === 'tabs' && (
        <button className="testfab" onClick={() => setTestMenu(true)} aria-label="Menú de prueba">
          🛠
        </button>
      )}
    </div>
  )
}
