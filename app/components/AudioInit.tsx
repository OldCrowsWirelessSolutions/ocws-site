'use client';
import { useEffect } from 'react';
import { initCorvusAudio } from '@/lib/corvusAudio';

export default function AudioInit() {
  useEffect(() => {
    initCorvusAudio();
  }, []);
  return null;
}
