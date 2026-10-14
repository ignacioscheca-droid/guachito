// What Gauchito sounds and feels like: the background music (looped), the sound effects
// (made on the fly with Web Audio, no files) and the haptics. Settings live on the device
// ("gauchito.sound"), not in the save.
//
// On iPhone: audio can only start after a touch, an <audio> element's volume can't be set
// (so the music goes through a Web Audio gain), and there is no navigator.vibrate: Safari
// gives a haptic tick when a switch checkbox is toggled, so haptics click a hidden one.

import { useSyncExternalStore } from 'react'

export type SoundSettings = { music: boolean; musicVolume: number; sfx: boolean; sfxVolume: number; haptics: boolean }

const KEY = 'gauchito.sound'
const DEFAULTS: SoundSettings = { music: true, musicVolume: 0.5, sfx: true, sfxVolume: 0.8, haptics: true }

function loadSettings(): SoundSettings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return DEFAULTS
  }
}

let settings = loadSettings()
const listeners = new Set<() => void>()

export function useSoundSettings() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => settings,
  )
}

export function setSoundSettings(patch: Partial<SoundSettings>) {
  settings = { ...settings, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    /* blocked storage: the change lasts this session */
  }
  listeners.forEach((l) => l())
  applyMusic()
  if (sfxGain && ctx) sfxGain.gain.setTargetAtTime(settings.sfxVolume, ctx.currentTime, 0.02)
}

// ---------- the audio graph ----------

let ctx: AudioContext | null = null
let musicGain: GainNode | null = null
let sfxGain: GainNode | null = null
let music: HTMLAudioElement | null = null

function audio(): AudioContext | null {
  if (ctx) return ctx
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  // iPhone: mix with whatever else is playing and respect the silent switch, like a game
  const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession
  if (session) session.type = 'ambient'
  ctx = new AC()
  musicGain = ctx.createGain()
  musicGain.gain.value = 0
  musicGain.connect(ctx.destination)
  sfxGain = ctx.createGain()
  sfxGain.gain.value = settings.sfxVolume
  sfxGain.connect(ctx.destination)
  return ctx
}

function applyMusic() {
  if (!ctx || !musicGain) return
  const on = settings.music && document.visibilityState === 'visible'
  if (on) {
    if (!music) {
      music = new Audio(`${import.meta.env.BASE_URL}audio/musica.m4a`)
      music.loop = true
      music.preload = 'auto'
      ctx.createMediaElementSource(music).connect(musicGain)
    }
    void music.play().catch(() => {})
    if (import.meta.env.DEV) Object.assign(window, { __audio: { ctx, music, musicGain } })
    musicGain.gain.setTargetAtTime(settings.musicVolume * 0.6, ctx.currentTime, 0.4)
  } else if (music) {
    musicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.15)
    const m = music
    window.setTimeout(() => {
      if (!settings.music || document.visibilityState !== 'visible') m.pause()
    }, 500)
  }
}

/** Audio starts with the first touch (browsers allow nothing before); then the music. */
export function startAudio() {
  const c = audio()
  if (!c) return
  if (c.state !== 'running') void c.resume()
  applyMusic()
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.visibilityState === 'visible') void ctx.resume()
    applyMusic()
  })
}

// ---------- sound effects, synthesized ----------

type Tone = { f: number; to?: number; at?: number; dur: number; type?: OscillatorType; gain?: number; attack?: number }

function tone(c: AudioContext, out: AudioNode, { f, to, at = 0, dur, type = 'sine', gain = 0.3, attack = 0.005 }: Tone) {
  const t = c.currentTime + at
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(f, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(out)
  o.start(t)
  o.stop(t + dur + 0.02)
}

/** A struck bell or marimba: a sine with a quieter overtone. */
function bell(c: AudioContext, out: AudioNode, f: number, at: number, dur = 0.5, gain = 0.22) {
  tone(c, out, { f, at, dur, gain })
  tone(c, out, { f: f * 2.76, at, dur: dur * 0.4, gain: gain * 0.25 })
}

let noiseBuffer: AudioBuffer | null = null
function noise(c: AudioContext, out: AudioNode, { at = 0, dur, freq, to, q = 1, gain = 0.2, type = 'bandpass' as BiquadFilterType }: { at?: number; dur: number; freq: number; to?: number; q?: number; gain?: number; type?: BiquadFilterType }) {
  if (!noiseBuffer) {
    noiseBuffer = c.createBuffer(1, c.sampleRate, c.sampleRate)
    const d = noiseBuffer.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const t = c.currentTime + at
  const src = c.createBufferSource()
  src.buffer = noiseBuffer
  src.loop = true
  const filter = c.createBiquadFilter()
  filter.type = type
  filter.Q.value = q
  filter.frequency.setValueAtTime(freq, t)
  if (to) filter.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.03, dur / 3))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter).connect(g).connect(out)
  src.start(t)
  src.stop(t + dur + 0.02)
}

const NOTE = (n: number) => 440 * 2 ** ((n - 69) / 12)

export type Sfx =
  | 'tap'
  | 'check'
  | 'uncheck'
  | 'tick'
  | 'full'
  | 'coin'
  | 'start'
  | 'rumble'
  | 'build'
  | 'area'
  | 'ready'
  | 'buy'
  | 'place'
  | 'unplace'
  | 'locked'
  | 'unlock'
  | 'cheer'

const SOUNDS: Record<Sfx, (c: AudioContext, o: AudioNode, p: number) => void> = {
  // a soft wooden tick for any touch
  tap: (c, o) => {
    tone(c, o, { f: 900, to: 520, dur: 0.06, type: 'triangle', gain: 0.12 })
    noise(c, o, { dur: 0.02, freq: 3500, q: 2, gain: 0.05 })
  },
  // a habit done: two bright marimba notes going up
  check: (c, o) => {
    bell(c, o, NOTE(84), 0, 0.35, 0.2)
    bell(c, o, NOTE(91), 0.09, 0.6, 0.22)
  },
  uncheck: (c, o) => {
    bell(c, o, NOTE(79), 0, 0.25, 0.12)
    bell(c, o, NOTE(74), 0.08, 0.35, 0.1)
  },
  // one step of the bar filling; p (0..1) is how full it is, and the pitch climbs with it
  tick: (c, o, p) => tone(c, o, { f: 520 + p * 900, dur: 0.05, type: 'triangle', gain: 0.1 }),
  // the bar is full: a quick major arpeggio and a shimmer
  full: (c, o) => {
    ;[72, 76, 79, 84, 88].forEach((n, i) => bell(c, o, NOTE(n), i * 0.07, 0.6, 0.18))
    noise(c, o, { at: 0.3, dur: 0.9, freq: 7000, q: 0.8, gain: 0.05, type: 'highpass' })
  },
  // a herradura lands on the counter
  coin: (c, o) => {
    const f = NOTE(88 + Math.round(Math.random() * 2))
    tone(c, o, { f, dur: 0.18, gain: 0.12 })
    tone(c, o, { f: f * 1.5, at: 0.05, dur: 0.3, gain: 0.1 })
  },
  // off to work: a whoosh and a thump
  start: (c, o) => {
    noise(c, o, { dur: 0.45, freq: 400, to: 3000, q: 1.2, gain: 0.18 })
    tone(c, o, { f: 140, to: 60, at: 0.3, dur: 0.3, gain: 0.35 })
  },
  // the pile shakes
  rumble: (c, o) => {
    noise(c, o, { dur: 0.75, freq: 180, q: 0.7, gain: 0.3, type: 'lowpass' })
    tone(c, o, { f: 70, to: 55, dur: 0.75, gain: 0.15 })
  },
  // the obra pops up: a thump, then sparkles
  build: (c, o) => {
    tone(c, o, { f: 160, to: 55, dur: 0.35, gain: 0.45 })
    noise(c, o, { dur: 0.3, freq: 600, q: 0.6, gain: 0.15, type: 'lowpass' })
    ;[84, 88, 91, 96].forEach((n, i) => bell(c, o, NOTE(n), 0.12 + i * 0.06, 0.5, 0.12))
  },
  // an area restored: a little fanfare
  area: (c, o) => {
    const chords = [
      [60, 64, 67],
      [65, 69, 72],
      [67, 71, 74],
      [72, 76, 79, 84],
    ]
    chords.forEach((ch, i) => ch.forEach((n) => tone(c, o, { f: NOTE(n), at: i * 0.18, dur: i === 3 ? 1.4 : 0.3, type: 'triangle', gain: 0.09, attack: 0.02 })))
    ;[96, 91, 100, 103].forEach((n, i) => bell(c, o, NOTE(n), 0.6 + i * 0.09, 0.6, 0.08))
    noise(c, o, { at: 0.55, dur: 1.2, freq: 8000, q: 0.8, gain: 0.05, type: 'highpass' })
  },
  // the job is finished and waits to be seen
  ready: (c, o) => {
    bell(c, o, NOTE(79), 0, 0.5, 0.16)
    bell(c, o, NOTE(84), 0.12, 0.8, 0.18)
  },
  // bought: ka-ching
  buy: (c, o) => {
    noise(c, o, { dur: 0.08, freq: 5000, q: 1, gain: 0.08 })
    bell(c, o, NOTE(88), 0.04, 0.3, 0.14)
    bell(c, o, NOTE(93), 0.12, 0.6, 0.16)
  },
  place: (c, o) => {
    tone(c, o, { f: 220, to: 120, dur: 0.12, type: 'triangle', gain: 0.25 })
    noise(c, o, { dur: 0.06, freq: 900, q: 1, gain: 0.08 })
  },
  unplace: (c, o) => tone(c, o, { f: 260, to: 420, dur: 0.12, type: 'triangle', gain: 0.15 }),
  // not yet: a soft low "bonk"
  locked: (c, o) => {
    tone(c, o, { f: 196, dur: 0.12, type: 'triangle', gain: 0.2 })
    tone(c, o, { f: 165, at: 0.1, dur: 0.2, type: 'triangle', gain: 0.18 })
  },
  // something opens: a magic pentatonic run
  unlock: (c, o) => {
    ;[72, 74, 76, 79, 81, 84, 86, 88].forEach((n, i) => bell(c, o, NOTE(n), i * 0.045, 0.5, 0.1))
    noise(c, o, { at: 0.2, dur: 0.8, freq: 7500, q: 0.8, gain: 0.04, type: 'highpass' })
  },
  // Paucho is happy
  cheer: (c, o) => {
    tone(c, o, { f: NOTE(76), to: NOTE(83), dur: 0.15, type: 'triangle', gain: 0.12 })
    bell(c, o, NOTE(88), 0.1, 0.4, 0.1)
  },
}

/** Plays a sound effect now, or `delayMs` later. */
export function sfx(name: Sfx, p = 0, delayMs = 0) {
  if (!settings.sfx) return
  const play = () => {
    const c = audio()
    if (!c || !sfxGain || c.state !== 'running') return
    SOUNDS[name](c, sfxGain, p)
  }
  if (delayMs) window.setTimeout(play, delayMs)
  else play()
}

// ---------- haptics ----------

export type Haptic = 'tap' | 'tick' | 'success' | 'heavy' | 'warning' | 'celebrate'

const PATTERN: Record<Haptic, number[]> = {
  tap: [8],
  tick: [5],
  success: [12, 70, 18],
  heavy: [30],
  warning: [18, 60, 18],
  celebrate: [14, 70, 14, 70, 28],
}

let switchLabel: HTMLLabelElement | null = null
/** iPhone: one system haptic, from toggling a hidden switch. */
function iosTick() {
  if (!switchLabel) {
    switchLabel = document.createElement('label')
    switchLabel.ariaHidden = 'true'
    switchLabel.style.display = 'none'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    switchLabel.appendChild(input)
    document.body.appendChild(switchLabel)
  }
  switchLabel.click()
}

/** A haptic now, or `delayMs` later. */
export function haptic(kind: Haptic, delayMs = 0) {
  if (!settings.haptics) return
  const run = () => {
    const p = PATTERN[kind]
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(p)
      return
    }
    // iPhone: one tick per pulse of the pattern (the even entries), at its times
    let t = 0
    p.forEach((ms, i) => {
      if (i % 2 === 0) window.setTimeout(iosTick, t)
      t += ms
    })
  }
  if (delayMs) window.setTimeout(run, delayMs)
  else run()
}

/** Sound and touch together, the usual pair. */
export function feel(name: Sfx, h: Haptic, p = 0) {
  sfx(name, p)
  haptic(h)
}

// ---------- every touch ----------

const TOUCHABLE = 'button, a[href], [role="button"], [role="tab"], input[type="checkbox"], select, .rmichi, .hcard'

/**
 * Any touch on something touchable ticks (a soft sound and a light haptic); the first touch
 * also starts the audio. Things with their own sound play it on top.
 */
export function installTouchFeedback() {
  document.addEventListener(
    'pointerdown',
    (e) => {
      startAudio()
      const el = (e.target as Element | null)?.closest(TOUCHABLE)
      if (!el || (el as HTMLButtonElement).disabled || el.closest('[data-quiet]')) return
      sfx('tap')
      haptic('tap')
    },
    { capture: true, passive: true },
  )
}
