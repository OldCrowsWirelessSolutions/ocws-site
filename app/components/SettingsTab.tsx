'use client';

import { useState, useEffect } from 'react';
import {
  SESSION_TIMEOUT_OPTIONS,
  getSessionTimeout,
  setSessionTimeout,
  handleLogout,
  type SessionTimeout,
} from '@/lib/session';

interface SettingsTabProps {
  code: string;
  isVIP?: boolean;
  isAdmin?: boolean;
}

const DEFAULT_VOICE_SETTINGS = {
  login:      true,
  dashboard:  true,
  processing: true,
  report:     true,
  chat:       true,
  holidays:   true,
  tributes:   true,
  imageClick: true,
};
type VoiceKey = keyof typeof DEFAULT_VOICE_SETTINGS;

const VOICE_TOGGLE_CONFIG: { key: VoiceKey; label: string; desc: string }[] = [
  { key: 'login',      label: 'LOGIN GREETING',       desc: 'Corvus speaks when you log in' },
  { key: 'dashboard',  label: 'DASHBOARD BRIEFING',   desc: 'Corvus speaks his dashboard briefing' },
  { key: 'processing', label: 'SCAN PROCESSING',      desc: 'Corvus narrates while analyzing' },
  { key: 'report',     label: 'REPORT RENDER',        desc: 'Corvus speaks when your Verdict is ready' },
  { key: 'chat',       label: 'CORVUS CHAT',          desc: 'Corvus speaks his chat responses' },
  { key: 'holidays',   label: 'HOLIDAYS & SPECIAL DATES', desc: 'Corvus speaks holiday greetings' },
  { key: 'tributes',   label: 'TRIBUTE MESSAGES',     desc: 'Corvus speaks personal tribute messages' },
  { key: 'imageClick', label: 'CORVUS IMAGE CLICK',   desc: 'Corvus speaks when you click his image' },
];

export default function SettingsTab({ code, isVIP = false, isAdmin = false }: SettingsTabProps) {
  const [selectedTimeout, setSelectedTimeout] = useState<SessionTimeout>('never');
  const [timeoutSaved, setTimeoutSaved] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Voice settings
  const [masterAudio, setMasterAudio] = useState(true);
  const [voiceSettings, setVoiceSettings] = useState({ ...DEFAULT_VOICE_SETTINGS });

  useEffect(() => {
    setSelectedTimeout(getSessionTimeout());
    // Load voice settings from localStorage
    setMasterAudio(localStorage.getItem('corvus_audio') !== 'false');
    try {
      const stored = localStorage.getItem('corvus_voice_settings');
      if (stored) setVoiceSettings({ ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(stored) as typeof DEFAULT_VOICE_SETTINGS });
    } catch { /* use defaults */ }
  }, []);

  function handleVoiceToggle(key: VoiceKey | 'master', value: boolean) {
    if (key === 'master') {
      setMasterAudio(value);
      localStorage.setItem('corvus_audio', String(value));
      return;
    }
    const updated = { ...voiceSettings, [key]: value };
    setVoiceSettings(updated);
    localStorage.setItem('corvus_voice_settings', JSON.stringify(updated));
    localStorage.setItem(`corvus_voice_${key}`, String(value));
  }

  function handleTimeoutChange(timeout: SessionTimeout) {
    setSelectedTimeout(timeout);
    setSessionTimeout(timeout);
    setTimeoutSaved(true);
    setTimeout(() => setTimeoutSaved(false), 2000);
  }

  async function handlePasswordChange() {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) return;
    setPasswordLoading(true);
    setPasswordMessage('');
    try {
      // Verify current password
      const verifyRes = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password: currentPassword }),
      });
      const verifyData = await verifyRes.json() as { valid?: boolean; error?: string };
      if (!verifyData.valid) {
        setPasswordMessage(verifyData.error ?? 'Current password is incorrect.');
        setPasswordSuccess(false);
        return;
      }
      // Set new password
      const setRes = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password: newPassword, force: true }),
      });
      const setData = await setRes.json() as { success?: boolean; error?: string };
      if (setData.success) {
        setPasswordMessage('Password updated. You will be signed out.');
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => handleLogout('manual'), 2000);
      } else {
        setPasswordMessage(setData.error ?? 'Password update failed.');
        setPasswordSuccess(false);
      }
    } catch {
      setPasswordMessage('Network error. Please try again.');
      setPasswordSuccess(false);
    } finally {
      setPasswordLoading(false);
    }
  }

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(13,21,32,0.8)',
    border: '1px solid rgba(0,194,199,0.12)',
    borderRadius: 12,
    padding: 24,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '0.6rem',
    color: '#B8922A',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    marginBottom: 6,
  };

  const sectionDescStyle: React.CSSProperties = {
    fontSize: '0.78rem',
    color: '#888888',
    marginBottom: 20,
    lineHeight: 1.6,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0D1520',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'monospace',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Session security */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Session Security</p>
        <p style={sectionDescStyle}>
          Control how long you stay logged in when inactive.
          Active use always keeps your session alive.
        </p>

        <p style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '0.55rem',
          color: '#888888',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Auto Logout After Inactivity
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 8,
          marginBottom: 16,
        }}>
          {SESSION_TIMEOUT_OPTIONS.map(option => {
            const active = selectedTimeout === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleTimeoutChange(option.value as SessionTimeout)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '14px 10px',
                  background: active ? 'rgba(0,194,199,0.1)' : 'rgba(26,35,50,0.8)',
                  border: `1px solid ${active ? 'rgba(0,194,199,0.4)' : 'rgba(0,194,199,0.12)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                }}
              >
                <span style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.8rem',
                  color: active ? '#00C2C7' : '#F4F6F8',
                  fontWeight: 600,
                }}>
                  {option.label}
                </span>
                <span style={{ fontSize: '0.6rem', color: '#888888' }}>
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{
          fontSize: '0.75rem',
          color: 'rgba(244,246,248,0.6)',
          padding: '10px 14px',
          background: 'rgba(0,194,199,0.04)',
          borderRadius: 6,
          border: '1px solid rgba(0,194,199,0.08)',
          transition: 'opacity 0.3s',
        }}>
          {timeoutSaved ? (
            <span style={{ color: '#4ade80' }}>✓ Saved</span>
          ) : selectedTimeout === 'never' ? (
            '🔓 You will stay logged in until you click Sign Out'
          ) : (
            `🔒 You will be logged out after ${selectedTimeout} minute${selectedTimeout !== '1' ? 's' : ''} of inactivity`
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          marginTop: 16,
          padding: '12px 14px',
          background: 'rgba(184,146,42,0.05)',
          border: '1px solid rgba(184,146,42,0.15)',
          borderRadius: 8,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>🔒</span>
          <div>
            <p style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.6rem',
              color: '#B8922A',
              letterSpacing: '0.1em',
              marginBottom: 4,
            }}>
              Domain Exit Protection
            </p>
            <p style={{ fontSize: '0.72rem', color: '#888888', lineHeight: 1.5 }}>
              You are automatically signed out when you navigate away from oldcrowswireless.com.
              This cannot be disabled.
            </p>
          </div>
        </div>
      </div>

      {/* Password change — not shown for admin */}
      {!isAdmin && (
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>Dashboard Password</p>
          <p style={sectionDescStyle}>
            Change your dashboard access password.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380 }}>
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="New password (min 8 characters)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              style={inputStyle}
            />
            <button
              onClick={handlePasswordChange}
              disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || passwordLoading}
              style={{
                padding: '10px 20px',
                background: 'rgba(0,194,199,0.1)',
                border: '1px solid rgba(0,194,199,0.3)',
                borderRadius: 8,
                color: '#00C2C7',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.68rem',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: 4,
                opacity: (!currentPassword || !newPassword || newPassword !== confirmPassword || passwordLoading) ? 0.4 : 1,
              }}
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
            {passwordMessage && (
              <div style={{
                fontSize: '0.72rem',
                padding: '8px 12px',
                borderRadius: 6,
                background: passwordSuccess ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                border: `1px solid ${passwordSuccess ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                color: passwordSuccess ? '#4ade80' : '#f87171',
              }}>
                {passwordMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Corvus Voice Settings */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Corvus Voice</p>
        <p style={sectionDescStyle}>
          Control when and where Corvus speaks. Voice speed is set at 1.5x — optimized for Corvus&apos; delivery style.
        </p>

        {/* Master toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,194,199,0.06)', border: '1px solid rgba(0,194,199,0.2)', borderRadius: 8, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.62rem', color: '#F4F6F8', letterSpacing: '0.1em', marginBottom: 2 }}>MASTER AUDIO</p>
            <p style={{ fontSize: '0.68rem', color: '#888888' }}>Enable or disable all Corvus voice</p>
          </div>
          <button
            onClick={() => handleVoiceToggle('master', !masterAudio)}
            style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s', minWidth: 70, background: masterAudio ? 'rgba(0,194,199,0.12)' : 'rgba(136,136,136,0.08)', borderColor: masterAudio ? 'rgba(0,194,199,0.4)' : 'rgba(136,136,136,0.2)', color: masterAudio ? '#00C2C7' : '#888888' }}
          >
            {masterAudio ? '🔊 ON' : '🔇 OFF'}
          </button>
        </div>

        {/* Per-context toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {VOICE_TOGGLE_CONFIG.map(({ key, label, desc }) => {
            const on = voiceSettings[key];
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(26,35,50,0.6)', border: '1px solid rgba(0,194,199,0.08)', borderRadius: 8 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.62rem', color: '#F4F6F8', letterSpacing: '0.1em', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: '0.68rem', color: '#888888' }}>{desc}</p>
                </div>
                <button
                  onClick={() => handleVoiceToggle(key, !on)}
                  style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s', minWidth: 60, background: on ? 'rgba(0,194,199,0.12)' : 'rgba(136,136,136,0.08)', borderColor: on ? 'rgba(0,194,199,0.4)' : 'rgba(136,136,136,0.2)', color: on ? '#00C2C7' : '#888888' }}
                >
                  {on ? 'ON' : 'OFF'}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.58rem', color: '#888888', padding: '8px 12px', background: 'rgba(184,146,42,0.05)', border: '1px solid rgba(184,146,42,0.15)', borderRadius: 6 }}>
          🔒 Voice speed is locked at 1.5x — optimized for Corvus&apos; character delivery.
        </div>
      </div>

      {/* Notifications placeholder */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Notifications</p>
        <p style={{ ...sectionDescStyle, marginBottom: 0 }}>
          Push notification preferences — available when the mobile app launches.
        </p>
        <p style={{ fontSize: '0.78rem', color: '#555555', fontStyle: 'italic', marginTop: 8 }}>
          🥚 Push notifications coming with the iOS and Android app.
        </p>
      </div>

      {/* Sign out */}
      <div style={{ ...sectionStyle, border: '1px solid rgba(248,113,113,0.2)' }}>
        <p style={{ ...sectionTitleStyle, color: '#f87171' }}>Sign Out</p>
        <button
          onClick={() => handleLogout('manual')}
          style={{
            padding: '10px 24px',
            background: 'transparent',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 8,
            color: '#f87171',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.68rem',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Sign Out of Dashboard
        </button>
      </div>

    </div>
  );
}
