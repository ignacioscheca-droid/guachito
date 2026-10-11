import { useRef, useState } from 'react'
import { Button } from '../components/ui'
import { isIOS, isStandalone } from '../game/push'
import { actions, useGame } from '../game/store'

export function Settings({ onClose, onTestMenu }: { onClose: () => void; onTestMenu: () => void }) {
  const savedName = useGame((s) => s.name)
  const savedPlayer = useGame((s) => s.playerName)
  const [companion, setCompanion] = useState(savedName)
  const [player, setPlayer] = useState(savedPlayer)
  const [msg, setMsg] = useState<string | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const needsInstall = isIOS() && !isStandalone()

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
          <p>Esta versión de prueba todavía no manda notificaciones: siguen llegando desde la app de siempre.</p>
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

        {msg && <p className="settings__msg">{msg}</p>}

        <Button variant="ghost" onClick={onTestMenu}>
          Menú de prueba
        </Button>
        <Button onClick={onClose}>Listo</Button>
      </div>
    </div>
  )
}
