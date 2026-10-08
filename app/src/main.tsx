import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/nunito/900.css'
import './index.css'
import './idle/idle.css'
import { IdleApp } from './idle/IdleApp'

// Branch idle-tycoon: the app is only the idle exploration (no onboarding, no reminders).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IdleApp />
  </StrictMode>,
)
