// app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Old Crows Wireless Solutions",
  description:
    "Joshua Turner founded OCWS after a house fire proved how critical wireless communication really is. 17 years of U.S. Navy Electronic Warfare. Built in Pensacola, FL.",
};

export default function AboutPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-16">
        {/* Header */}
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.18em" }}>
            Old Crows Wireless Solutions LLC
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Built from a house fire.
          </h1>
          <p className="text-base max-w-2xl" style={{ color: "#888" }}>
            Clarity Where Wireless Fails — for everyone, not just engineers.
          </p>
        </div>

        {/* Founder section */}
        <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
          {/* Bio photo */}
          <div className="shrink-0 w-full md:w-auto flex justify-center">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                width: "300px",
                height: "400px",
                border: "2px solid #B8922A",
                boxShadow: "0 0 0 6px rgba(184,146,42,0.12), 0 8px 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/bio-picture.jpg"
                alt="Joshua Turner — Founder, Old Crows Wireless Solutions"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">Joshua Turner</h2>
            <p className="text-sm font-semibold mb-6" style={{ color: "#00C2C7" }}>
              Managing Member, OCWS LLC · Built on 17 years of U.S. Navy Electronic Warfare experience
            </p>

            <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
              In October 2025 our house caught fire. During the cleanup, my wife noticed she
              couldn&rsquo;t get a cell signal anywhere near the structure. She didn&rsquo;t know
              why. I did &mdash; superheated metal wiring changes the magnetic field. The Navy
              taught me that. Old Crows Wireless Solutions was born that night.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
              The mission is simple: give real
              people the wireless clarity that engineers have always had. No guessing. No vague ISP
              advice. Measured findings, plain-English explanations, and fix instructions that
              actually work.
            </p>
            <p className="text-base leading-relaxed mb-6" style={{ color: "#aaa" }}>
              I spent 17 years as a U.S. Navy Electronic Warfare specialist. I&rsquo;ve operated in
              over 55 countries, hunted signals in environments most people will never see, and
              spent more time thinking about the RF spectrum than most people spend thinking about
              anything. This is what I know. Now it&rsquo;s yours.
            </p>

            {/* Faith box */}
            <div
              className="rounded-xl px-5 py-4 mb-6"
              style={{ borderLeft: "3px solid #B8922A" }}
            >
              <p className="text-sm italic" style={{ color: "#B8922A" }}>
                &ldquo;God opened this door. We walked through it.&rdquo;
              </p>
              <p className="mt-1 text-xs" style={{ color: "#666" }}>
                — Joshua Turner, Managing Member, OCWS LLC
              </p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div
          className="rounded-2xl p-8 mb-8"
          style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
            <strong className="text-white">Clarity Where Wireless Fails</strong> — for everyone,
            not just engineers. The tools, knowledge, and diagnostic capability that defense
            contractors and Fortune 500 IT departments have always had — delivered to homeowners,
            small businesses, churches, schools, and anyone whose wireless problems have never
            gotten a real answer.
          </p>
          <p className="text-base leading-relaxed" style={{ color: "#aaa" }}>
            We built Corvus because most people who suffer from bad Wi-Fi never get a straight
            answer. Their ISP tells them to restart the router. Their IT guy says it&rsquo;s the building.
            Nobody looks at the actual RF environment. Corvus looks. He renders a Verdict. And he
            tells you exactly what to do about it.
          </p>
        </div>

        {/* The Old Crows */}
        <div
          className="rounded-2xl p-8 mb-8"
          style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">The Association of Old Crows</h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
            The name Old Crows Wireless Solutions is a direct homage to the{" "}
            <strong className="text-white">Association of Old Crows</strong> — the fraternal
            organization of electronic warfare professionals founded in 1964. AOC members are the
            people who jammed enemy radar, protected aircraft from surface-to-air missiles, and
            hunted signals in the most hostile environments on earth.
          </p>
          <p className="text-base leading-relaxed" style={{ color: "#aaa" }}>
            We are proud to carry that lineage into civilian wireless diagnostics. The same
            discipline, the same obsession with the RF environment, the same commitment to getting
            it right — applied to the Wi-Fi networks that power modern life.
          </p>
        </div>

        {/* 55 countries */}
        <div
          className="rounded-2xl p-8 mb-10"
          style={{ background: "#1A2332", border: "1px solid #0D6E7A" }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">55 Countries. One Standard.</h2>
          <p className="text-base leading-relaxed" style={{ color: "#aaa" }}>
            OCWS has operated — in uniform and as consultants — across more than 55 countries and
            environments ranging from aircraft carriers to mountain villages to dense urban
            corridors. RF physics doesn&rsquo;t change by geography. The spectrum is the spectrum.
            That experience is what Corvus is built on.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/crows-eye"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold ocws-glow-hover"
            style={{ background: "#00C2C7", color: "#0D1520" }}
          >
            Try Crow&rsquo;s Eye Free
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold ocws-glow-hover"
            style={{ border: "1px solid rgba(255,255,255,0.15)", color: "white", background: "transparent" }}
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
}
