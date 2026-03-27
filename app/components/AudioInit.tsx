'use client';
import { useEffect } from 'react';
import { initCorvusAudio } from '@/lib/corvusAudio';

export default function AudioInit() {
  useEffect(() => {
    // AudioContext unlock — for CorvusTourPlayer (uses corvusAudio.ts)
    initCorvusAudio();

    // HTMLAudio unlock — for speakCorvus (uses HTMLAudioElement, immune to getUserMedia)
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      try {
        const a = new Audio();
        a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        a.volume = 0;
        a.play().catch(() => {});
      } catch { /* silent */ }
    };

    const EVENTS = ['click', 'keydown', 'touchstart', 'touchend'] as const;
    EVENTS.forEach(evt => document.addEventListener(evt, unlock, { passive: true }));
    return () => EVENTS.forEach(evt => document.removeEventListener(evt, unlock));
  }, []);

  return null;
}
