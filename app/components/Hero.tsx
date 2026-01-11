// app/components/Hero.tsx
import Image from "next/image";
import Link from "next/link";

type HeroProps = {
  title?: string;
  subtitle?: string;

  ctaPrimaryText?: string;
  ctaPrimaryHref?: string;

  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;

  imageSrc?: string;
  imageAlt?: string;

  // ✅ your app is already trying to pass this from an industry page
  footerLine?: string;
};

export default function Hero({
  title = "Clarity where wireless fails.",
  subtitle = "RF-focused diagnostics, compliance-ready reporting, and measurable performance improvements.",

  ctaPrimaryText = "Request Quote",
  ctaPrimaryHref = "/request-quote",

  ctaSecondaryText = "Learn More",
  ctaSecondaryHref = "/services",

  imageSrc = "/hero.jpg",
  imageAlt = "Old Crows Wireless Solutions",

  footerLine = "Wi-Fi (2.4/5/6 GHz) • RF interference/noise floor • In-building cellular (observational)",
}: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative min-h-[70vh] md:min-h-[78vh] lg:min-h-[85vh]">
        <Image src={imageSrc} alt={imageAlt} fill priority className="object-cover" />

        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-6 pb-10 md:px-10 md:pb-14 lg:px-16 lg:pb-16">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                {title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 md:text-base">
                {subtitle}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={ctaSecondaryHref}
                  className="rounded-xl border border-white/30 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
                >
                  {ctaSecondaryText}
                </Link>

                <Link
                  href={ctaPrimaryHref}
                  className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
                >
                  {ctaPrimaryText}
                </Link>
              </div>

              {footerLine ? (
                <div className="mt-6 text-xs text-white/80 md:text-sm">{footerLine}</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
