"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadSlot = "signal" | "scan24" | "scan5";

interface TeaserProblem {
  title: string;
  teaser: string;
}

interface FullFinding {
  severity: "CRITICAL" | "WARNING" | "GOOD";
  title: string;
  description: string;
  fix: string;
}

interface AnalysisResult {
  corvus_opening: string;
  problems_found: number;
  critical_count: number;
  warning_count: number;
  good_count: number;
  teaser_problems: TeaserProblem[];
  corvus_closing: string;
  full_findings: FullFinding[];
  recommendations: string[];
  corvus_summary: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LOCATION_TYPES = [
  "Home",
  "Office",
  "Restaurant",
  "Church",
  "RV Park",
  "Marina",
  "School",
  "Medical",
  "Other",
];

const UPLOAD_SLOTS: { id: UploadSlot; label: string; description: string }[] = [
  {
    id: "signal",
    label: "Signal List",
    description:
      "Screenshot of your Access Points screen showing all networks, signal strength, and channels",
  },
  {
    id: "scan24",
    label: "2.4 GHz Scan",
    description:
      "Screenshot of your Channel Graph filtered to 2.4 GHz showing channel congestion",
  },
  {
    id: "scan5",
    label: "5 GHz Scan",
    description:
      "Screenshot of your Channel Graph filtered to 5 GHz showing channel usage",
  },
];

// ─── Typewriter ───────────────────────────────────────────────────────────────

function Typewriter({
  text,
  speed = 18,
  onDone,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) {
      setDone(true);
      onDoneRef.current?.();
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
        onDoneRef.current?.();
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && (
        <span
          className="inline-block w-px ml-0.5 opacity-70"
          style={{ height: "1em", background: "currentColor", animation: "pulse 1s infinite" }}
        />
      )}
    </span>
  );
}

// ─── Severity helpers ─────────────────────────────────────────────────────────

function severityBorderColor(s: string) {
  if (s === "CRITICAL") return "#ef4444";
  if (s === "GOOD") return "#22c55e";
  return "#eab308";
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    CRITICAL: {
      bg: "rgba(239,68,68,0.12)",
      color: "#f87171",
      border: "rgba(239,68,68,0.35)",
    },
    WARNING: {
      bg: "rgba(234,179,8,0.12)",
      color: "#fbbf24",
      border: "rgba(234,179,8,0.35)",
    },
    GOOD: {
      bg: "rgba(34,197,94,0.12)",
      color: "#4ade80",
      border: "rgba(34,197,94,0.35)",
    },
  };
  const c = map[severity] ?? map.WARNING;
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded tracking-widest"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {severity}
    </span>
  );
}

// ─── Upload box with thumbnail preview ───────────────────────────────────────

function UploadBox({
  slot,
  file,
  preview,
  onFile,
}: {
  slot: (typeof UPLOAD_SLOTS)[number];
  file: File | null;
  preview: string | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) onFile(f);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className="ocws-tile flex flex-col items-center justify-center gap-3 p-4 cursor-pointer transition-all overflow-hidden"
      style={{
        minHeight: "176px",
        borderColor: dragging
          ? "var(--ocws-cyan)"
          : file
          ? "rgba(0,212,255,0.40)"
          : undefined,
        background: file ? "rgba(0,212,255,0.05)" : undefined,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {preview ? (
        <>
          <img
            src={preview}
            alt={slot.label}
            className="w-full h-24 object-cover rounded-lg"
            style={{ opacity: 0.85 }}
          />
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
              <path
                d="M5 13l4 4L19 7"
                stroke="#00d4ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-xs font-semibold ocws-accent-cyan">{slot.label}</p>
          </div>
          <p className="text-xs ocws-muted2 text-center truncate max-w-full px-2">
            {file?.name}
          </p>
        </>
      ) : (
        <>
          <div
            className="flex items-center justify-center rounded-full w-10 h-10"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 16V8m0 0l-3 3m3-3l3 3"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 16.5A4.5 4.5 0 0015.5 12H15a6 6 0 10-11.95 1"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-white text-center leading-snug">
            {slot.label}
          </p>
          <p className="text-xs ocws-muted2 text-center leading-relaxed max-w-[200px]">
            {slot.description}
          </p>
          <p className="text-xs ocws-muted2">Tap or drag to upload</p>
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CrowsEyeClient() {
  // Form
  const [files, setFiles] = useState<Record<UploadSlot, File | null>>({
    signal: null,
    scan24: null,
    scan5: null,
  });
  const [previews, setPreviews] = useState<Record<UploadSlot, string | null>>({
    signal: null,
    scan24: null,
    scan5: null,
  });
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [environment, setEnvironment] = useState<"indoor" | "outdoor">("indoor");
  const [locationType, setLocationType] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Phase: form → analyzing → free_result → full_verdict
  const [phase, setPhase] = useState<
    "form" | "analyzing" | "free_result" | "full_verdict"
  >("form");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Free result reveal step:
  // 0 idle | 1 typing opening | 2 stats+teaser1 | 3 teaser2 | 4 typing closing | 5 payment CTA
  const [freeStep, setFreeStep] = useState(0);

  // Full verdict reveal: index of currently-typing finding (-1 = not started)
  const [verdictStep, setVerdictStep] = useState(-1);

  // Corvus panel
  const [corvusVisible, setCorvusVisible] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-skip missing teaser 2
  useEffect(() => {
    if (result && freeStep === 3 && !result.teaser_problems[1]) {
      const t = setTimeout(() => setFreeStep(4), 300);
      return () => clearTimeout(t);
    }
  }, [result, freeStep]);

  function handleFile(slot: UploadSlot, f: File | null) {
    setFiles((prev) => ({ ...prev, [slot]: f }));
    if (f) {
      const reader = new FileReader();
      reader.onload = (e) =>
        setPreviews((prev) => ({ ...prev, [slot]: (e.target?.result as string) ?? null }));
      reader.readAsDataURL(f);
    } else {
      setPreviews((prev) => ({ ...prev, [slot]: null }));
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = (e.target?.result as string) ?? "";
        resolve(result.split(",")[1] ?? "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!files.signal && !files.scan24 && !files.scan5) {
      setErrorMsg("Please upload at least one screenshot.");
      return;
    }

    setErrorMsg("");
    setPhase("analyzing");
    setCorvusVisible(true);
    setFreeStep(0);
    setVerdictStep(-1);

    setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      300
    );

    try {
      const images: Record<string, string> = {};
      const mimeTypes: Record<string, string> = {};

      for (const slot of ["signal", "scan24", "scan5"] as UploadSlot[]) {
        if (files[slot]) {
          images[slot] = await fileToBase64(files[slot]!);
          mimeTypes[slot] = files[slot]!.type || "image/jpeg";
        }
      }

      const res = await fetch("/api/crows-eye/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          mimeTypes,
          name,
          address,
          environment,
          locationType,
          notes,
        }),
      });

      const data: AnalysisResult & { ok: boolean; error?: string } = await res
        .json()
        .catch(() => ({ ok: false, error: "Unexpected response." }));

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Analysis failed.");
      }

      setResult(data);
      setPhase("free_result");
      setFreeStep(1);

      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100
      );
    } catch (err: unknown) {
      setPhase("form");
      setCorvusVisible(false);
      setErrorMsg(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    }
  }

  function handleStripePayment() {
    console.log("Stripe payment triggered");
    // Wire real Stripe here later
  }

  function handleDemoVerdict() {
    setPhase("full_verdict");
    setVerdictStep(0);
    setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      100
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="ocws-container py-12 md:py-16 pb-40">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="text-center mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest ocws-accent-cyan mb-4">
          Crow&rsquo;s Eye by Corvus
        </p>
        <h1 className="ocws-h1 mb-4">Crow&rsquo;s Eye</h1>
        <p className="text-xl font-medium text-white/90 mb-4">
          Corvus sees what your ISP won&rsquo;t tell you.
        </p>
        <p className="ocws-muted text-base max-w-xl mx-auto leading-relaxed">
          Got slow Wi-Fi, dead zones, or drops that never get explained? This is for
          anyone — homeowners, small businesses, RV parks, churches, restaurants. If
          you have a Wi-Fi problem, Corvus can read your environment and tell you
          exactly what&rsquo;s wrong.
        </p>
      </div>

      {/* ── HOW TO GET YOUR SCANS ─────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="ocws-h2 text-white mb-2">How to get your scans</h2>
        <p className="ocws-muted text-sm mb-6">
          You&rsquo;ll need the free{" "}
          <span className="text-white font-medium">WiFi Analyzer (open source)</span>{" "}
          app — green icon, Google Play Store, no account required.
        </p>
        <ol className="space-y-4">
          {[
            {
              n: "1",
              title: "Download WiFi Analyzer (open source)",
              body: 'Search "WiFi Analyzer open source" on the Google Play Store. Free. Green icon. Install it.',
            },
            {
              n: "2",
              title: "Open the app",
              body: "Grant location permission if prompted — Android requires it for Wi-Fi scanning.",
            },
            {
              n: "3",
              title: 'Tap "Access Points" — screenshot that screen',
              body: "You'll see every network your phone can detect, with signal strength and channel numbers. Take a screenshot.",
            },
            {
              n: "4",
              title: 'Tap "Channel Graph" — screenshot each band',
              body: "Switch to 2.4 GHz and screenshot. Then switch to 5 GHz and screenshot. These reveal channel congestion.",
            },
            {
              n: "5",
              title: "You're done. Upload below.",
              body: "Three screenshots. That's everything Corvus needs to render his Verdict.",
            },
          ].map(({ n, title, body }) => (
            <li key={n} className="flex gap-4 items-start">
              <div
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                style={{
                  background: "rgba(0,212,255,0.12)",
                  border: "1px solid rgba(0,212,255,0.30)",
                  color: "var(--ocws-cyan)",
                }}
              >
                {n}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="ocws-muted text-sm mt-0.5 leading-relaxed">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── UPLOAD FORM ───────────────────────────────────────────────────── */}
      <form onSubmit={handleAnalyze} className="space-y-8 max-w-3xl">

        {/* Upload boxes */}
        <div>
          <h2 className="ocws-h2 text-white mb-1">Upload your screenshots</h2>
          <p className="ocws-muted text-sm mb-5">
            All three for the sharpest Verdict. JPEG or PNG.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {UPLOAD_SLOTS.map((slot) => (
              <UploadBox
                key={slot.id}
                slot={slot}
                file={files[slot.id]}
                preview={previews[slot.id]}
                onFile={(f) => handleFile(slot.id, f)}
              />
            ))}
          </div>
        </div>

        {/* Location details */}
        <div className="ocws-tile p-6 space-y-5">
          <h2 className="ocws-h2 text-white">About your location</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Your name <span className="text-white/50">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="Name or business name"
                autoComplete="name"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Site address
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City and state is fine"
                autoComplete="street-address"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Environment
              </label>
              <div
                className="inline-flex rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.10)" }}
              >
                {(["indoor", "outdoor"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setEnvironment(opt)}
                    className="px-5 py-2.5 text-sm font-semibold transition"
                    style={{
                      background:
                        environment === opt
                          ? "rgba(0,212,255,0.15)"
                          : "rgba(255,255,255,0.04)",
                      color:
                        environment === opt
                          ? "var(--ocws-cyan)"
                          : "rgba(255,255,255,0.55)",
                      borderRight:
                        opt === "indoor"
                          ? "1px solid rgba(255,255,255,0.10)"
                          : undefined,
                    }}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Location type
              </label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                style={{
                  color: locationType ? "white" : "rgba(255,255,255,0.35)",
                }}
              >
                <option value="" disabled>
                  Select…
                </option>
                {LOCATION_TYPES.map((t) => (
                  <option
                    key={t}
                    value={t}
                    style={{ color: "white", background: "#0d1117" }}
                  >
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Describe your problem
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="What's slow, what drops, what frustrates you. The more detail, the sharper the Verdict."
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-white text-sm">
            ❌ {errorMsg}
          </div>
        )}

        {/* CTA */}
        <div>
          <button
            type="submit"
            disabled={phase === "analyzing"}
            className="w-full sm:w-auto rounded-2xl px-8 py-4 text-base font-bold tracking-tight transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, var(--ocws-cyan), var(--ocws-cyan2))",
              color: "#05070b",
              boxShadow: "0 8px 28px rgba(0,212,255,0.25)",
            }}
          >
            {phase === "analyzing" ? "Corvus is looking…" : "Let Corvus Look"}
          </button>
          <p className="mt-3 text-xs ocws-muted2">
            Free instant analysis. No account. Upgrade to the full Verdict for $50.
          </p>
        </div>
      </form>

      {/* ── RESULTS PANEL ─────────────────────────────────────────────────── */}
      <div ref={resultsRef} className="mt-16 max-w-3xl">

        {/* Analyzing spinner */}
        {phase === "analyzing" && (
          <div className="ocws-tile p-8 flex flex-col items-center gap-4 text-center">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{
                borderColor: "rgba(0,212,255,0.3)",
                borderTopColor: "var(--ocws-cyan)",
              }}
            />
            <p className="text-white font-semibold">Corvus is reading your environment…</p>
            <p className="ocws-muted text-sm">
              Analyzing channel allocation, signal topology, and interference patterns.
            </p>
          </div>
        )}

        {/* Free result + full verdict share this container */}
        {(phase === "free_result" || phase === "full_verdict") && result && (
          <div className="space-y-6">

            {/* 1 — Corvus opening */}
            {freeStep >= 1 && (
              <div className="ocws-tile p-6">
                <p className="text-xs font-semibold uppercase tracking-widest ocws-accent-cyan mb-3">
                  Corvus&rsquo; Assessment
                </p>
                <p className="text-white text-lg leading-relaxed font-medium">
                  {freeStep === 1 ? (
                    <Typewriter
                      text={result.corvus_opening}
                      speed={20}
                      onDone={() => setTimeout(() => setFreeStep(2), 450)}
                    />
                  ) : (
                    result.corvus_opening
                  )}
                </p>
              </div>
            )}

            {/* 2 — Stats grid */}
            {freeStep >= 2 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Issues Found", value: result.problems_found, color: "white" },
                  { label: "Critical", value: result.critical_count, color: "#f87171" },
                  { label: "Warnings", value: result.warning_count, color: "#fbbf24" },
                  { label: "Good", value: result.good_count, color: "#4ade80" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="ocws-tile p-4 text-center">
                    <p className="text-3xl font-bold" style={{ color }}>
                      {value}
                    </p>
                    <p className="text-xs ocws-muted2 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 3 — Teaser problem 1 */}
            {freeStep >= 2 && result.teaser_problems[0] && (
              <div
                className="ocws-tile p-5"
                style={{ borderLeft: "4px solid rgba(239,68,68,0.55)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">
                  Top Issue
                </p>
                <p className="text-white font-semibold mb-2">
                  {result.teaser_problems[0].title}
                </p>
                <p className="ocws-muted text-sm leading-relaxed">
                  {freeStep === 2 ? (
                    <Typewriter
                      text={result.teaser_problems[0].teaser}
                      speed={16}
                      onDone={() => setTimeout(() => setFreeStep(3), 350)}
                    />
                  ) : (
                    result.teaser_problems[0].teaser
                  )}
                </p>
                <p className="text-xs text-white/30 mt-3 italic">
                  Fix withheld pending Verdict.
                </p>
              </div>
            )}

            {/* 4 — Teaser problem 2 */}
            {freeStep >= 3 && result.teaser_problems[1] && (
              <div
                className="ocws-tile p-5"
                style={{ borderLeft: "4px solid rgba(234,179,8,0.55)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">
                  Also Notable
                </p>
                <p className="text-white font-semibold mb-2">
                  {result.teaser_problems[1].title}
                </p>
                <p className="ocws-muted text-sm leading-relaxed">
                  {freeStep === 3 ? (
                    <Typewriter
                      text={result.teaser_problems[1].teaser}
                      speed={16}
                      onDone={() => setTimeout(() => setFreeStep(4), 350)}
                    />
                  ) : (
                    result.teaser_problems[1].teaser
                  )}
                </p>
                <p className="text-xs text-white/30 mt-3 italic">
                  Fix withheld pending Verdict.
                </p>
              </div>
            )}

            {/* 5 — Corvus closing line */}
            {freeStep >= 4 && (
              <div className="ocws-tile p-6 text-center">
                <p className="text-white text-lg italic leading-relaxed">
                  &ldquo;
                  {freeStep === 4 ? (
                    <Typewriter
                      text={result.corvus_closing}
                      speed={22}
                      onDone={() => setTimeout(() => setFreeStep(5), 700)}
                    />
                  ) : (
                    result.corvus_closing
                  )}
                  &rdquo;
                </p>
              </div>
            )}

            {/* 6 — Payment CTA (free_result only) */}
            {freeStep >= 5 && phase === "free_result" && (
              <div className="ocws-tile p-8 text-center space-y-5">
                <p className="text-xs font-semibold uppercase tracking-widest ocws-accent-gold">
                  Full Verdict
                </p>
                <h2 className="text-2xl font-bold text-white">
                  All {result.problems_found} findings. Every fix. Delivered in his voice.
                </h2>
                <p className="ocws-muted text-sm max-w-sm mx-auto">
                  Plus a downloadable PDF branded with the Crow&rsquo;s Eye mark.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleStripePayment}
                    className="rounded-2xl px-8 py-4 text-base font-bold tracking-tight transition"
                    style={{
                      background: "linear-gradient(135deg, #d6b25e, #b8943e)",
                      color: "#05070b",
                      boxShadow: "0 8px 28px rgba(214,178,94,0.28)",
                    }}
                  >
                    Get the Full Verdict — $50
                  </button>
                  <button
                    onClick={handleDemoVerdict}
                    className="ocws-btn ocws-btn-ghost text-sm"
                  >
                    Demo: See Full Verdict
                  </button>
                </div>
              </div>
            )}

            {/* ── FULL VERDICT ──────────────────────────────────────────── */}
            {phase === "full_verdict" && (
              <div className="space-y-6 pt-2">
                <div
                  className="pb-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest ocws-accent-cyan mt-6 mb-2">
                    Full Verdict
                  </p>
                  <h2 className="ocws-h2 text-white mb-1">
                    Corvus&rsquo; Complete Findings
                  </h2>
                  <p className="ocws-muted text-sm">
                    Everything. In order of how much it&rsquo;s costing you.
                  </p>
                </div>

                {/* Finding cards */}
                {result.full_findings.map((finding, i) => {
                  if (i > verdictStep) return null;
                  const isTyping = i === verdictStep;
                  const borderColor = severityBorderColor(finding.severity);

                  return (
                    <div
                      key={i}
                      className="ocws-tile p-6 space-y-3"
                      style={{ borderLeft: `4px solid ${borderColor}` }}
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <SeverityBadge severity={finding.severity} />
                        <p className="text-white font-semibold">{finding.title}</p>
                      </div>

                      <p className="ocws-muted text-sm leading-relaxed">
                        {isTyping ? (
                          <Typewriter
                            text={finding.description}
                            speed={14}
                            onDone={() =>
                              setTimeout(
                                () => setVerdictStep((v) => v + 1),
                                450
                              )
                            }
                          />
                        ) : (
                          finding.description
                        )}
                      </p>

                      {/* Fix appears after description finishes */}
                      {i < verdictStep && (
                        <div
                          className="rounded-xl px-4 py-3"
                          style={{
                            background: "rgba(0,0,0,0.3)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
                            Fix
                          </p>
                          <p className="text-white text-sm leading-relaxed">
                            {finding.fix}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Recommendations (after all findings done) */}
                {verdictStep >= result.full_findings.length && (
                  <div className="ocws-tile p-6 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest ocws-accent-cyan">
                      Recommendations
                    </p>
                    <ol className="space-y-3">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <span
                            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                            style={{
                              background: "rgba(0,212,255,0.12)",
                              border: "1px solid rgba(0,212,255,0.30)",
                              color: "var(--ocws-cyan)",
                            }}
                          >
                            {i + 1}
                          </span>
                          <p className="ocws-muted text-sm leading-relaxed">{rec}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Corvus summary */}
                {verdictStep >= result.full_findings.length && (
                  <div className="ocws-tile p-6">
                    <p className="text-xs font-semibold uppercase tracking-widest ocws-accent-gold mb-3">
                      Corvus&rsquo; Final Word
                    </p>
                    <p className="text-white text-base italic leading-relaxed">
                      &ldquo;{result.corvus_summary}&rdquo;
                    </p>
                  </div>
                )}

                {/* Download PDF */}
                {verdictStep >= result.full_findings.length && (
                  <div className="text-center pt-2">
                    <button
                      className="rounded-2xl px-8 py-4 text-base font-bold tracking-tight transition"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--ocws-cyan), var(--ocws-cyan2))",
                        color: "#05070b",
                        boxShadow: "0 8px 28px rgba(0,212,255,0.25)",
                      }}
                    >
                      Download Corvus&rsquo; Verdict PDF
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CORVUS VIDEO PANEL — fixed bottom-right ───────────────────────── */}
      {corvusVisible && (
        <div
          className="fixed z-50 rounded-2xl overflow-hidden transition-all"
          style={{
            bottom: "1.5rem",
            right: "1.5rem",
            width: "240px",
            border: "2px solid var(--ocws-cyan)",
            background: "#05070b",
            boxShadow: "0 8px 40px rgba(0,212,255,0.22)",
          }}
        >
          {/* Video placeholder — swap src for actual MP4 when ready */}
          <div
            className="relative w-full flex flex-col items-center justify-center gap-2"
            style={{
              aspectRatio: "16/9",
              background: "linear-gradient(135deg, #0a1628, #051020)",
            }}
          >
            {phase === "analyzing" ? (
              <>
                <div
                  className="w-5 h-5 rounded-full border-2 animate-spin"
                  style={{
                    borderColor: "rgba(0,212,255,0.3)",
                    borderTopColor: "var(--ocws-cyan)",
                  }}
                />
                <p className="text-xs ocws-accent-cyan font-semibold">Looking…</p>
              </>
            ) : (
              <p className="text-xs ocws-accent-cyan font-semibold px-3 text-center">
                Verdict rendered.
              </p>
            )}
          </div>

          {/* Panel footer */}
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(0,212,255,0.15)" }}
          >
            <p className="text-xs font-semibold ocws-accent-cyan">Crow&rsquo;s Eye</p>
            <button
              onClick={() => setCorvusVisible(false)}
              className="text-white/40 hover:text-white/80 transition text-sm leading-none"
              aria-label="Close Corvus panel"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
