'use client';

// Singleton AudioContext — shared across all Corvus audio calls
let audioCtx: AudioContext | null = null;
let audioUnlocked = false;
let unlockListenerAdded = false;

// Attach gesture listeners once on app load — call from layout.tsx
export function initCorvusAudio() {
  if (typeof window === 'undefined') return;
  if (unlockListenerAdded) return;
  unlockListenerAdded = true;

  const unlock = async () => {
    if (audioUnlocked) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      // Play a silent buffer to satisfy iOS requirement
      const buffer = audioCtx.createBuffer(1, 1, 22050);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start(0);
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioUnlocked = true;
    } catch { /* silent */ }
  };

  ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'].forEach(evt => {
    document.addEventListener(evt, unlock, { once: false, passive: true });
  });
}

async function getAudioContext(): Promise<AudioContext> {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  return audioCtx;
}

let currentSource: AudioBufferSourceNode | null = null;

export function stopCorvusAudio() {
  if (typeof window === 'undefined') return;
  if (currentSource) {
    try { currentSource.stop(); } catch { /* already stopped */ }
    currentSource = null;
  }
}

export async function speakAsCorvus(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!text?.trim()) return;

  stopCorvusAudio();

  try {
    const res = await fetch('/api/elevenlabs/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.replace(/["""]/g, '') }),
    });

    if (!res.ok) return;

    const arrayBuffer = await res.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) return;

    const ctx = await getAudioContext();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    currentSource = source;
    onStart?.();

    source.onended = () => {
      currentSource = null;
      onEnd?.();
    };

    source.start(0);
  } catch {
    onEnd?.(); // ensure UI never hangs
  }
}
