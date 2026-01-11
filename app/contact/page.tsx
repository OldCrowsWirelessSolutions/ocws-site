"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/app/components/Container";
import { services, type ServiceKey } from "@/app/data/catalog";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service") as ServiceKey | null;

  const selected = useMemo(() => {
    if (!serviceParam) return "";
    const match = services.find((s) => s.key === serviceParam);
    return match ? match.key : "";
  }, [serviceParam]);

  return (
    <div className="pt-ocws-12">
      <Container>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-panel">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Request a Quote
          </h1>
          <p className="mt-ocws-3 text-white/75">
            Tell us what’s failing, where it’s happening, and what success looks like.
            We’ll respond with next steps and a quote range.
          </p>

          {/* Netlify-friendly form */}
          <form
            name="quote"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            className="mt-ocws-8 grid gap-4 md:grid-cols-2"
          >
            <input type="hidden" name="form-name" value="quote" />
            <p className="hidden">
              <label>
                Don’t fill this out: <input name="bot-field" />
              </label>
            </p>

            <Field label="Full name">
              <input
                name="name"
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-ocws-cyan/60"
                placeholder="Your name"
              />
            </Field>

            <Field label="Email">
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-ocws-cyan/60"
                placeholder="you@company.com"
              />
            </Field>

            <Field label="Phone (optional)">
              <input
                name="phone"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-ocws-cyan/60"
                placeholder="(555) 555-5555"
              />
            </Field>

            <Field label="Site / City (optional)">
              <input
                name="site"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-ocws-cyan/60"
                placeholder="Pensacola, FL"
              />
            </Field>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-white/85">
                Service
              </label>
              <select
                name="service"
                defaultValue={selected || ""}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-ocws-cyan/60"
              >
                <option value="">Select a service…</option>
                {services.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-white/85">
                What’s failing / what do you need?
              </label>
              <textarea
                name="message"
                required
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-ocws-cyan/60"
                placeholder="Example: Wi-Fi drops in the west wing; voice calls fail inside; intermittent RF noise near equipment room; need acceptance testing after install…"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-white/60">
                By submitting, you agree OCWS may contact you regarding this request.
              </p>

              <button
                type="submit"
                className="rounded-full bg-ocws-cyan px-7 py-3 text-sm font-semibold text-black transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-ocws-cyan/60"
              >
                Submit request →
              </button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/85">
        {label}
      </label>
      {children}
    </div>
  );
}
