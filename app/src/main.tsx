import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/nunito/900.css'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './game/push'
import { startReminderSnapshots } from './game/reminderSnapshot'
import { installTouchFeedback } from './game/sound'

// The daily notifications: the service worker shows them, from a snapshot of today kept
// in IndexedDB (src/game/push.ts, src/game/reminderSnapshot.ts).
registerServiceWorker()
startReminderSnapshots()

// every touch ticks (sound and haptic); the first one also starts the music
installTouchFeedback()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
