// app/industries/page.tsx
import IndustryTiles from "@/app/components/IndustryTiles";

export const metadata = {
  title: "Industries",
  description:
    "From homes and campuses to public safety and critical infrastructure — OCWS provides measurable wireless clarity.",
};

export default function IndustriesPage() {
  return (
    <main className="min-h-screen bg-ocws-midnight text-white">
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-8">
        <h1 className="text-4xl font-semibold tracking-tight">Industries</h1>
        <p className="mt-3 max-w-3xl text-white/75">
          From homes and campuses to public safety and critical infrastructure — OCWS provides measurable wireless clarity.
        </p>
      </section>

      <IndustryTiles />
    </main>
  );
}
