// app/request-quote/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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
  { slug: "small-business", label: "Small Business" },
  { slug: "healthcare", label: "Healthcare" },
  { slug: "hospitality", label: "Hospitality" },
  { slug: "retail", label: "Retail" },
  { slug: "industrial", label: "Industrial" },
  { slug: "education", label: "Education" },
  { slug: "enterprise", label: "Enterprise" },
  { slug: "government", label: "Government" },
  { slug: "public-safety", label: "Public Safety (ERRC / P25)" },
  { slug: "homes-estates", label: "Homes & Estates" },
];

export default function RequestQuotePage() {
  const sp = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Core contact info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // Preselect when coming from tiles (optional, supports future linking)
  const [serviceHref, setServiceHref] = useState<string>(sp.get("service") || "");
  const [industrySlug, setIndustrySlug] = useState<string>(sp.get("industry") || "");

  // Trigger questions (only used to compute addendums)
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
      acreage,
      boostersRepeatersPresent,
      criticalAreas,
      floors,
      hasDetachedStructures,
      hasIdfMdf,
      industrySlug,
      machineryOrMedical,
      multiTenant,
      outsideRegionTravel,
      postInstallVerification,
      publicSafetyConcern,
      serviceHref,
      suspectedInterference,
    ]
  );

  const recommendedAddendums = useMemo(
    () => computeRecommendedAddendums(intakeInputs),
    [intakeInputs]
  );

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

  const canSubmit = name.trim() && email.trim() && message.trim();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Request a Quote
      </h1>

      <p className="mt-3 text-white/75 max-w-3xl">
        Tell us about your environment and goals. We’ll confirm scope, recommended
        next steps, and any applicable addendums before scheduling.
      </p>

      <form
        className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;

          setIsSubmitting(true);

          // ✅ This is the payload you want your backend/email handler to receive.
          // For now, we just log it so you can verify.
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
          };

          // eslint-disable-next-line no-console
          console.log("OCWS intake payload:", payload);

          setTimeout(() => setIsSubmitting(false), 900);
        }}
      >
        {/* LEFT: FORM */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
          {/* Service + Industry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
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
              <label className="block text-sm font-medium mb-1">
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
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone (optional)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Describe the issue / goal *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* Trigger Questions (only show what matters) */}
          {showHomeTriggers ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-3">
              <div className="font-semibold">Home / estate scope checks</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Property size (acres, optional)
                  </label>
                  <input
                    value={acreage}
                    onChange={(e) => setAcreage(e.target.value)}
                    inputMode="decimal"
                    placeholder="e.g., 1.5"
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-sm mt-7">
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
              <div className="font-semibold">Commercial scope checks</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Floors (optional)
                  </label>
                  <input
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    inputMode="numeric"
                    placeholder="e.g., 1"
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>

                <div className="space-y-2 mt-1">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={multiTenant}
                      onChange={(e) => setMultiTenant(e.target.checked)}
                      className="accent-white"
                    />
                    Multi-tenant / multiple suites
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={hasIdfMdf}
                      onChange={(e) => setHasIdfMdf(e.target.checked)}
                      className="accent-white"
                    />
                    IDF/MDF / network closets involved
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={criticalAreas}
                      onChange={(e) => setCriticalAreas(e.target.checked)}
                      className="accent-white"
                    />
                    Critical areas (server rooms, stairwells, etc.)
                  </label>
                </div>
              </div>
            </div>
          ) : null}

          {showInterferenceTriggers ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-2">
              <div className="font-semibold">Interference / complexity checks</div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={suspectedInterference}
                  onChange={(e) => setSuspectedInterference(e.target.checked)}
                  className="accent-white"
                />
                Intermittent drops / mystery outages / suspected interference
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={boostersRepeatersPresent}
                  onChange={(e) => setBoostersRepeatersPresent(e.target.checked)}
                  className="accent-white"
                />
                Booster / repeater / “signal extender” already present
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={machineryOrMedical}
                  onChange={(e) => setMachineryOrMedical(e.target.checked)}
                  className="accent-white"
                />
                Industrial machinery or medical equipment nearby
              </label>
            </div>
          ) : null}

          {showPublicSafetyTriggers ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-2">
              <div className="font-semibold">Public safety / ERRC checks</div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={publicSafetyConcern}
                  onChange={(e) => setPublicSafetyConcern(e.target.checked)}
                  className="accent-white"
                />
                ERRC / first responder radios / AHJ compliance is involved
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={postInstallVerification}
                  onChange={(e) => setPostInstallVerification(e.target.checked)}
                  className="accent-white"
                />
                This is a post-install validation / acceptance / punch-list situation
              </label>
            </div>
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-2">
            <div className="font-semibold">Logistics</div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={outsideRegionTravel}
                onChange={(e) => setOutsideRegionTravel(e.target.checked)}
                className="accent-white"
              />
              Site is outside the standard service region (over 50 miles from Pensacola, FL)
            </label>
          </div>

          <p className="text-xs text-white/60">
            By submitting, you consent to receive a reply from OCWS regarding your
            request. We don’t sell your info. No spam calls.
          </p>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Link
              href="/services"
              className="text-sm text-white/70 hover:text-white transition"
            >
              View services
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
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
              {isSubmitting ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </div>

        {/* RIGHT: ADDENDUMS + NOTES */}
        <aside className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h2 className="font-semibold">Applicable addendums</h2>

          {recommendedAddendums.length ? (
            <div className="space-y-3">
              {recommendedAddendums.map((a) => (
                <div
                  key={a.key}
                  className="rounded-xl border border-white/10 bg-black/30 p-4"
                >
                  <div className="font-semibold">{a.title}</div>
                  <p className="mt-1 text-sm text-white/70">{a.description}</p>
                </div>
              ))}
              <p className="text-xs text-white/60">
                These are recommendations based on your selections and scope checks.
                We’ll confirm final scope before scheduling.
              </p>
            </div>
          ) : (
            <div className="text-sm text-white/70">
              No addendums indicated based on current inputs.
            </div>
          )}

          <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
            Tip: Include building size (sq ft), number of floors, and any critical
            areas (IDFs, stairwells, server rooms).
          </div>
        </aside>
      </form>
    </main>
  );
}
