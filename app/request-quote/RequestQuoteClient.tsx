// app/request-quote/RequestQuoteClient.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  computeRecommendedAddendums,
  IntakeInputs,
} from "@/app/data/intakeAddendums";

const SERVICE_OPTIONS = [
  {
    href: "/services/commercial-connectivity-rf-baseline-survey",
    label: "Commercial Connectivity & RF Baseline Survey",
  },
  {
    href: "/services/premium-home-rf-optimization",
    label: "Premium Home & Home Office RF Optimization",
  },
  { href: "/services/rfi-hunting", label: "Radio Frequency Interference (RFI) Hunting" },
  {
    href: "/services/cellular-das-design",
    label: "Cellular / DAS Survey & Design Blueprint",
  },
  { href: "/services/p25-survey", label: "Public Safety (P25) ERRC Survey" },
  {
    href: "/services/post-install-validation",
    label: "Post-Installation Validation & Acceptance Survey",
  },
];

const INDUSTRY_OPTIONS = [
  { slug: "homes-estates", label: "Homes & Estates" },
  { slug: "small-business", label: "Small Business" },
  { slug: "healthcare", label: "Healthcare" },
  { slug: "hospitality", label: "Hospitality" },
  { slug: "retail", label: "Retail" },
  { slug: "industrial", label: "Industrial" },
  { slug: "education", label: "Education" },
  { slug: "enterprise", label: "Enterprise" },
  { slug: "government", label: "Government" },
  { slug: "public-safety", label: "Public Safety (ERRC / P25)" },
];

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function RequestQuoteClient({
  initialServiceHref = "",
  initialIndustrySlug = "",
}: {
  initialServiceHref?: string;
  initialIndustrySlug?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  // Core contact info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Details
  const [message, setMessage] = useState("");

  // Honeypot
  const [company, setCompany] = useState("");

  // Preselect from query string props
  const [serviceHref, setServiceHref] = useState<string>(initialServiceHref);
  const [industrySlug, setIndustrySlug] = useState<string>(initialIndustrySlug);

  // Triggers (kept minimal + aligned with your addendum engine)
  const [acreage, setAcreage] = useState<string>("");
  const [hasDetachedStructures, setHasDetachedStructures] = useState(false);

  const [floors, setFloors] = useState<string>("");
  const [multiTenant, setMultiTenant] = useState(false);
  const [hasIdfMdf, setHasIdfMdf] = useState(false);
  const [criticalAreas, setCriticalAreas] = useState(false);

  const [suspectedInterference, setSuspectedInterference] = useState(false);
  const [machineryOrMedical, setMachineryOrMedical] = useState(false);
  const [boostersRepeatersPresent, setBoostersRepeatersPresent] = useState(false);

  const [publicSafetyConcern, setPublicSafetyConcern] = useState(false);
  const [postInstallVerification, setPostInstallVerification] = useState(false);
  const [outsideRegionTravel, setOutsideRegionTravel] = useState(false);

  const intakeInputs: IntakeInputs = useMemo(
    () => ({
      serviceHref: serviceHref || undefined,
      industrySlug: industrySlug || undefined,

      acreage: acreage ? Number(acreage) : null,
      hasDetachedStructures,

      floors: floors ? Number(floors) : null,
      multiTenant,
      hasIdfMdf,
      criticalAreas,

      suspectedInterference,
      machineryOrMedical,
      boostersRepeatersPresent,

      publicSafetyConcern,
      postInstallVerification,
      outsideRegionTravel,
    }),
    [
      serviceHref,
      industrySlug,
      acreage,
      hasDetachedStructures,
      floors,
      multiTenant,
      hasIdfMdf,
      criticalAreas,
      suspectedInterference,
      machineryOrMedical,
      boostersRepeatersPresent,
      publicSafetyConcern,
      postInstallVerification,
      outsideRegionTravel,
    ]
  );

  const recommendedAddendums = useMemo(
    () => computeRecommendedAddendums(intakeInputs),
    [intakeInputs]
  );

  const validationError = useMemo(() => {
    if (!name.trim()) return "Please enter your name.";
    if (!email.trim()) return "Please enter your email.";
    if (!isEmail(email)) return "Please enter a valid email address.";
    if (!message.trim()) return "Please describe the issue / goal.";
    return "";
  }, [name, email, message]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (validationError) {
      setStatus("error");
      setErrorMsg(validationError);
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const payload = {
        name,
        email,
        phone,
        message,
        serviceHref,
        industrySlug,
        triggers: intakeInputs,
        recommendedAddendums: recommendedAddendums.map((a) => ({
          key: a.key,
          title: a.title,
        })),
        company, // honeypot
      };

      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch {
        // ignore
      }

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || raw || "Failed to send quote request.");
      }

      setStatus("sent");

      // Clear form after send
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setCompany("");

      // Keep the selected service/industry (helps user see what they submitted)
      // If you want to clear these too, uncomment:
      // setServiceHref("");
      // setIndustrySlug("");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Failed to send quote request.");
    }
  }

  const showHomeTriggers =
    serviceHref === "/services/premium-home-rf-optimization" ||
    industrySlug === "homes-estates";

  const showCommercialComplexityTriggers =
    serviceHref === "/services/commercial-connectivity-rf-baseline-survey" ||
    serviceHref === "/services/cellular-das-design" ||
    serviceHref === "/services/p25-survey" ||
    serviceHref === "/services/post-install-validation" ||
    [
      "small-business",
      "healthcare",
      "hospitality",
      "retail",
      "industrial",
      "education",
      "enterprise",
      "government",
      "public-safety",
    ].includes(industrySlug);

  const showInterferenceTriggers =
    serviceHref === "/services/rfi-hunting" ||
    serviceHref === "/services/commercial-connectivity-rf-baseline-survey" ||
    serviceHref === "/services/premium-home-rf-optimization";

  const showPublicSafetyTriggers =
    industrySlug === "public-safety" || serviceHref === "/services/p25-survey";

  return (
    <main className="ocws-container py-10">
      <div className="max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
          Request a Quote
        </h1>

        <p className="mt-3 text-white/75 max-w-3xl">
          Tell us about your environment and goals. We’ll confirm scope,
          recommended next steps, and any applicable addendums before scheduling.
        </p>

        <form onSubmit={onSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 ocws-tile p-6 space-y-6">
            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <label className="block text-sm font-medium mb-1">Company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
              />
            </div>

            {/* Service + Industry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">
                  Primary service (optional)
                </label>
                <select
                  value={serviceHref}
                  onChange={(e) => setServiceHref(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="">Select a starting point…</option>
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s.href} value={s.href}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">
                  Environment / vertical (optional)
                </label>
                <select
                  value={industrySlug}
                  onChange={(e) => setIndustrySlug(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="">Select…</option>
                  {INDUSTRY_OPTIONS.map((i) => (
                    <option key={i.slug} value={i.slug}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">
                  Name <span className="text-white/60">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (status !== "sent") setStatus("idle");
                  }}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">
                  Email <span className="text-white/60">*</span>
                </label>
                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== "sent") setStatus("idle");
                  }}
                  type="email"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Phone (optional)
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Describe the issue / goal <span className="text-white/60">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (status !== "sent") setStatus("idle");
                }}
                rows={6}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Briefly describe what you’re seeing, the environment, and what success looks like."
              />
            </div>

            {/* Trigger blocks */}
            {showHomeTriggers ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-3">
                <div className="font-semibold text-white">Home / estate scope checks</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">
                      Property size (acres, optional)
                    </label>
                    <input
                      value={acreage}
                      onChange={(e) => setAcreage(e.target.value)}
                      inputMode="decimal"
                      placeholder="e.g., 1.5"
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm mt-7 text-white/85">
                    <input
                      type="checkbox"
                      checked={hasDetachedStructures}
                      onChange={(e) => setHasDetachedStructures(e.target.checked)}
                      className="accent-white"
                    />
                    Detached buildings (shop/barn/guest house)
                  </label>
                </div>
              </div>
            ) : null}

            {showCommercialComplexityTriggers ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-3">
                <div className="font-semibold text-white">Commercial scope checks</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">
                      Floors (optional)
                    </label>
                    <input
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                      inputMode="numeric"
                      placeholder="e.g., 2"
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
                    />
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm mt-7 text-white/85">
                    <input
                      type="checkbox"
                      checked={multiTenant}
                      onChange={(e) => setMultiTenant(e.target.checked)}
                      className="accent-white"
                    />
                    Multi-tenant / multiple suites
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm text-white/85">
                    <input
                      type="checkbox"
                      checked={hasIdfMdf}
                      onChange={(e) => setHasIdfMdf(e.target.checked)}
                      className="accent-white"
                    />
                    Has MDF/IDF closets (network rooms)
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm text-white/85">
                    <input
                      type="checkbox"
                      checked={criticalAreas}
                      onChange={(e) => setCriticalAreas(e.target.checked)}
                      className="accent-white"
                    />
                    Critical areas (POS, exam rooms, call centers, etc.)
                  </label>
                </div>
              </div>
            ) : null}

            {showInterferenceTriggers ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-3">
                <div className="font-semibold text-white">Interference indicators</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-white/85">
                    <input
                      type="checkbox"
                      checked={suspectedInterference}
                      onChange={(e) => setSuspectedInterference(e.target.checked)}
                      className="accent-white"
                    />
                    Suspected RF interference / noise
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-white/85">
                    <input
                      type="checkbox"
                      checked={machineryOrMedical}
                      onChange={(e) => setMachineryOrMedical(e.target.checked)}
                      className="accent-white"
                    />
                    Machinery/medical equipment present
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-white/85">
                    <input
                      type="checkbox"
                      checked={boostersRepeatersPresent}
                      onChange={(e) => setBoostersRepeatersPresent(e.target.checked)}
                      className="accent-white"
                    />
                    Boosters/repeaters already installed
                  </label>
                </div>
              </div>
            ) : null}

            {showPublicSafetyTriggers ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-3">
                <div className="font-semibold text-white">Public safety context</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-white/85">
                    <input
                      type="checkbox"
                      checked={publicSafetyConcern}
                      onChange={(e) => setPublicSafetyConcern(e.target.checked)}
                      className="accent-white"
                    />
                    ERRC / Fire Marshal concern
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-white/85">
                    <input
                      type="checkbox"
                      checked={postInstallVerification}
                      onChange={(e) => setPostInstallVerification(e.target.checked)}
                      className="accent-white"
                    />
                    Post-install verification needed
                  </label>
                </div>
              </div>
            ) : null}

            <label className="inline-flex items-center gap-2 text-sm text-white/85">
              <input
                type="checkbox"
                checked={outsideRegionTravel}
                onChange={(e) => setOutsideRegionTravel(e.target.checked)}
                className="accent-white"
              />
              Site is outside the standard 50-mile service region
            </label>

            <p className="text-xs text-white/60">
              By submitting, you consent to receive a reply from OCWS regarding your request.
              We don’t sell your info. No spam calls.
            </p>

            {status === "sent" ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-white">
                ✅ Quote request sent. We’ll reply by email.
              </div>
            ) : null}

            {status === "error" ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-white">
                ❌ {errorMsg || "Failed to send quote request."}
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <Link href="/services" className="text-sm text-white/70 hover:text-white transition">
                View services
              </Link>

              <button
                type="submit"
                disabled={status === "sending"}
                title={validationError || undefined}
                className="
                  inline-flex items-center justify-center
                  rounded-2xl px-6 py-3
                  font-semibold tracking-tight
                  border border-white/15
                  bg-white/10 text-white
                  shadow-[0_10px_30px_rgba(0,0,0,0.35)]
                  hover:bg-white/15 hover:border-white/25
                  active:translate-y-[1px]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30
                  transition
                "
              >
                {status === "sending" ? "Submitting…" : "Submit request"}
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <aside className="ocws-tile p-6 space-y-4">
            <h2 className="font-semibold text-white">Applicable addendums</h2>

            {recommendedAddendums.length ? (
              <div className="space-y-3">
                {recommendedAddendums.map((a) => (
                  <div
                    key={a.key}
                    className="rounded-xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="font-semibold text-white">{a.title}</div>
                    <p className="mt-1 text-sm text-white/70">{a.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/70">
                No addendums indicated based on current inputs.
              </div>
            )}
          </aside>
        </form>
      </div>
    </main>
  );
}
