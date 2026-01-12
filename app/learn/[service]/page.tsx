// app/learn/[service]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getServiceDetailBySlug } from "@/app/data/serviceDetails";

type PageProps = {
  params: { service: string };
};

export default function LearnServicePage({ params }: PageProps) {
  const detail = getServiceDetailBySlug(params.service);

  if (!detail) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Top */}
      <section className="mb-6">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          {detail.title}
        </h1>
        <p className="mt-3 text-base md:text-lg text-white/75 max-w-3xl">
          {detail.short}
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-white/90 font-medium">{detail.tagline}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/request-quote"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-white text-black hover:bg-white/90 transition"
          >
            Request a Quote
          </Link>

          <Link
            href={`/services/${detail.slug}`}
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold border border-white/20 text-white hover:bg-white/10 transition"
          >
            View Service
          </Link>
        </div>
      </section>

      {/* Visuals / Images */}
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {detail.visuals.map((v, idx) => (
            <div
              key={`${detail.slug}-${idx}`}
              className="rounded-2xl overflow-hidden border border-white/10 bg-white/5"
            >
              <div className="relative h-[220px] w-full">
                <Image
                  src={v.src} // ✅ THIS is the key fix (use the exact /services/... path)
                  alt={v.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority={idx === 0}
                />
              </div>

              <div className="p-4">
                <div className="font-semibold">{v.title}</div>
                <p className="mt-1 text-sm text-white/75">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Facts */}
      {detail.quickFacts?.length ? (
        <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Quick facts</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {detail.quickFacts.map((f, i) => (
              <div
                key={`${detail.slug}-fact-${i}`}
                className="rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <div className="text-sm text-white/60">{f.label}</div>
                <div className="mt-1 font-semibold">{f.value}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* What it is */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">What it is</h2>
        <p className="mt-2 text-white/75">{detail.whatItIs}</p>
      </section>

      {/* Why you need it */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Why you need it</h2>
        <ul className="mt-3 space-y-2 text-white/75 list-disc pl-5">
          {detail.whyYouNeedIt.map((item, i) => (
            <li key={`${detail.slug}-why-${i}`}>{item}</li>
          ))}
        </ul>
      </section>

      {/* What you get */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">What you get</h2>
        <ul className="mt-3 space-y-2 text-white/75 list-disc pl-5">
          {detail.whatYouGet.map((item, i) => (
            <li key={`${detail.slug}-get-${i}`}>{item}</li>
          ))}
        </ul>

        <div className="mt-6">
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
