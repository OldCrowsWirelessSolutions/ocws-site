// app/services/small-business-rf-assessment/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Small Business Connectivity & RF Assessment | OCWS",
  description:
    "Evidence-driven RF and Wi-Fi assessment to improve reliability for staff, customers, and critical business devices.",
};

export default function SmallBusinessRFAssessmentPage() {
  return (
    <div className="ocws-container py-12 md:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Small Business Connectivity & RF Assessment
          </h1>
          <p className="mt-2 ocws-muted text-sm md:text-base">
            A practical, evidence-driven assessment designed for small business environments
            where reliability matters for staff, customers, and critical devices.
          </p>
        </div>

        <Link href="/request-quote" className="ocws-btn ocws-btn-primary">
          Request a Quote
        </Link>
      </div>

      <section className="mt-10 ocws-tile px-6 py-8 md:px-10 md:py-10">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
          What this includes
        </h2>
        <ul className="mt-4 space-y-3 ocws-muted text-sm md:text-base">
          <li>• Baseline RF/Wi-Fi environment review (congestion + interference indicators)</li>
          <li>• Coverage observations in key work and customer areas</li>
          <li>• Practical placement and configuration recommendations (no guesswork)</li>
          <li>• Clear prioritization: quick wins vs. longer-term improvements</li>
        </ul>
      </section>

      <section className="mt-8 ocws-tile px-6 py-8 md:px-10 md:py-10">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
          When this is the right fit
        </h2>
        <ul className="mt-4 space-y-3 ocws-muted text-sm md:text-base">
          <li>• “Wi-Fi works in some rooms but not others”</li>
          <li>• VoIP calls drop or sound distorted</li>
          <li>• Customer Wi-Fi complaints or inconsistent checkout / POS connectivity</li>
          <li>• Performance changes throughout the day</li>
        </ul>
      </section>

      <section className="mt-10 flex flex-col sm:flex-row gap-3">
        <Link href="/request-quote" className="ocws-btn ocws-btn-primary">
          Request a Quote
        </Link>
        <Link href="/services" className="ocws-btn ocws-btn-ghost">
          Back to Services
        </Link>
      </section>
    </div>
  );
}
