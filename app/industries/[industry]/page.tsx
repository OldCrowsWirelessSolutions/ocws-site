// app/industries/[industry]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Container from "@/app/components/Container";
import SectionHeader from "@/app/components/SectionHeader";
import Hero from "@/app/components/Hero";
import { industries, services, verticals, type Vertical } from "@/app/data/catalog";

type PageProps = {
  params: { industry: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const ind = industries.find((i) => i.key === params.industry);
  if (!ind) {
    return {
      title: "Industry Not Found | Old Crows Wireless Solutions",
      description: "The requested industry page could not be found.",
    };
  }

  const title = `${ind.name} | OCWS Industries`;
  const description = ind.tagline.length > 155 ? ind.tagline.slice(0, 152) + "..." : ind.tagline;
  return { title, description };
}

export default function IndustryPage({ params }: PageProps) {
  const ind = industries.find((i) => i.key === params.industry);
  if (!ind) return notFound();

  const indVerticals: Vertical[] = (ind.verticals ?? [])
    .map((k) => verticals.find((v) => v.key === k))
    .filter((v): v is Vertical => Boolean(v));

  const relevantServices = services.filter((s) => s.forIndustries.includes(ind.key));

  return (
    <main className="min-h-screen bg-ocws-midnight text-white">
      <Hero
        title={ind.name}
        subtitle={ind.tagline}
        imageSrc={ind.image}
        imageAlt={`${ind.name} | OCWS`}
        ctaSecondaryText="Back to Industries"
        ctaSecondaryHref="/#industries"
        ctaPrimaryText="Request Quote"
        ctaPrimaryHref="/request-quote"
        footerLine="RF-focused diagnostics • Coverage risk identification • Measurement-based recommendations"
      />

      <Container>
        <div className="py-14">
          {indVerticals.length ? (
            <section className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
              <SectionHeader title="Verticals we support" />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {indVerticals.map((v) => (
                  <div key={v.key} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="font-semibold">{v.name}</p>
                    <p className="mt-1 text-sm text-white/70">{v.short}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <SectionHeader title="Services for this industry" />
            <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relevantServices.map((svc) => {
                const quoteHref = `/intake?service=${encodeURIComponent(svc.key)}`;

                return (
                  <div key={svc.key} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
                    <p className="text-lg font-semibold">{svc.name}</p>
                    <p className="mt-2 text-sm text-white/75">{svc.short}</p>

                    <ul className="mt-4 space-y-2">
                      {svc.bullets.slice(0, 4).map((b, i) => (
                        <li key={i} className="text-sm text-white/80">
                          • {b}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 flex items-center justify-between">
                      <Link
                        href={`/learn/${svc.key}`}
                        className="inline-flex items-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                      >
                        Learn More →
                      </Link>

                      <Link
                        href={quoteHref}
                        className="text-sm font-semibold text-white/80 transition hover:text-white"
                      >
                        Request Quote
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <p className="text-lg font-semibold">Not sure which service you need?</p>
            <p className="mt-2 text-sm text-white/75">
              Use our intake form and we’ll recommend the right scope based on your site, devices, and symptoms.
            </p>
            <div className="mt-5">
              <Link
                href="/intake"
                className="inline-flex items-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Start Intake →
              </Link>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
