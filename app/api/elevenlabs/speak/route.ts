import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string' || text.length > 500) {
      return NextResponse.json({ error: 'Invalid text' }, { status: 400 })
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID
    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!voiceId || !apiKey) {
      return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 500 })
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.25,
            similarity_boost: 0.85,
            style: 0.80,
            use_speaker_boost: true,
            speed: 1.15,
          },
        }),
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('ElevenLabs proxy error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
