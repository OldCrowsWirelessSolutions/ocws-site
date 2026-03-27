export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const LOCKED_SPEED = 1.5;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text?.trim()) return new NextResponse('bad request', { status: 400 });

    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
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

    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      console.error('ElevenLabs error:', r.status, errText);
      return new NextResponse('elevenlabs error', { status: 500 });
    }

    const audio = await r.arrayBuffer();
    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audio.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('ElevenLabs route error:', e);
    return new NextResponse('error', { status: 500 });
  }
}
