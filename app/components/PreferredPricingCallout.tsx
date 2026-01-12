// app/components/PreferredPricingCallout.tsx
export default function PreferredPricingCallout() {
  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 md:px-6 md:py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/60">
              Preferred pricing
            </div>
            <p className="mt-1 text-sm ocws-muted2 leading-6">
              Available for{" "}
              <span className="text-white/80">active-duty &amp; retired military</span>{" "}
              and <span className="text-white/80">first responders</span>.{" "}
              <span className="text-white/50">Verification may be requested.</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-white/60">
              Military
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-white/60">
              First Responders
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
