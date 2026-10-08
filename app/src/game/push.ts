// Daily notifications: the phone subscribes to Web Push here; a scheduled GitHub
// Action (.github/workflows/reminder.yml) sends them at 9:00, 16:00 and 21:00 (Madrid).
// iPhone only allows this once Gauchito is added to the Home Screen.
import { saveReminderSnapshot } from './reminderSnapshot'

/** VAPID public key (the private half lives only in the GitHub secret). */
const VAPID_PUBLIC_KEY = 'BCp_BYxwkOCUJcUayhzQTSXevG3sz8tBXnbzUht2Bso5O9TI_vyP8bKTezjZu4rTEjJ88yNiRtRS2u6CIDFuxW8'

export type NotificationKind = 'morning' | 'reminder' | 'night'

/** The three daily notifications; the times must match .github/workflows/reminder.yml. */
export const NOTIFICATIONS: { kind: NotificationKind; time: string; emoji: string }[] = [
  { kind: 'morning', time: '9:00', emoji: '☀️' },
  { kind: 'reminder', time: '16:00', emoji: '🧉' },
  { kind: 'night', time: '21:00', emoji: '🌙' },
]

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
  if (isIOS() && !isStandalone()) return { ok: false, reason: 'Primero agregá Gauchito a tu pantalla de inicio y abrilo desde ahí.' }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, reason: 'No diste permiso para notificaciones. Podés habilitarlo en Ajustes del teléfono.' }
  const reg = await navigator.serviceWorker.ready
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) }))
  return { ok: true, subscription: JSON.stringify(sub) }
}

/** Shows one of today's notifications right away, with the text it would have now. */
export async function testNotification(kind: NotificationKind) {
  await saveReminderSnapshot()
  const reg = await navigator.serviceWorker.ready
  reg.active?.postMessage({ type: 'test-reminder', kind })
}
