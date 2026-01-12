import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What You Get From OCWS | OCWS Learn",
  description:
    "Understand OCWS deliverables, what validation means, and how to turn results into a plan.",
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
            What You Get From an OCWS Engagement
          </h1>
          <p className="mt-3 text-sm md:text-base ocws-muted2 max-w-3xl leading-6">
            The goal is not “data.” The goal is clarity you can act on—plus validation that changes worked.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <Card
              title="Measured findings"
              body="Coverage + quality measurements that explain what users are experiencing and where it’s happening."
            />
            <Card
              title="Prioritized recommendations"
              body="The highest ROI fixes first: placement, configuration, channel planning, or targeted hardware where it’s truly justified."
            />
            <Card
              title="A defensible plan"
              body="Clear steps that your internal team or installer can execute without guesswork, plus optional vendor/equipment guidance."
            />
            <Card
              title="Post-change validation"
              body="Optional re-testing to confirm improvement and document the results—especially important for business environments and ROI."
            />
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
              <div className="text-sm font-semibold text-white">
                Next step
              </div>
              <p className="mt-2 text-sm leading-6 text-white/75">
                If you want, we can scope a fast assessment first, then expand only if the data supports it.
              </p>
              <div className="mt-4">
                <Link href="/request-quote" className="ocws-btn ocws-btn-primary">
                  Request a Quote
                </Link>
              </div>
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
