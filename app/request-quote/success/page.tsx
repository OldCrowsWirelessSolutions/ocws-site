// app/request-quote/success/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Request Received",
  description: "Your OCWS quote request has been received.",
};

export default function RequestQuoteSuccessPage() {
  return (
    <main className="min-h-screen bg-ocws-midnight text-white">
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-soft">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80">
            <span className="inline-block h-2 w-2 rounded-full bg-ocws-cyan" />
            Submission received
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Thanks — we got your request.
          </h1>

          <p className="mt-3 text-white/75">
            We’ll review your details and reply by email with next steps. If you requested a call,
            we’ll follow up to schedule a time window.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10"
            >
              Back to Home
            </Link>

            <Link
              href="/services"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-ocws-cyan to-ocws-gold px-6 text-sm font-semibold text-ocws-midnight hover:opacity-95"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
