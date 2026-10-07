// Gauchito service worker: shows the daily reminder and opens the app on tap.
// The reminder text is written here, on the phone, from the snapshot the app keeps
// in IndexedDB (src/game/reminderSnapshot.ts): what is done today, what is missing,
// and where Gauchito is. The push from GitHub only says "it's time".
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// ---- reading the snapshot ----------------------------------------------

function readSnapshot() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('guachito', 1)
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
/** Same variant all day, a different one each day. */
const pick = (variants, now) => variants[now.getDate() % variants.length]

const FALLBACK = { title: 'Gauchito 🧉', body: '¿Cómo vienen los hábitos de hoy?' }

function composeReminder(s, now = new Date()) {
  if (!s || !Array.isArray(s.habits)) return FALLBACK
  const name = s.name || 'Gauchito'
  const title = `${name} 🧉`
  const you = (s.playerName || '').trim()
  const toYou = you ? `, ${you}` : '' // "¡Vas 1/3, Nacho!"
  const hey = you ? `${you}, ` : '' // "Nacho, solo falta…"
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1)
  const a = s.adventure || {}

  // Where Guachito is comes first: it's the most interesting news.
  const back = a.status === 'returned' || (a.status === 'running' && a.returnAt && now.getTime() >= a.returnAt)
  if (back) {
    const where = a.episode ? ` de “${a.episode}”` : ''
    const gift = s.rewardItem ? ` y un regalo para el rancho: ${s.rewardItem}` : ''
    return { title: `¡${name} volvió!`, body: cap(`${hey}volvió${where} con una historia para contarte${gift}.`) }
  }
  if (a.status === 'running') {
    return { title, body: `${name} anda por las pampas${a.episode ? ` (“${a.episode}”)` : ''}. Vuelve a las ${hhmm(a.returnAt)}.` }
  }
  if (a.status === 'ready') {
    return { title: `¡${name} está listo!`, body: `Juntó toda la energía${toYou}. Entrá a mandarlo de aventura 🐴` }
  }

  const completions = s.completions || {}
  const today = completions[dayKey(now)] || []
  const done = s.habits.filter((h) => today.includes(h.id))
  const missing = s.habits.filter((h) => !today.includes(h.id))

  if (s.habits.length > 0 && missing.length === 0) {
    return {
      title: `¡Día completo${toYou}! 🎉`,
      body: pick(
        [
          `Cumpliste todo. ${name} toma unos mates en el rancho, orgulloso de vos.`,
          `Hoy no faltó nada. ${name} ya está pensando en la aventura de mañana.`,
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
          `El perro y ${name} te esperan en el rancho${toYou}. Hoy toca ${list(missing)}.`,
        ],
        now,
      ),
    }
  }

  if (missing.length === 1) {
    return {
      title,
      body: pick(
        [cap(`${hey}solo falta ${label(missing[0])} y ${name} sale de aventura.`), `¡Casi${toYou}! Te queda ${label(missing[0])} para completar el día.`],
        now,
      ),
    }
  }
  return { title, body: `¡Vas ${done.length}/${s.habits.length}${toYou}! Ya hiciste ${list(done)}. Faltan ${list(missing)}.` }
}
self.composeReminder = composeReminder // exposed for tests

async function showReminder(fallback) {
  const snapshot = await readSnapshot()
  const msg = snapshot ? composeReminder(snapshot) : { ...FALLBACK, ...fallback }
  return self.registration.showNotification(msg.title, {
    body: msg.body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'guachito-daily',
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
  event.waitUntil(showReminder(payload))
})

// "Probar" in Ajustes asks for today's message right away.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'test-reminder') event.waitUntil(showReminder())
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
