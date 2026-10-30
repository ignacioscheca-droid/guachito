import { useRef, useState } from 'react'
import { Button } from '../components/ui'
import { clearErrors, errorLogAsText, formatTime, kindLabel, stateLine, useErrorLog } from '../game/errorLog'
import { enableReminders, isIOS, isStandalone, NOTIFICATIONS, pushSupported, testNotification } from '../game/push'
import { setSoundSettings, sfx, useSoundSettings } from '../game/sound'
import { actions, useGame } from '../game/store'

/** An on/off pill. */
function Toggle({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`toggle${on ? ' toggle--on' : ''}`} onClick={() => onChange(!on)}>
      <i />
    </button>
  )
}

/** Music, sound effects and vibration: on or off, and how loud. */
function SoundBlock() {
  const so = useSoundSettings()
  return (
    <section className="settings__block">
      <h3>Sonido y vibración</h3>
      <div className="sound__row">
        <span>🎵 Música</span>
        <Toggle label="Música" on={so.music} onChange={(music) => setSoundSettings({ music })} />
      </div>
      <input
        className="sound__volume"
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={so.musicVolume}
        disabled={!so.music}
        aria-label="Volumen de la música"
        onChange={(e) => setSoundSettings({ musicVolume: Number(e.target.value) })}
      />
      <div className="sound__row">
        <span>🔔 Efectos</span>
        <Toggle label="Efectos" on={so.sfx} onChange={(sfxOn) => setSoundSettings({ sfx: sfxOn })} />
      </div>
      <input
        className="sound__volume"
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={so.sfxVolume}
        disabled={!so.sfx}
        aria-label="Volumen de los efectos"
        onChange={(e) => setSoundSettings({ sfxVolume: Number(e.target.value) })}
        onPointerUp={() => sfx('check')}
      />
      <div className="sound__row">
        <span>📳 Vibración</span>
        <Toggle label="Vibración" on={so.haptics} onChange={(haptics) => setSoundSettings({ haptics })} />
      </div>
    </section>
  )
}

/** Failures kept on this phone (src/game/errorLog.ts), to copy and pass on. */
function ErrorsBlock() {
  const list = useErrorLog()
  const [msg, setMsg] = useState<string | null>(null)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(errorLogAsText(list))
      setMsg('¡Copiado! Pegalo en el chat.')
    } catch {
      setMsg('No pude copiar. Abrí la lista y mantené apretado el texto para copiarlo.')
    }
  }

  return (
    <section className="settings__block">
      <h3>Errores ({list.length})</h3>
      {!list.length && <p>No hay errores guardados. Si algo se rompe, queda anotado acá.</p>}
      {list.length > 0 && (
        <>
          <p>Si algo falló, copiá la lista y mandásela a Claude.</p>
          <details className="settings__details">
            <summary>Ver la lista</summary>
            <ul className="errlog">
              {[...list].reverse().map((e) => (
                <li key={e.t + e.message} className={`errlog__item errlog__item--${e.kind}`}>
                  <b>
                    {formatTime(e.t)} · {kindLabel(e.kind)} · {e.screen}
                  </b>
                  <span>{e.message}</span>
                  <small>{stateLine(e.state)}</small>
                  {e.stack && <pre>{e.stack}</pre>}
                </li>
              ))}
            </ul>
          </details>
          <div className="settings__row">
            <Button variant="light" onClick={copy}>
              Copiar
            </Button>
            <Button
              variant="light"
              onClick={() => {
                clearErrors()
                setMsg(null)
              }}
            >
              Borrar
            </Button>
          </div>
        </>
      )}
      {msg && <p className="settings__msg">{msg}</p>}
    </section>
  )
}

export function Settings({ onClose, onTestMenu }: { onClose: () => void; onTestMenu: () => void }) {
  const subscription = useGame((s) => s.pushSubscription)
  const savedName = useGame((s) => s.name)
  const savedPlayer = useGame((s) => s.playerName)
  const [companion, setCompanion] = useState(savedName)
  const [player, setPlayer] = useState(savedPlayer)
  const [msg, setMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const needsInstall = isIOS() && !isStandalone()

  const turnOn = async () => {
    setMsg(null)
    const r = await enableReminders()
    if (r.ok) actions.setPushSubscription(r.subscription)
    else setMsg(r.reason)
  }

  const copy = async () => {
    if (!subscription) return
    try {
      await navigator.clipboard.writeText(subscription)
      setCopied(true)
    } catch {
      setMsg('No pude copiar. Mantené apretado el código para copiarlo.')
    }
  }

  const exportBackup = () => {
    const blob = new Blob([actions.exportData()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `gauchito-copia-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importBackup = async (f: File | undefined) => {
    if (!f) return
    const ok = actions.importData(await f.text())
    setMsg(ok ? '¡Listo! Recuperé tu copia.' : 'Ese archivo no es una copia de Gauchito.')
  }

  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div className="modal settings" onClick={(e) => e.stopPropagation()}>
        <h2>Ajustes</h2>

        <SoundBlock />

        <section className="settings__block">
          <h3>Nombres</h3>
          <label className="settings__field">
            <span>Tu nombre</span>
            <input value={player} maxLength={24} placeholder="¿Cómo te llamás?" onChange={(e) => setPlayer(e.target.value)} />
          </label>
          <label className="settings__field">
            <span>Tu Gauchito</span>
            <input value={companion} maxLength={16} onChange={(e) => setCompanion(e.target.value)} />
          </label>
          <Button
            variant="light"
            disabled={!companion.trim() || (companion.trim() === savedName && player.trim() === savedPlayer)}
            onClick={() => {
              actions.setNames(companion, player)
              setMsg('¡Listo! Guardé los nombres.')
            }}
          >
            Guardar nombres
          </Button>
        </section>

        {needsInstall && (
          <section className="settings__block settings__block--warn">
            <h3>Instalá Gauchito</h3>
            <p>
              En Safari tocá <strong>Compartir</strong> → <strong>Agregar a inicio</strong> y abrilo desde el ícono. Así tus datos quedan
              guardados y podés recibir las notificaciones.
            </p>
          </section>
        )}

        <section className="settings__block">
          <h3>Notificaciones</h3>
          {!pushSupported() && <p>Este navegador no admite notificaciones.</p>}
          {pushSupported() && !subscription && (
            <>
              <p>
                Te escribo tres veces por día: buen día a las 9, un recordatorio a las 16 según lo que tengas hecho y lo que te falte, y
                buenas noches a las 21.
              </p>
              <Button onClick={turnOn} disabled={needsInstall}>
                Activar notificaciones
              </Button>
            </>
          )}
          {subscription && (
            <>
              <p>✅ Activadas en este teléfono: buen día a las 9, un recordatorio a las 16 y buenas noches a las 21.</p>
              <p>Ver cómo quedan hoy:</p>
              <div className="settings__row">
                {NOTIFICATIONS.map((n) => (
                  <Button key={n.kind} variant="light" onClick={() => testNotification(n.kind)}>
                    {n.emoji} {n.time}
                  </Button>
                ))}
              </div>
              <details className="settings__details">
                <summary>Código del teléfono</summary>
                <p>
                  Para que te lleguen, este código tiene que estar en GitHub (el secreto <code>PUSH_SUBSCRIPTION</code>). Copialo y en la Mac
                  corré el comando que te pasó Claude.
                </p>
                <textarea className="settings__code" readOnly value={subscription} rows={3} onFocus={(e) => e.target.select()} />
                <Button variant="light" onClick={copy}>
                  {copied ? '¡Copiado!' : 'Copiar código'}
                </Button>
              </details>
            </>
          )}
        </section>

        <section className="settings__block">
          <h3>Copia de seguridad</h3>
          <p>Guardá tus hábitos, herraduras y la casita en un archivo, por si cambiás de teléfono.</p>
          <div className="settings__row">
            <Button variant="light" onClick={exportBackup}>
              Exportar
            </Button>
            <Button variant="light" onClick={() => file.current?.click()}>
              Importar
            </Button>
          </div>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => importBackup(e.target.files?.[0])} />
        </section>

        <ErrorsBlock />

        {msg && <p className="settings__msg">{msg}</p>}

        <Button variant="ghost" onClick={onTestMenu}>
          Menú de prueba
        </Button>
        <Button onClick={onClose}>Listo</Button>
      </div>
    </div>
  )
}
