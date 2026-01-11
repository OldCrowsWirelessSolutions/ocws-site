"use client";

import Link from "next/link";
import { services } from "../data/catalog";

export default function ServicesGrid() {
  return (
    <section className="py-10">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((svc) => {
          const quoteHref = `/intake?service=${encodeURIComponent(svc.key)}`;

          return (
            <div
              key={svc.key}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-6 transition hover:border-white/25 hover:bg-black/55"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-white drop-shadow-sm">
                  {svc.name}
                </h3>
                <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs text-white/80">
                  Service
                </span>
              </div>

              <p className="mt-3 text-sm text-white/80 drop-shadow-sm">
                {svc.short}
              </p>

              <ul className="mt-5 space-y-2">
                {svc.bullets.slice(0, 4).map((b, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-white/85 drop-shadow-sm"
                  >
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {svc.networksCovered?.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {svc.networksCovered.slice(0, 4).map((n) => (
                    <span
                      key={n}
                      className="rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs text-white/75"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Footer actions */}
              <div className="mt-6 flex items-center justify-between">
                <Link
                  href={`/learn/${svc.key}`}
                  className="inline-flex items-center rounded-xl bg-black/70 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85"
                >
                  Learn More
                  <span className="ml-2 transition group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>

                <Link
                  href={quoteHref}
                  className="text-sm font-semibold text-white/85 transition hover:text-white"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
