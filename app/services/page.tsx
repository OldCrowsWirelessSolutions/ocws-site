// app/services/page.tsx
import Link from "next/link";
import { ALL_SERVICES, INDUSTRY_TO_SERVICE_HREFS } from "../data/industryServiceMap";
import { industries } from "../data/industries";

export const metadata = {
  title: "Services | Old Crows Wireless Solutions (OCWS)",
  description: "Evidence-driven RF services tailored to your environment.",
};

type PageProps = {
  searchParams?: {
    industry?: string;
  };
};

function getIndustryNameFromSlug(slug: string | undefined) {
  if (!slug) return null;
  const match = industries.find((i) => i.slug === slug);
  return match?.name ?? slug;
}

function serviceCard(service: {
  href: string;
  title: string;
  description: string;
  footnote?: string;
}) {
  return (
    <Link key={service.href} href={service.href} className="ocws-tile ocws-tile-hover p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">{service.title}</h3>
        <span className="text-white/40" aria-hidden="true">
          →
        </span>
      </div>
      <p className="mt-3 text-sm ocws-muted leading-relaxed">{service.description}</p>
      {service.footnote ? (
        <div className="mt-4 text-xs ocws-muted2">{service.footnote}</div>
      ) : null}
    </Link>
  );
}

export default function ServicesPage({ searchParams }: PageProps) {
  const industrySlug = searchParams?.industry?.trim();
  const industryName = getIndustryNameFromSlug(industrySlug);

  const recommendedHrefs =
    (industrySlug && INDUSTRY_TO_SERVICE_HREFS[industrySlug]) || [];

  const recommendedServices =
    recommendedHrefs.length > 0
      ? ALL_SERVICES.filter((s) => recommendedHrefs.includes(s.href))
      : [];

  return (
    <div className="ocws-container py-12 md:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Services
          </h1>
          <p className="mt-2 ocws-muted text-sm md:text-base">
            Choose a starting point based on your environment, goals, and constraints.
          </p>
        </div>

        <Link href="/request-quote" className="ocws-btn ocws-btn-primary">
          Request a Quote
        </Link>
      </div>

      {/* Recommended services when arriving from an industry tile */}
      {industryName && (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
                Recommended for {industryName}
              </h2>
              <p className="mt-2 ocws-muted text-sm md:text-base">
                Suggested starting points based on the selected industry.
              </p>
            </div>

            <Link href="/services" className="ocws-btn ocws-btn-ghost">
              Clear filter
            </Link>
          </div>

          {recommendedServices.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedServices.map(serviceCard)}
            </div>
          ) : (
            <div className="mt-6 ocws-tile p-6">
              <p className="ocws-muted text-sm md:text-base">
                We don’t have a recommendation map for this industry yet. Here are all services:
              </p>
            </div>
          )}
        </section>
      )}

      {/* All services */}
      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
              All services
            </h2>
            <p className="mt-2 ocws-muted text-sm md:text-base">
              Browse the full catalog of OCWS service offerings.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {ALL_SERVICES.map(serviceCard)}
        </div>
      </section>
    </div>
  );
}
