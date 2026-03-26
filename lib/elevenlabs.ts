'use client'

import { speakAsCorvus, stopCorvusAudio } from '@/lib/corvusAudio';

interface CorvusVoiceSettings {
  toggleKey?: string;
}

export async function speakCorvus(
  text: string,
  settings?: CorvusVoiceSettings
): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!isAudioEnabled()) return;

  if (settings?.toggleKey) {
    const enabled = localStorage.getItem(`corvus_voice_${settings.toggleKey}`);
    if (enabled === 'false') return;
  }

  if (process.env.NEXT_PUBLIC_ELEVENLABS_ENABLED !== 'true') return;

  await speakAsCorvus(text);
}

export async function speakCorvusFull(
  text: string,
  toggleKey?: string
): Promise<void> {
  await speakCorvus(text, { toggleKey });
}

export function stopCorvus(): void {
  stopCorvusAudio();
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
