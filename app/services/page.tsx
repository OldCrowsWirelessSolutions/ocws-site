// app/services/page.tsx
import Link from "next/link";
import { serviceDetails } from "../data/serviceDetails";

export const metadata = {
  title: "Services | OCWS",
  description: "Explore Old Crows Wireless Solutions service offerings.",
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-12 md:py-16">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
            Services
          </h1>

          <Link
            href="/request-quote"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white hover:bg-white/[0.10] transition"
          >
            Request a Quote
          </Link>
        </div>

        <p className="mt-3 max-w-3xl text-base md:text-lg text-white/70 leading-relaxed">
          Evidence-driven RF diagnostics, validation, and optimization—built for real-world performance.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {serviceDetails.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg md:text-xl font-semibold text-white">
                  {s.title}
                </h2>
                <span
                  className="text-white/40 group-hover:text-white/70 transition"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>

              <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">
                {s.short}
              </p>

              <div className="mt-4 text-xs text-white/50">
                View details
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
