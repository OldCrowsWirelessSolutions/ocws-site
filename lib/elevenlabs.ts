'use client'

// Voice speed is locked at 1.5x — not user adjustable
const CORVUS_VOICE_SPEED = 1.5

interface CorvusVoiceSettings {
  toggleKey?: string;
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

    await audio.play()
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl)
      win.corvusCurrentAudio = undefined
    }
  } catch (error) {
    console.error('Corvus audio error:', error)
    // Fail silently — never break the UI for audio failure
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
