// Daily reminder: the phone subscribes to Web Push here; a scheduled GitHub
// Action (.github/workflows/reminder.yml) sends the notification at 16:00.
// iPhone only allows this once Guachito is added to the Home Screen.
import { saveReminderSnapshot } from './reminderSnapshot'

/** VAPID public key (the private half lives only in the GitHub secret). */
const VAPID_PUBLIC_KEY = 'BCp_BYxwkOCUJcUayhzQTSXevG3sz8tBXnbzUht2Bso5O9TI_vyP8bKTezjZu4rTEjJ88yNiRtRS2u6CIDFuxW8'

export const REMINDER_TIME = '16:00'

export const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent)
export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch(() => {
    /* no SW (e.g. private mode): the app still works, just without reminders */
  })
}

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

/** Asks for permission and subscribes; returns the subscription JSON to hand to GitHub. */
export async function enableReminders(): Promise<{ ok: true; subscription: string } | { ok: false; reason: string }> {
  if (!pushSupported()) return { ok: false, reason: 'Este navegador no admite notificaciones.' }
  if (isIOS() && !isStandalone()) return { ok: false, reason: 'Primero agregá Guachito a tu pantalla de inicio y abrilo desde ahí.' }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, reason: 'No diste permiso para notificaciones. Podés habilitarlo en Ajustes del teléfono.' }
  const reg = await navigator.serviceWorker.ready
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) }))
  return { ok: true, subscription: JSON.stringify(sub) }
}

/** Shows today's reminder right away (the same text the 16:00 one would have). */
export async function testNotification() {
  await saveReminderSnapshot()
  const reg = await navigator.serviceWorker.ready
  reg.active?.postMessage({ type: 'test-reminder' })
}
