// app/components/IndustryTiles.tsx
import Link from "next/link";
import Image from "next/image";
import { industries } from "../data/industries";

export default function IndustryTiles() {
  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
            Industries
          </h2>
          <p className="mt-2 ocws-muted text-sm md:text-base">
            Industries we serve, supporting environments where reliable wireless performance matters.
          </p>
        </div>

        <Link href="/industries" className="ocws-btn ocws-btn-ghost">
          View all
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map((ind) => (
          <Link
            key={ind.slug}
            href={`/services?industry=${encodeURIComponent(ind.slug)}`}
            className="ocws-tile ocws-tile-hover overflow-hidden group"
          >
            <div className="relative h-44 w-full">
              <Image
                src={ind.imageSrc}
                alt={ind.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

              {ind.badge ? (
                <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur">
                  {ind.badge}
                </div>
              ) : null}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-base md:text-lg font-semibold text-white">
                  {ind.name}
                </h3>
                <span
                  className="text-white/35 group-hover:text-white/70 transition"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>

              <p className="mt-2 text-sm ocws-muted leading-relaxed">
                {ind.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
