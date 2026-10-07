import { useRef, useState } from 'react'
import { Button } from '../components/ui'
import { enableReminders, isIOS, isStandalone, pushSupported, REMINDER_TIME, testNotification } from '../game/push'
import { actions, useGame } from '../game/store'

export function Settings({ onClose, onTestMenu }: { onClose: () => void; onTestMenu: () => void }) {
  const subscription = useGame((s) => s.pushSubscription)
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
    a.download = `guachito-copia-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importBackup = async (f: File | undefined) => {
    if (!f) return
    const ok = actions.importData(await f.text())
    setMsg(ok ? '¡Listo! Recuperé tu copia.' : 'Ese archivo no es una copia de Guachito.')
  }

  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div className="modal settings" onClick={(e) => e.stopPropagation()}>
        <h2>Ajustes</h2>

        {needsInstall && (
          <section className="settings__block settings__block--warn">
            <h3>Instalá Guachito</h3>
            <p>
              En Safari tocá <strong>Compartir</strong> → <strong>Agregar a inicio</strong> y abrilo desde el ícono. Así tus datos quedan
              guardados y podés recibir el recordatorio.
            </p>
          </section>
        )}

        <section className="settings__block">
          <h3>Recordatorio diario · {REMINDER_TIME}</h3>
          {!pushSupported() && <p>Este navegador no admite notificaciones.</p>}
          {pushSupported() && !subscription && (
            <>
              <p>Te aviso todos los días a las {REMINDER_TIME}, según lo que tengas hecho y lo que te falte.</p>
              <Button onClick={turnOn} disabled={needsInstall}>
                Activar notificaciones
              </Button>
            </>
          )}
          {subscription && (
            <>
              <p>
                ✅ Notificaciones activadas en este teléfono. Último paso: copiá este código y pasáselo a Claude (o guardalo como secreto{' '}
                <code>PUSH_SUBSCRIPTION</code> en GitHub).
              </p>
              <textarea className="settings__code" readOnly value={subscription} rows={3} onFocus={(e) => e.target.select()} />
              <div className="settings__row">
                <Button variant="light" onClick={copy}>
                  {copied ? '¡Copiado!' : 'Copiar código'}
                </Button>
                <Button variant="light" onClick={() => testNotification()}>
                  Ver mensaje de hoy
                </Button>
              </div>
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
