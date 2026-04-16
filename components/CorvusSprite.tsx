'use client'

import { useEffect, useRef, useState } from 'react'

// ── Timing constants (ms) ────────────────────────────────────────────────────
const FADE_IN_MS      = 150
const SETTLE_MS       = 200
const PRE_BUBBLE_MS   = 300
const BUBBLE_IN_MS    = 150
const BUBBLE_DISP_MS  = 1800
const BUBBLE_OUT_MS   = 150
const POST_BUBBLE_MS  = 600
// LAUNCH_MS and EXIT_DISP_MS reserved — used in exit sequence timing
const DEPART_FADE_MS  = 250
const SILENT_WATCH_MS = 3000

const FLIGHT_MS = 900   // entry/exit flight animation duration

// ── Frequency schedules ──────────────────────────────────────────────────────
function freqMs(f: 'low' | 'normal' | 'high'): [number, number] {
  if (f === 'low')  return [75000, 90000]
  if (f === 'high') return [20000, 40000]
  return [45000, 75000]
}

// ── Types ────────────────────────────────────────────────────────────────────
type Phase      = 'idle' | 'entering' | 'perched' | 'bubble' | 'laughing' | 'silent' | 'exiting'
type LaughLevel = 1 | 2 | 3 | 4 | 5
type VisitMode  = 'normal' | 'laugh' | 'silent' | 'upside' | 'cheshire'

// ── Speech lines ─────────────────────────────────────────────────────────────
const LINES = [
  "I've already rendered my Verdict.",
  "I found problems. Some are embarrassing.",
  "I've seen worse. Not much worse.",
  "Your signal thinks it's fine. It isn't.",
  'Ha.',
]

// ── Laugh durations and bubble display times ─────────────────────────────────
const LAUGH_DURATION_MS: Record<LaughLevel, number> = {
  1: 250,
  2: 350,
  3: 500,
  4: 700,
  5: 1000,
}

const LAUGH_DISPLAY_MS: Record<LaughLevel, number> = {
  1: BUBBLE_DISP_MS,
  2: BUBBLE_DISP_MS,
  3: 2200,
  4: 2800,
  5: 3500,
}

// ── CSS keyframes injected as a <style> tag ───────────────────────────────────
// All five laugh animations; laugh-4 and laugh-5 include translateY bounce.
const CSS_KEYFRAMES = `
@keyframes corvus-laugh-1 {
  0%,100% { transform:scale(1); }
  50%     { transform:scale(1.08); }
}
@keyframes corvus-laugh-2 {
  0%   { transform:scale(1) rotate(0deg); }
  25%  { transform:scale(1.12) rotate(-5deg); }
  60%  { transform:scale(0.97) rotate(5deg); }
  100% { transform:scale(1) rotate(0deg); }
}
@keyframes corvus-laugh-3 {
  0%   { transform:scale(1) rotate(0deg); }
  20%  { transform:scale(1.18) rotate(-8deg); }
  45%  { transform:scale(0.93) rotate(5deg); }
  70%  { transform:scale(1.05) rotate(-8deg); }
  100% { transform:scale(1) rotate(0deg); }
}
@keyframes corvus-laugh-4 {
  0%   { transform:scale(1) rotate(0deg) translateY(0); }
  15%  { transform:scale(1.25) rotate(-10deg) translateY(-3px); }
  30%  { transform:scale(0.88) rotate(8deg) translateY(0); }
  50%  { transform:scale(1.1) rotate(-5deg) translateY(-8px); }
  70%  { transform:scale(0.96) rotate(3deg) translateY(-4px); }
  100% { transform:scale(1) rotate(0deg) translateY(0); }
}
@keyframes corvus-laugh-5 {
  0%   { transform:scale(1) rotate(0deg) translateY(0); }
  10%  { transform:scale(1.35) rotate(-15deg) translateY(-5px); }
  22%  { transform:scale(0.80) rotate(12deg) translateY(0); }
  35%  { transform:scale(1.2) rotate(-8deg) translateY(-15px); }
  50%  { transform:scale(0.90) rotate(5deg) translateY(-8px); }
  65%  { transform:scale(1.1) rotate(-12deg) translateY(-10px); }
  80%  { transform:scale(0.97) rotate(8deg) translateY(-5px); }
  100% { transform:scale(1) rotate(0deg) translateY(0); }
}
`

// ── Props ────────────────────────────────────────────────────────────────────
export interface CorvusSpriteProps {
  frequency?: 'low' | 'normal' | 'high'
  className?: string
}

export default function CorvusSprite({ frequency = 'normal', className }: CorvusSpriteProps) {
  // Hydration guard — only render after client mount to prevent SSR mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // ── Wing flap ──────────────────────────────────────────────────────────────
  const [wingsFlap, setWingsFlap] = useState(false)
  const [wingsUp,   setWingsUp]   = useState(false)

  // ── Speech bubble ──────────────────────────────────────────────────────────
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleVis,  setBubbleVis]  = useState(false)
  const [bubbleLine, setBubbleLine] = useState('')

  // ── Level-5 flash overlay ──────────────────────────────────────────────────
  const [showFlash, setShowFlash] = useState(false)
  const [flashVis,  setFlashVis]  = useState(false)

  // ── Sprite visual state ────────────────────────────────────────────────────
  const [upside,     setUpside]     = useState(false)
  const [laughAnim,  setLaughAnim]  = useState('')
  const [laughDurMs, setLaughDurMs] = useState(250)

  // ── CSS-transition-driven position + opacity ───────────────────────────────
  const [spriteX,  setSpriteX]  = useState(120)   // translateX offset in px
  const [spriteOp, setSpriteOp] = useState(0)
  const [spriteTx, setSpriteTx] = useState('none') // CSS transition shorthand

  // ── Cheshire per-part opacities ────────────────────────────────────────────
  const [headOp,  setHeadOp]  = useState(1)
  const [bodyOp,  setBodyOp]  = useState(1)
  const [wingsOp, setWingsOp] = useState(1)

  // ── Refs (always current, safe inside stale closures) ─────────────────────
  const mountedRef      = useRef(false)
  const phaseRef        = useRef<Phase>('idle')
  const freqRef         = useRef(frequency)
  const schedRef        = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef        = useRef<ReturnType<typeof setTimeout> | null>(null)
  const state2Ref       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastLineRef     = useRef<string | null>(null)
  const lastWasLaughRef = useRef(false)

  useEffect(() => { freqRef.current = frequency }, [frequency])

  // ── Wing flap interval ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!wingsFlap) { setWingsUp(false); return }
    const id = setInterval(() => setWingsUp(prev => !prev), 150)
    return () => clearInterval(id)
  }, [wingsFlap])

  // ── Helpers ────────────────────────────────────────────────────────────────
  function ok()  { return mountedRef.current }

  function clearTimers() {
    if (schedRef.current)  { clearTimeout(schedRef.current);  schedRef.current  = null }
    if (stateRef.current)  { clearTimeout(stateRef.current);  stateRef.current  = null }
    if (state2Ref.current) { clearTimeout(state2Ref.current); state2Ref.current = null }
  }

  function scheduleNext() {
    if (!ok()) return
    const [mn, mx] = freqMs(freqRef.current)
    schedRef.current = setTimeout(() => {
      if (ok() && phaseRef.current === 'idle') beginVisit()
    }, mn + Math.random() * (mx - mn))
  }

  function rollVisitMode(): VisitMode {
    const r = Math.random()
    if (!lastWasLaughRef.current && r < 0.25) return 'laugh'
    if (r < 0.45) return 'silent'
    if (r < 0.55) return 'upside'
    if (r < 0.75) return 'cheshire'
    return 'normal'
  }

  function determineLaughLevel(): LaughLevel {
    if (Math.random() < 0.03) return 5
    const r = Math.random()
    if (r < 0.40) return 1
    if (r < 0.65) return 2
    if (r < 0.82) return 3
    if (r < 0.94) return 4
    return 5
  }

  function pickLine(): string {
    const pool = LINES.filter(l => l !== lastLineRef.current)
    const line = pool[Math.floor(Math.random() * pool.length)]
    lastLineRef.current = line
    return line
  }

  // ── State machine ──────────────────────────────────────────────────────────

  function beginVisit() {
    if (!ok() || phaseRef.current !== 'idle') return
    clearTimers()
    phaseRef.current = 'entering'

    const mode  = rollVisitMode()
    const level: LaughLevel = mode === 'laugh' ? determineLaughLevel() : 1

    setUpside(mode === 'upside')
    setLaughAnim('')

    if (mode === 'cheshire') {
      // Teleport to position with parts invisible, stagger them in: head → body → wings
      setHeadOp(0); setBodyOp(0); setWingsOp(0)
      setSpriteTx('none')
      setSpriteX(0); setSpriteOp(1)
      setWingsFlap(false)

      stateRef.current = setTimeout(() => {
        if (!ok()) return
        setHeadOp(1)
        stateRef.current = setTimeout(() => {
          if (!ok()) return
          setBodyOp(1)
          stateRef.current = setTimeout(() => {
            if (!ok()) return
            setWingsOp(1)
            stateRef.current = setTimeout(() => {
              if (!ok()) return
              doPerched(mode, level)
            }, 200)
          }, 150)
        }, 150)
      }, 150)
      return
    }

    // Standard fly-in: start off-screen right, then transition to x=0
    setHeadOp(1); setBodyOp(1); setWingsOp(1)
    setSpriteTx('none')
    setSpriteX(120)
    setSpriteOp(0)
    setWingsFlap(true)

    // 20ms delay ensures the initial off-screen position is committed to the DOM
    // before the transition is applied — prevents the browser from skipping the animation
    stateRef.current = setTimeout(() => {
      if (!ok()) return
      setSpriteTx(`transform ${FLIGHT_MS}ms ease-in-out, opacity ${FADE_IN_MS}ms ease`)
      setSpriteX(0)
      setSpriteOp(1)

      stateRef.current = setTimeout(() => {
        if (!ok()) return
        setWingsFlap(false)
        doPerched(mode, level)
      }, FLIGHT_MS + SETTLE_MS)
    }, 20)
  }

  function doPerched(mode: VisitMode, level: LaughLevel) {
    if (!ok()) return
    setSpriteTx('none')

    if (mode === 'silent') {
      phaseRef.current = 'silent'
      stateRef.current = setTimeout(() => {
        if (!ok()) return
        doExit()
      }, SILENT_WATCH_MS)
      return
    }

    phaseRef.current = 'perched'

    if (mode === 'laugh') {
      stateRef.current = setTimeout(() => {
        if (!ok()) return
        doLaugh(level)
      }, PRE_BUBBLE_MS)
      return
    }

    // Normal / upside / cheshire: show bubble then exit
    stateRef.current = setTimeout(() => {
      if (!ok()) return
      doShowBubble(BUBBLE_DISP_MS, () => {
        stateRef.current = setTimeout(() => {
          if (!ok()) return
          doExit()
        }, POST_BUBBLE_MS)
      })
    }, PRE_BUBBLE_MS)
  }

  function doLaugh(level: LaughLevel) {
    if (!ok()) return
    phaseRef.current = 'laughing'

    const dur = LAUGH_DURATION_MS[level]
    setLaughAnim(`corvus-laugh-${level}`)
    setLaughDurMs(dur)

    if (level === 5) {
      setShowFlash(true)
      setFlashVis(true)
      state2Ref.current = setTimeout(() => { if (ok()) setFlashVis(false) }, 150)
      setTimeout(() => { if (mountedRef.current) setShowFlash(false) }, 400)
    }

    stateRef.current = setTimeout(() => {
      if (!ok()) return
      setLaughAnim('')
      lastWasLaughRef.current = true

      doShowBubble(LAUGH_DISPLAY_MS[level], () => {
        lastWasLaughRef.current = false
        stateRef.current = setTimeout(() => {
          if (!ok()) return
          doExit()
        }, POST_BUBBLE_MS)
      })
    }, dur)
  }

  function doShowBubble(displayMs: number, onDone: () => void) {
    if (!ok()) return
    phaseRef.current = 'bubble'
    setBubbleLine(pickLine())
    setShowBubble(true)

    // 10ms delay lets React mount the bubble div before the opacity transition fires
    stateRef.current = setTimeout(() => {
      if (!ok()) return
      setBubbleVis(true)

      stateRef.current = setTimeout(() => {
        if (!ok()) return
        setBubbleVis(false)
        stateRef.current = setTimeout(() => {
          if (!ok()) return
          setShowBubble(false)
          onDone()
        }, BUBBLE_OUT_MS)
      }, displayMs)
    }, 10)
  }

  function doExit() {
    if (!ok()) return
    phaseRef.current = 'exiting'
    setBubbleVis(false)
    setWingsFlap(true)
    state2Ref.current = setTimeout(() => {
      if (mountedRef.current) setShowBubble(false)
    }, BUBBLE_OUT_MS)

    // Apply transition, then trigger position change one frame later so the
    // browser registers the before/after values as a proper CSS transition
    setSpriteTx(`transform ${FLIGHT_MS}ms ease-in-out, opacity ${DEPART_FADE_MS}ms ease`)
    stateRef.current = setTimeout(() => {
      if (!ok()) return
      setSpriteX(120)
      setSpriteOp(0)

      stateRef.current = setTimeout(() => {
        if (!ok()) return
        setWingsFlap(false)
        setUpside(false)
        setHeadOp(1); setBodyOp(1); setWingsOp(1)
        phaseRef.current = 'idle'
        scheduleNext()
      }, FLIGHT_MS)
    }, 20)
  }

  // ── Mount / unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true
    // Staggered first visit: 3–8 seconds after page load
    const initDelay = 3000 + Math.random() * 5000
    schedRef.current = setTimeout(() => {
      if (mountedRef.current) beginVisit()
    }, initDelay)
    return () => {
      mountedRef.current = false
      clearTimers()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS_KEYFRAMES}</style>

      {/* Level-5 full-page teal flash — brief opacity pulse */}
      {showFlash && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,194,199,0.15)',
            opacity: flashVis ? 1 : 0,
            transition: `opacity ${flashVis ? 150 : 200}ms ease`,
            pointerEvents: 'none',
            zIndex: 9998,
          }}
        />
      )}

      {/* Fixed anchor — bottom-right corner, flex column so bubble sits above sprite */}
      <div
        className={className}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {/* Speech bubble — rendered above sprite in the flex column */}
        {showBubble && (
          <div
            aria-live="polite"
            style={{
              position: 'relative',
              marginBottom: 8,
              background: '#1A2332',
              border: '1px solid #00C2C7',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 11,
              fontFamily: "'Share Tech Mono', 'Courier New', monospace",
              color: '#00C2C7',
              lineHeight: 1.5,
              whiteSpace: 'nowrap',
              opacity: bubbleVis ? 1 : 0,
              transition: `opacity ${bubbleVis ? BUBBLE_IN_MS : BUBBLE_OUT_MS}ms ease`,
            }}
          >
            {bubbleLine}
            {/* Triangle tail — points down toward the sprite */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                bottom: -6,
                right: 14,
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #00C2C7',
              }}
            />
            <span
              aria-hidden
              style={{
                position: 'absolute',
                bottom: -4,
                right: 15,
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid #1A2332',
              }}
            />
          </div>
        )}

        {/* ── Sprite: 3-layer transform stack ─────────────────────────────── */}

        {/* Layer A (outermost): CSS-transition-driven translateX + opacity for entry/exit */}
        <div
          style={{
            transform: `translateX(${spriteX}px)`,
            opacity: spriteOp,
            transition: spriteTx,
          }}
        >
          {/* Layer B: 180° rotation for upside-down visit mode */}
          <div style={{ transform: upside ? 'rotate(180deg)' : undefined }}>

            {/* Layer C: CSS keyframe animation for laugh levels 1–5 */}
            <div
              style={
                laughAnim
                  ? { animation: `${laughAnim} ${laughDurMs}ms ease-in-out forwards` }
                  : undefined
              }
            >
              {/* 44×44 pixel crow canvas — three absolute SVG layers for cheshire control */}
              <div style={{ position: 'relative', width: 44, height: 44 }}>

                {/* SVG Layer 1 (bottom): body, tail, beak, circuit traces
                    Controlled by bodyOp for cheshire fade-in */}
                <div
                  style={{
                    opacity: bodyOp,
                    transition: 'opacity 150ms ease',
                    position: 'absolute',
                    inset: 0,
                  }}
                >
                  <svg width={44} height={44} viewBox="0 0 120 80" overflow="visible">
                    {/* Tail */}
                    <rect x="2" y="32" width="10" height="14"
                      fill="#0D1520" stroke="#1A2332" strokeWidth="1" />
                    {/* Body */}
                    <rect x="8" y="30" width="56" height="16"
                      fill="#0D1520" stroke="#1A2332" strokeWidth="1" />
                    {/* Beak */}
                    <rect x="70" y="18" width="16" height="10" fill="#8B6914" />
                    {/* Circuit traces across body */}
                    <rect x="14" y="35" width="22" height="1" fill="#00C2C7" opacity={0.6} />
                    <rect x="20" y="39" width="16" height="1" fill="#00C2C7" opacity={0.6} />
                    <rect x="26" y="43" width="10" height="1" fill="#00C2C7" opacity={0.6} />
                  </svg>
                </div>

                {/* SVG Layer 2 (middle): wings — controlled by wingsOp and wing flap state
                    Wing group transform pivots at y=37 (midpoint of upper+lower wing band)
                    to mirror the wing pair for the up-stroke, matching mobile app behavior */}
                <div
                  style={{
                    opacity: wingsOp,
                    transition: 'opacity 150ms ease',
                    position: 'absolute',
                    inset: 0,
                  }}
                >
                  <svg width={44} height={44} viewBox="0 0 120 80">
                    <g transform={wingsUp ? 'translate(0,37) scale(1,-1) translate(0,-37)' : undefined}>
                      {/* Upper wing band */}
                      <rect x="6" y="20" width="50" height="10"
                        fill="#0D1520" stroke="rgba(0,194,199,0.55)" strokeWidth="1" />
                      {/* Lower wing band */}
                      <rect x="4" y="44" width="44" height="10"
                        fill="#0D1520" stroke="rgba(0,194,199,0.55)" strokeWidth="1" />
                    </g>
                  </svg>
                </div>

                {/* SVG Layer 3 (top): head and eye — controlled by headOp
                    Eye glow uses absolute div overlays matching SVG coordinate mapping:
                    SVG (50,15) in a 120×80 viewBox rendered at 44×44 → (50/120*44, 15/80*44) ≈ (18, 8) */}
                <div
                  style={{
                    opacity: headOp,
                    transition: 'opacity 150ms ease',
                    position: 'absolute',
                    inset: 0,
                  }}
                >
                  <svg width={44} height={44} viewBox="0 0 120 80">
                    {/* Head */}
                    <rect x="42" y="8" width="28" height="26"
                      fill="#0D1520" stroke="#1A2332" strokeWidth="1" />
                    {/* Eye */}
                    <rect x="50" y="15" width="6" height="6" fill="#00C2C7" />
                  </svg>
                  {/* Eye glow — two overlapping divs for bloom spread */}
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: 18,
                      top: 8,
                      width: 4,
                      height: 4,
                      background: '#00C2C7',
                      boxShadow: '0 0 8px #00C2C7, 0 0 10px #00C2C7',
                    }}
                  />
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: 20,
                      top: 8,
                      width: 4,
                      height: 4,
                      background: '#00C2C7',
                      boxShadow: '0 0 8px #00C2C7, 0 0 10px #00C2C7',
                      opacity: 0.6,
                    }}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
