import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why You Have Bars But Bad Service | OCWS Learn",
  description:
    "Bars aren’t the whole story. Learn the common causes of bad calls/data despite “good signal.”",
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
            Why You Have Bars But Calls/Data Are Bad
          </h1>
          <p className="mt-3 text-sm md:text-base ocws-muted2 max-w-3xl leading-6">
            Good “bars” can coexist with poor performance when quality, load, or band behavior
            is working against you.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <Card
              title="1) Signal quality is poor (noise/interference)"
              body="You may be receiving a strong signal, but it’s corrupted by noise, reflections, or interference. This shows up as low SINR/SNR and causes drops, stalls, and high latency."
            />
            <Card
              title="2) The network is loaded (congestion)"
              body="Cell sites and Wi-Fi networks are shared. If many users are active, performance can collapse even when signal looks fine."
            />
            <Card
              title="3) Band/technology selection isn’t ideal"
              body="Your device may choose a band that looks strong but performs worse indoors, or it may bounce between technologies. That transition behavior can feel like instability."
            />
            <Card
              title="4) Indoor environment is the real problem"
              body="Metal, low-E glass, dense walls, and building geometry can create strong multipath with poor usability. Sometimes the fix is placement, not power."
            />

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
              <div className="text-sm font-semibold text-white">OCWS approach</div>
              <p className="mt-2 text-sm leading-6 text-white/75">
                We measure coverage + quality, map problem zones, identify the dominant cause, and then recommend
                changes you can defend with data (including validation after changes).
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
