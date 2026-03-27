'use client';

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return _ctx;
}

// Call this as the FIRST LINE inside every button onClick — synchronous iOS unlock
export function unlockAudio() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  } catch { /* silent */ }
}

// Legacy init — kept for layout.tsx compatibility, delegates to unlockAudio
export function initCorvusAudio() {
  if (typeof window === 'undefined') return;
  ['touchstart', 'mousedown', 'keydown', 'click'].forEach(evt => {
    document.addEventListener(evt, unlockAudio, { once: false, passive: true });
  });
}

let currentSource: AudioBufferSourceNode | null = null;

export function stopCorvusAudio() {
  if (typeof window === 'undefined') return;
  try { currentSource?.stop(); } catch { /* already stopped */ }
  currentSource = null;
}

export async function speakAsCorvus(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!text?.trim()) { onEnd?.(); return; }

  stopCorvusAudio();

  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') await ctx.resume();

    const res = await fetch('/api/elevenlabs/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.replace(/["""'']/g, '') }),
    });

    if (!res.ok) { onEnd?.(); return; }

    const buf = await res.arrayBuffer();
    if (!buf?.byteLength) { onEnd?.(); return; }

    const audio = await ctx.decodeAudioData(buf);
    const src = ctx.createBufferSource();
    src.buffer = audio;
    src.connect(ctx.destination);
    currentSource = src;
    onStart?.();
    src.onended = () => { currentSource = null; onEnd?.(); };
    src.start(0);
  } catch (e) {
    console.warn('Corvus audio error:', e);
    onEnd?.();
  }
}
