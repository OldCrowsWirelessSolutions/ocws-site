// app/components/Hero.tsx
import Link from "next/link";
import Image from "next/image";

type HeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
  secondaryCtaHref?: string;
  secondaryCtaLabel?: string;
};

export default function Hero({
  eyebrow = "EVIDENCE-DRIVEN • FIELD-TESTED • ACTIONABLE",
  title = "Clarity where wireless fails.",
  subtitle =
    "Old Crows Wireless Solutions helps homes and businesses uncover the real cause of connectivity failures—RF interference, Wi-Fi congestion, placement issues, or carrier limitations—then delivers a clear plan to fix it.",
  primaryCtaHref = "/request-quote",
  primaryCtaLabel = "Request a Quote",
  secondaryCtaHref = "/services",
  secondaryCtaLabel = "Explore Services",
}: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_10px_26px_rgba(0,0,0,0.45)]">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/hero.jpg"
          alt="OCWS hero background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Subtle gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/25 to-black/70" />
        {/* Slight brand tint (very subtle) */}
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_0%,rgba(0,212,255,0.12),transparent_55%),radial-gradient(800px_circle_at_90%_20%,rgba(214,178,94,0.10),transparent_60%)]" />
      </div>

      {/* Content */}
      <div className="relative px-6 py-10 md:px-10 md:py-14">
        <div className="max-w-3xl">
          <div className="text-xs tracking-widest uppercase text-white/60">
            {eyebrow}
          </div>

          <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-white">
            {title}
          </h1>

          <p className="mt-4 text-base md:text-lg text-white/75 leading-relaxed">
            {subtitle}
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link href={primaryCtaHref} className="ocws-btn ocws-btn-primary">
              {primaryCtaLabel}
            </Link>
            <Link href={secondaryCtaHref} className="ocws-btn ocws-btn-ghost">
              {secondaryCtaLabel}
            </Link>
          </div>

          {/* Quick facts tiles */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4">
              <div className="text-xs text-white/55">Outcome</div>
              <div className="mt-1 text-sm text-white font-semibold">Reliable performance</div>
              <div className="mt-1 text-xs text-white/55">
                Calls, streaming, smart home stability
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4">
              <div className="text-xs text-white/55">Approach</div>
              <div className="mt-1 text-sm text-white font-semibold">Evidence-first</div>
              <div className="mt-1 text-xs text-white/55">
                Measurements + defensible findings
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4">
              <div className="text-xs text-white/55">Deliverable</div>
              <div className="mt-1 text-sm text-white font-semibold">Action plan</div>
              <div className="mt-1 text-xs text-white/55">
                Clear steps, priorities, and next moves
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
