// app/components/IndustryTiles.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { industries as defaultIndustries } from "@/app/data/catalog";

type Industry = {
  key: string;
  name: string;
  tagline: string;
  image: string;
};

export default function IndustryTiles({ items }: { items?: Industry[] }) {
  const list = items ?? (defaultIndustries as unknown as Industry[]);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((industry) => (
          <IndustryCard key={industry.key} industry={industry} />
        ))}
      </div>
    </section>
  );
}

function IndustryCard({ industry }: { industry: Industry }) {
  const fallbackGradient = useMemo(() => {
    const map: Record<string, string> = {
      home: "from-white/10 to-white/0",
      healthcare: "from-ocws-cyan/20 to-white/0",
      education: "from-ocws-gold/20 to-white/0",
      hospitality: "from-white/10 to-ocws-cyan/10",
      "public-safety": "from-ocws-gold/20 to-white/0",
      government: "from-white/10 to-ocws-gold/10",
      enterprise: "from-ocws-cyan/15 to-white/0",
      retail: "from-white/10 to-ocws-cyan/10",
      industrial: "from-white/10 to-ocws-gold/10",
    };
    return map[industry.key] ?? "from-white/10 to-white/0";
  }, [industry.key]);

  return (
    <Link
      href={`/industries/${industry.key}`}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-soft transition hover:border-white/20"
    >
      {/* Image area: fixed height so it can’t blow up */}
      <div className="relative h-48 w-full overflow-hidden">
        {/* Premium fallback always present */}
        <div className={`absolute inset-0 bg-gradient-to-b ${fallbackGradient}`} />

        {/* PNG industry image */}
        <img
          src={industry.image}
          alt={industry.name}
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-300 group-hover:opacity-100"
          onError={(e) => {
            // Hide broken image icon while keeping the premium gradient fallback
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ocws-midnight/85 via-ocws-midnight/35 to-transparent" />
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold tracking-tight">{industry.name}</h3>
        <p className="mt-2 text-sm text-white/70">{industry.tagline}</p>

        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/85">
          <span className="h-2 w-2 rounded-full bg-ocws-cyan transition group-hover:bg-ocws-gold" />
          Explore
        </div>
      </div>
    </Link>
  );
}
