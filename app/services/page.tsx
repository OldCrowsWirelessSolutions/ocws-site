import { services } from "@/app/data/catalog";
import Link from "next/link";

export default function ServicesPage() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl sm:text-4xl font-semibold">Services</h1>
        <p className="mt-3 text-white/70">
          RF diagnostics, interference hunting, validation, and in-building survey support—built on measurable proof.
        </p>

        <div className="mt-10 grid gap-8">
          {services.map((service) => (
            <div
              key={service.key}
              className="rounded-2xl border border-white/10 bg-black/30 p-6"
            >
              <h2 className="text-2xl font-semibold">{service.name}</h2>
              <p className="mt-2 text-white/70">{service.short}</p>

              {service.bullets?.length ? (
                <ul className="mt-4 list-disc pl-5 text-white/80 space-y-1">
                  {service.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : null}

              {service.networksCovered?.length ? (
                <p className="mt-4 text-sm text-white/60">
                  {service.networksCovered.join(" • ")}
                </p>
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
                  className="text-sm font-medium text-white/70 hover:text-white underline"
                >
                  Request quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
