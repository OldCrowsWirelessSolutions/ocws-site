import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Wi-Fi Congestion & Channel Planning | OCWS Learn",
  description:
    "Learn how co-channel interference and poor channel planning cause slow Wi-Fi, even with strong signal.",
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
            Wi-Fi Congestion & Channel Planning
          </h1>
          <p className="mt-3 text-sm md:text-base ocws-muted2 max-w-3xl leading-6">
            “Full signal, slow Wi-Fi” is often congestion. Wi-Fi is polite—too many networks on the
            same channel means everyone waits.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <Card
              title="Co-channel interference (CCI)"
              body="When neighboring APs share a channel, devices take turns. More APs can reduce performance if channel reuse isn’t planned."
            />
            <Card
              title="Channel width matters"
              body="Wider channels can increase peak speed in clean environments, but in neighborhoods and businesses they often increase collisions and reduce reliability."
            />
            <Card
              title="Why “auto” often fails"
              body="Auto algorithms can chase short-term noise and fight neighbors. A stable channel plan often beats constant shifting."
            />
            <Card
              title="What OCWS changes"
              body="We measure utilization, interference, and coverage; then set a channel plan and AP placement that matches the environment—not a generic default."
            />
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
