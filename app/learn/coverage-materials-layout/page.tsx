import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Coverage, Materials, and Layout | OCWS Learn",
  description:
    "Understand how building materials and layout shape coverage and why small placement changes matter.",
};

export default function Page() {
  return (
    <main className="relative">
      <section className="ocws-container pt-10 pb-16">
        <div className="ocws-tile px-5 py-6 md:px-8 md:py-10">
          <Link href="/learn" className="text-sm text-white/70 hover:text-white">
            ← Back to Learn
          </Link>

          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-white tracking-tight">
            Coverage, Building Materials, and Layout
          </h1>
          <p className="mt-3 text-sm md:text-base ocws-muted2 max-w-3xl leading-6">
            Wireless is physics. Materials and geometry can create dead zones even when the router is “good.”
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <Card
              title="Materials that hurt the most"
              body="Metal, masonry, tile, concrete, elevator shafts, low-E glass, dense insulation, and large appliances. Some modern windows are especially brutal for cellular."
            />
            <Card
              title="Geometry creates shadow zones"
              body="Hallways, stairwells, and oddly shaped additions can block or reflect signal. Two rooms the same distance from an AP can behave totally differently."
            />
            <Card
              title="Why moving an AP can outperform upgrading it"
              body="A small placement change can escape a reflective null, reduce obstruction, and improve line-of-sight. Placement is often the highest ROI change."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-5">
      <div className="text-base font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-white/75">{body}</p>
    </div>
  );
}
