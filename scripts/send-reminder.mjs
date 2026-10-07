// Sends Gauchito's daily reminder as a Web Push notification.
// Run by .github/workflows/reminder.yml. Secrets (env):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  - the app's push keys
//   PUSH_SUBSCRIPTION                    - JSON copied from the app (Ajustes > Recordatorio)
// REMINDER_HOUR (Europe/Madrid) gates the two UTC crons so it fires once, at the
// right local time, in both summer and winter time. FORCE=true skips the gate.
import webpush from 'web-push'

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTION, REMINDER_HOUR = '16', FORCE = 'false' } = process.env

const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: 'numeric', hourCycle: 'h23' }).format(new Date()))
if (FORCE !== 'true' && hour !== Number(REMINDER_HOUR)) {
  console.log(`Madrid hour is ${hour}, reminder is at ${REMINDER_HOUR}: nothing to do.`)
  process.exit(0)
}
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !PUSH_SUBSCRIPTION) {
  console.log('Missing VAPID keys or PUSH_SUBSCRIPTION secret: skipping.')
  process.exit(0)
}

const lines = [
  '¿Cómo vienen los hábitos de hoy? Gauchito ya ensilló el caballo.',
  'Gauchito tiene el mate listo. ¿Arrancamos con los hábitos?',
  'Cada hábito es energía para la aventura de hoy.',
  'El perro y Gauchito te esperan en el rancho.',
]
const body = lines[new Date().getUTCDate() % lines.length]

webpush.setVapidDetails('mailto:guachito@users.noreply.github.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
try {
  const res = await webpush.sendNotification(JSON.parse(PUSH_SUBSCRIPTION), JSON.stringify({ title: 'Gauchito 🧉', body }), { TTL: 6 * 3600 })
  console.log('Sent, status', res.statusCode)
} catch (err) {
  // 404/410: the phone dropped the subscription; turn notifications on again in the app.
  console.error('Push failed:', err.statusCode, err.body)
  process.exit(1)
}
