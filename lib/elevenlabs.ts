'use client'

// Module-level audio state — HTMLAudioElement is immune to AudioContext/getUserMedia conflicts
let currentAudio: HTMLAudioElement | null = null;

export function stopCorvus(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}

export async function speakCorvus(
  text: string,
  toggleKey?: string,
): Promise<void> {
  if (typeof window === 'undefined') return;

  if (localStorage.getItem('corvus_audio') === 'false') {
    console.log('[speakCorvus] skipped — corvus_audio disabled in localStorage');
    return;
  }

  if (toggleKey) {
    if (localStorage.getItem(`corvus_voice_${toggleKey}`) === 'false') return;
  }

  if (process.env.NEXT_PUBLIC_ELEVENLABS_ENABLED !== 'true') {
    console.log('[speakCorvus] skipped — NEXT_PUBLIC_ELEVENLABS_ENABLED is', JSON.stringify(process.env.NEXT_PUBLIC_ELEVENLABS_ENABLED), '(must be "true")');
    return;
  }

  stopCorvus();

  try {
    console.log('[speakCorvus] fetching audio, text length:', text.length);

    const res = await fetch('/api/elevenlabs/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.substring(0, 2500) }),
    });

    console.log('[speakCorvus] response status:', res.status);

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      console.error('[speakCorvus] API error:', res.status, err);
      return;
    }

    const blob = await res.blob();
    console.log('[speakCorvus] blob size:', blob.size);

    if (blob.size < 100) {
      console.error('[speakCorvus] blob too small — likely empty response from ElevenLabs');
      return;
    }

    // Convert to base64 data URL — more reliable than createObjectURL on iOS/Android
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const audio = new Audio(dataUrl);
    audio.preload = 'auto';
    currentAudio = audio;

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
    };

    audio.onerror = (e) => {
      console.error('[speakCorvus] playback error', e);
      if (currentAudio === audio) currentAudio = null;
    };

    // Attempt immediate play
    try {
      await audio.play();
      console.log('[speakCorvus] playing');
    } catch (playError: unknown) {
      const name = (playError as Error).name;
      if (name === 'NotAllowedError' || name === 'NotSupportedError') {
        console.warn('[speakCorvus] autoplay blocked — queued for next user interaction');
        const playOnGesture = async () => {
          try {
            audio.load();
            await audio.play();
          } catch { /* ignored */ }
        };
        document.addEventListener('touchend', playOnGesture, { once: true });
        document.addEventListener('click', playOnGesture, { once: true });
      } else {
        console.error('[speakCorvus] play error:', playError);
      }
    }
  } catch (err) {
    console.error('[speakCorvus] error:', err);
    currentAudio = null;
  }
}

export async function speakCorvusFull(
  text: string,
  toggleKey?: string,
): Promise<void> {
  await speakCorvus(text, toggleKey);
}

export function isAudioEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('corvus_audio') !== 'false';
}

export function toggleAudio(): boolean {
  const current = isAudioEnabled();
  localStorage.setItem('corvus_audio', String(!current));
  return !current;
}
