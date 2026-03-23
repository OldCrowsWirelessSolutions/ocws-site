"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadSlot = "signal" | "scan24" | "scan5";

interface LocationEntry {
  id: string;
  name: string;
  locType: string;
  structureRel: string;
  files: Record<UploadSlot, File | null>;
  previews: Record<UploadSlot, string | null>;
}

function makeEmptyLocation(): LocationEntry {
  return {
    id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    locType: "",
    structureRel: "",
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

interface CrossStructureAnalysis {
  threshold_analysis: string;
  bridge_feasibility: string;
  recommended_placement: string;
  powerline_moca: string;
  cost_estimate: string;
  corvus_assessment: string;
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
  cross_structure_analysis?: CrossStructureAnalysis;
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

const LOCATION_NAME_PLACEHOLDERS: Record<string, string> = {
  "Home":       "e.g. Main House Living Room, Master Bedroom, Man Cave, Workshop, Detached Garage, Back Patio, Pool Area, Driveway",
  "Office":     "e.g. Main Office, Warehouse Floor, Loading Dock, Parking Lot, Guard Shack, Detached Storage",
  "Church":     "e.g. Main Sanctuary, Fellowship Hall, Detached Youth Building, Covered Pavilion, Parking Lot North, Parking Lot South",
  "Restaurant": "e.g. Main Dining, Bar, Kitchen, Front Patio, Back Patio, Parking Lot, Drive-Through Lane",
  "RV Park":    "e.g. Site 1, Clubhouse, Pool Area, Office, Back Loop",
  "Marina":     "e.g. Dock A, Clubhouse, Fuel Dock, Dry Storage, Office",
  "School":     "e.g. Classroom 1, Library, Gymnasium, Cafeteria, Main Office",
  "Medical":    "e.g. Waiting Room, Exam Room 1, Nurses Station, Lab, Reception",
  "Other":      "e.g. Location 1, Location 2, Location 3",
};

const LOCATION_TYPE_OPTIONS = [
  "Indoor \u2014 Main Structure",
  "Indoor \u2014 Detached Structure",
  "Outdoor \u2014 Connected to Main",
  "Outdoor \u2014 Standalone Area",
  "Transition Zone (doorway/hallway between structures)",
];

const STRUCTURE_REL_OPTIONS = [
  "Primary Structure",
  "Detached Structure",
  "Outdoor Area",
  "Mixed/Transition",
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

// ─── Corvus Dialogue (cycles lines with typewriter for analyzing panel) ────────

function CorvusDialogue({ lines }: { lines: string[] }) {
  const [idx, setIdx] = useState(0);
  return (
    <Typewriter
      key={idx}
      text={lines[idx % lines.length]}
      speed={18}
      onDone={() => setTimeout(() => setIdx((i) => i + 1), 800)}
    />
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

  // Pricing info collapsible
  const [pricingOpen, setPricingOpen] = useState(false);

  // Full Reckoning info collapsible
  const [reckInfoOpen, setReckInfoOpen] = useState(false);

  // Hybrid property mode
  const [isHybrid, setIsHybrid] = useState(false);

  // Site overview (Full Reckoning)
  const [siteOverview, setSiteOverview] = useState("");

  // Placeholder: logged-in member who has used monthly credits (wire to auth later)
  const [loggedInMember] = useState(false);

  // PDF generation
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Logos pre-loaded at mount so PDF generation is instant
  const [pdfLogos, setPdfLogos] = useState<{
    ocws: string | null; ocwsAspect: number;
    crows: string | null; crowsAspect: number;
  }>({ ocws: null, ocwsAspect: 1, crows: null, crowsAspect: 1 });

  const resultsRef = useRef<HTMLDivElement>(null);

  // Dynamic dialogue lines referencing actual form data shown while Corvus analyzes
  const analysisDialogue = useMemo<string[]>(() => {
    const lines: string[] = ["Reading your RF environment\u2026"];
    if (ssid) lines.push(`Scanning for ${ssid} in the stack\u2026`);
    lines.push("Checking 2.4\u202FGHz channel saturation\u2026");
    if (ssid) lines.push(`Pulling BSSID data for ${ssid}\u2026`);
    lines.push("Analyzing 5\u202FGHz band coverage topology\u2026");
    if (mode === "site") {
      lines.push(`Cross-referencing ${locations.length} location${locations.length !== 1 ? "s" : ""}\u2026`);
      if (isHybrid) {
        lines.push("Analyzing cross-structure signal relationships\u2026");
        lines.push("Mapping dead zones at structural thresholds\u2026");
        lines.push("Evaluating bridge and access point placement options\u2026");
      }
    }
    if (ssid) lines.push(`Identifying router vendor from ${ssid}\u2026`);
    lines.push("Cataloging interference sources\u2026");
    lines.push("Mapping channel conflicts and overlap\u2026");
    lines.push("Calculating signal attenuation patterns\u2026");
    lines.push("Building step-by-step remediation plan\u2026");
    lines.push("Rendering the Verdict\u2026");
    return lines;
  }, [ssid, mode, locations.length, isHybrid]);

  // Derived counts and pricing for Full Reckoning
  const detachedCount = useMemo(
    () => locations.filter((l) => l.structureRel === "Detached Structure").length,
    [locations]
  );

  const reckoningPrice = useMemo(() => {
    const tierPrice = locations.length <= 5 ? 150 : locations.length <= 15 ? 350 : 750;
    if (isHybrid && detachedCount >= 1) {
      const hybridPrice = 350 + Math.max(0, detachedCount - 1) * 50;
      return Math.max(tierPrice, hybridPrice);
    }
    return tierPrice;
  }, [locations.length, isHybrid, detachedCount]);

  const reckoningLabel = useMemo(() => {
    if (isHybrid && detachedCount >= 1) {
      const extras = Math.max(0, detachedCount - 1);
      return extras > 0
        ? `Hybrid Property \u2014 $${reckoningPrice} ($350 + ${extras} extra detached \xd7 $50)`
        : "Hybrid Property \u2014 $350";
    }
    if (locations.length <= 5) return "Small Site \u2014 $150";
    if (locations.length <= 15) return "Standard Site \u2014 $350";
    return "Commercial Site \u2014 $750";
  }, [locations.length, isHybrid, detachedCount, reckoningPrice]);

  // Auto-skip missing teaser 2
  useEffect(() => {
    if (result && freeStep === 3 && !result.teaser_problems[1]) {
      const t = setTimeout(() => setFreeStep(4), 300);
      return () => clearTimeout(t);
    }
  }, [result, freeStep]);

  // Load PDF logos at mount so they are ready when the PDF generates
  useEffect(() => {
    (async () => {
      async function fetchLogo(path: string) {
        try {
          const r = await fetch(path);
          const blob = await r.blob();
          const data = await new Promise<string>((res) => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result as string);
            fr.readAsDataURL(blob);
          });
          const aspect = await new Promise<number>((res) => {
            const img = new Image();
            img.onload = () => res(img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : 1);
            img.onerror = () => res(1);
            img.src = data;
          });
          return { data, aspect };
        } catch { return { data: null as string | null, aspect: 1 }; }
      }
      const [ocws, crows] = await Promise.all([
        fetchLogo("/OCWS_Logo_Transparent.png"),
        fetchLogo("/Crows_Eye_Logo.png"),
      ]);
      setPdfLogos({ ocws: ocws.data, ocwsAspect: ocws.aspect, crows: crows.data, crowsAspect: crows.aspect });
    })();
  }, []);

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
            return {
              name: loc.name.trim() || `Location ${idx + 1}`,
              locType: loc.locType,
              structureRel: loc.structureRel,
              images,
              mimeTypes,
            };
          })
        );
        bodyPayload = {
          mode: "site",
          locations: encodedLocations,
          isHybrid,
          siteOverview: siteOverview.trim(),
          detachedCount,
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

  function handleStripePayment(product = "verdict") {
    if (honeypot) return; // bot trap
    console.log("Stripe payment triggered:", product);
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
    if (locations.length >= 30) return;
    setLocations((prev) => [...prev, makeEmptyLocation()]);
  }

  function removeLocation(id: string) {
    setLocations((prev) => prev.length > 1 ? prev.filter((l) => l.id !== id) : prev);
  }

  function updateLocationName(id: string, val: string) {
    setLocations((prev) => prev.map((l) => l.id === id ? { ...l, name: val } : l));
  }

  function updateLocationLocType(id: string, val: string) {
    setLocations((prev) => prev.map((l) => l.id === id ? { ...l, locType: val } : l));
  }

  function updateLocationStructureRel(id: string, val: string) {
    setLocations((prev) => prev.map((l) => l.id === id ? { ...l, structureRel: val } : l));
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
      doc.setLineHeightFactor(1.4);

      // ── Page geometry ────────────────────────────────────────────────────
      const PW = 612, PH = 792, ML = 36, MR = 36, CW = PW - ML - MR;
      const FOOTER_H = 36, SAFE_BTM = PH - FOOTER_H - 8;

      // ── Brand colors ─────────────────────────────────────────────────────
      const NAVY:  [number,number,number] = [26,  35,  50];
      const NAVYL: [number,number,number] = [26,  38,  69];
      const NAVYD: [number,number,number] = [13,  21,  32];
      const TEAL:  [number,number,number] = [13,  110, 122];
      const CYAN:  [number,number,number] = [0,   194, 199];
      const GOLD:  [number,number,number] = [184, 146, 42];
      const WHITE: [number,number,number] = [255, 255, 255];
      const LGRAY: [number,number,number] = [244, 246, 248];
      const MGRAY: [number,number,number] = [170, 170, 170];
      const DGRAY: [number,number,number] = [100, 120, 145];
      const RED:   [number,number,number] = [224, 85,  85];
      const GREEN: [number,number,number] = [34,  197, 94];
      const SEV: Record<string, [number,number,number]> = {
        CRITICAL: RED, WARNING: GOLD, GOOD: GREEN,
      };

      // ── Metadata ─────────────────────────────────────────────────────────
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const reportId = `CE-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;

      // ── Y cursor & page counter ───────────────────────────────────────────
      let y = 0, pg = 1;

      // ── Helpers ──────────────────────────────────────────────────────────
      // Set fill / text / draw color from a tuple
      const sf = (c: [number,number,number]) => doc.setFillColor(c[0], c[1], c[2]);
      const st = (c: [number,number,number]) => doc.setTextColor(c[0], c[1], c[2]);
      const sd = (c: [number,number,number]) => doc.setDrawColor(c[0], c[1], c[2]);
      const fn = (style: "normal"|"bold"|"italic"|"bolditalic", sz: number) => {
        doc.setFont("helvetica", style); doc.setFontSize(sz);
      };
      // Height of n lines at size sz with lineHeightFactor 1.4
      const th = (n: number, sz: number) => n * sz * 1.4;
      // Wrap text to maxW — always use before rendering
      const wrap = (t: string, maxW: number) => doc.splitTextToSize(t, maxW);
      // Render wrapped text left-aligned at topY (baseline = topY + sz*0.8), return height consumed
      function txt(lines: string | string[], x: number, topY: number, sz: number): number {
        const arr = typeof lines === "string" ? [lines] : lines;
        doc.text(arr, x, topY + sz * 0.8);
        return th(arr.length, sz);
      }

      function drawBg() { sf(NAVY); doc.rect(0, 0, PW, PH, "F"); }

      function drawFooter() {
        sf(NAVY); doc.rect(0, PH - FOOTER_H, PW, FOOTER_H, "F");
        const copyrightText = "\u00A9 2026 Old Crows Wireless Solutions LLC. Corvus, Crow\u2019s Eye, The Full Reckoning, and Corvus\u2019 Verdict are unregistered trademarks of Old Crows Wireless Solutions LLC. All rights reserved.";
        st(DGRAY); fn("normal", 6.5);
        const copyrightLines = doc.splitTextToSize(copyrightText, PW - ML - MR - 30);
        const lineH = 6.5 * 1.4;
        const blockH = copyrightLines.length * lineH;
        const startY = PH - FOOTER_H + (FOOTER_H - blockH) / 2 + 6.5 * 0.8;
        doc.text(copyrightLines, PW / 2, startY, { align: "center" });
        st(DGRAY); fn("normal", 7);
        doc.text(String(pg), PW - MR, PH - FOOTER_H + 18, { align: "right" });
      }

      function newPage() {
        drawFooter(); doc.addPage(); pg++; drawBg();
        // Slim continuation header
        sf(NAVYD); doc.rect(0, 0, PW, 26, "F");
        sf(TEAL);  doc.rect(0, 23, PW, 3, "F");
        st(CYAN); fn("bold", 7.5); doc.text("CORVUS\u2019 VERDICT", ML, 17);
        st(DGRAY); fn("normal", 7); doc.text(reportId, PW - MR, 17, { align: "right" });
        y = 36;
      }

      function ensure(needed: number) { if (y + needed > SAFE_BTM) newPage(); }

      function sectionBar(title: string) {
        ensure(26);
        sf(TEAL); doc.rect(0, y, PW, 22, "F");
        st(WHITE); fn("bold", 9); doc.text(title, ML, y + 15);
        y += 22;
      }

      // ── Page 1 background ────────────────────────────────────────────────
      drawBg();

      // ── HEADER BAR ───────────────────────────────────────────────────────
      const HDR = 72;
      sf(NAVYD); doc.rect(0, 0, PW, HDR, "F");
      sf(GOLD);  doc.rect(0, HDR - 2, PW, 2, "F");

      // OCWS logo left
      const LOGO_H = 44;
      let ocwsW = 0;
      if (pdfLogos.ocws) {
        ocwsW = Math.round(LOGO_H * pdfLogos.ocwsAspect);
        doc.addImage(pdfLogos.ocws, "PNG", ML, (HDR - LOGO_H) / 2, ocwsW, LOGO_H);
      }
      // "CORVUS' VERDICT" centered in cyan
      st(CYAN); fn("bold", 20);
      doc.text("CORVUS\u2019 VERDICT", PW / 2, HDR / 2 + 7, { align: "center" });
      // Report info right in gold/gray
      st(GOLD); fn("bold", 7.5);
      doc.text("CROW\u2019S EYE BY CORVUS", PW - MR, HDR / 2 - 6, { align: "right" });
      st(DGRAY); fn("normal", 7.5);
      doc.text(reportId, PW - MR, HDR / 2 + 5,  { align: "right" });
      doc.text(dateStr,  PW - MR, HDR / 2 + 16, { align: "right" });
      y = HDR + 2;

      // ── CLIENT INFO BLOCK (two-column, fully wrapped) ─────────────────────
      const CPAD = 16, HALF = CW / 2 - 8;
      const nameW   = wrap(name || "\u2014", HALF);
      const addrStr = [street, suite, city, state, zip].filter(Boolean).join(", ") || "Address not provided";
      const addrW   = wrap(addrStr, HALF);
      const ssidW   = ssid ? wrap(`SSID: ${ssid}`, HALF) : [];
      const envVal  = [environment.charAt(0).toUpperCase() + environment.slice(1), locationType]
        .filter(Boolean).join("  \u00B7  ");
      const rightRows: Array<[string, string]> = [
        ["REPORT",      reportId],
        ["DATE",        dateStr],
        ["ENVIRONMENT", envVal],
        ...(mode === "site" ? [["LOCATIONS", String(locations.length)] as [string,string]] : []),
      ];
      let leftColH = th(nameW.length, 13) + 4 + th(addrW.length, 9);
      if (ssidW.length) leftColH += 4 + th(ssidW.length, 9);
      const rightColH = rightRows.reduce((a, [,v]) => {
        return a + th(1, 6.5) + 2 + th(wrap(v, HALF).length, 8.5) + 6;
      }, 0);
      const clientH = Math.max(leftColH, rightColH) + CPAD * 2;
      ensure(clientH + 4);
      sf(NAVY); doc.rect(0, y, PW, clientH, "F");

      // Left column
      let ly = y + CPAD;
      st(WHITE); fn("bold",   13); ly += txt(nameW, ML, ly, 13) + 4;
      st(MGRAY); fn("normal",  9); ly += txt(addrW, ML, ly, 9);
      if (ssidW.length) {
        ly += 4; st(CYAN); fn("normal", 9); txt(ssidW, ML, ly, 9);
      }

      // Right column
      let ry = y + CPAD;
      const rx = ML + CW / 2 + 8;
      for (const [label, val] of rightRows) {
        const valW = wrap(val, HALF);
        st(GOLD); fn("bold", 6.5); ry += txt(label, rx, ry, 6.5) + 2;
        st(DGRAY); fn("normal", 8.5); ry += txt(valW, rx, ry, 8.5) + 6;
      }
      y += clientH + 8;

      // ── CORVUS ANALYSIS (cyan-bordered dark box, fully wrapped) ───────────
      sectionBar("CORVUS ANALYSIS");
      y += 6;
      const INNER_W = CW - 3 - 16;
      const openW = wrap(`\u201C${result.corvus_opening}\u201D`, INNER_W);
      const aH = th(openW.length, 9) + 24;
      ensure(aH + 4);
      sf(NAVYL); doc.rect(ML, y, CW, aH, "F");
      sf(CYAN);  doc.rect(ML, y, 3, aH, "F");
      st(LGRAY); fn("italic", 9); txt(openW, ML + 3 + 12, y + 12, 9);
      y += aH + 8;

      // Stats row
      ensure(52);
      const SW = (CW - 9) / 4;
      [
        { label: "ISSUES",   val: result.problems_found, clr: LGRAY },
        { label: "CRITICAL", val: result.critical_count, clr: RED   },
        { label: "WARNINGS", val: result.warning_count,  clr: GOLD  },
        { label: "GOOD",     val: result.good_count,     clr: GREEN },
      ].forEach((s, i) => {
        const sx = ML + i * (SW + 3);
        sf(NAVYL); doc.roundedRect(sx, y, SW, 46, 3, 3, "F");
        st(s.clr); fn("bold", 20);  doc.text(String(s.val), sx + SW / 2, y + 30, { align: "center" });
        st(DGRAY); fn("normal", 6.5); doc.text(s.label, sx + SW / 2, y + 40, { align: "center" });
      });
      y += 54;

      // ── FINDINGS ─────────────────────────────────────────────────────────
      sectionBar("FINDINGS");
      y += 6;

      for (const f of result.full_findings) {
        const sc = SEV[f.severity] ?? GOLD;
        const CP = 12, CARD_IW = CW - 3 - CP * 2;

        // Pre-wrap all text blocks
        const titleW = wrap(f.title, CARD_IW - 58);
        const descW  = wrap(f.description, CARD_IW);
        const fixW   = wrap(`Fix: ${f.fix}`, CARD_IW);
        const stepsW: string[][] = f.steps?.length
          ? f.steps.map((s, si) => wrap(`${si + 1}.  ${s}`, CARD_IW - 10))
          : [];

        let routerW: string[] = [], disclaimerW: string[] = [], rBoxH = 0;
        if (f.router_info?.gateway_ip) {
          const ri = f.router_info;
          const rtxt = [
            ri.vendor,
            `Gateway: ${ri.gateway_ip}`,
            ri.default_username ? `User: ${ri.default_username}` : "",
            ri.default_password ? `Pass: ${ri.default_password}` : "",
          ].filter(Boolean).join("   \u00B7   ");
          routerW = wrap(rtxt, CARD_IW - 16);
          if (f.login_disclaimer) disclaimerW = wrap(f.login_disclaimer, CARD_IW - 16);
          rBoxH = th(routerW.length, 8.5)
            + (disclaimerW.length ? 4 + th(disclaimerW.length, 7.5) : 0)
            + 16;
        }

        // Calculate total card height so ensure() can check fit
        const S = stepsW.length  ? stepsW.reduce((a, sl) => a + th(sl.length, 8) + 3, 0) + 5 : 0;
        const R = routerW.length ? rBoxH + 8 : 0;
        const cardH = CP * 2
          + th(titleW.length, 10) + 6
          + th(descW.length, 9)   + 6
          + th(fixW.length, 9)    + 8
          + S + R;

        ensure(cardH + 8);

        // Card background + severity left border
        sf(NAVYL); doc.rect(ML, y, CW, cardH, "F");
        sf(sc);    doc.rect(ML, y, 3, cardH, "F");

        // Severity badge top-right
        const bb: [number,number,number] = [
          Math.round(sc[0] * 0.12 + NAVYL[0] * 0.88),
          Math.round(sc[1] * 0.12 + NAVYL[1] * 0.88),
          Math.round(sc[2] * 0.12 + NAVYL[2] * 0.88),
        ];
        sf(bb); doc.roundedRect(ML + CW - 58, y + CP - 4, 52, 14, 2, 2, "F");
        st(sc); fn("bold", 7);
        doc.text(f.severity, ML + CW - 32, y + CP + 5.5, { align: "center" });

        // Content — tracked with cy so each block flows below the previous
        let cy = y + CP;
        const cx = ML + 3 + CP;
        st(WHITE); fn("bold",   10); cy += txt(titleW, cx, cy, 10) + 6;
        st(MGRAY); fn("normal",  9); cy += txt(descW,  cx, cy,  9) + 6;
        st(CYAN);  fn("normal",  9); cy += txt(fixW,   cx, cy,  9) + 8;

        // Numbered steps
        if (stepsW.length) {
          for (const sl of stepsW) {
            st(MGRAY); fn("normal", 8); cy += txt(sl, cx + 10, cy, 8) + 3;
          }
          cy += 5;
        }

        // Router info box (dark inset, amber text, wrapped disclaimer)
        if (routerW.length) {
          sf(NAVYD); doc.rect(cx, cy, CARD_IW, rBoxH, "F");
          st(GOLD); fn("normal", 8.5); txt(routerW, cx + 8, cy + 8, 8.5);
          if (disclaimerW.length) {
            const dty = cy + 8 + th(routerW.length, 8.5) + 4;
            st(MGRAY); fn("normal", 7.5); txt(disclaimerW, cx + 8, dty, 7.5);
          }
        }

        y += cardH + 8;
      }

      // ── RECOMMENDATIONS ───────────────────────────────────────────────────
      sectionBar("RECOMMENDATIONS");
      y += 8;
      result.recommendations.forEach((rec, i) => {
        const rW = wrap(rec, CW - 28);
        const rH = th(rW.length, 9) + 8;
        ensure(rH + 4);
        sf(TEAL); doc.circle(ML + 9, y + rH / 2, 7, "F");
        st(WHITE); fn("bold", 7); doc.text(String(i + 1), ML + 9, y + rH / 2 + 2.5, { align: "center" });
        st(LGRAY); fn("normal", 9); txt(rW, ML + 22, y + 4, 9);
        y += rH + 6;
      });

      // Corvus final word
      y += 10;
      const fwW = wrap(`\u201C${result.corvus_summary}\u201D`, CW - 24);
      const fwH = th(fwW.length, 9) + 28;
      ensure(fwH + 8);
      sf(NAVYL); doc.rect(ML, y, CW, fwH, "F");
      sf(GOLD);  doc.rect(ML, y, 3, fwH, "F");
      st(GOLD);  fn("bold", 7);   txt("CORVUS\u2019 FINAL WORD", ML + 10, y + 8, 7);
      st(LGRAY); fn("italic", 9); txt(fwW, ML + 10, y + 18, 9);
      y += fwH + 14;

      // ── CROSS-STRUCTURE ANALYSIS (hybrid Reckonings only) ────────────────
      const csa = result.cross_structure_analysis;
      if (csa) {
        sectionBar("CROSS-STRUCTURE ANALYSIS");
        y += 8;

        const csaFields: { label: string; value: string }[] = [
          { label: "SIGNAL AT THRESHOLDS", value: csa.threshold_analysis },
          { label: "BRIDGE FEASIBILITY", value: csa.bridge_feasibility },
          { label: "RECOMMENDED PLACEMENT", value: csa.recommended_placement },
          { label: "POWERLINE / MoCA OPTIONS", value: csa.powerline_moca },
          { label: "ESTIMATED COST RANGE", value: csa.cost_estimate },
        ];

        for (const { label, value } of csaFields) {
          const valW = wrap(value, CW - 16);
          const blockH = th(1, 7) + 4 + th(valW.length, 9) + 12;
          ensure(blockH + 4);
          sf(NAVYL); doc.rect(ML, y, CW, blockH, "F");
          sf(TEAL);  doc.rect(ML, y, 3, blockH, "F");
          st(GOLD);  fn("bold", 7);   txt(label, ML + 10, y + 6, 7);
          st(LGRAY); fn("normal", 9); txt(valW, ML + 10, y + 6 + th(1, 7) + 4, 9);
          y += blockH + 6;
        }

        // Corvus assessment of cross-structure situation
        y += 4;
        const csaAssessW = wrap(`\u201C${csa.corvus_assessment}\u201D`, CW - 24);
        const csaAssessH = th(csaAssessW.length, 9) + 28;
        ensure(csaAssessH + 8);
        sf(NAVYL); doc.rect(ML, y, CW, csaAssessH, "F");
        sf(CYAN);  doc.rect(ML, y, 3, csaAssessH, "F");
        st(CYAN);  fn("bold", 7);   txt("CORVUS ON YOUR STRUCTURES", ML + 10, y + 8, 7);
        st(LGRAY); fn("italic", 9); txt(csaAssessW, ML + 10, y + 18, 9);
        y += csaAssessH + 14;
      }

      // ── GOLD DIVIDER ──────────────────────────────────────────────────────
      ensure(4); sf(GOLD); doc.rect(0, y, PW, 2, "F"); y += 10;

      // ── CERTIFICATION ─────────────────────────────────────────────────────
      const CERT_H = 74;
      ensure(CERT_H + 10);
      sf(NAVY); doc.rect(ML, y, CW, CERT_H, "F");
      sd(TEAL); doc.setLineWidth(0.8); doc.roundedRect(ML, y, CW, CERT_H, 4, 4);
      sf(TEAL); doc.rect(ML, y, 3, CERT_H, "F");
      let sealW = 0;
      if (pdfLogos.ocws) {
        const SEAL_H = 42;
        sealW = Math.round(SEAL_H * pdfLogos.ocwsAspect);
        doc.addImage(pdfLogos.ocws, "PNG", ML + 10, y + (CERT_H - SEAL_H) / 2, sealW, SEAL_H);
      }
      const certX = ML + 10 + sealW + 12;
      st(CYAN);  fn("bold",   7);  txt("CERTIFICATION", certX, y + 10, 7);
      st(WHITE); fn("bold",  11);  txt("Joshua Turner", certX, y + 22, 11);
      st(MGRAY); fn("normal", 9);  txt("Managing Member  \u00B7  Old Crows Wireless Solutions LLC", certX, y + 37, 9);
      st(CYAN);  fn("normal", 9);  txt("17 Years U.S. Navy Electronic Warfare Experience", certX, y + 50, 9);
      st(GOLD);  fn("normal", 8);  txt(`Rendered by Crow\u2019s Eye  \u00B7  ${dateStr}`, certX, y + 63, 8);
      y += CERT_H + 10;

      // ── FOOTER (final page) ───────────────────────────────────────────────
      drawFooter();

      // ── SAVE ──────────────────────────────────────────────────────────────
      const safeName = (name || "Client").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, " ");
      const fileDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
      doc.save(`Corvus\u2019 Verdict - ${safeName} - ${fileDate}.pdf`);
    } finally {
      setPdfGenerating(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="ocws-container py-12 md:py-16 pb-40">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="text-center mb-14">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src="/Crows_Eye_Logo.png"
            alt="Crow's Eye"
            style={{ height: "48px", width: "auto" }}
          />
          <p className="text-xs font-semibold uppercase tracking-widest ocws-accent-cyan">
            Crow&rsquo;s Eye by Corvus
          </p>
        </div>
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

      {/* ── PRICING INFO COLLAPSIBLE ─────────────────────────────────────── */}
      <div className="mb-10">
        <button
          type="button"
          onClick={() => setPricingOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-left transition"
          style={{ border: "1px solid rgba(0,212,255,0.30)", background: "rgba(0,212,255,0.05)" }}
        >
          <span className="text-sm font-semibold ocws-accent-cyan">How Crow&rsquo;s Eye pricing works</span>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className="transition-transform duration-200 shrink-0"
            style={{ transform: pricingOpen ? "rotate(180deg)" : "rotate(0deg)", color: "var(--ocws-cyan)" }}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {pricingOpen && (
          <div
            className="rounded-b-2xl px-5 py-5 text-sm leading-relaxed space-y-4"
            style={{ border: "1px solid rgba(0,212,255,0.30)", borderTop: "none", background: "rgba(0,0,0,0.25)" }}
          >
            <div>
              <p className="text-white font-semibold mb-1">Single Verdict &mdash; $50</p>
              <p className="ocws-muted">Get one full Corvus analysis immediately. No account required. Best for one-time fixes.</p>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Nest Membership &mdash; $19/mo</p>
              <p className="ocws-muted">Get 3 Verdicts per month included. New accounts unlock first Verdict after 24 hours &mdash; Corvus needs time to properly calibrate. Monthly plan requires 3-month minimum commitment. Cancel anytime after 90 days. Annual plan ($149/yr) has no minimum &mdash; save $79 and cancel anytime.</p>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Need more than 3 per month?</p>
              <p className="ocws-muted mb-1">Buy extra Verdict credits anytime:</p>
              <ul className="ocws-muted space-y-0.5">
                <li>&middot; Single credit: $15</li>
                <li>&middot; 6-pack: $75 <span className="text-white/40">(save $15)</span></li>
                <li>&middot; 12-pack: $120 <span className="text-white/40">(save $60)</span></li>
              </ul>
            </div>
            <p className="ocws-muted">Flock members ($99/mo) get 15 Verdicts per month and extra credits at $10 each. Murder members ($249/mo) get unlimited Verdicts with no credit limits.</p>
            <div style={{ height: "1px", background: "rgba(0,212,255,0.15)" }} />
            <div>
              <p className="text-white font-semibold mb-1">The Full Reckoning — Multi-Location Survey</p>
              <p className="ocws-muted mb-2">Map your entire facility room by room. One unified report across all locations.</p>
              <ul className="ocws-muted space-y-0.5">
                <li>&middot; Small Reckoning (up to 5 locations): $150</li>
                <li>&middot; Standard Reckoning (6&ndash;15 locations): $350</li>
                <li>&middot; Commercial Reckoning (16+ locations): $750</li>
                <li>&middot; Pro Certified Reckoning (any size, Joshua certifies): $1,500</li>
              </ul>
              <p className="ocws-muted mt-2">Nest members get 1 Small Reckoning per month included. Flock members get 3 Small + 1 Standard. Murder members get unlimited Small and Standard Reckonings.</p>
            </div>
          </div>
        )}
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
            <div className="mt-2 space-y-1">
              <p className="text-xs ocws-muted2">
                Upload scans for each location on the property. Corvus synthesizes a site-wide assessment.{" "}
                <span className="text-white/60 font-semibold">{reckoningLabel}</span>
              </p>
              {isHybrid && (
                <p className="text-xs" style={{ color: "rgba(239,68,68,0.7)" }}>
                  Properties with detached structures require a minimum Standard Reckoning ($350) due to the additional complexity of cross-structure signal analysis.
                </p>
              )}
              <p className="text-xs text-white/30">Nest members: first Small Reckoning per month included. Additional from $50.</p>
            </div>
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

          {/* Site Overview textarea */}
          <div>
            <label className="block text-sm font-semibold text-white mb-1">
              Site Overview <span className="text-white/40 font-normal">(optional but recommended)</span>
            </label>
            <textarea
              value={siteOverview}
              onChange={(e) => setSiteOverview(e.target.value)}
              rows={3}
              placeholder="e.g. Main house 2400 sq ft, detached 2-car garage with man cave above it 800 sq ft, covered back patio, pool area. Signal drops completely in the garage."
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <p className="mt-1 text-xs ocws-muted2">Describe your property layout. Corvus uses this to understand relationships between structures.</p>
          </div>

          {/* Hybrid Property toggle */}
          <div
            className="rounded-2xl px-5 py-4"
            style={{ border: `1px solid ${isHybrid ? "rgba(0,212,255,0.45)" : "rgba(255,255,255,0.10)"}`, background: isHybrid ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.02)" }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Hybrid Property</p>
                <p className="text-xs ocws-muted2 mt-0.5">Enable if your property has detached structures — garages, workshops, man caves, outbuildings.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHybrid((v) => !v)}
                className="shrink-0 w-12 h-6 rounded-full transition-colors relative"
                style={{ background: isHybrid ? "var(--ocws-cyan)" : "rgba(255,255,255,0.15)" }}
                aria-pressed={isHybrid}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: isHybrid ? "translateX(26px)" : "translateX(2px)" }}
                />
              </button>
            </div>
            {isHybrid && (
              <div className="mt-3 text-xs ocws-accent-cyan leading-relaxed">
                Hybrid property survey selected — Corvus will analyze signal relationships between all structures including dead zones, cross-structure bleed, and bridge placement recommendations.
                {detachedCount > 0 && (
                  <span className="block mt-1 text-white/50">
                    {detachedCount} detached structure{detachedCount !== 1 ? "s" : ""} detected from location entries. Pricing: ${reckoningPrice}.
                    {detachedCount > 1 && ` ($350 base + ${detachedCount - 1} extra × $50)`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* How The Full Reckoning works — collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setReckInfoOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-left transition"
              style={{ border: "1px solid rgba(0,212,255,0.30)", background: "rgba(0,212,255,0.05)" }}
            >
              <span className="text-sm font-semibold ocws-accent-cyan">How The Full Reckoning works</span>
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                className="transition-transform duration-200 shrink-0"
                style={{ transform: reckInfoOpen ? "rotate(180deg)" : "rotate(0deg)", color: "var(--ocws-cyan)" }}
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {reckInfoOpen && (
              <div
                className="rounded-b-2xl px-5 py-5 text-sm leading-relaxed space-y-3"
                style={{ border: "1px solid rgba(0,212,255,0.30)", borderTop: "none", background: "rgba(0,0,0,0.25)" }}
              >
                <p className="ocws-muted">
                  The Full Reckoning is Corvus moving through your entire facility — room by room, location by location, building a complete picture of everything wrong across the whole site.
                </p>
                <p className="ocws-muted">For each location you will need the same three screenshots:</p>
                <ul className="ocws-muted space-y-1">
                  <li>&middot; <span className="text-white/70">Signal List</span> — Access Points screen showing all networks</li>
                  <li>&middot; <span className="text-white/70">2.4 GHz Scan</span> — Channel Graph filtered to 2.4 GHz</li>
                  <li>&middot; <span className="text-white/70">5 GHz Scan</span> — Channel Graph filtered to 5 GHz</li>
                </ul>
                <p className="ocws-muted">
                  Walk to each location — a different room, floor, or area — and take all three screenshots before moving to the next location. Label each location clearly so Corvus knows where each scan was taken.
                </p>
                <p className="ocws-muted">
                  Corvus will synthesize findings across all locations, identify site-wide patterns, find dead zones, and deliver one unified Verdict covering your entire facility.
                </p>
              </div>
            )}
          </div>

          {/* Step-by-step location instructions */}
          <div
            className="rounded-2xl px-5 py-4 text-sm space-y-2"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
          >
            <p className="text-white font-semibold mb-3">How to add locations</p>
            {[
              "Name your first location clearly. Example: Front Office, Lobby, Kitchen, Room 101.",
              "Stand in that location and open WiFi Analyzer.",
              "Take your Signal List screenshot (Access Points tab).",
              "Take your 2.4 GHz Channel Graph screenshot.",
              "Take your 5 GHz Channel Graph screenshot.",
              "Upload all three to this location slot.",
              "Click Add Location and repeat for each area.",
              "When all locations are added hit Render The Full Reckoning.",
            ].map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                  style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)", color: "var(--ocws-cyan)" }}
                >
                  {i + 1}
                </span>
                <p className="ocws-muted leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="ocws-h2 text-white mb-1">Upload location scans</h2>
              <p className="ocws-muted text-sm">One set of screenshots per location. Up to 30.</p>
            </div>
            {locations.length < 30 && (
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
              <div className="space-y-3">
                {/* Row 1: number badge + name + remove */}
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
                    placeholder={LOCATION_NAME_PLACEHOLDERS[locationType] ?? `e.g. Location ${idx + 1}, Room, Floor, Area`}
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

                {/* Row 2: location type + structure relationship */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10">
                  <select
                    value={loc.locType}
                    onChange={(e) => updateLocationLocType(loc.id, e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={{ color: loc.locType ? "white" : "rgba(255,255,255,0.35)" }}
                  >
                    <option value="" disabled style={{ color: "rgba(255,255,255,0.35)", background: "#0d1117" }}>Location type…</option>
                    {LOCATION_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t} style={{ color: "white", background: "#0d1117" }}>{t}</option>
                    ))}
                  </select>
                  <select
                    value={loc.structureRel}
                    onChange={(e) => updateLocationStructureRel(loc.id, e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={{ color: loc.structureRel ? "white" : "rgba(255,255,255,0.35)" }}
                  >
                    <option value="" disabled style={{ color: "rgba(255,255,255,0.35)", background: "#0d1117" }}>Structure relationship…</option>
                    {STRUCTURE_REL_OPTIONS.map((r) => (
                      <option key={r} value={r} style={{ color: "white", background: "#0d1117" }}>{r}</option>
                    ))}
                  </select>
                </div>
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
            {phase === "analyzing"
              ? "Corvus is looking\u2026"
              : mode === "site"
              ? "Render The Full Reckoning"
              : "Let Corvus Look"}
          </button>
          <p className="mt-3 text-xs ocws-muted2">
            Free instant analysis. No account. Upgrade to the full Verdict for $50.
          </p>
        </div>
      </form>

      {/* ── RESULTS PANEL ─────────────────────────────────────────────────── */}
      <div ref={resultsRef} className="mt-16 max-w-3xl">

        {/* Star Fox Corvus rendering panel */}
        {phase === "analyzing" && (
          <div
            className="ocws-tile overflow-hidden"
            style={{ border: "1px solid rgba(0,212,255,0.25)" }}
          >
            {/* flex-col on mobile (video top, dialogue bottom), flex-row on md+ (video left, dialogue right) */}
            <div className="flex flex-col md:flex-row" style={{ minHeight: "220px" }}>
              {/* Left: Corvus video — explicit height so objectFit cover can crop correctly */}
              <div
                className="shrink-0 md:w-60"
                style={{ height: "220px" }}
              >
                <video
                  src="/corvus.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
                />
              </div>
              {/* Right: Live typewriter dialogue based on scan data
                  border-t on mobile (separator under video), md:border-l (vertical separator desktop) */}
              <div
                className="flex-1 flex flex-col justify-center p-5 border-t md:border-t-0 md:border-l"
                style={{
                  borderColor: "rgba(0,212,255,0.18)",
                  background: "rgba(0,0,0,0.25)",
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest ocws-accent-cyan mb-3">
                  Corvus is reading\u2026
                </p>
                <p className="text-white text-sm leading-relaxed font-medium">
                  <CorvusDialogue lines={analysisDialogue} />
                </p>
              </div>
            </div>
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
                      onClick={() => handleStripePayment("verdict")}
                      className="w-full sm:w-auto rounded-2xl px-8 py-4 text-base font-bold tracking-tight transition min-h-[56px]"
                      style={{
                        background: "linear-gradient(135deg, #d6b25e, #b8943e)",
                        color: "#05070b",
                        boxShadow: "0 8px 28px rgba(214,178,94,0.28)",
                      }}
                    >
                      {mode === "single"
                        ? "Get the Full Verdict \u2014 $50"
                        : `Get the Full Reckoning \u2014 $${reckoningPrice}`}
                    </button>
                    <button
                      onClick={handleDemoVerdict}
                      className="ocws-btn ocws-btn-ghost text-sm w-full sm:w-auto min-h-[48px]"
                    >
                      Demo: See Full Verdict
                    </button>
                  </div>

                  {/* Nest membership note + extra credit purchase (for non-members) */}
                  {!loggedInMember && mode === "single" && (
                    <p className="text-xs text-white/40 max-w-xs text-center">
                      Or{" "}
                      <a href="/waitlist" className="underline underline-offset-2 text-white/55 hover:text-white/80 transition">
                        join Nest for $19/mo
                      </a>{" "}
                      and get 3 Verdicts per month included. New accounts unlock first Verdict after 24 hours.
                    </p>
                  )}

                  {/* Extra credit purchase — shown when logged-in member has used monthly credits */}
                  {loggedInMember && (
                    <div className="w-full max-w-sm space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/50 text-center">Extra Verdict Credits</p>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleStripePayment("credit_single")}
                          className="w-full rounded-xl px-5 py-3 text-sm font-semibold transition text-left flex justify-between items-center"
                          style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)", color: "var(--ocws-cyan)" }}
                        >
                          <span>Single credit</span>
                          <span className="font-bold">$15</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStripePayment("credit_6pack")}
                          className="w-full rounded-xl px-5 py-3 text-sm font-semibold transition text-left flex justify-between items-center"
                          style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)", color: "var(--ocws-cyan)" }}
                        >
                          <span>6-pack <span className="text-white/40 font-normal">(save $15)</span></span>
                          <span className="font-bold">$75</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStripePayment("credit_12pack")}
                          className="w-full rounded-xl px-5 py-3 text-sm font-semibold transition text-left flex justify-between items-center"
                          style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)", color: "var(--ocws-cyan)" }}
                        >
                          <span>12-pack <span className="text-white/40 font-normal">(save $60)</span></span>
                          <span className="font-bold">$120</span>
                        </button>
                      </div>
                    </div>
                  )}

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

                {/* Cross-Structure Analysis (hybrid only) */}
                {verdictStep >= result.full_findings.length && result.cross_structure_analysis && (
                  <div className="ocws-tile p-6 space-y-5" style={{ borderLeft: "3px solid var(--ocws-cyan)" }}>
                    <p className="text-xs font-semibold uppercase tracking-widest ocws-accent-cyan">
                      Cross-Structure Analysis
                    </p>
                    {[
                      { label: "Signal at Thresholds", value: result.cross_structure_analysis.threshold_analysis },
                      { label: "Bridge Feasibility", value: result.cross_structure_analysis.bridge_feasibility },
                      { label: "Recommended Placement", value: result.cross_structure_analysis.recommended_placement },
                      { label: "Powerline / MoCA Options", value: result.cross_structure_analysis.powerline_moca },
                      { label: "Estimated Cost Range", value: result.cross_structure_analysis.cost_estimate },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-1">{label}</p>
                        <p className="ocws-muted text-sm leading-relaxed">{value}</p>
                      </div>
                    ))}
                    <div
                      className="rounded-xl px-4 py-3 text-sm italic leading-relaxed"
                      style={{ borderLeft: "3px solid var(--ocws-cyan)", background: "rgba(0,212,255,0.04)" }}
                    >
                      <span className="ocws-accent-cyan font-semibold not-italic">Corvus: </span>
                      <span className="text-white/80">&ldquo;{result.cross_structure_analysis.corvus_assessment}&rdquo;</span>
                    </div>
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
          {/* Corvus video — autoplay, loop, muted */}
          <video
            src="/corvus.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", display: "block" }}
          />

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
