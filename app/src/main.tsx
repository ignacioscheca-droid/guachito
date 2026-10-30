import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/nunito/900.css'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { installErrorLog } from './game/errorLog'
import { registerServiceWorker } from './game/push'
import { startReminderSnapshots } from './game/reminderSnapshot'
import { installTouchFeedback } from './game/sound'

// The daily notifications: the service worker shows them, from a snapshot of today kept
// in IndexedDB (src/game/push.ts, src/game/reminderSnapshot.ts).
// failures are kept on the phone for testing (Ajustes → Errores, src/game/errorLog.ts)
installErrorLog()
registerServiceWorker()
startReminderSnapshots()

// every touch ticks (sound and haptic); the first one also starts the music
installTouchFeedback()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
