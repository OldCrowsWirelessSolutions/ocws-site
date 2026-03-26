'use client';

import { useActivityTracker } from '@/hooks/useActivityTracker';

/**
 * Invisible component that installs the activity / inactivity-logout tracker.
 * Included once in the root layout — runs on every page automatically.
 */
export default function ActivityTracker() {
  useActivityTracker();
  return null;
}
