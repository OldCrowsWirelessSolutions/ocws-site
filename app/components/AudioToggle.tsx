'use client'
import { useState, useEffect } from 'react'
import { isAudioEnabled, toggleAudio } from '@/lib/elevenlabs'

export default function AudioToggle() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    setEnabled(isAudioEnabled())
  }, [])

  const handleToggle = () => {
    const newState = toggleAudio()
    setEnabled(newState)
  }

  if (process.env.NEXT_PUBLIC_ELEVENLABS_ENABLED !== 'true') return null

  return (
    <button
      onClick={handleToggle}
      className="audio-toggle-btn"
      title={enabled ? 'Mute Corvus' : 'Unmute Corvus'}
    >
      {enabled ? '🔊' : '🔇'}
      <span className="audio-toggle-label">
        {enabled ? 'CORVUS AUDIO ON' : 'CORVUS AUDIO OFF'}
      </span>
    </button>
  )
}
