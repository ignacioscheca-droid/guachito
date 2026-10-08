// Sends Gauchito's daily notifications as Web Push: buen día at 9:00, the reminder
// at 16:00 and buenas noches at 21:00, Madrid time. Run by .github/workflows/reminder.yml.
// Secrets (env):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  - the app's push keys
//   PUSH_SUBSCRIPTION                    - JSON copied from the app (Ajustes > Notificaciones)
// SCHEDULE is the cron that started the run. Each cron fires at :50 UTC, ten minutes
// before the hour, because GitHub delays (and sometimes drops) runs at the top of the
// hour; the script works out which full hour that is in Madrid, waits for it and sends.
// Every time has two crons (summer and winter time): the one that doesn't land on a
// Madrid slot exits. KIND (manual runs) sends that notification right away.
// The push only says which one it is: the phone writes the text (app/public/sw.js).
import webpush from 'web-push'

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTION, SCHEDULE = '', KIND = '' } = process.env

/** Madrid hour -> notification. */
const SLOTS = { 9: 'morning', 16: 'reminder', 21: 'night' }
/** Used by the phone only if it has no snapshot of the app yet. */
const FALLBACK = {
  morning: { title: 'Gauchito ☀️', body: '¡Arriba, que hoy va a ser un gran día!' },
  reminder: { title: 'Gauchito 🧉', body: '¿Cómo vienen los hábitos de hoy? Gauchito ya ensilló el caballo.' },
  night: { title: 'Gauchito 🌙', body: '¡Qué sueño! Fue un día duro, ¿vamos a descansar?' },
}
/** How long the push service keeps trying if the phone is offline (a 9:00 "buen día" at noon is no use). */
const TTL_HOURS = { morning: 3, reminder: 4, night: 2 }
const LATE_LIMIT_MS = 90 * 60 * 1000

const madridHour = (d) =>
  Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: 'numeric', hourCycle: 'h23' }).format(d))

let kind = KIND
if (!kind) {
  const [min, hour] = SCHEDULE.split(' ').map(Number)
  if (!Number.isInteger(min) || !Number.isInteger(hour)) {
    console.log(`No schedule (${JSON.stringify(SCHEDULE)}) and no kind: nothing to do.`)
    process.exit(0)
  }
  // The full hour this cron is for, on the run's own day (allowing for runs that start past midnight).
  const now = new Date()
  const target = new Date(now)
  target.setUTCHours(hour, min + ((60 - min) % 60), 0, 0)
  if (target - now > 12 * 3600e3) target.setUTCDate(target.getUTCDate() - 1)
  if (now - target > 12 * 3600e3) target.setUTCDate(target.getUTCDate() + 1)

  kind = SLOTS[madridHour(target)]
  if (!kind) {
    console.log(`This cron is for ${madridHour(target)}:00 in Madrid, not a notification time: nothing to do.`)
    process.exit(0)
  }
  const late = now - target
  if (late > LATE_LIMIT_MS) {
    console.log(`GitHub started this run ${Math.round(late / 60000)} min late: skipping the ${kind} notification.`)
    process.exit(0)
  }
  if (late < 0) {
    console.log(`Waiting ${Math.round(-late / 1000)} s for ${madridHour(target)}:00 in Madrid…`)
    await new Promise((resolve) => setTimeout(resolve, -late))
  }
}
if (!FALLBACK[kind]) {
  console.error(`Unknown notification kind: ${kind}`)
  process.exit(1)
}
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !PUSH_SUBSCRIPTION) {
  console.log('Missing VAPID keys or PUSH_SUBSCRIPTION secret: skipping.')
  process.exit(0)
}

webpush.setVapidDetails('mailto:guachito@users.noreply.github.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
try {
  const payload = JSON.stringify({ kind, ...FALLBACK[kind] })
  const res = await webpush.sendNotification(JSON.parse(PUSH_SUBSCRIPTION), payload, { TTL: TTL_HOURS[kind] * 3600 })
  console.log(`Sent the ${kind} notification, status`, res.statusCode)
} catch (err) {
  // 404/410: the phone dropped the subscription; turn notifications on again in the app.
  console.error('Push failed:', err.statusCode, err.body)
  process.exit(1)
}
