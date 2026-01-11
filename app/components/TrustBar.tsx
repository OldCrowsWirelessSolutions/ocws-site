import BadgePill from "@/app/components/BadgePill";

export default function TrustBar() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            Evidence-driven wireless clarity
          </p>
          <p className="mt-1 text-xs text-white/70">
            Field-proven RF engineering focused on measurable results—not guesswork.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <BadgePill text="Veteran-owned & operated" />
          <BadgePill text="RF-focused diagnostics" />
          <BadgePill text="Measurable proof & reporting" />
        </div>
      </div>
    </section>
  );
}
