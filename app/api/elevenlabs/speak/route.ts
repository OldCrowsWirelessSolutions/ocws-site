export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const LOCKED_SPEED = 1.5;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text?.trim()) {
      console.error('[elevenlabs/speak] no text provided');
      return new NextResponse('bad request', { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey) {
      console.error('[elevenlabs/speak] ELEVENLABS_API_KEY not set');
      return new NextResponse('api key not configured', { status: 500 });
    }
    if (!voiceId) {
      console.error('[elevenlabs/speak] ELEVENLABS_VOICE_ID not set');
      return new NextResponse('voice id not configured', { status: 500 });
    }

    console.log('[elevenlabs/speak] calling ElevenLabs, voice:', voiceId, 'text length:', text.length);

    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.85,
            style: 0.72,
            use_speaker_boost: true,
            speed: LOCKED_SPEED,
          },
        }),
      }
    );

    console.log('[elevenlabs/speak] ElevenLabs response status:', r.status);

    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      console.error('[elevenlabs/speak] ElevenLabs error:', r.status, errText);
      return new NextResponse('elevenlabs error', { status: 500 });
    }

    const audio = await r.arrayBuffer();
    console.log('[elevenlabs/speak] audio buffer size:', audio.byteLength);

    if (audio.byteLength < 100) {
      console.error('[elevenlabs/speak] audio buffer too small — empty response from ElevenLabs');
      return new NextResponse('empty audio response', { status: 500 });
    }

    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audio.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[elevenlabs/speak] route error:', e);
    return new NextResponse('error', { status: 500 });
  }
}
