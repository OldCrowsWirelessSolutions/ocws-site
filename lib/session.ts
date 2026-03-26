// lib/session.ts
// Central session management — timeout, activity tracking, logout.
// Client-side only (uses localStorage/sessionStorage).

export type SessionTimeout = '1' | '5' | '10' | 'never';

export const SESSION_TIMEOUT_OPTIONS = [
  { value: '1',     label: '1 minute',   description: 'Highest security' },
  { value: '5',     label: '5 minutes',  description: 'Recommended for shared devices' },
  { value: '10',    label: '10 minutes', description: 'Balanced security' },
  { value: 'never', label: 'Never',      description: 'Stay logged in until I sign out' },
] as const;

const TIMEOUT_KEY       = 'corvus_session_timeout';
const LAST_ACTIVITY_KEY = 'corvus_last_activity';

export function getSessionTimeout(): SessionTimeout {
  if (typeof window === 'undefined') return 'never';
  return (localStorage.getItem(TIMEOUT_KEY) as SessionTimeout) || 'never';
}

export function setSessionTimeout(timeout: SessionTimeout): void {
  localStorage.setItem(TIMEOUT_KEY, timeout);
}

export function updateLastActivity(): void {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

export function getLastActivity(): number {
  const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
  return stored ? parseInt(stored, 10) : Date.now();
}

export function isSessionExpiredByInactivity(): boolean {
  const timeout = getSessionTimeout();
  if (timeout === 'never') return false;
  const timeoutMs = parseInt(timeout, 10) * 60 * 1000;
  return Date.now() - getLastActivity() > timeoutMs;
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  const code = localStorage.getItem('corvus_sub_code');
  return !!code;
}

export function handleLogout(reason?: 'manual' | 'inactivity' | 'domain_exit'): void {
  try {
    localStorage.removeItem('corvus_sub_code');
    localStorage.removeItem('corvus_session_ts');
    localStorage.removeItem('corvus_sub_tier');
    localStorage.removeItem('corvus_admin_auth');
    localStorage.removeItem('corvus_admin_impersonating');
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    sessionStorage.clear();

    if (reason && reason !== 'manual') {
      sessionStorage.setItem('corvus_logout_reason', reason);
    }
  } catch { /* */ }

  window.location.href = '/';
}
