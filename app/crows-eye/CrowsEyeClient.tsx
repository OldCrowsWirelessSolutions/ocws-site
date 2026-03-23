"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadSlot = "signal" | "scan24" | "scan5";

interface LocationEntry {
  id: string;
  name: string;
  files: Record<UploadSlot, File | null>;
  previews: Record<UploadSlot, string | null>;
}

function makeEmptyLocation(): LocationEntry {
  return {
    id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    files: { signal: null, scan24: null, scan5: null },
    previews: { signal: null, scan24: null, scan5: null },
  };
}

interface TeaserProblem {
  title: string;
  teaser: string;
}

interface RouterInfo {
  vendor: string;
  gateway_ip: string | null;
  default_username: string | null;
  default_password: string | null;
  confidence: "high" | "medium" | "low";
}

interface FullFinding {
  severity: "CRITICAL" | "WARNING" | "GOOD";
  title: string;
  description: string;
  fix: string;
  steps?: string[];
  router_info?: RouterInfo;
  login_disclaimer?: string;
}

interface AnalysisResult {
  identified_ssid: string | null;
  router_vendor: string | null;
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

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

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
  const [street, setStreet] = useState("");
  const [suite, setSuite] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("FL");
  const [zip, setZip] = useState("");
  const [environment, setEnvironment] = useState<"indoor" | "outdoor">("indoor");
  const [locationType, setLocationType] = useState("");
  const [notes, setNotes] = useState("");
  const [ssid, setSsid] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // TODO: replace honeypot with reCAPTCHA once key issue resolved
  const [honeypot, setHoneypot] = useState("");

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

  // Mode toggle
  const [mode, setMode] = useState<"single" | "site">("single");

  // Multi-location (site mode)
  const [locations, setLocations] = useState<LocationEntry[]>(() => [makeEmptyLocation()]);

  // Admin modal
  const [adminMode, setAdminMode] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  // Subscriber code
  const [showSubCode, setShowSubCode] = useState(false);
  const [subCode, setSubCode] = useState("");
  const [subCodeStatus, setSubCodeStatus] = useState<null | "valid" | "invalid">(null);

  // PDF generation
  const [pdfGenerating, setPdfGenerating] = useState(false);

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

  function validateForm(): boolean {
    if (!name.trim()) { setErrorMsg("Please enter your name."); return false; }
    if (mode === "site") {
      if (!locations.some((l) => l.files.signal || l.files.scan24 || l.files.scan5)) {
        setErrorMsg("Please upload at least one screenshot for at least one location.");
        return false;
      }
      return true;
    }
    if (!files.signal && !files.scan24 && !files.scan5) {
      setErrorMsg("Please upload at least one screenshot.");
      return false;
    }
    return true;
  }

  async function runAnalysis() {
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
      let bodyPayload: Record<string, unknown>;

      if (mode === "single") {
        const images: Record<string, string> = {};
        const mimeTypes: Record<string, string> = {};
        for (const slot of ["signal", "scan24", "scan5"] as UploadSlot[]) {
          if (files[slot]) {
            images[slot] = await fileToBase64(files[slot]!);
            mimeTypes[slot] = files[slot]!.type || "image/jpeg";
          }
        }
        bodyPayload = {
          mode: "single",
          images,
          mimeTypes,
          name,
          address: [street.trim(), suite.trim(), city.trim(), state, zip.trim()]
            .filter(Boolean)
            .join(", "),
          environment,
          locationType,
          notes,
          client_ssid: ssid,
          honeypot,
        };
      } else {
        const encodedLocations = await Promise.all(
          locations.map(async (loc, idx) => {
            const images: Record<string, string> = {};
            const mimeTypes: Record<string, string> = {};
            for (const slot of ["signal", "scan24", "scan5"] as UploadSlot[]) {
              if (loc.files[slot]) {
                images[slot] = await fileToBase64(loc.files[slot]!);
                mimeTypes[slot] = loc.files[slot]!.type || "image/jpeg";
              }
            }
            return { name: loc.name.trim() || `Location ${idx + 1}`, images, mimeTypes };
          })
        );
        bodyPayload = {
          mode: "site",
          locations: encodedLocations,
          name,
          address: [street.trim(), suite.trim(), city.trim(), state, zip.trim()]
            .filter(Boolean)
            .join(", "),
          environment,
          locationType,
          notes,
          client_ssid: ssid,
          honeypot,
        };
      }

      const res = await fetch("/api/crows-eye/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data: AnalysisResult & { ok: boolean; error?: string } = await res
        .json()
        .catch(() => ({ ok: false, error: "Unexpected response." }));

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Analysis failed.");
      }

      setResult(data);
      if (adminMode) {
        setPhase("full_verdict");
        setVerdictStep(0);
      } else {
        setPhase("free_result");
        setFreeStep(1);
      }

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

  function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return; // bot trap
    if (!validateForm()) return;
    runAnalysis();
  }

  function handleStripePayment() {
    if (honeypot) return; // bot trap
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

  function unlockVerdict() {
    setPhase("full_verdict");
    setVerdictStep(0);
    setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      100
    );
  }

  // Location management (site mode)
  function addLocation() {
    if (locations.length >= 10) return;
    setLocations((prev) => [...prev, makeEmptyLocation()]);
  }

  function removeLocation(id: string) {
    setLocations((prev) => prev.length > 1 ? prev.filter((l) => l.id !== id) : prev);
  }

  function updateLocationName(id: string, val: string) {
    setLocations((prev) => prev.map((l) => l.id === id ? { ...l, name: val } : l));
  }

  function handleLocationFile(locId: string, slot: UploadSlot, f: File | null) {
    if (f) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = (e.target?.result as string) ?? null;
        setLocations((prev) =>
          prev.map((l) =>
            l.id === locId
              ? { ...l, files: { ...l.files, [slot]: f }, previews: { ...l.previews, [slot]: preview } }
              : l
          )
        );
      };
      reader.readAsDataURL(f);
    } else {
      setLocations((prev) =>
        prev.map((l) =>
          l.id === locId
            ? { ...l, files: { ...l.files, [slot]: null }, previews: { ...l.previews, [slot]: null } }
            : l
        )
      );
    }
  }

  // Admin modal
  function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (adminPassword === "OCWS2026") {
      setAdminMode(true);
      setShowAdminModal(false);
      setAdminPassword("");
      setAdminError("");
    } else {
      setAdminError("Invalid password.");
    }
  }

  // Subscriber code
  function handleSubCodeCheck() {
    if (subCode.trim().toUpperCase() === "CORVUS-NEST") {
      setSubCodeStatus("valid");
    } else {
      setSubCodeStatus("invalid");
    }
  }

  // PDF generation
  async function handleDownloadPdf() {
    if (!result || pdfGenerating) return;
    setPdfGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "letter" });

      const PW = 612;
      const PH = 792;
      const ML = 40;
      const MR = 40;
      const CW = PW - ML - MR;
      const FOOTER_ZONE = 50;

      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const reportId = `CE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      let y = 0;

      function addPageFooter() {
        doc.setFillColor(26, 35, 50);
        doc.rect(0, PH - 36, PW, 36, "F");
        doc.setTextColor(100, 120, 145);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(
          "\u00A9 2026 Old Crows Wireless Solutions LLC  \u00B7  oldcrowswireless.com  \u00B7  Clarity Where Wireless Fails",
          PW / 2,
          PH - 13,
          { align: "center" }
        );
      }

      function newPage() {
        addPageFooter();
        doc.addPage();
        doc.setFillColor(26, 35, 50);
        doc.rect(0, 0, PW, 28, "F");
        doc.setFillColor(13, 110, 122);
        doc.rect(0, 25, PW, 3, "F");
        doc.setTextColor(0, 194, 199);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("CORVUS\u2019 VERDICT", ML, 18);
        doc.setTextColor(100, 120, 145);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(reportId, PW - MR, 18, { align: "right" });
        y = 44;
      }

      function ensure(needed: number) {
        if (y + needed > PH - FOOTER_ZONE) newPage();
      }

      // ── HEADER ─────────────────────────────────────────────────────────────
      const HDR = 68;
      doc.setFillColor(26, 35, 50);
      doc.rect(0, 0, PW, HDR, "F");
      doc.setFillColor(13, 110, 122);
      doc.rect(0, HDR - 3, PW, 3, "F");

      doc.setTextColor(0, 194, 199);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("CORVUS\u2019 VERDICT", ML, 40);

      doc.setTextColor(184, 146, 42);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("CROW\u2019S EYE BY CORVUS", PW - MR, 22, { align: "right" });

      doc.setTextColor(100, 120, 145);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(reportId, PW - MR, 34, { align: "right" });
      doc.text(dateStr, PW - MR, 46, { align: "right" });

      y = HDR + 22;

      // ── CLIENT INFO ────────────────────────────────────────────────────────
      const clientH = ssid ? 70 : 58;
      doc.setFillColor(13, 110, 122);
      doc.rect(ML, y, 3, clientH, "F");

      doc.setTextColor(0, 194, 199);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("CLIENT REPORT", ML + 12, y + 11);

      doc.setTextColor(220, 230, 242);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(name || "\u2014", ML + 12, y + 26);

      const addrStr = [street, suite, city, state, zip].filter(Boolean).join(", ");
      doc.setTextColor(160, 178, 200);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(addrStr || "Address not provided", ML + 12, y + 40);

      const envStr = [
        environment.charAt(0).toUpperCase() + environment.slice(1),
        locationType,
      ]
        .filter(Boolean)
        .join("  \u00B7  ");
      doc.text(envStr, ML + 12, y + 52);

      if (ssid) {
        doc.setTextColor(0, 194, 199);
        doc.setFontSize(7.5);
        doc.text(`SSID: ${ssid}`, ML + 12, y + 64);
      }

      y += clientH + 18;

      // Divider
      doc.setDrawColor(13, 110, 122);
      doc.setLineWidth(0.5);
      doc.line(ML, y, PW - MR, y);
      y += 18;

      // ── CORVUS' ASSESSMENT ─────────────────────────────────────────────────
      doc.setTextColor(0, 194, 199);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("CORVUS\u2019 ASSESSMENT", ML, y);
      y += 13;

      const openLines = doc.splitTextToSize(`\u201C${result.corvus_opening}\u201D`, CW);
      ensure(openLines.length * 14 + 12);
      doc.setTextColor(210, 222, 238);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bolditalic");
      doc.text(openLines, ML, y);
      y += openLines.length * 14 + 14;

      // Stats row
      ensure(54);
      const bW = (CW - 12) / 4;
      const statsData = [
        { label: "ISSUES FOUND", val: result.problems_found, r: 220, g: 228, b: 240 },
        { label: "CRITICAL",     val: result.critical_count,  r: 248, g: 113, b: 113 },
        { label: "WARNINGS",     val: result.warning_count,   r: 251, g: 191, b: 36  },
        { label: "GOOD",         val: result.good_count,      r: 74,  g: 222, b: 128 },
      ];
      statsData.forEach((s, i) => {
        const bx = ML + i * (bW + 4);
        doc.setFillColor(18, 28, 46);
        doc.roundedRect(bx, y, bW, 46, 4, 4, "F");
        doc.setTextColor(s.r, s.g, s.b);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(String(s.val), bx + bW / 2, y + 26, { align: "center" });
        doc.setTextColor(100, 120, 145);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.text(s.label, bx + bW / 2, y + 38, { align: "center" });
      });
      y += 58;

      // ── FINDINGS ───────────────────────────────────────────────────────────
      ensure(24);
      doc.setDrawColor(13, 110, 122);
      doc.setLineWidth(0.5);
      doc.line(ML, y, PW - MR, y);
      y += 14;

      doc.setTextColor(0, 194, 199);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("COMPLETE FINDINGS", ML, y);
      y += 14;

      const SEV_COLOR: Record<string, [number, number, number]> = {
        CRITICAL: [239, 68,  68 ],
        WARNING:  [234, 179, 8  ],
        GOOD:     [74,  222, 128],
      };

      for (const f of result.full_findings) {
        const [sr, sg, sb] = SEV_COLOR[f.severity] ?? SEV_COLOR.WARNING;
        const descLines = doc.splitTextToSize(f.description, CW - 20);
        const fixLines  = doc.splitTextToSize(f.fix, CW - 40);
        const cardH = 26 + descLines.length * 12 + 8 + fixLines.length * 12 + 18;

        ensure(cardH + 8);

        doc.setFillColor(sr, sg, sb);
        doc.rect(ML, y, 3, cardH, "F");

        doc.setFillColor(18, 28, 46);
        doc.rect(ML + 3, y, CW - 3, cardH, "F");

        // Severity badge
        const pr = Math.round(sr * 0.20 + 18 * 0.80);
        const pg = Math.round(sg * 0.20 + 28 * 0.80);
        const pb = Math.round(sb * 0.20 + 46 * 0.80);
        doc.setFillColor(pr, pg, pb);
        doc.roundedRect(ML + 10, y + 8, 54, 13, 3, 3, "F");
        doc.setTextColor(sr, sg, sb);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.text(f.severity, ML + 37, y + 17, { align: "center" });

        // Title (wraps if long)
        doc.setTextColor(215, 225, 240);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(f.title, CW - 80);
        doc.text(titleLines, ML + 72, y + 17);

        // Description
        doc.setTextColor(155, 175, 198);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(descLines, ML + 10, y + 30);

        // Fix box
        const fixY = y + 30 + descLines.length * 12 + 4;
        doc.setFillColor(12, 32, 52);
        doc.roundedRect(ML + 10, fixY, CW - 20, fixLines.length * 12 + 14, 3, 3, "F");
        doc.setTextColor(0, 194, 199);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.text("FIX", ML + 18, fixY + 10);
        doc.setTextColor(150, 200, 218);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.text(fixLines, ML + 36, fixY + 10);

        y += cardH + 8;
      }

      // ── RECOMMENDATIONS ────────────────────────────────────────────────────
      ensure(24);
      doc.setDrawColor(13, 110, 122);
      doc.setLineWidth(0.5);
      doc.line(ML, y, PW - MR, y);
      y += 14;

      doc.setTextColor(0, 194, 199);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("RECOMMENDATIONS", ML, y);
      y += 14;

      result.recommendations.forEach((rec, i) => {
        const rLines = doc.splitTextToSize(rec, CW - 30);
        const rH = rLines.length * 12 + 8;
        ensure(rH + 4);

        doc.setFillColor(13, 110, 122);
        doc.circle(ML + 9, y + 6, 7, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(String(i + 1), ML + 9, y + 9, { align: "center" });

        doc.setTextColor(155, 175, 198);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(rLines, ML + 24, y + 9);
        y += rH + 4;
      });

      // ── CORVUS' FINAL WORD ─────────────────────────────────────────────────
      y += 10;
      const fwLines = doc.splitTextToSize(`\u201C${result.corvus_summary}\u201D`, CW - 28);
      const fwH = fwLines.length * 13 + 30;
      ensure(fwH + 8);

      doc.setFillColor(20, 30, 50);
      doc.roundedRect(ML, y, CW, fwH, 5, 5, "F");
      doc.setFillColor(184, 146, 42);
      doc.rect(ML, y, 3, fwH, "F");

      doc.setTextColor(184, 146, 42);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.text("CORVUS\u2019 FINAL WORD", ML + 12, y + 14);

      doc.setTextColor(210, 222, 236);
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(fwLines, ML + 12, y + 26);
      y += fwH + 22;

      // ── CERTIFICATION ──────────────────────────────────────────────────────
      const certH = 62;
      ensure(certH + 8);
      doc.setDrawColor(13, 110, 122);
      doc.setLineWidth(0.8);
      doc.roundedRect(ML, y, CW, certH, 4, 4);
      doc.setFillColor(13, 110, 122);
      doc.rect(ML, y, 3, certH, "F");

      doc.setTextColor(0, 194, 199);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICATION", ML + 12, y + 14);

      doc.setTextColor(155, 175, 198);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      const certLines = [
        "Rendered by Crow\u2019s Eye  \u00B7  Certified by Joshua Turner",
        "Managing Member, Old Crows Wireless Solutions LLC",
        "17 Years U.S. Navy Electronic Warfare Experience",
      ];
      certLines.forEach((line, i) => {
        doc.text(line, ML + 12, y + 28 + i * 13);
      });

      addPageFooter();

      // ── SAVE ───────────────────────────────────────────────────────────────
      const safeName = (name || "Client")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, " ");
      const fileDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      doc.save(`Corvus' Verdict - ${safeName} - ${fileDate}.pdf`);
    } finally {
      setPdfGenerating(false);
    }
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
        <p className="ocws-muted text-sm mb-5">
          You&rsquo;ll need a free Wi-Fi scanner app on your phone. Pick yours below.
        </p>

        {/* App badges */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          {/* Google Play badge */}
          <a
            href="https://play.google.com/store/apps/details?id=com.vrem.wifianalyzer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-4 py-3 rounded-xl transition"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              textDecoration: "none",
            }}
          >
            {/* Play triangle */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M5 3.5L19 12L5 20.5V3.5Z" fill="#00d4ff" />
            </svg>
            <div>
              <p className="text-white/55 text-xs leading-none mb-0.5">GET IT ON</p>
              <p className="text-white font-semibold text-sm leading-none">Google Play</p>
            </div>
          </a>

          {/* Apple App Store badge */}
          <a
            href="https://apps.apple.com/us/app/wifi-analyzer/id1286522951"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-4 py-3 rounded-xl transition"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              textDecoration: "none",
            }}
          >
            {/* Apple logo */}
            <svg width="20" height="22" viewBox="0 0 814 1000" fill="#00d4ff">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46 790.8 0 663 0 541.3c0-194.3 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
            </svg>
            <div>
              <p className="text-white/55 text-xs leading-none mb-0.5">IPHONE USERS</p>
              <p className="text-white font-semibold text-sm leading-none">WiFi Analyzer by Zolt&#225;n Pall&#225;ghy</p>
            </div>
          </a>
        </div>

        <p className="ocws-muted2 text-xs mb-8">
          Android: look for the green icon that says <span className="text-white/70">WiFi Analyzer (open-source)</span> — free with no ads.
        </p>

        {/* Steps */}
        <ol className="space-y-6">

          {/* Step 1 */}
          <li className="flex gap-4 items-start">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold" style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.30)", color: "var(--ocws-cyan)" }}>1</div>
            <div>
              <p className="text-white font-semibold text-sm">Download WiFi Analyzer (open source)</p>
              <p className="ocws-muted text-sm mt-0.5 leading-relaxed">Search &ldquo;WiFi Analyzer open source&rdquo; on the Google Play Store. Free. Green icon. Install it.</p>
            </div>
          </li>

          {/* Step 2 */}
          <li className="flex gap-4 items-start">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold" style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.30)", color: "var(--ocws-cyan)" }}>2</div>
            <div>
              <p className="text-white font-semibold text-sm">Open the app</p>
              <p className="ocws-muted text-sm mt-0.5 leading-relaxed">Grant location permission if prompted — Android requires it for Wi-Fi scanning.</p>
            </div>
          </li>

          {/* Step 3 */}
          <li className="flex gap-4 items-start">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold" style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.30)", color: "var(--ocws-cyan)" }}>3</div>
            <div>
              <p className="text-white font-semibold text-sm">Tap &ldquo;Access Points&rdquo; at the bottom of the screen — screenshot this</p>
              <p className="ocws-muted text-sm mt-0.5 leading-relaxed">
                You will see a list of every Wi-Fi network nearby. Each one shows the network name, signal strength (the number like <span className="text-white/80 font-medium">-52 dBm</span>), and channel number. This is your <span className="text-white/80 font-medium">Signal List screenshot</span>.
              </p>
            </div>
          </li>

          {/* Step 4 — NEW */}
          <li className="flex gap-4 items-start">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold" style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.30)", color: "var(--ocws-cyan)" }}>4</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Switch to 2.4 GHz view and screenshot the Channel Graph</p>
              <p className="ocws-muted text-sm mt-0.5 leading-relaxed">
                Tap <span className="text-white/80 font-medium">&ldquo;Channel Graph&rdquo;</span> at the bottom of the screen. In the top right corner you will see <span className="text-white/80 font-medium">&ldquo;2.4 GHz&rdquo;</span> — make sure it says 2.4 GHz. If it says 5 GHz, tap it to switch. You will see colored bars showing channel congestion. Screenshot this.
              </p>
              <div className="mt-3 px-4 py-3 rounded-xl text-sm ocws-muted leading-relaxed" style={{ borderLeft: "3px solid rgba(0,212,255,0.5)", background: "rgba(0,212,255,0.05)" }}>
                <span className="text-white/70 font-semibold">Tip:</span> The 2.4 GHz view shows channels 1 through 13. If you see lots of overlapping bars, your network is congested.
              </div>
            </div>
          </li>

          {/* Step 5 — NEW */}
          <li className="flex gap-4 items-start">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold" style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.30)", color: "var(--ocws-cyan)" }}>5</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Switch to 5 GHz view and screenshot the Channel Graph</p>
              <p className="ocws-muted text-sm mt-0.5 leading-relaxed">
                Tap the <span className="text-white/80 font-medium">&ldquo;2.4 GHz&rdquo;</span> text in the top right corner — it will switch to <span className="text-white/80 font-medium">&ldquo;5 GHz&rdquo;</span>. Screenshot this new view.
              </p>
              <div className="mt-3 px-4 py-3 rounded-xl text-sm ocws-muted leading-relaxed" style={{ borderLeft: "3px solid rgba(0,212,255,0.5)", background: "rgba(0,212,255,0.05)" }}>
                <span className="text-white/70 font-semibold">Tip:</span> If the 5 GHz screen looks empty, that is normal — 5 GHz has shorter range and you may not see many networks.
              </div>
            </div>
          </li>

          {/* Step 6 */}
          <li className="flex gap-4 items-start">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold" style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.30)", color: "var(--ocws-cyan)" }}>6</div>
            <div>
              <p className="text-white font-semibold text-sm">You now have three screenshots. Upload them below.</p>
              <p className="ocws-muted text-sm mt-0.5 leading-relaxed">That&rsquo;s everything Corvus needs to render his Verdict.</p>
            </div>
          </li>

        </ol>

        {/* Corvus reassurance box */}
        <div className="mt-8 px-5 py-4 rounded-2xl text-sm leading-relaxed" style={{ border: "1px solid rgba(0,212,255,0.25)", background: "rgba(0,212,255,0.04)" }}>
          <span className="text-white font-semibold">Not sure if you did it right?</span>
          <span className="ocws-muted"> That&rsquo;s okay. Upload what you have and Corvus will work with whatever he can see. He has seen worse.</span>
        </div>
      </section>

      {/* ── UPLOAD FORM ───────────────────────────────────────────────────── */}
      <form onSubmit={handleAnalyze} className="space-y-8 max-w-3xl">

        {/* Honeypot — hidden from real users, bots fill it in */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
        />

        {/* Mode toggle */}
        <div>
          <div
            className="flex w-full rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {(["single", "site"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex-1 px-4 py-3 text-sm font-semibold transition"
                style={{
                  background: mode === m ? "rgba(0,212,255,0.13)" : "rgba(255,255,255,0.03)",
                  color: mode === m ? "var(--ocws-cyan)" : "rgba(255,255,255,0.50)",
                  borderRight: m === "single" ? "1px solid rgba(255,255,255,0.10)" : undefined,
                }}
              >
                {m === "single" ? "Corvus\u2019 Verdict \u2014 Single Location" : "The Full Reckoning \u2014 Full Site"}
              </button>
            ))}
          </div>
          {mode === "site" && (
            <p className="mt-2 text-xs ocws-muted2">
              Upload scans for each location on the property. Corvus synthesizes a site-wide assessment.{" "}
              <span className="text-white/60 font-semibold">
                {locations.length <= 5 ? "$150" : "$350"}
              </span>{" "}
              ({locations.length <= 5 ? "up to 5 locations" : "6\u201310 locations"})
            </p>
          )}
        </div>

        {/* SSID field */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Your Network Name (SSID) <span className="text-white/50">*</span>
          </label>
          <input
            value={ssid}
            onChange={(e) => { setSsid(e.target.value); setErrorMsg(""); }}
            placeholder="e.g. MyHomeWiFi or Smith_Family_5G"
            autoComplete="off"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <p className="mt-1.5 text-xs ocws-muted2">
            This is the name of YOUR Wi-Fi network — the one you are trying to fix. You can find it in your phone&rsquo;s Wi-Fi settings.
          </p>
        </div>

        {/* Upload boxes — single mode */}
        {mode === "single" && (
        <div>
          <h2 className="ocws-h2 text-white mb-1">Upload your screenshots</h2>
          <p className="ocws-muted text-sm mb-5">
            All three for the sharpest Verdict. JPEG or PNG.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        )}

        {/* Upload boxes — site mode */}
        {mode === "site" && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="ocws-h2 text-white mb-1">Upload location scans</h2>
              <p className="ocws-muted text-sm">One set of screenshots per location. Up to 10.</p>
            </div>
            {locations.length < 10 && (
              <button
                type="button"
                onClick={addLocation}
                className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition"
                style={{
                  background: "rgba(0,212,255,0.10)",
                  border: "1px solid rgba(0,212,255,0.25)",
                  color: "var(--ocws-cyan)",
                }}
              >
                + Add Location
              </button>
            )}
          </div>

          {locations.map((loc, idx) => (
            <div
              key={loc.id}
              className="ocws-tile p-5 space-y-4"
              style={{ border: "1px solid rgba(0,212,255,0.15)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "rgba(0,212,255,0.12)",
                    border: "1px solid rgba(0,212,255,0.30)",
                    color: "var(--ocws-cyan)",
                  }}
                >
                  {idx + 1}
                </span>
                <input
                  value={loc.name}
                  onChange={(e) => updateLocationName(loc.id, e.target.value)}
                  placeholder={`Location ${idx + 1} name (e.g. Main Building, Pool House)`}
                  className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                {locations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLocation(loc.id)}
                    className="shrink-0 text-white/35 hover:text-red-400 transition text-xs"
                    aria-label="Remove location"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {UPLOAD_SLOTS.map((slot) => (
                  <UploadBox
                    key={slot.id}
                    slot={slot}
                    file={loc.files[slot.id]}
                    preview={loc.previews[slot.id]}
                    onFile={(f) => handleLocationFile(loc.id, slot.id, f)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Location details */}
        <div className="ocws-tile p-6 space-y-5">
          <h2 className="ocws-h2 text-white">About your location</h2>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Your name <span className="text-white/50">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setErrorMsg(""); }}
              placeholder="Name or business name"
              autoComplete="name"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* Street address */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Street address
            </label>
            <input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="123 Main St"
              autoComplete="address-line1"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* Suite */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Suite / Apt / Unit
            </label>
            <input
              value={suite}
              onChange={(e) => setSuite(e.target.value)}
              placeholder="Suite 100, Apt 4B (optional)"
              autoComplete="address-line2"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* City / State / ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Pensacola"
                autoComplete="address-level2"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                autoComplete="address-level1"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                {US_STATES.map((s) => (
                  <option key={s} value={s} style={{ color: "white", background: "#0d1117" }}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">ZIP Code</label>
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                placeholder="32501"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Environment
              </label>
              <div
                className="flex w-full sm:w-auto rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.10)" }}
              >
                {(["indoor", "outdoor"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setEnvironment(opt)}
                    className="flex-1 px-5 py-3 text-base font-semibold transition min-h-[48px]"
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
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-white/20"
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
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
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
            className="w-full md:w-auto rounded-2xl px-8 py-4 text-base font-bold tracking-tight transition disabled:opacity-60 disabled:cursor-not-allowed min-h-[56px]"
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

            {/* 2 — Identified network banner + stats grid */}
            {freeStep >= 2 && result.identified_ssid && (
              <div
                className="ocws-tile px-5 py-4 flex items-start gap-3"
                style={{ border: "1px solid rgba(0,212,255,0.25)", background: "rgba(0,212,255,0.05)" }}
              >
                <span className="shrink-0 mt-0.5 text-base" aria-hidden="true">📡</span>
                <p className="text-sm leading-relaxed">
                  <span className="text-white font-semibold">
                    I found your network —{" "}
                    <span style={{ color: "var(--ocws-cyan)" }}>{result.identified_ssid}</span>
                  </span>
                  {result.router_vendor && result.router_vendor !== "Unknown" && (
                    <span className="text-white/80">
                      {" "}— running on a{" "}
                      <span className="font-semibold text-white">{result.router_vendor}</span> router
                    </span>
                  )}
                  <span className="ocws-muted">
                    {". "}I found {result.problems_found} problem{result.problems_found !== 1 ? "s" : ""}.
                  </span>
                </p>
              </div>
            )}

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
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
                    <button
                      onClick={handleStripePayment}
                      className="w-full sm:w-auto rounded-2xl px-8 py-4 text-base font-bold tracking-tight transition min-h-[56px]"
                      style={{
                        background: "linear-gradient(135deg, #d6b25e, #b8943e)",
                        color: "#05070b",
                        boxShadow: "0 8px 28px rgba(214,178,94,0.28)",
                      }}
                    >
                      {mode === "single"
                        ? "Get the Full Verdict \u2014 $50"
                        : `Get the Full Reckoning \u2014 ${locations.length <= 5 ? "$150" : "$350"}`}
                    </button>
                    <button
                      onClick={handleDemoVerdict}
                      className="ocws-btn ocws-btn-ghost text-sm w-full sm:w-auto min-h-[48px]"
                    >
                      Demo: See Full Verdict
                    </button>
                  </div>

                  {/* Subscriber code */}
                  {!showSubCode && subCodeStatus !== "valid" && (
                    <button
                      type="button"
                      onClick={() => setShowSubCode(true)}
                      className="text-xs text-white/40 hover:text-white/70 transition underline underline-offset-2"
                    >
                      Have a subscription code?
                    </button>
                  )}
                  {showSubCode && subCodeStatus !== "valid" && (
                    <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                      <div className="flex w-full gap-2">
                        <input
                          value={subCode}
                          onChange={(e) => { setSubCode(e.target.value); setSubCodeStatus(null); }}
                          placeholder="Subscription code"
                          className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-base text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubCodeCheck(); } }}
                        />
                        <button
                          type="button"
                          onClick={handleSubCodeCheck}
                          className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                          style={{
                            background: "rgba(0,212,255,0.10)",
                            border: "1px solid rgba(0,212,255,0.25)",
                            color: "var(--ocws-cyan)",
                          }}
                        >
                          Apply
                        </button>
                      </div>
                      {subCodeStatus === "invalid" && (
                        <p className="text-xs text-red-400">Invalid code. Try again.</p>
                      )}
                    </div>
                  )}
                  {subCodeStatus === "valid" && (
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm font-semibold" style={{ color: "#4ade80" }}>
                        ✓ Subscriber access granted
                      </p>
                      <button
                        type="button"
                        onClick={unlockVerdict}
                        className="rounded-2xl px-8 py-3 text-sm font-bold transition"
                        style={{
                          background: "rgba(74,222,128,0.12)",
                          border: "1px solid rgba(74,222,128,0.35)",
                          color: "#4ade80",
                        }}
                      >
                        Unlock Full Verdict →
                      </button>
                    </div>
                  )}
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

                      {/* Fix + steps appear after description finishes */}
                      {i < verdictStep && (
                        <div className="space-y-3">
                          {/* Fix summary */}
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

                          {/* Router info bar */}
                          {finding.router_info?.gateway_ip && (
                            <div
                              className="rounded-xl px-4 py-3 flex flex-wrap gap-x-6 gap-y-1"
                              style={{
                                background: "rgba(0,212,255,0.06)",
                                border: "1px solid rgba(0,212,255,0.18)",
                              }}
                            >
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-0.5">Router</p>
                                <p className="text-xs text-white font-medium">{finding.router_info.vendor}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-0.5">Gateway</p>
                                <p className="text-xs font-mono" style={{ color: "var(--ocws-cyan)" }}>{finding.router_info.gateway_ip}</p>
                              </div>
                              {finding.router_info.default_username && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-0.5">Username</p>
                                  <p className="text-xs font-mono text-white/80">{finding.router_info.default_username}</p>
                                </div>
                              )}
                              {finding.router_info.default_password && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-0.5">Password</p>
                                  <p className="text-xs font-mono text-white/80">{finding.router_info.default_password}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Step-by-step instructions */}
                          {finding.steps && finding.steps.length > 0 && (
                            <div
                              className="rounded-xl px-4 py-4"
                              style={{
                                background: "rgba(0,0,0,0.25)",
                                border: "1px solid rgba(255,255,255,0.07)",
                              }}
                            >
                              <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
                                Step-by-Step
                              </p>
                              <ol className="space-y-2">
                                {finding.steps.map((step, si) => (
                                  <li key={si} className="flex gap-3 items-start">
                                    <span
                                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                                      style={{
                                        background: "rgba(0,212,255,0.12)",
                                        border: "1px solid rgba(0,212,255,0.25)",
                                        color: "var(--ocws-cyan)",
                                      }}
                                    >
                                      {si + 1}
                                    </span>
                                    <p className="text-white/80 text-sm leading-relaxed">{step}</p>
                                  </li>
                                ))}
                              </ol>

                              {/* Login disclaimer */}
                              {finding.login_disclaimer && (
                                <p className="mt-3 text-[11px] text-white/35 leading-relaxed border-t border-white/[0.06] pt-3">
                                  {finding.login_disclaimer}
                                </p>
                              )}
                            </div>
                          )}
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
                  <div className="pt-2">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={pdfGenerating}
                      className="w-full sm:w-auto rounded-2xl px-8 py-4 text-base font-bold tracking-tight transition min-h-[56px] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--ocws-cyan), var(--ocws-cyan2))",
                        color: "#05070b",
                        boxShadow: "0 8px 28px rgba(0,212,255,0.25)",
                      }}
                    >
                      {pdfGenerating ? "Generating PDF…" : "Download Corvus\u2019 Verdict PDF"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ADMIN ACCESS LINK ─────────────────────────────────────────────── */}
      <div className="mt-16 text-center">
        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          className="text-[11px] transition"
          style={{ color: adminMode ? "rgba(74,222,128,0.5)" : "rgba(255,255,255,0.12)" }}
          onMouseEnter={(e) => { if (!adminMode) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.30)"; }}
          onMouseLeave={(e) => { if (!adminMode) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.12)"; }}
        >
          {adminMode ? "✓ Admin" : "Admin Access"}
        </button>
      </div>

      {/* ── ADMIN MODAL ────────────────────────────────────────────────────── */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <button
            type="button"
            aria-label="Close"
            onClick={() => { setShowAdminModal(false); setAdminPassword(""); setAdminError(""); }}
            className="absolute inset-0 bg-black/70"
          />
          <div
            className="relative z-10 w-[min(92%,360px)] rounded-2xl p-6 space-y-4"
            style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest ocws-muted2">
              Admin Access
            </p>
            {adminMode ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold" style={{ color: "#4ade80" }}>
                  ✓ Admin mode active — Stripe bypassed
                </p>
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="w-full rounded-xl px-4 py-2 text-sm text-white/60 hover:text-white/90 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdminSubmit} className="space-y-3">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => { setAdminPassword(e.target.value); setAdminError(""); }}
                  placeholder="Password"
                  autoFocus
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                {adminError && (
                  <p className="text-xs text-red-400">{adminError}</p>
                )}
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowAdminModal(false); setAdminPassword(""); setAdminError(""); }}
                    className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white/80 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                    }}
                  >
                    Enter
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── CORVUS VIDEO PANEL — fixed bottom-right ───────────────────────── */}
      {corvusVisible && (
        <div
          className="fixed z-50 rounded-2xl overflow-hidden transition-all"
          style={{
            bottom: "1rem",
            right: "1rem",
            width: "clamp(160px, 40vw, 240px)",
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
