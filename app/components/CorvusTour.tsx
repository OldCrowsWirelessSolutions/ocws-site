"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Tour, TourStep } from "@/lib/corvus-tours";
import { speakCorvusFull } from "@/lib/elevenlabs";

interface CorvusTourProps {
  tour: Tour;
  onComplete: () => void;
  onSkip: () => void;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function CorvusTour({ tour, onComplete, onSkip }: CorvusTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [animating, setAnimating] = useState(false);
  const step: TourStep = tour.steps[currentStep];

  const positionTarget = useCallback((target: string | null) => {
    if (!target) { setHighlightRect(null); return; }
    const el = document.querySelector(target);
    if (!el) { setHighlightRect(null); return; }
    const rect = el.getBoundingClientRect();
    setHighlightRect({
      top: rect.top + window.scrollY,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // Trigger on step change
  useEffect(() => {
    if (!step) return;
    setAnimating(true);
    positionTarget(step.target);
    speakCorvusFull(step.corvusLine, 'tour');
    const t = setTimeout(() => setAnimating(false), 400);
    return () => clearTimeout(t);
  }, [currentStep, step, positionTarget]);

  // Reposition on window resize / scroll
  useEffect(() => {
    const reposition = () => positionTarget(step?.target ?? null);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, { passive: true });
    return () => { window.removeEventListener("resize", reposition); window.removeEventListener("scroll", reposition); };
  }, [step, positionTarget]);

  function handleNext() {
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onComplete();
    }
  }

  function handlePrev() {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  }

  // Panel positioning
  const panelPos: React.CSSProperties = (() => {
    if (step?.position === "center" || !highlightRect) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
    if (step?.position === "top") {
      return { bottom: "24px", left: "50%", transform: "translateX(-50%)" };
    }
    return { bottom: "24px", left: "50%", transform: "translateX(-50%)" };
  })();

  return (
    <>
      <style>{`
        @keyframes tour-glow {
          0%, 100% { box-shadow: 0 0 0 4px #00C2C7, 0 0 0 6px rgba(0,194,199,0.3), 0 0 20px rgba(0,194,199,0.4), 0 0 40px rgba(0,194,199,0.2); }
          50%       { box-shadow: 0 0 0 4px #00C2C7, 0 0 0 8px rgba(0,194,199,0.5), 0 0 30px rgba(0,194,199,0.6), 0 0 60px rgba(0,194,199,0.3); }
        }
        @keyframes tour-speech-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Overlay */}
      <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(13,21,32,0.82)", pointerEvents: "none" }}>
        {/* Glowing highlight cutout */}
        {highlightRect && (
          <div style={{
            position: "absolute",
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            borderRadius: 8,
            background: "transparent",
            animation: "tour-glow 1.5s ease-in-out infinite",
            pointerEvents: "none",
          }} />
        )}
      </div>

      {/* Tour panel */}
      <div style={{
        position: "fixed",
        zIndex: 9001,
        width: "min(480px, calc(100vw - 32px))",
        background: "#0D1520",
        border: "1px solid rgba(0,194,199,0.4)",
        borderRadius: 16,
        padding: 20,
        pointerEvents: "all",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        ...panelPos,
      }}>
        {/* Gold top line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #B8922A, #00C2C7, #B8922A)", borderRadius: "16px 16px 0 0" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/corvus_still.png" style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #B8922A", objectFit: "cover" }} alt="Corvus" />
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.45rem", color: "#00C2C7", letterSpacing: "0.15em" }}>CORVUS</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#F4F6F8", fontSize: "0.9rem", fontWeight: 600, margin: "0 0 2px" }}>{step?.title}</p>
            <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", color: "#888888", letterSpacing: "0.1em", margin: 0 }}>
              {currentStep + 1} of {tour.steps.length}
            </p>
          </div>
          <button
            onClick={onSkip}
            style={{ background: "transparent", border: "1px solid rgba(136,136,136,0.2)", borderRadius: 6, padding: "4px 10px", color: "#888888", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}
          >
            Skip Tour
          </button>
        </div>

        {/* Speech */}
        <div style={{
          fontStyle: "italic",
          fontSize: "0.88rem",
          color: "#F4F6F8",
          lineHeight: 1.7,
          marginBottom: 16,
          padding: "12px 14px",
          background: "rgba(0,194,199,0.04)",
          borderLeft: "3px solid #00C2C7",
          borderRadius: "0 8px 8px 0",
          animation: animating ? "tour-speech-fade 0.4s ease" : "none",
        }}>
          {step?.corvusLine}
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
          {tour.steps.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentStep(i)}
              style={{
                width: i === currentStep ? 20 : 6,
                height: 6,
                borderRadius: i === currentStep ? 3 : "50%",
                background: i === currentStep ? "#00C2C7" : i < currentStep ? "rgba(0,194,199,0.4)" : "rgba(136,136,136,0.3)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(136,136,136,0.2)", borderRadius: 8, color: currentStep === 0 ? "rgba(136,136,136,0.3)" : "#888888", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.65rem", cursor: currentStep === 0 ? "not-allowed" : "pointer", transition: "all 0.2s" }}
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            style={{ flex: 1, padding: "8px 16px", background: "rgba(0,194,199,0.1)", border: "1px solid rgba(0,194,199,0.3)", borderRadius: 8, color: "#00C2C7", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.65rem", cursor: "pointer", transition: "all 0.2s" }}
          >
            {currentStep === tour.steps.length - 1 ? "Complete Tour ✓" : "Next →"}
          </button>
        </div>
      </div>
    </>
  );
}
