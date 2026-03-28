'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { speakCorvus } from '@/lib/elevenlabs';

const CORVUS_LANDING_WELCOME = [
  "Your Wi-Fi has problems. I already know what they are. Let me show you.",
  "You found Crow's Eye. Good timing — your network has been waiting for this conversation.",
  "Welcome. I'm Corvus. I've seen your type of network before, and the good news is I've also seen it fixed.",
  "Good. You're here. Upload your screenshots and I'll tell you exactly what's wrong — no jargon, no guessing.",
  "Welcome to Crow's Eye. I've had three coffees and I'm ready to diagnose your Wi-Fi. Let's go.",
];

export default function HeroSection() {
  useEffect(() => {
    const line = CORVUS_LANDING_WELCOME[Math.floor(Math.random() * CORVUS_LANDING_WELCOME.length)];
    const timer = setTimeout(() => {
      speakCorvus(line);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-20 px-6 text-center" style={{ background: "#0D1520" }}>
      <div className="max-w-2xl mx-auto">

        {/* Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-4"
           style={{ color: "#00C2C7", letterSpacing: "0.2em" }}>
          Crow&rsquo;s Eye by Corvus
        </p>

        {/* H1 */}
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          Your Wi-Fi is broken.<br />Corvus knows why.
        </h1>

        {/* Subtext */}
        <p className="text-base md:text-lg mb-8 leading-relaxed" style={{ color: "#B8CCD8" }}>
          Slow speeds, dead zones, drops that never get explained — Corvus reads your wireless environment and tells you exactly what&rsquo;s wrong and how to fix it. Upload three screenshots. Get your answer in seconds.
        </p>

        {/* Corvus video — large and centered */}
        <div className="mb-8 mx-auto" style={{ maxWidth: "520px" }}>
          <video
            src="/corvus.mp4"
            autoPlay loop muted playsInline
            className="w-full rounded-2xl"
            style={{ border: "2px solid #00C2C7", background: "#0D1520", display: "block" }}
          />
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link href="/crows-eye"
            className="w-full sm:w-auto rounded-2xl px-8 py-4 text-base font-bold"
            style={{ background: "linear-gradient(135deg, #0D6E7A, #00C2C7)", color: "#fff" }}>
            Get Corvus&rsquo; Verdict — Free
          </Link>
          <Link href="/learn"
            className="w-full sm:w-auto rounded-2xl px-8 py-4 text-base font-bold"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}>
            See How It Works
          </Link>
        </div>

        {/* Corvus quote */}
        <div className="rounded-2xl px-6 py-4 mx-auto max-w-lg" style={{ border: "1px solid #B8922A" }}>
          <p className="text-sm italic" style={{ color: "#B8922A" }}>
            &ldquo;I&rsquo;ve already rendered my Verdict. You&rsquo;re just here for the sentencing — and honestly, it&rsquo;s not as bad as it looks.&rdquo;
          </p>
          <p className="mt-2 text-xs" style={{ color: "#7A9AAB" }}>— Corvus</p>
        </div>

      </div>
    </section>
  );
}
