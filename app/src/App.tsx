import { useEffect, useRef, useState } from 'react'
import { PauchoFace, preloadPaucho } from './components/Paucho'
import { BottomNav } from './components/ui'
import { actions, canBuySomething, getState, keptDays, mateDue, nextJob, todayKey, useGame, workRemainingMs, type TabId } from './game/store'
import { streak } from './game/friendship'
import { areaView } from './game/journey'
import { FIRST_BED } from './game/room'
import { feel, sfx } from './game/sound'
import { AreasTab } from './screens/AreasTab'
import { AventurasTab } from './screens/AventurasTab'
import { Casita } from './screens/Casita'
import { FullTalk } from './screens/FullTalk'
import { Home } from './screens/Home'
import { Onboarding } from './screens/Onboarding'
import { PauchoTab } from './screens/PauchoTab'
import { AreaDone, Reveal } from './screens/Reveal'
import { Settings } from './screens/Settings'
import { StreakDay } from './screens/DayOne'
import { GoalDone, Rescue, WelcomeBack } from './screens/Racha'
import { TestMenu } from './screens/TestMenu'
import { TripRun } from './screens/TripRun'
import { TripStory } from './screens/TripStory'
import { DogArrival, LockedTab, NotifAsk, UnlockWelcome } from './screens/Welcomes'
import { shouldAskPush } from './game/push'

type View = 'tabs' | 'reveal' | 'story' | 'trip'

/** What Paucho says in the field after a habit. */
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
  // Paucho up close when the bar is full: thanks (and the herraduras), then what he'll build
  const [talk, setTalk] = useState<'thanks' | 'work' | null>(null)
  // what Paucho says in the field for a moment
  const [fieldSay, setFieldSay] = useState<string | null>(null)
  // a finished obra seen from Home that also closed its area: the area's celebration
  const [revealAt, setRevealAt] = useState<'obra' | 'area'>('obra')
  const [celebrateKey, setCelebrateKey] = useState(0)
  const [testMenu, setTestMenu] = useState(false)
  const [settings, setSettings] = useState(false)
  const [replayOnboarding, setReplayOnboarding] = useState(false)
  const [replayStreak, setReplayStreak] = useState(false)
  const [replayArea, setReplayArea] = useState(false)
  const [arriving, setArriving] = useState(false)
  const [lockedTap, setLockedTap] = useState<TabId | null>(null)
  const [askPush, setAskPush] = useState(false)
  const [fullPending, setFullPending] = useState(false)
  const remaining = useWorkClock()
  const testMode = new URLSearchParams(location.search).has('test')
  const morning = mateDue(s) && view === 'tabs' && !replayOnboarding
  // a streak goal reached this morning: its celebration comes after the mate
  const [goalDone, setGoalDone] = useState<number | null>(null)
  // the morning works out the streak first: termos for the days missed, or a rescue
  useEffect(() => {
    if (morning) actions.openDay()
  }, [morning])

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


  // Watching the trip when he gets back: straight to his story.
  useEffect(() => {
    if (s.work.status === 'done' && view === 'trip') setView('story')
  }, [s.work.status, view])

  const startJob = () => setTalk('work')
  const reveal = () => {
    setRevealAt('obra')
    setView(nextJob(getState())?.kind === 'trip' ? 'story' : 'reveal')
  }
  const say = (line: string, ms = 5000) => {
    setFieldSay(line)
    window.setTimeout(() => setFieldSay((l) => (l === line ? null : l)), ms)
  }
  // the mate recalentado by the habit that also filled the bar: said after the full bar's talk
  const laterSay = useRef<string | null>(null)
  const talkDone = (started: boolean) => {
    setTalk(null)
    setFullPending(false)
    setTab('inicio')
    const warm = laterSay.current
    laterSay.current = null
    if (warm) say(warm, 6000)
    if (!started) return
    if (!warm && nextJob(getState())?.kind !== 'trip') say('¡Toc, toc! Te aviso cuando esté 🔨')
    // he just set off for eight hours: the moment to offer to let you know
    if (shouldAskPush(getState())) window.setTimeout(() => setAskPush(true), 5200)
  }

  // Like Finch: a cheer for each habit, and when the bar fills, the full-energy sequence.
  const completeHabit = (id: string) => {
    const r = actions.completeHabit(id)
    setCelebrateKey((k) => k + 1)
    const warm = r.recalentado ? `¡Recalentamos el mate! Volvimos a ${r.recalentado} días de racha 🔥` : null
    if (r.full) {
      laterSay.current = warm
      // Home counts the bar up to the top (the herraduras held back), Paucho cheers in the
      // field, then he comes up close to thank you and hand them over
      setFullPending(true)
      say('¡Yujuuu! ⚡', 1300)
      window.setTimeout(() => setTalk('thanks'), 1400)
      return
    }
    if (warm) return say(warm, 6000)
    // Paucho cheers in the field (the energy or herraduras already flew to where they add up)
    const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)]
    say(r.firstTime ? `${praise} ¡Primera vez que lo hacés!` : praise, 2200)
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
  } else if (replayStreak) {
    content = <StreakDay onNext={() => setReplayStreak(false)} />
  } else if (replayArea) {
    content = <AreaDone area={areaView(s.jobsDone).area} onDone={() => setReplayArea(false)} />
  } else if (goalDone != null) {
    content = <GoalDone goal={goalDone} onDone={() => setGoalDone(null)} />
  } else if (morning) {
    // each new day opens with its mate, and the streak counts one more; a streak gone cold
    // is offered a rescue first
    const ds = s.dayStart?.day === todayKey(s) ? s.dayStart : null
    const days = streak({ ...keptDays(s), [todayKey(s)]: ['mate'] }, todayKey(s))
    content = !ds ? null : ds.away ? (
      <WelcomeBack days={ds.away} onDone={() => setTab('inicio')} />
    ) : ds.rescue && !ds.rescue.offered ? (
      <Rescue days={ds.rescue.days} onDone={() => setTab('inicio')} />
    ) : (
      <StreakDay
        key={ds.day}
        first={false}
        days={days}
        goal={s.streakGoal}
        saved={s.savedDays}
        termo={ds.termo.length}
        termos={s.termos}
        today={todayKey(s)}
        rescue={ds.rescue?.days ?? 0}
        onNext={() => {
          actions.cebarMate()
          setTab('inicio')
          if (s.streakGoal && days >= s.streakGoal) setGoalDone(s.streakGoal)
        }}
      />
    )
  } else if (view === 'reveal') {
    content = <Reveal startAt={revealAt} onDone={backHome} />
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
              fullPending={fullPending}
              hidePaucho={talk != null}
              say={fieldSay}
              onAreaDone={() => {
                setRevealAt('area')
                setView('reveal')
              }}
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
            casita: tab !== 'casita' && (s.unlocked.includes('casita') && !s.room.includes(FIRST_BED) || canBuySomething(s)),
          }}
          onTab={setTab}
          onLocked={(t) => {
            feel('locked', 'warning')
            setLockedTap(t)
          }}
        />
      </>
    )
  }

  const welcome = view === 'tabs' && s.onboarded && !replayOnboarding && !replayStreak && !replayArea && !morning
  return (
    <div className="app">
      {content}
      {arriving && <div className="arrive-veil" aria-hidden />}
      {talk && <FullTalk start={talk} onCoinsLanded={() => setFullPending(false)} onDone={talkDone} />}
      {welcome && s.dog.arrived && !s.dog.name && <DogArrival />}
      {welcome && !(s.dog.arrived && !s.dog.name) && s.unlockQueue.length > 0 && <UnlockWelcome tab={s.unlockQueue[0]} onGo={setTab} />}
      {welcome && askPush && !(s.dog.arrived && !s.dog.name) && s.unlockQueue.length === 0 && <NotifAsk onClose={() => setAskPush(false)} />}
      {lockedTap && <LockedTab tab={lockedTap} onClose={() => setLockedTap(null)} />}
      {settings && (
        <Settings
          onClose={() => setSettings(false)}
          onTestMenu={() => {
            setSettings(false)
            setTestMenu(true)
          }}
        />
      )}
      {testMenu && <TestMenu onClose={() => setTestMenu(false)} onOnboarding={() => setReplayOnboarding(true)} onAskPush={() => setAskPush(true)} onStreak={() => setReplayStreak(true)} onArea={() => setReplayArea(true)} />}
      {testMode && s.onboarded && !testMenu && !replayOnboarding && !replayStreak && !replayArea && view === 'tabs' && (
        <button className="testfab" onClick={() => setTestMenu(true)} aria-label="Menú de prueba">
          🛠
        </button>
      )}
    </div>
  )
}
