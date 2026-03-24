import Link from "next/link";

type CTAProps = {
  title: string;
  subtitle?: string;
  primaryText: string;
  primaryHref: string;
  secondaryText?: string;
  secondaryHref?: string;
};

export default function CTA({
  title,
  subtitle,
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
}: CTAProps) {
  return (
    <section className="rounded-2xl border border-white/15 bg-black/60 backdrop-blur-sm p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-white drop-shadow-sm md:text-2xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm text-white/80 drop-shadow-sm md:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-xl bg-black/80 px-4 py-2 text-sm font-semibold text-white ocws-glow-hover hover:bg-black/95"
          >
            {primaryText} →
          </Link>

          {secondaryText && secondaryHref ? (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-black/60 px-4 py-2 text-sm font-semibold text-white ocws-glow-hover hover:bg-black/80"
            >
              {secondaryText}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
