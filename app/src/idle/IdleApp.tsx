import { useEffect, useState, type MouseEvent } from 'react'
import { Confetti } from '../components/Confetti'
import { HabitToast } from '../components/DayLoop'
import { Scene } from '../components/Scene'
import { Check, HabitIcon } from '../components/ui'
import { art } from '../game/content'
import { FIXES, HUERTA, IDLE_HABITS, WEEDS, type Fix, type Spot } from './content'
import { doneToday, huertaCoins, idle, nextFixes, useIdle } from './store'

const PRAISE = ['¡Sos un genio!', '¡Bien ahí!', '¡Qué crack!', '¡Increíble!', '¡Bravo!', '¡Así se hace!']
/** How long Paucho works on a repair before it shows. */
const WORK_MS = 1400

const at = (s: Spot) => ({ left: `${s.x}%`, top: `${s.y}%` })

function useWidth() {
  const [w, setW] = useState(() => Math.min(window.innerWidth, 430))
  useEffect(() => {
    const on = () => setW(Math.min(window.innerWidth, 430))
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return w
}

/** A star or a coin flying from where it was earned to its counter. */
function fly(from: Element, to: string, icon: string, count = 1) {
  const target = document.querySelector(to)
  if (!target) return
  const a = from.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  for (let i = 0; i < count; i++) {
    const el = document.createElement(icon.length > 2 ? 'img' : 'span')
    if (el instanceof HTMLImageElement) el.src = art(icon)
    else el.textContent = icon
    el.className = 'flyer ix-flyer'
    el.style.left = `${a.left + a.width / 2 - 14}px`
    el.style.top = `${a.top + a.height / 2 - 14}px`
    document.body.appendChild(el)
    const dx = b.left + 14 - (a.left + a.width / 2)
    const dy = b.top + b.height / 2 - (a.top + a.height / 2)
    el.animate(
      [
        { transform: 'translate(0, 0) scale(0.6)', opacity: 0 },
        { transform: `translate(${dx * 0.3}px, ${dy * 0.3 - 40}px) scale(1.2)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.8)`, opacity: 1 },
      ],
      { duration: 700, delay: i * 110, easing: 'cubic-bezier(0.5, 0, 0.6, 1)', fill: 'backwards' },
    ).onfinish = () => el.remove()
  }
}

export function IdleApp() {
  const s = useIdle((g) => g)
  const width = useWidth()
  const [working, setWorking] = useState<Fix | null>(null)
  const [burst, setBurst] = useState<{ key: number; spot: Spot }>({ key: 0, spot: { x: 50, y: 50 } })
  const [cheer, setCheer] = useState(0)
  const [say, setSay] = useState<{ key: number; text: string } | null>(null)
  const [toast, setToast] = useState<{ key: number; title: string; sub: string } | null>(null)
  const [testMenu, setTestMenu] = useState(false)
  const [, tick] = useState(0)
  const testMode = new URLSearchParams(location.search).has('test')

  // The garden keeps growing coins: refresh what it holds every few seconds.
  useEffect(() => {
    const id = window.setInterval(() => tick((t) => t + 1), 5000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    if (!say) return
    const t = window.setTimeout(() => setSay(null), 3800)
    return () => clearTimeout(t)
  }, [say])
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const done = doneToday(s)
  const pending = nextFixes(s)
  const shown = pending.slice(0, 3)
  const ruin = pending.length / FIXES.length
  const planted = s.fixed.includes('huerta')
  const harvest = huertaCoins(s)
  const sceneH = Math.round(width * 1.0)

  const greeting = () => {
    if (s.fixed.length === 0) return 'Llegamos al rancho… está hecho pedazos. ¡Arreglémoslo juntos!'
    if (pending.length === 0) return '¡El rancho quedó como nuevo!'
    if (s.stars === 0 && done.length === IDLE_HABITS.length) {
      return planted ? '¡Hoy hiciste todo! Mañana hay hábitos nuevos, y la huerta sigue dando monedas.' : '¡Hoy hiciste todo! Mañana seguimos arreglando.'
    }
    if (s.stars === 0) return 'Cumplí tus hábitos de hoy y me traés estrellas para seguir arreglando.'
    return `Tenés ${s.stars} ⭐. ¿Qué arreglamos?`
  }


  const tickHabit = (id: string, e: MouseEvent<HTMLButtonElement>) => {
    const row = e.currentTarget
    if (!idle.completeHabit(id)) return
    fly(row.querySelector('.row__reward') ?? row, '.ix-res--stars', '⭐')
    setToast({ key: Date.now(), title: PRAISE[Math.floor(Math.random() * PRAISE.length)], sub: '+1 ⭐ para arreglar el rancho' })
  }

  const repair = (f: Fix) => {
    if (working || s.stars < f.stars || s.coins < f.coins) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setWorking(f)
    setCheer((c) => c + 1)
    setSay({ key: Date.now(), text: '¡Manos a la obra!' })
    window.setTimeout(() => {
      idle.fix(f.id)
      setWorking(null)
      setBurst((b) => ({ key: b.key + 1, spot: f.spot }))
      setSay({ key: Date.now(), text: f.line })
      if (f.id === 'huerta') {
        window.setTimeout(() => setSay({ key: Date.now(), text: `La huerta da ${HUERTA.perHour} 🪙 por hora, aunque no estés. ¡Volvé a cosechar!` }), 4000)
      }
    }, WORK_MS)
  }

  const harvestNow = (e: MouseEvent<HTMLElement>) => {
    const got = idle.collectHuerta()
    if (got > 0) fly(e.currentTarget, '.ix-res--coins', 'ui_moneda', Math.min(6, Math.ceil(got / 10)))
  }

  const overlay = (
    <>
      {/* placeholder ruin until the ChatGPT art: the patio is dull and dusty, and gets its colour back */}
      <div className="ix-ruin" style={{ opacity: ruin }} />
      {!s.fixed.includes('yuyos') &&
        WEEDS.map((w, i) => (
          <span key={i} className={`ix-weed${working?.id === 'yuyos' ? ' ix-weed--going' : ''}`} style={{ ...at(w), fontSize: `${w.s * 2.2}em` }}>
            🌾
          </span>
        ))}
      {planted && (
        <div className="ix-garden" style={at(HUERTA.spot)}>
          <span>🥬</span>
          <span>🥕</span>
          <span>🌱</span>
          <span>🥬</span>
        </div>
      )}
      {planted && harvest > 0 && (
        <button className="ix-harvest" style={at({ x: HUERTA.spot.x, y: HUERTA.spot.y - 9 })} onClick={harvestNow}>
          <img src={art('ui_moneda')} alt="" />+{harvest}
        </button>
      )}
      {!working &&
        shown.map((f) => (
          <button
            key={f.id}
            className={`ix-mark${s.stars >= f.stars && s.coins >= f.coins ? ' ix-mark--ready' : ''}`}
            style={at(f.spot)}
            onClick={() => repair(f)}
            aria-label={f.name}
          >
            {f.emoji}
          </button>
        ))}
      {working && (
        <div className="ix-work" style={at(working.spot)}>
          <span className="ix-work__dust" />
          <span className="ix-work__dust ix-work__dust--2" />
          <span className="ix-work__hammer">🔨</span>
        </div>
      )}
      <div className="ix-burst" style={at(burst.spot)}>
        <Confetti burstKey={burst.key} count={26} spread={0.8} />
      </div>
    </>
  )

  return (
    <div className="app ix">
      <Scene width={width} height={sceneH} view="ranch" items={[]} celebrateKey={cheer} overlay={overlay}>
        <div className="ix-top">
          <h1>El rancho de Paucho</h1>
          <div className="ix-res">
            <span className="ix-res__pill ix-res--stars">⭐ {s.stars}</span>
            <span className="ix-res__pill ix-res--coins">
              <img src={art('ui_moneda')} alt="" />
              {s.coins}
            </span>
            {testMode && (
              <button className="ix-res__pill" onClick={() => setTestMenu(true)} aria-label="Menú de prueba">
                🛠
              </button>
            )}
          </div>
        </div>
        <div className="ix-say" key={say?.key ?? 0}>
          <img src={art('g_avatar')} alt="" />
          <p>{say?.text ?? greeting()}</p>
        </div>
      </Scene>

      <div className="panel ix-panel">
        <section className="card ix-fixes">
          <h3>
            Arreglos del rancho
            <span>
              {s.fixed.length}/{FIXES.length}
            </span>
          </h3>
          {pending.length === 0 && <p className="ix-note">¡Quedó como nuevo! Pronto: edificios nuevos y viajes al pueblo.</p>}
          <ul>
            {shown.map((f) => {
              const can = s.stars >= f.stars && s.coins >= f.coins
              return (
                <li key={f.id} className="ix-fix">
                  <span className="ix-fix__emoji">{f.emoji}</span>
                  <div className="ix-fix__text">
                    <strong>{f.name}</strong>
                    <span className="ix-cost">
                      <b className={s.stars >= f.stars ? '' : 'ix-cost--short'}>⭐ {f.stars}</b>
                      {f.coins > 0 && (
                        <b className={s.coins >= f.coins ? '' : 'ix-cost--short'}>
                          <img src={art('ui_moneda')} alt="" /> {f.coins}
                        </b>
                      )}
                    </span>
                  </div>
                  <button className={`btn ${can ? 'btn--gold' : 'btn--light'} ix-fix__go`} disabled={!can || !!working} onClick={() => repair(f)}>
                    {working?.id === f.id ? '…' : 'Arreglar'}
                  </button>
                </li>
              )
            })}
          </ul>
          {pending.length > 0 && s.stars < (shown[0]?.stars ?? 0) && (
            <p className="ix-note">Cada hábito de hoy te da una ⭐ para seguir arreglando.</p>
          )}
        </section>

        {planted && (
          <section className="card ix-huerta">
            <div>
              <strong>🥕 La huerta</strong>
              <small>
                Da {HUERTA.perHour} monedas por hora y guarda hasta {HUERTA.capHours} h.
              </small>
            </div>
            <button className="btn btn--light" disabled={harvest <= 0} onClick={harvestNow}>
              {harvest > 0 ? `Cosechar +${harvest}` : 'Creciendo…'}
            </button>
          </section>
        )}

        <section className="card today">
          <h3>
            Hábitos de hoy
            <span>
              {done.length}/{IDLE_HABITS.length}
            </span>
          </h3>
          <ul>
            {IDLE_HABITS.map((h) => {
              const on = done.includes(h.id)
              return (
                <li key={h.id}>
                  <button className={`row${on ? ' row--done' : ''}`} onClick={(e) => (on ? idle.uncompleteHabit(h.id) : tickHabit(h.id, e))}>
                    <HabitIcon habit={h} />
                    <span>{h.name}</span>
                    {!on && <em className="row__reward">+1 ⭐</em>}
                    <Check on={on} />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="card ix-locked">
          <span>🔒</span>
          <div>
            <strong>El galpón</strong>
            <small>Hacen falta clavos del pueblo. Pronto: viajes a caballo.</small>
          </div>
        </section>
      </div>

      {toast && <HabitToast key={toast.key} title={toast.title} sub={toast.sub} />}

      {testMenu && (
        <div className="overlay" onClick={() => setTestMenu(false)}>
          <div className="modal testmenu" onClick={(e) => e.stopPropagation()}>
            <h2>Menú de prueba</h2>
            <button onClick={() => idle.debugStars()}>+5 ⭐</button>
            <button onClick={() => idle.debugHour()}>Pasar 1 hora</button>
            <button onClick={() => idle.debugNextDay()}>Pasar al día siguiente</button>
            <button
              className="testmenu__danger"
              onClick={() => {
                if (confirm('¿Empezar de cero?')) idle.debugReset()
                setTestMenu(false)
              }}
            >
              Empezar de cero
            </button>
            <button className="testmenu__close" onClick={() => setTestMenu(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
