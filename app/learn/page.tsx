// app/learn/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn | Old Crows Wireless Solutions",
  description:
    "Practical RF and wireless education: interference, coverage, Wi-Fi design basics, and how to interpret signal quality.",
};

export default function LearnPage() {
  return (
    <main className="relative">
      {/* background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-slate-950 to-black" />
      <div className="absolute inset-0 -z-10 opacity-40 [background:radial-gradient(900px_500px_at_20%_10%,rgba(34,211,238,0.18),transparent),radial-gradient(800px_500px_at_90%_30%,rgba(245,158,11,0.12),transparent)]" />

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 md:pt-14">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Learn
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-white/70 md:text-base">
              Clear, field-driven explanations of what actually impacts wireless performance:
              signal quality, interference, building materials, and how to diagnose root cause.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card
              title="Signal Strength vs. Signal Quality"
              desc="Why “bars” lie: RSSI/RSRP vs SINR, noise floor, and what good looks like."
            />
            <Card
              title="Wi-Fi Congestion & Channel Planning"
              desc="Co-channel interference, channel width, and why auto settings often fail in dense areas."
            />
            <Card
              title="Hidden Interference (RFI)"
              desc="Non-Wi-Fi noise sources: utilities, bad power supplies, cheap electronics, and how to find them."
            />
            <Card
              title="Coverage, Materials, and Layout"
              desc="How building materials and geometry create dead zones—and why moving an AP 8 feet can matter."
            />
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-sm text-white/70">
              Want this tailored to your environment? We can convert these concepts into a
              measurable plan with defensible data and clear next steps.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="text-base font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-white/70">{desc}</div>
    </div>
  );
}
