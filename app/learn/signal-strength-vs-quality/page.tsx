import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Signal Strength vs Signal Quality | OCWS Learn",
  description:
    "Understand why strong signal can still perform poorly: SINR/noise, interference, and what to measure.",
};

export default function Page() {
  return (
    <main className="relative">
      <section className="ocws-container pt-10 pb-16">
        <div className="ocws-tile px-5 py-6 md:px-8 md:py-10">
          <Link href="/learn" className="text-sm text-white/70 hover:text-white">
            ← Back to Learn
          </Link>

          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-white tracking-tight">
            Signal Strength vs Signal Quality
          </h1>
          <p className="mt-3 text-sm md:text-base ocws-muted2 max-w-3xl leading-6">
            Most “wireless problems” aren’t a lack of signal — they’re a lack of usable signal.
            Strong strength can still be bad experience if quality is poor.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-5">
              <div className="text-base font-semibold text-white">
                Strength: “How loud is the signal?”
              </div>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Strength is the received power level. On Wi-Fi you’ll hear RSSI. On cellular you’ll
                see metrics like RSRP. Strength helps indicate coverage, but it does not tell you
                whether the connection is clean.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-5">
              <div className="text-base font-semibold text-white">
                Quality: “How usable is the signal?”
              </div>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Quality reflects how much of the received signal is “real” versus noise and interference.
                Metrics like SINR/SNR correlate strongly with throughput, call stability, and latency.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-5">
              <div className="text-base font-semibold text-white">
                Why this matters
              </div>
              <p className="mt-2 text-sm leading-6 text-white/75">
                If quality is poor, adding “more signal” can make things worse (you amplify noise too).
                The fix may be channel planning, reducing interference, relocating equipment, or correcting
                power/placement — not just adding hardware.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
              <div className="text-sm font-semibold text-white">
                OCWS takeaway
              </div>
              <p className="mt-2 text-sm leading-6 text-white/75">
                We measure both coverage and quality, then recommend the smallest change that produces the biggest
                improvement (and we can validate results after changes are made).
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
