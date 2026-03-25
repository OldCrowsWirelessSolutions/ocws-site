'use client'

export async function speakCorvus(text: string): Promise<void> {
  if (typeof window === 'undefined') return
  if (!isAudioEnabled()) return
  if (process.env.NEXT_PUBLIC_ELEVENLABS_ENABLED !== 'true') return

  try {
    const response = await fetch('/api/elevenlabs/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) return

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    await audio.play()
    audio.onended = () => URL.revokeObjectURL(audioUrl)
  } catch (error) {
    console.error('Corvus audio error:', error)
    // Fail silently — never break the UI for audio failure
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
