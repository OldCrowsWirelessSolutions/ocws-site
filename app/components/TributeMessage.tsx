"use client";

// TributeMessage — one-time tribute overlay for founding friends and supporters.
// Standard style (Kyle): inline card with Corvus avatar and Continue button.
// Fullscreen style (Eric, Nate, Mike): full viewport overlay, Continue button hidden
// until typewriter animation completes + 1.5s pause.

import { useState, useEffect } from "react";
import type { TributeMessage } from "@/lib/tribute-messages";
import { speakCorvus } from "@/lib/elevenlabs";

interface TributeProps {
  message: TributeMessage;
  onDismiss: () => void;
}

export default function TributeMessagePanel({ message, onDismiss }: TributeProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  const speed = message.style === "fullscreen" ? 35 : 25;

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    setShowBtn(false);

    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(message.message.slice(0, i));
      if (i >= message.message.length) {
        clearInterval(id);
        setDone(true);
        // Standard: speak after typewriter completes; fullscreen: speak on start (below)
        if (message.style === "standard") {
          speakCorvus(message.message);
        }
        // Standard: show Continue immediately; fullscreen: 1.5s pause for gravitas
        const delay = message.style === "fullscreen" ? 1500 : 0;
        setTimeout(() => setShowBtn(true), delay);
      }
    }, speed);

    // Fullscreen: voice plays while typewriter animates simultaneously
    if (message.style === "fullscreen") {
      speakCorvus(message.message);
    }

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.message]);

  // Block Escape key for fullscreen — user cannot skip
  useEffect(() => {
    if (message.style !== "fullscreen") return;
    function blockEsc(e: KeyboardEvent) {
      if (e.key === "Escape") e.preventDefault();
    }
    window.addEventListener("keydown", blockEsc, { capture: true });
    return () => window.removeEventListener("keydown", blockEsc, { capture: true });
  }, [message.style]);

  if (message.style === "standard") {
    return (
      <div className="tribute-standard">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/corvus_still.png" className="tribute-corvus-avatar" alt="Corvus" />
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.45rem", color: "#B8922A", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
            CORVUS
          </div>
        </div>
        <div className="tribute-content">
          <div className="tribute-text">
            {displayed}
            {!done && <span className="corvus-speech-cursor">▋</span>}
          </div>
          {showBtn && (
            <>
              <div className="tribute-signature">{message.signature}</div>
              <button className="tribute-continue-btn" onClick={onDismiss}>
                Continue to Dashboard →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Fullscreen (Eric, Nate, Mike) ──────────────────────────────────────────
  return (
    <div
      className="tribute-fullscreen-overlay"
      onClick={e => e.stopPropagation()}
      onKeyDown={e => { if (e.key === "Escape") e.preventDefault(); }}
    >
      <div className="tribute-fullscreen-inner">
        <div className="tribute-gold-bar" />

        <div className="tribute-corvus-large">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/corvus_still.png" alt="Corvus" />
          <div className="tribute-corvus-glow" />
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/OCWS_Logo_Transparent.png" className="tribute-ocws-logo" alt="Old Crows Wireless Solutions" />

        <div className="tribute-fullscreen-text">
          {displayed}
          {!done && <span className="corvus-speech-cursor">▋</span>}
        </div>

        <div className="tribute-fullscreen-signature">{message.signature}</div>

        {/* Continue button — only appears after typewriter completes + 1.5s pause */}
        {showBtn && (
          <button className="tribute-fullscreen-btn" onClick={onDismiss}>
            Continue to Dashboard →
          </button>
        )}

        <div className="tribute-gold-bar" />
      </div>
    </div>
  );
}
