// app/learn/commercial-connectivity-rf-baseline-survey/page.tsx
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Commercial Connectivity & RF Baseline Survey | OCWS",
  description:
    "Establish a defensible baseline across cellular, Wi-Fi, and RF conditions—then receive prioritized recommendations and next steps.",
};

const IMAGES = [
  "/services/commercial-connectivity-rf-baseline-survey-1.jpg",
  "/services/commercial-connectivity-rf-baseline-survey-2.jpg",
  "/services/commercial-connectivity-rf-baseline-survey-3.jpg",
];

export default function CommercialConnectivityRFBaselineSurveyLearnPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* HERO */}
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Commercial Connectivity & RF Baseline Survey
        </h1>
        <p className="mt-3 text-base md:text-lg text-white/75 max-w-3xl">
          Establish a defensible baseline across cellular, Wi-Fi, and RF conditions—then
          invest with confidence using evidence-driven recommendations.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/request-quote"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-white text-black hover:bg-white/90 transition"
          >
            Request a Quote
          </Link>

          <Link
            href="/services/commercial-connectivity-rf-baseline-survey"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold border border-white/20 text-white hover:bg-white/10 transition"
          >
            View as a Service
          </Link>
        </div>
      </section>

      {/* IMAGE GRID */}
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {IMAGES.map((src, i) => (
            <div
              key={src}
              className="relative w-full h-[220px] rounded-2xl overflow-hidden border border-white/10 bg-white/5"
            >
              <Image
                src={src}
                alt={`Commercial Connectivity & RF Baseline Survey image ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </section>

      {/* WHAT IT IS */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">What it is</h2>
        <p className="mt-2 text-white/75">
          A baseline survey for small business and larger commercial environments that documents
          real-world connectivity performance (Wi-Fi + cellular) and the surrounding RF environment,
          producing a prioritized action plan and clear next-step paths.
        </p>
      </section>

      {/* WHY YOU NEED IT */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Why you need it</h2>
        <ul className="mt-3 space-y-2 text-white/75 list-disc pl-5">
          <li>
            Most “fixes” fail because the real constraint wasn’t measured first (coverage, airtime,
            noise, or carrier limitations).
          </li>
          <li>
            You get a defensible starting point before spending on new ISP plans, APs, mesh, or
            cellular solutions.
          </li>
          <li>
            Your stakeholders get a clear, prioritized path with evidence behind it.
          </li>
        </ul>
      </section>

      {/* WHAT YOU GET */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">What you get</h2>
        <ul className="mt-3 space-y-2 text-white/75 list-disc pl-5">
          <li>Measured Wi-Fi performance snapshots in critical areas</li>
          <li>Cellular baseline signal quality (where applicable)</li>
          <li>RF environment observations and practical constraints</li>
          <li>Prioritized recommendations + next-step options</li>
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/request-quote"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-white text-black hover:bg-white/90 transition"
          >
            Get Pricing / Schedule
          </Link>
        </div>
      </section>
    </main>
  );
}
