import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/nunito/900.css'
import './index.css'
import App from './App.tsx'
import { installTouchFeedback } from './game/sound'

// This build (branch "areas", published at /areas/) sends no notifications yet: they stay
// with the app on main. Re-enable registerServiceWorker() and startReminderSnapshots()
// (src/game/push.ts, src/game/reminderSnapshot.ts) when it replaces it.

// every touch ticks (sound and haptic); the first one also starts the music
installTouchFeedback()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
