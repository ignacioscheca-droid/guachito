import { useRef, useState } from 'react'
import { Button } from '../components/ui'
import { enableReminders, isIOS, isStandalone, NOTIFICATIONS, pushSupported, testNotification } from '../game/push'
import { actions, useGame } from '../game/store'

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
                  Si reinstalás la app, copiá el código nuevo y pasáselo a Claude (es el secreto <code>PUSH_SUBSCRIPTION</code> en GitHub).
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
          <p>Guardá tus hábitos, monedas y rancho en un archivo, por si cambiás de teléfono.</p>
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

        {msg && <p className="settings__msg">{msg}</p>}

        <Button variant="ghost" onClick={onTestMenu}>
          Menú de prueba
        </Button>
        <Button onClick={onClose}>Listo</Button>
      </div>
    </div>
  )
}
