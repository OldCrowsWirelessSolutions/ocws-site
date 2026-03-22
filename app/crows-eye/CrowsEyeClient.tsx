"use client";

import { useRef, useState } from "react";

const LOCATION_TYPES = [
  "Home",
  "Office",
  "Restaurant",
  "Church",
  "RV Park",
  "Marina",
  "School",
  "Medical Facility",
  "Other",
];

type UploadSlot = "signal" | "scan24" | "scan5";

const UPLOAD_SLOTS: {
  id: UploadSlot;
  label: string;
  description: string;
}[] = [
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

function UploadBox({
  slot,
  file,
  onFile,
}: {
  slot: (typeof UPLOAD_SLOTS)[number];
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) onFile(f);
  }

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className="ocws-tile flex flex-col items-center justify-center gap-3 p-6 cursor-pointer transition"
      style={{
        borderColor: dragging
          ? "var(--ocws-cyan)"
          : file
          ? "rgba(0,212,255,0.35)"
          : undefined,
        background: file ? "rgba(0,212,255,0.06)" : undefined,
        minHeight: "170px",
      }}
    >
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {/* Upload icon */}
      <div
        className="flex items-center justify-center rounded-full w-11 h-11"
        style={{
          background: file ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.06)",
          border: "1px solid",
          borderColor: file ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.12)",
        }}
      >
        {file ? (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M12 16V8m0 0l-3 3m3-3l3 3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 16.5A4.5 4.5 0 0015.5 12H15a6 6 0 10-11.95 1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Label */}
      <p className="text-base font-semibold text-white text-center leading-snug">
        {slot.label}
      </p>

      {/* Description or file name */}
      <p className="text-xs text-center ocws-muted2 leading-relaxed max-w-[200px]">
        {file ? file.name : slot.description}
      </p>

      {!file && (
        <p className="text-xs ocws-muted2 mt-1">Tap or drag to upload</p>
      )}
    </div>
  );
}

export default function CrowsEyeClient() {
  const [files, setFiles] = useState<Record<UploadSlot, File | null>>({
    signal: null,
    scan24: null,
    scan5: null,
  });
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [environment, setEnvironment] = useState<"indoor" | "outdoor">("indoor");
  const [locationType, setLocationType] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function setFile(slot: UploadSlot, f: File | null) {
    setFiles((prev) => ({ ...prev, [slot]: f }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setStatus("error");
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!files.signal && !files.scan24 && !files.scan5) {
      setStatus("error");
      setErrorMsg("Please upload at least one screenshot.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("address", address.trim());
      fd.append("environment", environment);
      fd.append("locationType", locationType);
      fd.append("notes", notes.trim());
      if (files.signal) fd.append("signal", files.signal);
      if (files.scan24) fd.append("scan24", files.scan24);
      if (files.scan5) fd.append("scan5", files.scan5);

      const res = await fetch("/api/crows-eye", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Submission failed.");
      }

      setStatus("sent");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed.");
    }
  }

  return (
    <div className="ocws-container py-12 md:py-16">

      {/* ── HERO ─────────────────────────────────── */}
      <div className="text-center mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest ocws-accent-cyan mb-4">
          Crow&rsquo;s Eye by Corvus
        </p>
        <h1 className="ocws-h1 mb-4">
          Crow&rsquo;s Eye
        </h1>
        <p className="text-xl font-medium text-white/90 mb-4">
          Corvus sees what your ISP won&rsquo;t tell you.
        </p>
        <p className="ocws-muted text-base max-w-xl mx-auto leading-relaxed">
          Got slow Wi-Fi, dead zones, or connections that keep dropping?
          This tool is for anyone — homeowners, small businesses, RV parks, churches,
          offices. If you have a Wi-Fi problem, Corvus can read your environment and
          tell you exactly what&rsquo;s wrong.
        </p>
      </div>

      {/* ── HOW TO GET YOUR SCANS ─────────────────── */}
      <section className="mb-14">
        <h2 className="ocws-h2 text-white mb-2">How to get your scans</h2>
        <p className="ocws-muted text-sm mb-6">
          You&rsquo;ll need the free{" "}
          <span className="text-white font-medium">WiFi Analyzer (open source)</span>{" "}
          app — it has a green icon and is available on the Google Play Store. No account required.
        </p>

        <ol className="space-y-4">
          {[
            {
              step: "1",
              title: "Download WiFi Analyzer (open source)",
              body: 'Search "WiFi Analyzer open source" on the Google Play Store. It\'s free with a green icon. Install it.',
            },
            {
              step: "2",
              title: "Open the app",
              body: "Grant location permission if prompted — this is required for Wi-Fi scanning on Android.",
            },
            {
              step: "3",
              title: 'Tap "Access Points" — screenshot that screen',
              body: "This view shows every network your phone can see, with signal strength and channel numbers. Take a screenshot.",
            },
            {
              step: "4",
              title: 'Tap "Channel Graph" — screenshot each band',
              body: "Switch to 2.4 GHz and screenshot. Then switch to 5 GHz and screenshot. These show channel congestion visually.",
            },
            {
              step: "5",
              title: "You now have everything Corvus needs",
              body: "Upload your three screenshots below and fill in a few details. Corvus does the rest.",
            },
          ].map(({ step, title, body }) => (
            <li key={step} className="flex gap-4 items-start">
              <div
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                style={{
                  background: "rgba(0,212,255,0.12)",
                  border: "1px solid rgba(0,212,255,0.3)",
                  color: "var(--ocws-cyan)",
                }}
              >
                {step}
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-snug">{title}</p>
                <p className="ocws-muted text-sm mt-0.5 leading-relaxed">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── FORM ─────────────────────────────────── */}
      <form onSubmit={onSubmit} className="space-y-10 max-w-3xl">

        {/* Upload boxes */}
        <div>
          <h2 className="ocws-h2 text-white mb-1">Upload your screenshots</h2>
          <p className="ocws-muted text-sm mb-6">Upload all three for the most accurate Verdict. JPEG or PNG.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {UPLOAD_SLOTS.map((slot) => (
              <UploadBox
                key={slot.id}
                slot={slot}
                file={files[slot.id]}
                onFile={(f) => setFile(slot.id, f)}
              />
            ))}
          </div>
        </div>

        {/* About your location */}
        <div className="ocws-tile p-6 space-y-5">
          <h2 className="ocws-h2 text-white">About your location</h2>

          {/* Name + Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Your name <span className="text-white/50">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setStatus("idle"); }}
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

          {/* Environment toggle + Location type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Environment
              </label>
              <div className="inline-flex rounded-xl overflow-hidden border border-white/10">
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
                          : "rgba(255,255,255,0.6)",
                      borderRight: opt === "indoor" ? "1px solid rgba(255,255,255,0.10)" : undefined,
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
                style={{ color: locationType ? "white" : "rgba(255,255,255,0.35)" }}
              >
                <option value="" disabled>Select…</option>
                {LOCATION_TYPES.map((t) => (
                  <option key={t} value={t} style={{ color: "white", background: "#0d1117" }}>
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
            rows={5}
            placeholder="What's slow, what drops, what frustrates you. The more detail, the sharper the Verdict."
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        {/* Status messages */}
        {status === "sent" && (
          <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-white text-sm">
            ✅ Submitted. Corvus is on it — you&rsquo;ll receive your Verdict by email.
          </div>
        )}
        {status === "error" && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-white text-sm">
            ❌ {errorMsg}
          </div>
        )}

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={status === "sending" || status === "sent"}
            className="w-full sm:w-auto rounded-2xl px-8 py-4 text-base font-bold tracking-tight transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, var(--ocws-cyan), var(--ocws-cyan2))",
              color: "#05070b",
              boxShadow: "0 8px 28px rgba(0,212,255,0.25)",
            }}
          >
            {status === "sending" ? "Submitting…" : "Get Corvus\u2019 Verdict — $50"}
          </button>

          <p className="mt-3 text-xs ocws-muted2 max-w-sm leading-relaxed">
            Corvus analyzes every network visible in your scans and renders a full branded
            PDF report with findings and fixes specific to your environment.
          </p>
        </div>
      </form>
    </div>
  );
}
