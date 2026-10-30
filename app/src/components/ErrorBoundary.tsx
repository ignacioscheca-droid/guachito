import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logError } from '../game/errorLog'
import { Button } from './ui'

/**
 * Around the whole app: a render error is saved in the error log (Ajustes → Errores) and
 * the player gets a way back instead of a white screen.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError('react', error.message, `${error.stack ?? ''}\n${info.componentStack ?? ''}`)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="screen errorfall">
        <h2>Uy, se me trabó algo</h2>
        <p>Ya lo anoté para arreglarlo. Probá de nuevo; tu progreso está guardado.</p>
        <Button onClick={() => this.setState({ failed: false })}>Volver a intentar</Button>
      </div>
    )
  }
}
