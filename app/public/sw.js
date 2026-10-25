// Gauchito service worker: shows the daily notifications and opens the app on tap.
// Three a day (.github/workflows/reminder.yml): "morning" at 9:00, "reminder" at 16:00
// and "night" at 21:00. The push from GitHub only says which one it is; the text is
// written here, on the phone. Morning and night are plain greetings. The reminder reads
// the snapshot the app keeps in IndexedDB (src/game/reminderSnapshot.ts): what is done
// today, what is missing, and what Paucho is building. This is Gauchito 2's (branch
// "areas"): its snapshot is the "gauchito-v2" database, with the obras (v: 3).
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// ---- reading the snapshot ----------------------------------------------

function readSnapshot() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('gauchito-v2', 1)
      req.onupgradeneeded = () => req.result.createObjectStore('kv')
      req.onerror = () => resolve(null)
      req.onsuccess = () => {
        const db = req.result
        try {
          const get = db.transaction('kv').objectStore('kv').get('reminder')
          get.onsuccess = () => resolve(get.result || null)
          get.onerror = () => resolve(null)
        } catch {
          resolve(null)
        }
      }
    } catch {
      resolve(null)
    }
  })
}

// ---- writing the message -----------------------------------------------

const pad = (n) => String(n).padStart(2, '0')
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const hhmm = (t) => {
  const d = new Date(t)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const label = (h) => `${h.emoji} ${h.name}`
const list = (hs) => {
  const xs = hs.map(label)
  return xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`
}
/** Same variant all day, the next one the next day. */
const pick = (variants, now) => variants[Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000) % variants.length]

const FALLBACK = { title: 'Gauchito 🧉', body: '¿Cómo vienen los hábitos de hoy?' }

/** What the reminder needs to know about today. */
function today(s, now) {
  const name = s.name || 'Gauchito'
  const you = (s.playerName || '').trim()
  const completions = s.completions || {}
  const doneIds = completions[dayKey(now)] || []
  const work = s.work || {}
  return {
    name,
    you,
    toYou: you ? `, ${you}` : '', // "¡Vas 1/3, Nacho!"
    hey: you ? `${you}, ` : '', // "Nacho, solo falta…"
    work,
    job: work.job || 'la próxima obra',
    finished: work.status === 'done' || (work.status === 'working' && work.doneAt && now.getTime() >= work.doneAt),
    completions,
    done: s.habits.filter((h) => doneIds.includes(h.id)),
    missing: s.habits.filter((h) => !doneIds.includes(h.id)),
  }
}
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1)

// Buen día and buenas noches are only greetings from Gauchito: they never look at the
// habits. One variant per day, in turn.
const GREETINGS = {
  morning: (you) => [`¡Buen día${you ? `, ${you}` : ''}! ¡Qué buena mañana para unos mates!`, '¡Arriba, que hoy va a ser un gran día!'],
  night: () => ['¡Día completo, estoy orgulloso de vos! Que descanses.', '¡Qué sueño! Fue un día duro, ¿vamos a descansar?'],
}

function greet(kind, s, now = new Date()) {
  const name = (s && s.name) || 'Gauchito'
  const you = ((s && s.playerName) || '').trim()
  return { title: `${name} ${kind === 'morning' ? '☀️' : '🌙'}`, body: pick(GREETINGS[kind](you), now) }
}

function composeReminder(s, now = new Date()) {
  if (!s || !Array.isArray(s.habits)) return FALLBACK
  const { name, toYou, hey, work, job, finished, completions, done, missing } = today(s, now)
  const title = `${name} 🧉`

  // What Paucho is up to comes first: it's the most interesting news.
  // the trip to the south is a job too, but he travels instead of building
  if (work.trip) {
    if (finished) return { title: `¡${name} volvió del sur!`, body: cap(`${hey}entrá, que tiene una historia para contarte 🧉`) }
    if (work.status === 'ready') return { title: `¡${name} está listo!`, body: `Juntó toda la energía${toYou}. Entrá a mandarlo de viaje al sur 🐴` }
    if (work.status === 'working') return { title, body: `${name} anda de viaje por el sur. Vuelve a las ${hhmm(work.doneAt)}.` }
  }
  if (finished) {
    return { title: `¡${name} terminó ${job}!`, body: cap(`${hey}entrá a ver cómo quedó 🔨✨`) }
  }
  if (work.status === 'ready') {
    return { title: `¡${name} está listo!`, body: `Juntó toda la energía${toYou}. Entrá a mandarlo a construir ${job} 🔨` }
  }
  if (work.status === 'working') {
    const extra = missing.length ? ` Mientras, ${label(missing[0])} te da herraduras para la casita.` : ''
    return { title, body: `${name} está construyendo ${job}. Termina a las ${hhmm(work.doneAt)}.${extra}` }
  }

  if (s.habits.length > 0 && missing.length === 0) {
    return {
      title: `¡Día completo${toYou}! 🎉`,
      body: pick(
        [
          `Cumpliste todo. ${name} toma unos mates en el rancho, orgulloso de vos.`,
          `Hoy no faltó nada. ${name} ya está pensando en ${job}.`,
          `${list(done)}: todo hecho. ¡Qué día!`,
        ],
        now,
      ),
    }
  }

  if (done.length === 0) {
    // Nothing yet today: a warm word if yesterday went by without anything.
    const activeDays = Object.keys(completions).filter((d) => (completions[d] || []).length > 0)
    const last = activeDays.sort().pop()
    const yesterday = dayKey(new Date(now.getTime() - 86400000))
    if (last && last < yesterday) {
      return { title, body: `${name} te extrañó${toYou}. Sin apuro: ¿arrancamos hoy con ${label(missing[0])}?` }
    }
    return {
      title,
      body: pick(
        [
          `${hey}${name} ya ensilló el caballo. Hoy te esperan ${list(missing)}.`,
          `¿Arrancamos${toYou}? Con ${label(missing[0])} ${name} empieza a juntar energía.`,
          `${name} te espera en el rancho${toYou}. Hoy toca ${list(missing)}.`,
        ],
        now,
      ),
    }
  }

  // Today's bar is already full: what's left gives herraduras for the casita.
  if (s.resting) {
    return { title, body: `¡Vas ${done.length}/${s.habits.length}${toYou}! Cada hábito que sumes ahora son herraduras para la casita de ${name}.` }
  }
  const toGo = typeof s.toGo === 'number' ? s.toGo : missing.length
  if (toGo === 1) {
    return {
      title,
      body: pick(
        [cap(`${hey}con un hábito más ${name} arranca ${job}. ¿${label(missing[0])}?`), `¡Casi${toYou}! Te falta uno para que ${name} se ponga a construir.`],
        now,
      ),
    }
  }
  return {
    title,
    body: `¡Vas ${done.length}/${s.habits.length}${toYou}! Ya hiciste ${list(done)}. Con ${toGo} más ${name} arranca ${job}.`,
  }
}
function compose(kind, s, now = new Date()) {
  return GREETINGS[kind] ? greet(kind, s, now) : composeReminder(s, now)
}
self.compose = compose // exposed for tests

async function showReminder(kind = 'reminder', fallback = {}) {
  const snapshot = await readSnapshot()
  const msg = snapshot || GREETINGS[kind] ? compose(kind, snapshot) : { ...FALLBACK, ...fallback }
  return self.registration.showNotification(msg.title, {
    body: msg.body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    // One tag per kind, so a new one never silently replaces an earlier one.
    tag: kind === 'reminder' ? 'gauchito2-daily' : `gauchito2-${kind}`,
  })
}

// ---- events ---------------------------------------------------------------

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    if (event.data) payload = event.data.json()
  } catch {
    /* plain-text payload: ignore */
  }
  const { kind, title, body } = payload
  event.waitUntil(showReminder(kind, title && body ? { title, body } : {}))
})

// "Ver mensajes" in Ajustes asks for one of today's messages right away.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'test-reminder') event.waitUntil(showReminder(event.data.kind))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => 'focus' in w)
      return open ? open.focus() : self.clients.openWindow(self.registration.scope)
    }),
  )
})
