import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hidden Interference (RFI) Basics | OCWS Learn",
  description:
    "Learn how non-Wi-Fi RF noise sources cause unstable wireless and what an RFI hunt looks like.",
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
            Hidden Interference (RFI) Basics
          </h1>
          <p className="mt-3 text-sm md:text-base ocws-muted2 max-w-3xl leading-6">
            Not all interference is Wi-Fi. Cheap electronics, bad power supplies, lighting,
            and industrial equipment can raise the noise floor and quietly destroy performance.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <Card
              title="Common hidden sources"
              body="LED lighting drivers, failing power supplies, motors, microwave leakage, cheap cameras, building automation, and poorly-shielded cabling."
            />
            <Card
              title="What it feels like"
              body="Random drops, voice choppiness, high latency spikes, throughput that collapses at certain times, or specific rooms that behave ‘haunted.’"
            />
            <Card
              title="How OCWS hunts RFI"
              body="We look for noise patterns, correlate performance to time/location, and isolate candidates using measurement—not guesswork."
            />
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
              <div className="text-sm font-semibold text-white">
                Pro tip
              </div>
              <p className="mt-2 text-sm leading-6 text-white/75">
                If performance changes when certain equipment is on/off, that’s a strong RFI clue.
                Don’t replace your router first—measure and confirm.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-5">
      <div className="text-base font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-white/75">{body}</p>
    </div>
  );
}
