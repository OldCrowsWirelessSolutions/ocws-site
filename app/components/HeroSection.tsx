'use client';
import Link from 'next/link';

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.oldcrowswireless.crowseye";

export default function HeroSection() {
  return (
    <section className="py-24 px-6 text-center" style={{ background: "#0D1520" }}>
      <div className="max-w-2xl mx-auto">

        {/* Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-4"
           style={{ color: "#22D6DC", letterSpacing: "0.2em" }}>
          Crow&rsquo;s Eye by Corvus
        </p>

        {/* H1 */}
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
          Full bars. Still buffering.<br />Corvus knows why.
        </h1>

        {/* Subheadline */}
        <p className="text-base md:text-lg mb-10 leading-relaxed" style={{ color: "#B8CCD8" }}>
          AI-powered wireless diagnostics. Plain English results. No engineer required.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-bold"
            style={{ background: "linear-gradient(135deg, #0D6E7A, #22D6DC)", color: "#fff", textDecoration: "none" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M2 3.27L12.73 12L2 20.73V3.27Z" fill="#fff" opacity="0.9" />
              <path d="M2 3.27L16.5 7.5L12.73 12L2 3.27Z" fill="#fff" opacity="0.7" />
              <path d="M2 20.73L12.73 12L16.5 16.5L2 20.73Z" fill="#fff" opacity="0.8" />
              <path d="M16.5 7.5L22 12L16.5 16.5L12.73 12L16.5 7.5Z" fill="#fff" />
            </svg>
            Download on Google Play
          </a>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-semibold"
            style={{ border: "1px solid rgba(34,214,220,0.3)", color: "#22D6DC", background: "transparent" }}
          >
            See Pricing
          </Link>
        </div>

      </div>
    </section>
  );
}
