import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getIndustry,
  industries,
  services,
  type IndustryKey,
  type ServiceKey,
} from "@/app/data/catalog";

type PageProps = {
  params: { industry: string };
};

export function generateStaticParams() {
  return industries.map((i) => ({ industry: i.key }));
}

export default function IndustryPage({ params }: PageProps) {
  const key = params.industry as IndustryKey;
  const industry = getIndustry(key);

  if (!industry) return notFound();

  const recommended = (industry.recommendedServices ?? []) as ServiceKey[];
  const recommendedServices = services.filter((s) => recommended.includes(s.key));

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Top nav */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/industries" className="text-sm text-white/70 hover:text-white">
            ← Back to Industries
          </Link>
          <Link
            href="/request-quote"
            className="text-sm text-white/80 hover:text-white underline underline-offset-4"
          >
            Request Quote
          </Link>
        </div>

        {/* Header */}
        <h1 className="mt-6 text-3xl sm:text-4xl font-semibold">{industry.name}</h1>
        <p className="mt-2 text-white/70">{industry.tagline}</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="mt-2 text-white/70">{industry.description}</p>

          {industry.verticals?.length ? (
            <div className="mt-5">
              <div className="text-sm text-white/60">Verticals we support</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {industry.verticals.map((v) => (
                  <span
                    key={v}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Services */}
        <div className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold">Recommended services</h2>
            <Link
              href="/services"
              className="text-sm text-white/70 hover:text-white underline underline-offset-4"
            >
              View all services →
            </Link>
          </div>

          {recommendedServices.length === 0 ? (
            <p className="mt-3 text-white/70">
              No recommended services are configured for this industry yet.
            </p>
          ) : (
            <div className="mt-6 grid gap-8">
              {recommendedServices.map((service) => (
                <div
                  key={service.key}
                  className="rounded-2xl border border-white/10 bg-black/30 p-6"
                >
                  <h3 className="text-xl font-semibold">{service.name}</h3>
                  <p className="mt-2 text-white/70">{service.short}</p>

                  {service.bullets?.length ? (
                    <ul className="mt-4 list-disc pl-5 text-white/80 space-y-1">
                      {service.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-6 flex gap-4">
                    <Link
                      href={`/services/${service.key}`}
                      className="text-sm font-medium text-white hover:underline"
                    >
                      Learn more →
                    </Link>
                    <Link
                      href="/request-quote"
                      className="text-sm font-medium text-white/70 hover:text-white underline underline-offset-4"
                    >
                      Request quote
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-2xl font-semibold">Not sure what you need?</h2>
          <p className="mt-2 text-white/70">
            Use our intake form and we’ll recommend the right scope based on your site,
            devices, and symptoms.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/intake"
              className="rounded-xl bg-white text-black font-semibold px-4 py-2 text-center"
            >
              Start Intake →
            </Link>
            <Link
              href="/contact"
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 text-center"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
