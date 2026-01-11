export default function Callouts() {
  return (
    <section className="grid gap-6 md:grid-cols-3">
      {[
        {
          title: "Evidence-driven",
          body: "Decisions based on RF measurements, not assumptions or consumer-grade speed tests.",
        },
        {
          title: "Vendor-agnostic",
          body: "We don’t sell hardware. Our recommendations are based solely on performance and environment.",
        },
        {
          title: "Clear reporting",
          body: "You receive documentation you can act on—internally or with installers and vendors.",
        },
      ].map((c) => (
        <div
          key={c.title}
          className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-sm p-6"
        >
          <h3 className="text-lg font-semibold text-white drop-shadow-sm">
            {c.title}
          </h3>
          <p className="mt-3 text-sm text-white/80 drop-shadow-sm">
            {c.body}
          </p>
        </div>
      ))}
    </section>
  );
}
