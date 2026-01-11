import Container from "@/app/components/Container";
import SectionHeader from "@/app/components/SectionHeader";
import CTA from "@/app/components/CTA";

type Testimonial = {
  name: string;
  org?: string;
  role?: string;
  quote: string;
  context?: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Client (Name Here)",
    org: "Organization / Business",
    role: "Title (optional)",
    quote:
      "Placeholder testimonial — replace this with a real quote. Keep it short, specific, and outcome-based.",
    context: "Example: Post-install validation | Multi-story office",
  },
  {
    name: "Client (Name Here)",
    org: "Organization / Business",
    quote:
      "Placeholder testimonial — replace this with a real quote. Mention the pain point and what improved.",
    context: "Example: RFI hunting | Intermittent outages",
  },
  {
    name: "Client (Name Here)",
    org: "Organization / Business",
    quote:
      "Placeholder testimonial — replace this with a real quote. Great testimonials mention speed, clarity, and measurable results.",
    context: "Example: Premium Home RF | Work-from-home reliability",
  },
];

export const metadata = {
  title: "Testimonials | Old Crows Wireless Solutions",
  description:
    "Real-world outcomes from OCWS wireless assessments, interference hunting, and post-install validation.",
};

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-[#05070B] text-white">
      <Container>
        <div className="py-14">
          <SectionHeader
            title="Testimonials"
            subtitle="Real outcomes from clients who needed wireless clarity—without guessing or expensive trial-and-error."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg"
              >
                <p className="text-sm font-semibold text-white/80">
                  {t.name}
                  {t.role ? <span className="text-white/55"> • {t.role}</span> : null}
                </p>
                {t.org ? (
                  <p className="mt-1 text-xs text-white/55">{t.org}</p>
                ) : null}

                <p className="mt-4 text-sm leading-relaxed text-white/80">
                  “{t.quote}”
                </p>

                {t.context ? (
                  <p className="mt-4 text-xs text-white/60">{t.context}</p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-12">
            <CTA
              title="Want results like these?"
              subtitle="Use our intake form and we’ll recommend the right scope based on your building, devices, and symptoms."
              primaryText="Request a Quote"
              primaryHref="/intake"
              secondaryText="Contact"
              secondaryHref="/contact"
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
