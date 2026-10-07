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

registerServiceWorker()
startReminderSnapshots()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
