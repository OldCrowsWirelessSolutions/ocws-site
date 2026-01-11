import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getService, serviceKeys, type ServiceKey } from "@/app/data/catalog";

type PageProps = {
  params: { service: string };
};

export function generateStaticParams() {
  return serviceKeys.map((service) => ({ service }));
}

export default function LearnServicePage({ params }: PageProps) {
  const key = params.service as ServiceKey;
  const service = getService(key);

  if (!service) return notFound();

  const images = Array.isArray(service.images) ? service.images : [];

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/services" className="text-sm text-white/70 hover:text-white">
            ← Back to Services
          </Link>

          <Link
            href="/request-quote"
            className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 hover:bg-white/15 text-sm"
          >
            Request a Quote
          </Link>
        </div>

        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold">{service.name}</h1>
        <p className="mt-2 text-white/70">{service.short}</p>

        {service.headline ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-lg font-semibold">{service.headline}</p>
          </div>
        ) : null}

        {/* Image gallery */}
        {images.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {images.map((src: string, idx: number) => (
              <div
                key={`${src}-${idx}`}
                className="relative h-40 overflow-hidden rounded-2xl border border-white/10 bg-black/20"
              >
                <Image
                  src={src}
                  alt={`${service.name} image ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6">
          {/* What it is */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-xl font-semibold">What it is</h2>
            <p className="mt-2 text-white/70">{service.whatItIs}</p>
          </div>

          {/* Why you need it */}
          {Array.isArray(service.whyYouNeedIt) && service.whyYouNeedIt.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h2 className="text-xl font-semibold">Why you need it</h2>
              <ul className="mt-3 list-disc pl-5 text-white/70 space-y-2">
                {service.whyYouNeedIt.map((t: string, i: number) => (
                  <li key={`${t}-${i}`}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* What you get */}
          {Array.isArray(service.whatYouGet) && service.whatYouGet.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h2 className="text-xl font-semibold">What you get</h2>
              <ul className="mt-3 list-disc pl-5 text-white/70 space-y-2">
                {service.whatYouGet.map((t: string, i: number) => (
                  <li key={`${t}-${i}`}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Deliverables */}
          {Array.isArray(service.deliverables) && service.deliverables.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h2 className="text-xl font-semibold">Deliverables</h2>
              <ul className="mt-3 list-disc pl-5 text-white/70 space-y-2">
                {service.deliverables.map((t: string, i: number) => (
                  <li key={`${t}-${i}`}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Common misconceptions */}
          {Array.isArray(service.commonMisconceptions) && service.commonMisconceptions.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h2 className="text-xl font-semibold">Common misconceptions</h2>
              <ul className="mt-3 list-disc pl-5 text-white/70 space-y-2">
                {service.commonMisconceptions.map((t: string, i: number) => (
                  <li key={`${t}-${i}`}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Good fit if */}
          {Array.isArray(service.goodFitIf) && service.goodFitIf.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h2 className="text-xl font-semibold">Good fit if</h2>
              <ul className="mt-3 list-disc pl-5 text-white/70 space-y-2">
                {service.goodFitIf.map((t: string, i: number) => (
                  <li key={`${t}-${i}`}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/request-quote"
            className="rounded-xl bg-white text-black font-semibold px-4 py-2 text-center"
          >
            Request a Quote
          </Link>
          <Link
            href="/contact"
            className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 text-center"
          >
            Contact
          </Link>
        </div>
      </div>
    </section>
  );
}
