// app/learn/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn | Old Crows Wireless Solutions",
  description:
    "Plain-English education on Wi-Fi, channels, signal strength, and how Corvus diagnoses your wireless environment.",
};

export default function LearnPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-16">
        {/* Page header */}
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.18em" }}>
            Crow&rsquo;s Eye · Education
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How Wi-Fi actually works.
          </h1>
          <p className="text-base max-w-2xl" style={{ color: "#888" }}>
            Plain English. No jargon without an explanation. This is what Corvus already knows —
            now you can too.
          </p>
        </div>

        {/* Section 1: What is Wi-Fi */}
        <div
          className="rounded-2xl p-8 mb-6"
          style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">What is Wi-Fi and how does it work?</h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
            Wi-Fi is radio. Your router is a small radio station broadcasting on specific frequencies.
            Your phone, laptop, and smart TV are receivers tuned to those frequencies. Every wall,
            appliance, and neighboring router affects how well that signal travels.
          </p>
          <p className="text-base leading-relaxed" style={{ color: "#aaa" }}>
            Unlike a cable, Wi-Fi has to share the air with every other wireless device in your area.
            Your neighbors&rsquo; routers, baby monitors, microwaves, and Bluetooth devices are all
            competing for the same airspace. That competition is where most &ldquo;bad Wi-Fi&rdquo; problems
            actually come from.
          </p>
        </div>

        {/* Section 2: Channels */}
        <div
          className="rounded-2xl p-8 mb-6"
          style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">What are channels and why do they matter?</h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
            The 2.4 GHz Wi-Fi band is divided into 14 channels — but only channels 1, 6, and 11
            don&rsquo;t overlap with each other. Every other channel partially overlaps with its neighbors,
            creating interference even when no two routers are on the exact same channel.
          </p>
          <div
            className="rounded-xl px-5 py-4 mb-4"
            style={{ border: "1px solid #0D6E7A", background: "rgba(13,110,122,0.08)" }}
          >
            <p className="text-sm font-semibold text-white mb-2">The Three Non-Overlapping Channels</p>
            <p className="text-sm" style={{ color: "#aaa" }}>
              <strong style={{ color: "#00C2C7" }}>Channel 1</strong> — 2.412 GHz &nbsp;|&nbsp;
              <strong style={{ color: "#00C2C7" }}>Channel 6</strong> — 2.437 GHz &nbsp;|&nbsp;
              <strong style={{ color: "#00C2C7" }}>Channel 11</strong> — 2.462 GHz
            </p>
            <p className="text-sm mt-2" style={{ color: "#888" }}>
              Every Wi-Fi network in your area should be on one of these three channels. If they&rsquo;re
              not, they&rsquo;re creating interference by design.
            </p>
          </div>
          <p className="text-base leading-relaxed" style={{ color: "#aaa" }}>
            The 5 GHz band has many more non-overlapping channels, which is one reason 5 GHz is
            generally faster and less congested — though it doesn&rsquo;t penetrate walls as well.
          </p>
        </div>

        {/* Section 3: Signal Strength */}
        <div
          className="rounded-2xl p-8 mb-6"
          style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">What is signal strength (dBm)?</h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
            Signal strength is measured in dBm — decibels relative to one milliwatt. The scale is
            negative: numbers closer to zero are stronger. -40 dBm is excellent. -80 dBm is barely
            usable.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {[
              { range: "-30 to -50 dBm", label: "Excellent", color: "#22c55e" },
              { range: "-50 to -65 dBm", label: "Good", color: "#86efac" },
              { range: "-65 to -70 dBm", label: "Fair", color: "#f59e0b" },
              { range: "-70 to -80 dBm", label: "Poor", color: "#ef4444" },
              { range: "Below -80 dBm", label: "Barely there", color: "#991b1b" },
            ].map(({ range, label, color }) => (
              <div
                key={range}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-sm font-mono text-white">{range}</span>
                <span className="text-sm ml-auto" style={{ color: color }}>{label}</span>
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: "#888" }}>
            Corvus flags any network signal below -70 dBm as a problem worth addressing.
          </p>
        </div>

        {/* Section 4: Channel Congestion */}
        <div
          className="rounded-2xl p-8 mb-6"
          style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">What is channel congestion?</h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
            When multiple routers broadcast on the same channel, they compete for airtime. Every
            time one router transmits, all others on that channel have to wait. In a dense apartment
            building, Channel 6 might have 8 networks fighting for the same slice of spectrum.
          </p>
          <p className="text-base leading-relaxed" style={{ color: "#aaa" }}>
            This is why your Wi-Fi degrades at 7pm when your neighbors get home — not because your
            router changed, but because the airspace suddenly got crowded. Corvus identifies exactly
            how many networks are on each channel and whether moving your router to a less congested
            channel would help.
          </p>
        </div>

        {/* Section 5: MAC Address */}
        <div
          className="rounded-2xl p-8 mb-6"
          style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">What is a MAC address?</h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
            Every network device has a MAC (Media Access Control) address — a unique hardware
            identifier that looks like <code className="text-sm px-1 rounded" style={{ background: "rgba(0,0,0,0.4)", color: "#00C2C7" }}>A4:2B:8C:11:22:33</code>.
            The first three pairs (the OUI — Organizationally Unique Identifier) identify the
            manufacturer.
          </p>
          <p className="text-base leading-relaxed" style={{ color: "#aaa" }}>
            Corvus uses your router&rsquo;s MAC address to identify who made it — Netgear, TP-Link, Cox,
            AT&amp;T, etc. — and then delivers fix instructions specific to that exact hardware. Instead
            of generic advice, you get: &ldquo;Open 192.168.0.1, log in with admin/admin, click Wireless,
            change Channel from Auto to 1.&rdquo;
          </p>
        </div>

        {/* Section 6: Reading a Channel Graph */}
        <div
          className="rounded-2xl p-8 mb-10"
          style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">How to read a Channel Graph</h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
            The Channel Graph in WiFi Analyzer shows a bar for every network visible in your
            environment. The X axis is the channel number. The Y axis is signal strength (dBm —
            closer to the top is stronger). Each bar&rsquo;s width represents the channel width that
            network is using.
          </p>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
            A healthy 2.4 GHz graph has bars clustered on channels 1, 6, and 11 with minimal
            overlap between them. An unhealthy graph has bars stacked on top of each other,
            competing for the same frequencies.
          </p>
          <p className="text-base leading-relaxed" style={{ color: "#aaa" }}>
            Corvus reads these graphs directly from your screenshots. He can see how many networks
            are on each channel, how strong each one is, and whether your router is on a
            sub-optimal channel assignment.
          </p>
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "#0D6E7A" }}
        >
          <h3 className="text-2xl font-bold text-white mb-3">
            Ready to let Corvus analyze your network?
          </h3>
          <p className="text-base mb-6" style={{ color: "rgba(255,255,255,0.75)" }}>
            Free instant analysis. No account required.
          </p>
          <Link
            href="/crows-eye"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-bold transition"
            style={{ background: "#0D1520", color: "white" }}
          >
            Get Corvus&rsquo; Verdict
          </Link>
        </div>
      </section>
    </main>
  );
}
