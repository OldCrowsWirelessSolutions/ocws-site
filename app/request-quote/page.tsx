// app/request-quote/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Request a Quote",
  description:
    "Request a quote for RF optimization, interference hunting, public safety (P25) surveys, DAS design, and post-install validation.",
};

const services = [
  { value: "premium-home-rf", label: "Premium Home & Home Office RF Optimization" },
  { value: "rfi-hunting", label: "RFI Hunting & Advanced Diagnostics" },
  { value: "p25-survey", label: "Public Safety (P25) ERRC Survey (NFPA/IFC)" },
  { value: "cellular-das-design", label: "Cellular / DAS Initial Survey & Design Blueprint" },
  { value: "post-install-validation", label: "Post-Installation Validation & Acceptance Survey" },
  { value: "other", label: "Other / Not Sure Yet" },
];

export default function RequestQuotePage() {
  return (
    <main className="min-h-screen bg-ocws-midnight text-white">
      {/* Header band */}
      <section className="border-b border-white/10 bg-gradient-to-b from-ocws-slate to-ocws-midnight">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80">
              <span className="inline-block h-2 w-2 rounded-full bg-ocws-cyan" />
              OCWS • Pensacola, FL • Data-driven RF engineering
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Request a Quote
            </h1>

            <p className="max-w-2xl text-white/75">
              Tell us what’s going wrong (or what you’re building). We’ll review your details and
              reply with next steps and a quote. If you prefer a call, you can request one — no spam
              calls, no pressure.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <InfoCard title="Fast response" text="Most inquiries get a reply within 1 business day." />
              <InfoCard title="Call by request" text="You choose if/when a call is needed." />
              <InfoCard title="Professional intake" text="Clear scope → clean quote → strong deliverables." />
            </div>
          </div>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-12">
          {/* Form */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight">Project details</h2>
                <p className="mt-1 text-sm text-white/70">
                  The more specific you are, the faster we can quote accurately.
                </p>
              </div>

              {/* Netlify Form */}
              <form
                name="ocws-quote"
                method="POST"
                action="/request-quote/success"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                className="grid gap-5"
              >
                {/* Required hidden field for Netlify */}
                <input type="hidden" name="form-name" value="ocws-quote" />

                {/* Honeypot (hidden) */}
                <p className="hidden">
                  <label>
                    Don’t fill this out: <input name="bot-field" />
                  </label>
                </p>

                {/* Useful for Netlify email notifications */}
                <input
                  type="hidden"
                  name="email_subject"
                  value="New Quote Request – OCWS Website"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" name="name" type="text" required placeholder="Joshua Turner" />
                  <Field label="Email" name="email" type="email" required placeholder="you@company.com" />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Phone (optional)"
                    name="phone"
                    type="tel"
                    placeholder="Optional — only used if you request a call"
                  />

                  <SelectField
                    label="Service / Project type"
                    name="service"
                    required
                    placeholder="Select a service…"
                    options={services}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="City" name="city" type="text" required placeholder="Pensacola" />
                  <Field label="State" name="state" type="text" required placeholder="FL" />
                </div>

                <TextAreaField
                  label="What’s happening / what do you need?"
                  name="details"
                  required
                  placeholder="Example: Wi-Fi drops during video calls, dead zones in office; or: need P25 grid test for AHJ compliance..."
                />

                {/* Option C: Call by request */}
                <div className="rounded-2xl border border-white/10 bg-ocws-slate/60 p-5">
                  <div className="flex items-start gap-3">
                    <input
                      id="callRequested"
                      name="call_requested"
                      type="checkbox"
                      value="Yes"
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-ocws-cyan"
                    />
                    <div className="flex-1">
                      <label htmlFor="callRequested" className="text-sm font-semibold">
                        I would like a call to discuss this
                      </label>
                      <p className="mt-1 text-sm text-white/70">
                        If checked, we’ll reach out using the phone number you provided (if any) or
                        reply by email to schedule.
                      </p>

                      <div className="mt-4 grid gap-2 sm:max-w-sm">
                        <label className="text-sm font-medium text-white/90">
                          Preferred call window (optional)
                        </label>
                        <select
                          name="preferred_call_window"
                          className="h-11 w-full rounded-xl border border-white/10 bg-ocws-midnight px-3 text-sm text-white outline-none focus:border-ocws-cyan/60 focus:ring-2 focus:ring-ocws-cyan/20"
                          defaultValue=""
                        >
                          <option value="">No preference</option>
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                          <option value="Evening">Evening</option>
                        </select>

                        <p className="text-xs text-white/55">
                          (Timezone: Central unless you note otherwise)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/55">
                  By submitting, you consent to receive a reply from OCWS regarding your request.
                  We don’t sell your info. No spam calls.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/services"
                    className="text-sm text-white/70 underline decoration-white/20 underline-offset-4 hover:text-white"
                  >
                    View services
                  </Link>

                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-ocws-cyan to-ocws-gold px-6 text-sm font-semibold text-ocws-midnight shadow-soft transition hover:opacity-95"
                  >
                    Submit request
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                <h3 className="text-sm font-semibold tracking-wide text-white/90">
                  What happens next
                </h3>
                <ol className="mt-4 space-y-3 text-sm text-white/70">
                  <Step n="1" text="We review your request and clarify scope if needed." />
                  <Step n="2" text="You receive a quote or a short discovery call invite (if requested)." />
                  <Step n="3" text="We schedule once terms are confirmed." />
                </ol>
              </div>

              <div className="rounded-3xl border border-white/10 bg-ocws-slate/70 p-6 shadow-soft">
                <h3 className="text-sm font-semibold tracking-wide text-white/90">
                  OCWS intake notes
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  <li>• Premium-home work is typically scoped around a single site visit + report.</li>
                  <li>• Enterprise/compliance work often requires floor plans and access coordination.</li>
                  <li>• If you’re unsure, select “Other / Not Sure Yet” and describe the problem.</li>
                </ul>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                  Tip: Include building size (sq ft), number of floors, and any critical areas (IDFs,
                  stairwells, server rooms).
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-sm text-white/70">{text}</div>
    </div>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-white/80">
        {n}
      </span>
      <span>{text}</span>
    </li>
  );
}

function Field({
  label,
  name,
  type,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-white/90">
        {label} {required ? <span className="text-ocws-gold">*</span> : null}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-white/10 bg-ocws-slate px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-ocws-cyan/60 focus:ring-2 focus:ring-ocws-cyan/20"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  required,
  placeholder,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-white/90">
        {label} {required ? <span className="text-ocws-gold">*</span> : null}
      </label>
      <select
        name={name}
        required={required}
        className="h-11 w-full rounded-xl border border-white/10 bg-ocws-slate px-3 text-sm text-white outline-none focus:border-ocws-cyan/60 focus:ring-2 focus:ring-ocws-cyan/20"
        defaultValue=""
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-white/90">
        {label} {required ? <span className="text-ocws-gold">*</span> : null}
      </label>
      <textarea
        name={name}
        required={required}
        rows={6}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-ocws-slate px-3 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-ocws-cyan/60 focus:ring-2 focus:ring-ocws-cyan/20"
      />
    </div>
  );
}
