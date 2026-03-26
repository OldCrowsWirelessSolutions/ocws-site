'use client'

// Voice speed is locked at 1.5x — not user adjustable
const CORVUS_VOICE_SPEED = 1.5

interface CorvusVoiceSettings {
  toggleKey?: string;
}

// Holds a pre-fetched audio URL that was blocked by browser autoplay policy.
// Played as soon as the user makes any gesture (click, keydown, touch).
let _pendingAudioUrl: string | null = null

function _playPendingAudio() {
  if (!_pendingAudioUrl) return
  const url = _pendingAudioUrl
  _pendingAudioUrl = null
  const audio = new Audio(url)
  const win = window as Window & { corvusCurrentAudio?: HTMLAudioElement }
  if (win.corvusCurrentAudio) win.corvusCurrentAudio.pause()
  win.corvusCurrentAudio = audio
  audio.play().catch(() => {})
  audio.onended = () => {
    URL.revokeObjectURL(url)
    win.corvusCurrentAudio = undefined
  }
}

function _registerAutoplayUnlock() {
  const opts = { once: true, capture: true }
  document.addEventListener('click',      _playPendingAudio, opts)
  document.addEventListener('keydown',    _playPendingAudio, opts)
  document.addEventListener('touchstart', _playPendingAudio, opts)
  document.addEventListener('pointerdown',_playPendingAudio, opts)
}

export async function speakCorvus(
  text: string,
  settings?: CorvusVoiceSettings
): Promise<void> {
  if (typeof window === 'undefined') return
  if (!isAudioEnabled()) return

  // Check per-context toggle if provided
  if (settings?.toggleKey) {
    const enabled = localStorage.getItem(`corvus_voice_${settings.toggleKey}`)
    if (enabled === 'false') return
  }

  if (process.env.NEXT_PUBLIC_ELEVENLABS_ENABLED !== 'true') return

  try {
    const response = await fetch('/api/elevenlabs/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speed: CORVUS_VOICE_SPEED }),
    })

    if (!response.ok) return

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)

    // Stop any currently playing Corvus audio
    const win = window as Window & { corvusCurrentAudio?: HTMLAudioElement }
    if (win.corvusCurrentAudio) {
      win.corvusCurrentAudio.pause()
    }
    win.corvusCurrentAudio = audio

    try {
      await audio.play()
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        win.corvusCurrentAudio = undefined
      }
    } catch (playErr: unknown) {
      win.corvusCurrentAudio = undefined
      // Browser blocked autoplay (no user gesture yet) — queue for first interaction
      if (playErr instanceof DOMException && playErr.name === 'NotAllowedError') {
        if (_pendingAudioUrl) URL.revokeObjectURL(_pendingAudioUrl)
        _pendingAudioUrl = audioUrl
        _registerAutoplayUnlock()
      } else {
        URL.revokeObjectURL(audioUrl)
      }
    }
  } catch {
    // Network / API failure — fail silently, never break the UI
  }
}

// Speaks full text without truncation. toggleKey gates on per-context localStorage preference.
export async function speakCorvusFull(
  text: string,
  toggleKey?: string
): Promise<void> {
  await speakCorvus(text, { toggleKey })
}

// Stop any currently playing Corvus audio immediately
export function stopCorvus(): void {
  if (typeof window === 'undefined') return
  const win = window as Window & { corvusCurrentAudio?: HTMLAudioElement }
  if (win.corvusCurrentAudio) {
    win.corvusCurrentAudio.pause()
    win.corvusCurrentAudio = undefined
  }
}

export function isAudioEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('corvus_audio') !== 'false'
}

export function toggleAudio(): boolean {
  const current = isAudioEnabled()
  localStorage.setItem('corvus_audio', String(!current))
  return !current
}
