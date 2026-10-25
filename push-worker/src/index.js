// The app posts { sub, at } when Paucho sets off: `sub` is the phone's push subscription,
// `at` when the job ends (ms). One Durable Object per phone keeps it and sets an alarm; the
// alarm sends an empty Web Push (no payload, so nothing to encrypt). The phone's service
// worker writes the text itself from what it knows ("¡Paucho terminó la cucha!").
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (the same keys as the daily notifications).

const ALLOWED = ['https://ignacioscheca-droid.github.io', 'http://localhost:5173']
const DAY = 86_400_000

export class Timer {
  constructor(state, env) {
    this.state = state
    this.env = env
  }
  async fetch(req) {
    const job = await req.json()
    await this.state.storage.put('job', job)
    await this.state.storage.setAlarm(job.at)
    return new Response('ok')
  }
  async alarm() {
    const job = await this.state.storage.get('job')
    await this.state.storage.delete('job')
    if (job) await sendPush(job.sub, this.env)
  }
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') ?? ''
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    const url = new URL(req.url)
    if (req.method !== 'POST' || url.pathname !== '/done') return new Response('Gauchito', { status: 404, headers: cors })
    let body
    try {
      body = await req.json()
    } catch {
      return new Response('bad json', { status: 400, headers: cors })
    }
    const { sub, at } = body ?? {}
    const now = Date.now()
    if (!sub?.endpoint?.startsWith('https://') || typeof at !== 'number' || at < now - 60_000 || at > now + 2 * DAY) {
      return new Response('bad request', { status: 400, headers: cors })
    }
    const stub = env.TIMER.get(env.TIMER.idFromName(sub.endpoint))
    await stub.fetch('https://timer/set', { method: 'POST', body: JSON.stringify({ sub: { endpoint: sub.endpoint }, at: Math.max(at, now + 1000) }) })
    return new Response('ok', { headers: cors })
  },
}

// ---- Web Push without a payload: a VAPID-signed POST to the subscription's endpoint ----

const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const unb64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0))
const text = (s) => new TextEncoder().encode(s)

async function vapidJwt(audience, env) {
  const pub = unb64url(env.VAPID_PUBLIC_KEY)
  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', d: env.VAPID_PRIVATE_KEY, x: b64url(pub.slice(1, 33)), y: b64url(pub.slice(33, 65)), ext: true },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  )
  const head = b64url(text(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const claims = b64url(text(JSON.stringify({ aud: audience, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: 'mailto:guachito@users.noreply.github.com' })))
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, text(`${head}.${claims}`))
  return `${head}.${claims}.${b64url(sig)}`
}

async function sendPush(sub, env) {
  const jwt = await vapidJwt(new URL(sub.endpoint).origin, env)
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: { TTL: String(6 * 3600), Urgency: 'high', Authorization: `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}` },
  })
  console.log('push', res.status, await res.text())
}
