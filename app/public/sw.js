// Gauchito service worker: shows the daily notifications and opens the app on tap.
// Three a day (.github/workflows/reminder.yml): "morning" at 9:00, "reminder" at 16:00
// and "night" at 21:00. The text is written here, on the phone, from the snapshot the
// app keeps in IndexedDB (src/game/reminderSnapshot.ts): what is done today, what is
// missing, and where Gauchito is. The push from GitHub only says which one it is.
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

const FALLBACKS = {
  morning: { title: '¡Buen día! ☀️', body: 'Gauchito ya cebó el primer mate. ¿Arrancamos?' },
  reminder: { title: 'Gauchito 🧉', body: '¿Cómo vienen los hábitos de hoy?' },
  night: { title: 'Buenas noches 🌙', body: 'Gauchito ya se va a dormir. Mañana seguimos.' },
}
const FALLBACK = FALLBACKS.reminder

/** What every message needs to know about today. */
function today(s, now) {
  const name = s.name || 'Gauchito'
  const you = (s.playerName || '').trim()
  const a = s.adventure || {}
  const completions = s.completions || {}
  const doneIds = completions[dayKey(now)] || []
  return {
    name,
    you,
    toYou: you ? `, ${you}` : '', // "¡Vas 1/3, Nacho!"
    hey: you ? `${you}, ` : '', // "Nacho, solo falta…"
    a,
    back: a.status === 'returned' || (a.status === 'running' && a.returnAt && now.getTime() >= a.returnAt),
    where: a.episode ? ` de “${a.episode}”` : '',
    gift: s.rewardItem ? ` y un regalo para el rancho: ${s.rewardItem}` : '',
    completions,
    done: s.habits.filter((h) => doneIds.includes(h.id)),
    missing: s.habits.filter((h) => !doneIds.includes(h.id)),
  }
}
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1)

function composeMorning(s, now = new Date()) {
  if (!s || !Array.isArray(s.habits)) return FALLBACKS.morning
  const { name, toYou, a, back, where, done, missing } = today(s, now)
  const title = `¡Buen día${toYou}! ☀️`
  const andGift = s.rewardItem ? ' y un regalo para el rancho' : ''
  if (back) return { title, body: `${name} volvió${where} con una historia${andGift}. Ideal para leer con el primer mate 🧉` }
  if (a.status === 'running') return { title, body: `${name} salió temprano: anda por las pampas y vuelve a las ${hhmm(a.returnAt)}.` }
  if (a.status === 'ready') return { title, body: `${name} tiene toda la energía y te espera para salir de aventura 🐴` }
  if (s.habits.length === 0) return { title, body: `${name} ya cebó el primer mate. ¿Qué hacemos hoy?` }
  if (missing.length === 0) return { title, body: `¡Ya hiciste todo y recién arranca el día! ${name} no lo puede creer.` }
  if (done.length > 0) return { title, body: `Ya arrancaste con ${list(done)} 💪 Te ${missing.length === 1 ? 'queda' : 'quedan'} ${list(missing)}.` }
  const trip = s.nextEpisode ? `Con ${list(missing)}, hoy sale a “${s.nextEpisode}”.` : `Hoy te esperan ${list(missing)}.`
  return {
    title,
    body: pick(
      [
        `${name} ya cebó el primer mate. Hoy te esperan ${list(missing)}.`,
        `Arranca un día nuevo en el rancho. ${trip}`,
        `El sol ya salió en las pampas 🌄 ¿Arrancamos con ${label(missing[0])}?`,
      ],
      now,
    ),
  }
}

function composeNight(s, now = new Date()) {
  if (!s || !Array.isArray(s.habits)) return FALLBACKS.night
  const { name, toYou, a, back, where, done, missing } = today(s, now)
  const title = `Buenas noches${toYou} 🌙`
  const andGift = s.rewardItem ? ' y un regalo para el rancho' : ''
  if (back) return { title, body: `Antes de dormir: ${name} te trajo la historia${where}${andGift} 📖` }
  if (a.status === 'running') return { title, body: `${name} todavía anda por las pampas. Vuelve a las ${hhmm(a.returnAt)} y mañana te cuenta todo.` }
  if (a.status === 'ready') return { title, body: `¡Juntaste toda la energía! Mandá a ${name} de aventura y mañana te cuenta.` }
  if (s.habits.length > 0 && missing.length === 0) {
    return {
      title,
      body: pick([`¡Día completo! ${name} se va a dormir orgulloso de vos.`, `Hoy hiciste todo: ${list(done)}. Que descanses.`], now),
    }
  }
  if (done.length > 0) {
    return { title, body: `Hoy hiciste ${list(done)} 👏 Si te da, todavía hay tiempo para ${list(missing)}. Si no, mañana seguimos.` }
  }
  return {
    title,
    body: pick(
      [
        `Hoy fue un día tranqui en el rancho, y está bien. Mañana a las 9 ${name} te espera con el mate.`,
        `${name} ya colgó el sombrero. Mañana arrancamos de nuevo, sin apuro.`,
      ],
      now,
    ),
  }
}

function composeReminder(s, now = new Date()) {
  if (!s || !Array.isArray(s.habits)) return FALLBACK
  const { name, toYou, hey, a, back, where, gift, completions, done, missing } = today(s, now)
  const title = `${name} 🧉`

  // Where Gauchito is comes first: it's the most interesting news.
  if (back) {
    return { title: `¡${name} volvió!`, body: cap(`${hey}volvió${where} con una historia para contarte${gift}.`) }
  }
  if (a.status === 'running') {
    return { title, body: `${name} anda por las pampas${a.episode ? ` (“${a.episode}”)` : ''}. Vuelve a las ${hhmm(a.returnAt)}.` }
  }
  if (a.status === 'ready') {
    return { title: `¡${name} está listo!`, body: `Juntó toda la energía${toYou}. Entrá a mandarlo de aventura 🐴` }
  }

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
const COMPOSE = { morning: composeMorning, reminder: composeReminder, night: composeNight }
function compose(kind, s, now = new Date()) {
  return (COMPOSE[kind] || composeReminder)(s, now)
}
self.compose = compose // exposed for tests

async function showReminder(kind = 'reminder', fallback = {}) {
  const snapshot = await readSnapshot()
  const msg = snapshot ? compose(kind, snapshot) : { ...(FALLBACKS[kind] || FALLBACK), ...fallback }
  return self.registration.showNotification(msg.title, {
    body: msg.body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    // One tag per kind, so a new one never silently replaces an earlier one.
    tag: kind === 'reminder' ? 'guachito-daily' : `guachito-${kind}`,
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
