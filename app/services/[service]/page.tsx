// app/services/[service]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceDetailBySlug, serviceDetails } from "../../data/serviceDetails";

export function generateStaticParams() {
  return serviceDetails.map((s) => ({ service: s.slug }));
}

export function generateMetadata({ params }: { params: { service: string } }) {
  const svc = getServiceDetailBySlug(params.service);
  if (!svc) return { title: "Service | OCWS" };

  return {
    title: `${svc.title} | OCWS`,
    description: svc.short,
  };
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-white/80">
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white">{title}</h2>
      <div className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">{children}</div>
    </section>
  );
}

function VisualGrid({
  items,
}: {
  items: { title: string; desc: string; src: string; alt: string }[];
}) {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((v) => (
        <div
          key={v.title}
          className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
        >
          {/* CRITICAL: parent must be relative + have height when using Image fill */}
          <div className="relative h-44 md:h-40 lg:h-44 w-full">
            <Image
              src={v.src}
              alt={v.alt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
          </div>

          <div className="p-5">
            <h3 className="text-base font-semibold text-white">{v.title}</h3>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">{v.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ServiceDetailPage({ params }: { params: { service: string } }) {
  const svc = getServiceDetailBySlug(params.service);
  if (!svc) return notFound();

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-12 md:py-16">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Services</span>
          </Link>

          {/* Your tree shows "request-quote" */}
          <Link
            href="/request-quote"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white hover:bg-white/[0.10] transition"
          >
            Request a Quote
          </Link>
        </div>

        <header className="mt-10">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
            {svc.title}
          </h1>
          <p className="mt-3 max-w-3xl text-base md:text-lg text-white/70 leading-relaxed">
            {svc.short}
          </p>

          <div className="mt-8">
            <Pill>
              <span className="font-semibold text-white">{svc.tagline}</span>
            </Pill>
          </div>

          {svc.quickFacts?.length ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {svc.quickFacts.map((f) => (
                <div
                  key={f.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="text-xs text-white/50">{f.label}</div>
                  <div className="mt-1 text-sm md:text-base text-white">{f.value}</div>
                </div>
              ))}
            </div>
          ) : null}
        </header>

        {svc.visuals?.length ? <VisualGrid items={svc.visuals} /> : null}

        <Section title="What it is">{svc.whatItIs}</Section>

        <Section title="Why you need it">
          <ul className="mt-3 space-y-2 list-disc pl-5">
            {svc.whyYouNeedIt.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>

        <Section title="What you get">
          <ul className="mt-3 space-y-2 list-disc pl-5">
            {svc.whatYouGet.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/request-quote"
              className="inline-flex items-center justify-center rounded-xl bg-white text-black px-5 py-3 text-sm font-semibold hover:opacity-90 transition"
            >
              Request a Quote
            </Link>

            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm text-white hover:bg-white/[0.10] transition"
            >
              View All Services
            </Link>
          </div>
        </Section>

        {svc.faqs?.length ? (
          <Section title="FAQ">
            <div className="mt-4 space-y-4">
              {svc.faqs.map((f) => (
                <div
                  key={f.q}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="text-white font-semibold">{f.q}</div>
                  <div className="mt-2 text-sm text-white/70 leading-relaxed">{f.a}</div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        <div className="mt-14 border-t border-white/10 pt-6 text-xs text-white/50">
          Old Crows Wireless Solutions (OCWS) • Evidence-driven RF diagnostics and optimization
        </div>
      </div>
    </main>
  );
}
