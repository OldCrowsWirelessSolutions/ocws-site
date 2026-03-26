'use client';

import { useEffect, useRef } from 'react';
import {
  updateLastActivity,
  isSessionExpiredByInactivity,
  getSessionTimeout,
  handleLogout,
  isLoggedIn,
} from '@/lib/session';

const ACTIVITY_EVENTS = [
  'mousedown', 'mousemove', 'keydown',
  'scroll', 'touchstart', 'click', 'focus',
] as const;

export function useActivityTracker() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) return;

    const handleActivity = () => updateLastActivity();

    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Seed with current time so a fresh page visit doesn't immediately expire
    updateLastActivity();

    // Check inactivity every 30 seconds
    intervalRef.current = setInterval(() => {
      if (!isLoggedIn()) return;
      if (getSessionTimeout() === 'never') return;
      if (isSessionExpiredByInactivity()) {
        handleLogout('inactivity');
      }
    }, 30_000);

    // Domain exit detection — log out when navigating to an external domain
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor?.href) return;
      try {
        const url = new URL(anchor.href);
        const isExternal =
          url.hostname !== window.location.hostname &&
          url.hostname !== '' &&
          !url.hostname.endsWith('oldcrowswireless.com');
        if (isExternal && isLoggedIn()) {
          handleLogout('domain_exit');
        }
      } catch { /* invalid URL — ignore */ }
    };
    document.addEventListener('click', handleClick);

    // Multi-tab logout: if another tab clears corvus_sub_code, redirect here too
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'corvus_sub_code' && !e.newValue) {
        window.location.href = '/';
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('click', handleClick);
      window.removeEventListener('storage', handleStorage);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}
