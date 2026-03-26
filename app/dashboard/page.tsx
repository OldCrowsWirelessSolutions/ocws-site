"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CorvusChat from "@/app/components/CorvusChat";
import CrowsEyeTab from "@/app/components/CrowsEyeTab";
import SettingsTab from "@/app/components/SettingsTab";
import CorvusTour from "@/app/components/CorvusTour";
import CorvusTourPlayer from "@/app/components/CorvusTourPlayer";
import { TOURS, type Tour } from "@/lib/corvus-tours";
import type { TourLevel } from "@/lib/corvusTour";
import {
  corvusLineFresh,
  CORVUS_JOSHUA_DASHBOARD_BRIEF,
  CORVUS_ERIC_DASHBOARD_BRIEF,
  CORVUS_NATE_DASHBOARD_BRIEF,
  CORVUS_MIKE_DASHBOARD_BRIEF,
  CORVUS_KYLE_DASHBOARD_BRIEF,
  CORVUS_TEAM_LEAD_DASHBOARD_BRIEF,
  CORVUS_FLEDGLING_FIRST,
  CORVUS_FLEDGLING_RETURNING,
  CORVUS_FLEDGLING_VERDICT_USED,
} from "@/lib/corvus-ui-strings";
import { getTodayHoliday, getHolidayGreeting } from "@/lib/corvus-calendar";
import type { TeamReport } from "@/lib/team-reporting";
import { speakCorvus } from "@/lib/elevenlabs";
import AudioToggle from "@/app/components/AudioToggle";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubscriptionTier = "fledgling" | "nest" | "flock" | "murder";
type ReportType = "verdict" | "reckoning_small" | "reckoning_standard" | "reckoning_commercial" | "reckoning_pro";
type ReportSeverity = "critical" | "warning" | "info";

interface ReportRecord {
  reportId: string; type: ReportType; subscriptionId: string | null;
  email: string | null; codeUsed: string; createdAt: string;
  locationName: string; findingCount: number; severity: ReportSeverity;
  reportData: string; pdfAvailable: boolean;
}

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  verdict: "Verdict", reckoning_small: "Small Reckoning",
  reckoning_standard: "Standard Reckoning", reckoning_commercial: "Commercial Reckoning",
  reckoning_pro: "Pro Reckoning",
};

const SEVERITY_COLORS: Record<ReportSeverity, { color: string; bg: string; border: string }> = {
  critical: { color: "#f87171", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)" },
  warning:  { color: "#fbbf24", bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.35)"  },
  info:     { color: "#4ade80", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)"  },
};

interface CreditPricing {
  single: string; singlePrice: number; sixPack: string; sixPackPrice: number;
  twelvePack: string; twelvePackPrice: number;
}
interface ReckoningPricing {
  small?: string; smallPrice?: number; standard?: string; standardPrice?: number;
  commercial?: string; commercialPrice?: number;
}
interface ValidationResult {
  valid: boolean; type: "subscription" | "founder" | "admin" | "promo" | "vip" | null;
  tier?: SubscriptionTier; customer_name?: string; verdicts_remaining?: number;
  verdicts_unlimited?: boolean;
  reckonings_remaining?: { small: number; standard: number; commercial: number };
  reckonings_unlimited?: { small: boolean; standard: boolean; commercial: boolean };
  seat_limit?: number; seats_used?: number;
  credit_pricing?: CreditPricing; reckoning_pricing?: ReckoningPricing;
  vip_name?: string; vip_title?: string; vip_company?: string; vip_max_subordinates?: number;
  error?: string;
}
interface SubDetails {
  customer_email: string; customer_name: string; tier: SubscriptionTier; status: string;
  current_period_start: string | null; current_period_end: string | null; created_at: string;
  verdicts_used: number; reckonings_used: { small: number; standard: number; commercial: number };
  extra_verdict_credits: number;
}

type TierCfg = { label: string; color: string; textColor: string; monthlyVerdicts: number; price: string };
const TIER_CONFIG: Record<SubscriptionTier, TierCfg> = {
  fledgling: { label: "FLEDGLING", color: "#B8922A", textColor: "#0D1520", monthlyVerdicts: 1,      price: "$10/mo"   },
  nest:      { label: "NEST",      color: "#00C2C7", textColor: "#0D1520", monthlyVerdicts: 3,      price: "$20/mo"   },
  flock:     { label: "FLOCK",     color: "#B8922A", textColor: "#0D1520", monthlyVerdicts: 15,     price: "$100/mo"  },
  murder:    { label: "MURDER",    color: "#9B1C1C", textColor: "#ffffff", monthlyVerdicts: 999999, price: "$950/mo"  },
};

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", background: "#0D1520",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px",
  padding: "12px 14px", color: "#ffffff", fontSize: "16px",
  fontFamily: "monospace", letterSpacing: "0.08em", outline: "none",
};

const card: React.CSSProperties = {
  background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px", padding: "24px", marginBottom: "0",
};

const sectionLabel: React.CSSProperties = {
  color: "#00C2C7", fontSize: "11px", fontWeight: 700,
  letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px",
};

// ─── Tab definitions ──────────────────────────────────────────────────────────

type SubTab  = "overview" | "reports" | "analytics" | "credits" | "team" | "billing" | "chat" | "products" | "crow" | "settings" | "help";
type VIPTab  = "overview" | "reports" | "analytics" | "codes"   | "team" | "chat"  | "products" | "crow" | "settings" | "help";
type AnyTab  = SubTab | VIPTab;

// ─── TabBar ───────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onSelect }: {
  tabs: { id: AnyTab; label: string }[];
  active: AnyTab;
  onSelect: (t: AnyTab) => void;
}) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px",
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onSelect(t.id)} data-tab={t.id}
            style={{
              padding: "8px 16px", fontSize: "12px", fontWeight: isActive ? 700 : 500,
              border: isActive ? "1px solid rgba(0,194,199,0.5)" : "1px solid rgba(255,255,255,0.09)",
              borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap",
              transition: "all 0.15s",
              background: isActive ? "rgba(0,194,199,0.13)" : "rgba(255,255,255,0.03)",
              color: isActive ? "#00C2C7" : "rgba(255,255,255,0.45)",
              letterSpacing: isActive ? "0.02em" : "0",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Corvus dashboard greeting (module-level to prevent remount) ──────────────

const SUBSCRIBER_GREETINGS = [
  "Your network is waiting. Let's see what needs fixing.",
  "I've been here. Your network hasn't changed itself. Let's look.",
  "Back again. Good. I have things to show you.",
  "Subscriber dashboard ready. What are we looking at today?",
  "You're back. I haven't changed anything. Your network might have. Let's check.",
  "Dashboard loaded. Corvus online. What are we looking at?",
];

interface DashGreetingProps {
  storedCode: string;
  reportsCount: number;
  teamReportsCount: number;
  activeSubordinatesCount: number;
  verdictsRemaining: number;
  isVIP: boolean;
  isSubType: boolean;
  tier: string;
  customerName: string | null;
  vipCompany: string | null;
}

function CorvusDashGreeting(props: DashGreetingProps) {
  const [displayed, setDisplayed] = useState("");
  const lineRef = useRef("");

  useEffect(() => {
    const code = props.storedCode.toUpperCase();
    let line: string;

    const isJoshua = ["OCWS-CORVUS-FOUNDER-JOSHUA", "CORVUS-ADMIN", "CORVUS-NEST", "OCWS-ADMIN-2026"].includes(code);
    const isEric   = ["CORVUS-ERIC", "CORVUS-ERIC-2026"].includes(code);
    const isNate   = ["CORVUS-NATE", "CORVUS-NATE-2026"].includes(code);
    const isMike   = ["CORVUS-MIKE", "CORVUS-MIKE-2026"].includes(code);
    const isKyle   = code === "CORVUS-KYLE";
    const isHighTierSub = props.isSubType && (props.tier === "flock" || props.tier === "murder");

    if (isJoshua) {
      line = corvusLineFresh(CORVUS_JOSHUA_DASHBOARD_BRIEF(props.reportsCount, 0, 0, 0, null), "dashboard_brief");
    } else if (isEric) {
      line = corvusLineFresh(CORVUS_ERIC_DASHBOARD_BRIEF(props.reportsCount, props.teamReportsCount, props.activeSubordinatesCount), "dashboard_brief");
    } else if (isNate) {
      line = corvusLineFresh(CORVUS_NATE_DASHBOARD_BRIEF(props.reportsCount, props.teamReportsCount, props.activeSubordinatesCount), "dashboard_brief");
    } else if (isMike) {
      line = corvusLineFresh(CORVUS_MIKE_DASHBOARD_BRIEF(props.reportsCount, props.teamReportsCount, props.activeSubordinatesCount), "dashboard_brief");
    } else if (isKyle) {
      line = corvusLineFresh(CORVUS_KYLE_DASHBOARD_BRIEF(props.reportsCount, props.verdictsRemaining), "dashboard_brief");
    } else if (isHighTierSub) {
      const name = props.customerName ?? "Team Lead";
      const company = props.vipCompany ?? "";
      line = corvusLineFresh(
        CORVUS_TEAM_LEAD_DASHBOARD_BRIEF(name, company, props.teamReportsCount, props.reportsCount, props.verdictsRemaining, props.tier as "flock" | "murder"),
        "dashboard_brief"
      );
    } else {
      line = corvusLineFresh(SUBSCRIBER_GREETINGS, "dashboard_brief");
    }

    // Inject holiday greeting
    const holiday = getTodayHoliday();
    if (holiday) {
      const holidayLine = getHolidayGreeting(holiday.type, isJoshua, new Date().getFullYear());
      if (holidayLine) {
        line = holiday.isSpecial ? holidayLine : `${line} — ${holidayLine}`;
      }
    }

    lineRef.current = line;
    speakCorvus(line); // fire and forget
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(line.slice(0, i));
      if (i >= line.length) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="corvus-dash-panel" style={{ marginBottom: "16px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/corvus_still.png" className="corvus-dash-avatar" alt="Corvus" style={{ cursor: "pointer" }} onClick={() => speakCorvus(lineRef.current)} />
      <span className="corvus-dash-text">
        {displayed}
        <span className="corvus-speech-cursor">▋</span>
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [phase, setPhase]         = useState<"loading" | "auth" | "dashboard">("loading");
  const [codeInput, setCodeInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [authError, setAuthError] = useState("");
  const [codeVisible, setCodeVisible] = useState(false);
  const [codeCopied, setCodeCopied]   = useState(false);
  const [sub, setSub]         = useState<ValidationResult | null>(null);
  const [details, setDetails] = useState<SubDetails | null>(null);
  const [storedCode, setStoredCode] = useState("");
  const [buyingCredits, setBuyingCredits]       = useState<string | null>(null);
  const [buyingReckoning, setBuyingReckoning]   = useState<string | null>(null);
  const [codeStats, setCodeStats]               = useState<{ usageCount: number; lastUsed: string | null } | null>(null);
  const [resending, setResending]               = useState(false);
  const [resent, setResent]                     = useState(false);
  const [reports, setReports]                   = useState<ReportRecord[]>([]);
  const [reportsLoading, setReportsLoading]     = useState(false);
  const [expandedReport, setExpandedReport]     = useState<string | null>(null);
  const [isAdminView, setIsAdminView]           = useState(false);
  const [activeTab, setActiveTab]               = useState<AnyTab>("overview");

  interface SubordinateRecord {
    code: string; issuedBy: string; issuedByName: string;
    issuedAt: string; expiresAt: string; expiryType: string;
    active: boolean; usageCount: number; lastUsed: string | null;
  }
  const [vipSubordinates, setVipSubordinates]           = useState<SubordinateRecord[]>([]);
  const [vipTeamActivity, setVipTeamActivity]           = useState<ReportRecord[]>([]);
  const [vipLoadingSubordinates, setVipLoadingSubordinates] = useState(false);
  const [vipLoadingActivity, setVipLoadingActivity]     = useState(false);
  const [vipSubExpiryType, setVipSubExpiryType]         = useState("24h");
  const [vipGenerating, setVipGenerating]               = useState(false);
  const [vipGeneratedCode, setVipGeneratedCode]         = useState("");
  const [vipCopied, setVipCopied]                       = useState(false);

  const [teamLeadActive, setTeamLeadActive]             = useState(false);
  const [teamActivity, setTeamActivity]                 = useState<ReportRecord[]>([]);
  const [teamActivityLoading, setTeamActivityLoading]   = useState(false);
  const [buyingTeamLead, setBuyingTeamLead]             = useState(false);
  const [teamLeadBilling, setTeamLeadBilling]           = useState<"monthly" | "annual">("monthly");

  const [teamReport, setTeamReport]                     = useState<TeamReport | null>(null);
  const [teamReportLoading, setTeamReportLoading]       = useState(false);
  const [teamReportInterval, setTeamReportInterval]     = useState("30d");
  const [teamReportBriefing, setTeamReportBriefing]     = useState("");
  const [teamBriefingLoading, setTeamBriefingLoading]   = useState(false);
  const [memberModalCode, setMemberModalCode]           = useState<string | null>(null);
  const [teamAvailableMonths, setTeamAvailableMonths]   = useState<string[]>([]);
  const [teamReportGenerated, setTeamReportGenerated]   = useState(false);

  const [subMgmtLoading, setSubMgmtLoading]   = useState<"pause30" | "pause60" | "cancel" | "reactivate" | null>(null);
  const [subMgmtConfirm, setSubMgmtConfirm]   = useState<"pause30" | "pause60" | "cancel" | null>(null);
  const [subMgmtFeedback, setSubMgmtFeedback] = useState("");

  interface SeatMember { email: string; name: string; addedAt: string; code: string; }
  interface SeatInfo {
    tier: string; includedSeats: number; additionalSeats: number;
    totalSeats: number; maxTotal: number; maxAdditional: number;
    upgradeRequired: string | null; members: SeatMember[];
  }
  const [seatInfo, setSeatInfo]                 = useState<SeatInfo | null>(null);
  const [seatBillingPeriod, setSeatBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [seatAddCount, setSeatAddCount]         = useState(1);
  const [buyingSeats, setBuyingSeats]           = useState(false);
  const [showInviteModal, setShowInviteModal]   = useState(false);
  const [inviteName, setInviteName]             = useState("");
  const [inviteEmail, setInviteEmail]           = useState("");
  const [inviting, setInviting]                 = useState(false);
  const [inviteError, setInviteError]           = useState("");
  const [removingMember, setRemovingMember]     = useState<string | null>(null);

  interface CodeSummary {
    code: string; totalScans: number; lastScan: string | null;
    productBreakdown: Record<string, number>; severityBreakdown: Record<string, number>;
    avgFindingsPerScan: number; totalCritical: number;
    dailyScans?: { date: string; count: number }[];
  }
  const [myAnalytics, setMyAnalytics]             = useState<CodeSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading]   = useState(false);
  const [analyticsNarrative, setAnalyticsNarrative] = useState("");
  const [narrativeLoading, setNarrativeLoading]   = useState(false);

  // ── Tour state ──────────────────────────────────────────────────────────────
  const [activeTour, setActiveTour]               = useState<Tour | null>(null);
  const [autoTourLevel, setAutoTourLevel]         = useState<TourLevel | null>(null);

  // ── Fledgling state ─────────────────────────────────────────────────────────
  const [fledglingVerdictUsed, setFledglingVerdictUsed] = useState<boolean>(false);
  const [fledglingIsFirst, setFledglingIsFirst]         = useState<boolean>(true);

  // ── Tab persistence via URL hash ────────────────────────────────────────────
  const tabInitialized = useRef(false);

  function navigateTab(t: AnyTab) {
    setActiveTab(t);
    window.history.replaceState(null, "", `#${t}`);
  }

  // ── Data loaders ────────────────────────────────────────────────────────────

  const loadReports = useCallback(async (code: string) => {
    setReportsLoading(true);
    try {
      const res = await fetch("/api/reports/list", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) { const d = await res.json() as { reports?: ReportRecord[] }; setReports(d.reports ?? []); }
    } catch { /* */ } finally { setReportsLoading(false); }
  }, []);

  const loadVipSubordinates = useCallback(async (code: string) => {
    setVipLoadingSubordinates(true);
    try {
      const res = await fetch("/api/vip/subordinates", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) { const d = await res.json(); setVipSubordinates(d.subordinates ?? []); }
    } catch { /* */ } finally { setVipLoadingSubordinates(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadVipTeamActivity = useCallback(async (code: string) => {
    setVipLoadingActivity(true);
    try {
      const res = await fetch("/api/vip/team-activity", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) { const d = await res.json(); setVipTeamActivity(d.reports ?? []); }
    } catch { /* */ } finally { setVipLoadingActivity(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTeamActivity = useCallback(async (code: string) => {
    setTeamActivityLoading(true);
    try {
      const res = await fetch("/api/subscriptions/team-activity", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) { const d = await res.json(); setTeamActivity(d.reports ?? []); setTeamLeadActive(true); }
    } catch { /* */ } finally { setTeamActivityLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSeatInfo = useCallback(async (code: string) => {
    try {
      const res = await fetch("/api/subscriptions/seat-info", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) { const data = await res.json() as SeatInfo; setSeatInfo(data); setSeatAddCount(1); }
    } catch { /* */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyAnalytics = useCallback(async (code: string) => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/analytics/code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) { const d = await res.json() as { summary?: CodeSummary }; setMyAnalytics(d.summary ?? null); }
    } catch { /* */ } finally { setAnalyticsLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTeamReport = useCallback(async (code: string, interval: string, silent = false) => {
    if (!silent) setTeamReportLoading(true);
    setTeamBriefingLoading(true);
    try {
      const res = await fetch("/api/team/report", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, interval }),
      });
      if (res.ok) {
        const d = await res.json();
        setTeamReport(d.report ?? null);
        // briefing is now embedded in report.corvusBriefing; keep teamReportBriefing for legacy display
        setTeamReportBriefing(d.report?.corvusBriefing ?? d.briefing ?? "");
        setTeamReportGenerated(true);
        if (d.availableMonths) {
          setTeamAvailableMonths(d.availableMonths);
        }
      }
    } catch { /* */ } finally {
      if (!silent) setTeamReportLoading(false);
      setTeamBriefingLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboard = useCallback(async (code: string) => {
    setValidating(true);
    try {
      const res  = await fetch("/api/subscriptions/validate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: code }),
      });
      const data: ValidationResult = await res.json();
      if (!data.valid || (data.type !== "subscription" && data.type !== "founder" && data.type !== "admin" && data.type !== "vip")) {
        setAuthError(data.error ?? "Invalid or inactive subscription.");
        try { localStorage.removeItem("corvus_sub_code"); } catch { /* */ }
        setPhase("auth"); return;
      }
      setSub(data);
      if (data.type === "subscription") {
        try {
          const dRes = await fetch(`/api/subscriptions/details?code=${encodeURIComponent(code)}`);
          if (dRes.ok) setDetails(await dRes.json());
        } catch { /* */ }
        try {
          const sRes = await fetch(`/api/subscriptions/code-stats?code=${encodeURIComponent(code)}`);
          if (sRes.ok) setCodeStats(await sRes.json());
        } catch { /* */ }
        if (data.tier === "fledgling") {
          try {
            const fRes = await fetch(`/api/subscriptions/fledgling-status?code=${encodeURIComponent(code)}`);
            if (fRes.ok) {
              const fd = await fRes.json() as { verdictUsed: boolean; isFirst: boolean };
              setFledglingVerdictUsed(fd.verdictUsed ?? false);
              setFledglingIsFirst(fd.isFirst ?? true);
            }
          } catch { /* */ }
        }
      }
      try {
        const imp = localStorage.getItem("corvus_admin_impersonating") === "true";
        setIsAdminView(imp);
      } catch { /* */ }
      setStoredCode(code);
      setPhase("dashboard");
      // Auto-tour: show on first login per code, tier-appropriate level
      try {
        const tourKey = `corvus_tour_seen_${code}`;
        if (!localStorage.getItem(tourKey)) {
          const upperCode = code.toUpperCase();
          const isJoshuaCode = ["OCWS-CORVUS-FOUNDER-JOSHUA", "CORVUS-ADMIN", "CORVUS-NEST", "OCWS-ADMIN-2026"].includes(upperCode);
          if (!isJoshuaCode) {
            const isVIPCode = ["CORVUS-NATE", "CORVUS-NATE-2026", "CORVUS-MIKE", "CORVUS-MIKE-2026", "CORVUS-ERIC", "CORVUS-ERIC-2026"].includes(upperCode) || data.type === "vip";
            const isKyleCode = upperCode === "CORVUS-KYLE";
            let level: TourLevel;
            if (isVIPCode) level = "full";
            else if (isKyleCode) level = "flock";
            else if (data.tier === "murder") level = "murder";
            else if (data.tier === "flock") level = "flock";
            else level = "nest";
            setAutoTourLevel(level);
          }
        }
      } catch { /* localStorage unavailable */ }
      loadReports(code);
      loadMyAnalytics(code);
      if (data.type === "vip") {
        loadVipSubordinates(code); loadVipTeamActivity(code);
        loadTeamReport(code, "30d", true);
      } else {
        loadSeatInfo(code);
        if (data.type === "subscription" && (data.tier === "flock" || data.tier === "murder")) {
          loadTeamActivity(code);
          loadTeamReport(code, "30d", true);
        }
      }
    } catch {
      setAuthError("Connection error. Please try again."); setPhase("auth");
    } finally { setValidating(false); }
  }, [loadReports, loadSeatInfo, loadVipSubordinates, loadVipTeamActivity, loadTeamActivity, loadMyAnalytics, loadTeamReport]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("corvus_sub_code");
      if (!saved) { setPhase("auth"); return; }
      // Session persists until explicit logout — no time-based expiry
      loadDashboard(saved);
    } catch { setPhase("auth"); }
  }, [loadDashboard]);

  // Restore tab from hash after dashboard loads + listen for FAB hash changes
  useEffect(() => {
    if (phase !== "dashboard") return;
    if (!tabInitialized.current) {
      tabInitialized.current = true;
      const hash = window.location.hash.replace("#", "") as AnyTab;
      if (hash) setActiveTab(hash);
    }
    function onHashChange() {
      const hash = window.location.hash.replace("#", "") as AnyTab;
      if (hash) setActiveTab(hash);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [phase]);

  const handleLoginWrapped = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setAuthError(""); setValidating(true);
    try {
      const res  = await fetch("/api/subscriptions/validate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: code }),
      });
      const data: ValidationResult = await res.json();
      if (!data.valid || (data.type !== "subscription" && data.type !== "founder" && data.type !== "admin" && data.type !== "vip")) {
        setAuthError(data.error ?? "Invalid or inactive subscription."); return;
      }
      try {
        localStorage.setItem("corvus_sub_code", code);
      } catch { /* */ }
      setSub(data);
      if (data.type === "subscription") {
        try {
          const dRes = await fetch(`/api/subscriptions/details?code=${encodeURIComponent(code)}`);
          if (dRes.ok) setDetails(await dRes.json());
        } catch { /* */ }
      }
      setStoredCode(code); setPhase("dashboard");
      // Auto-tour on first login
      try {
        const tourKey = `corvus_tour_seen_${code}`;
        if (!localStorage.getItem(tourKey)) {
          const isJoshuaCode = ["OCWS-CORVUS-FOUNDER-JOSHUA", "CORVUS-ADMIN", "CORVUS-NEST", "OCWS-ADMIN-2026"].includes(code);
          if (!isJoshuaCode) {
            const isVIPCode = ["CORVUS-NATE", "CORVUS-NATE-2026", "CORVUS-MIKE", "CORVUS-MIKE-2026", "CORVUS-ERIC", "CORVUS-ERIC-2026"].includes(code) || data.type === "vip";
            const isKyleCode = code === "CORVUS-KYLE";
            let level: TourLevel;
            if (isVIPCode) level = "full";
            else if (isKyleCode) level = "flock";
            else if (data.tier === "murder") level = "murder";
            else if (data.tier === "flock") level = "flock";
            else level = "nest";
            setAutoTourLevel(level);
          }
        }
      } catch { /* localStorage unavailable */ }
    } catch { setAuthError("Connection error. Please try again.");
    } finally { setValidating(false); }
  };

  function handleGoToCrowsEye() {
    try {
      if (storedCode) sessionStorage.setItem("corvus_active_session", storedCode);
    } catch { /* non-fatal */ }
  }

  function handleLogout() {
    try {
      localStorage.removeItem("corvus_sub_code");
      localStorage.removeItem("corvus_session_ts");
      localStorage.removeItem("corvus_sub_tier");
      localStorage.removeItem("corvus_admin_auth");
      localStorage.removeItem("corvus_admin_impersonating");
      sessionStorage.clear();
    } catch { /* */ }
    window.location.href = "/";
  }

  function copyCode() {
    navigator.clipboard.writeText(storedCode).then(() => {
      setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  async function handleResendCode() {
    const email = details?.customer_email; if (!email) return;
    setResending(true);
    try {
      await fetch("/api/subscriptions/recover-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true); setTimeout(() => setResent(false), 4000);
    } catch { /* */ } finally { setResending(false); }
  }

  async function handleBuyCredits(pack: "single" | "6pack" | "12pack") {
    setBuyingCredits(pack);
    try {
      const res = await fetch("/api/subscriptions/buy-credits", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, pack }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      if (data.url) window.location.href = data.url;
    } catch { alert("Connection error. Please try again."); } finally { setBuyingCredits(null); }
  }

  async function handleBuyReckoning(type: "small" | "standard" | "commercial") {
    setBuyingReckoning(type);
    try {
      const res = await fetch("/api/subscriptions/buy-reckoning", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, type }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      if (data.url) window.location.href = data.url;
    } catch { alert("Connection error. Please try again."); } finally { setBuyingReckoning(null); }
  }

  async function handleGenerateSubordinate() {
    if (vipGenerating || !storedCode) return;
    setVipGenerating(true); setVipGeneratedCode(""); setVipCopied(false);
    try {
      const res = await fetch("/api/vip/generate-subordinate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, expiryType: vipSubExpiryType }),
      });
      const data = await res.json() as { code?: string; error?: string };
      if (data.code) { setVipGeneratedCode(data.code); await loadVipSubordinates(storedCode); }
      else alert(data.error ?? "Failed to generate code.");
    } catch { alert("Connection error. Please try again."); } finally { setVipGenerating(false); }
  }

  async function handleRevokeSubordinate(subCode: string) {
    if (!confirm(`Revoke ${subCode}? This will immediately invalidate the code.`)) return;
    try {
      await fetch("/api/vip/revoke-subordinate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, subCode }),
      });
      await loadVipSubordinates(storedCode);
    } catch { alert("Connection error."); }
  }

  async function handleExportCSV() {
    try {
      const res = await fetch("/api/team/report/csv", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, interval: teamReportInterval }),
      });
      if (!res.ok) { alert("Failed to export CSV."); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `team-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Export failed."); }
  }

  async function handleUpgradeTeamLead() {
    if (buyingTeamLead || !storedCode) return;
    setBuyingTeamLead(true);
    try {
      const res = await fetch("/api/subscriptions/upgrade-team-lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, billingPeriod: teamLeadBilling }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Could not start checkout. Please try again.");
    } catch { alert("Connection error. Please try again."); } finally { setBuyingTeamLead(false); }
  }

  async function handleBuySeats() {
    if (buyingSeats || !storedCode) return; setBuyingSeats(true);
    try {
      const res = await fetch("/api/subscriptions/buy-seats", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, additionalSeats: seatAddCount, billingPeriod: seatBillingPeriod }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Could not start checkout. Please try again.");
    } catch { alert("Connection error. Please try again."); } finally { setBuyingSeats(false); }
  }

  async function handleInviteMember() {
    if (inviting || !storedCode) return; setInviteError(""); setInviting(true);
    try {
      const res = await fetch("/api/subscriptions/invite-seat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, memberName: inviteName, memberEmail: inviteEmail }),
      });
      const data = await res.json() as { ok?: boolean; seatCode?: string; error?: string };
      if (data.ok) { setShowInviteModal(false); setInviteName(""); setInviteEmail(""); await loadSeatInfo(storedCode); }
      else setInviteError(data.error ?? "Failed to invite member.");
    } catch { setInviteError("Connection error. Please try again."); } finally { setInviting(false); }
  }

  async function handleRemoveMember(memberEmail: string) {
    if (removingMember || !storedCode) return;
    if (!confirm(`Remove ${memberEmail} from your team? Their access code will be deactivated.`)) return;
    setRemovingMember(memberEmail);
    try {
      const res = await fetch("/api/subscriptions/remove-seat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, memberEmail }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) await loadSeatInfo(storedCode);
      else alert(data.error ?? "Failed to remove member.");
    } catch { alert("Connection error."); } finally { setRemovingMember(null); }
  }

  async function handleGetMyNarrative() {
    if (!myAnalytics || !storedCode) return;
    setNarrativeLoading(true); setAnalyticsNarrative("");
    try {
      const res = await fetch("/api/analytics/corvus-narrative", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: sub?.type === "vip" ? "vip" : "code", data: myAnalytics }),
      });
      const data = await res.json() as { narrative?: string };
      setAnalyticsNarrative(data.narrative ?? "No briefing returned.");
    } catch { setAnalyticsNarrative("Failed to reach Corvus. Try again."); } finally { setNarrativeLoading(false); }
  }

  async function handlePause(days: 30 | 60) {
    if (!storedCode) return;
    const key = days === 30 ? "pause30" : "pause60";
    setSubMgmtLoading(key); setSubMgmtConfirm(null);
    try {
      const res = await fetch("/api/subscriptions/pause", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, pauseDays: days }),
      });
      const data = await res.json() as { success?: boolean; resumesAt?: string; error?: string };
      if (data.success) {
        const resumeDate = data.resumesAt ? new Date(data.resumesAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "soon";
        setSubMgmtFeedback(`Subscription paused. Resumes ${resumeDate}.`);
        loadDashboard(storedCode);
      } else { setSubMgmtFeedback(data.error ?? "Failed to pause subscription."); }
    } catch { setSubMgmtFeedback("Connection error. Please try again."); } finally { setSubMgmtLoading(null); }
  }

  async function handleCancel() {
    if (!storedCode) return; setSubMgmtLoading("cancel"); setSubMgmtConfirm(null);
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode }),
      });
      const data = await res.json() as { success?: boolean; accessUntil?: string; error?: string };
      if (data.success) {
        const accessDate = data.accessUntil ? new Date(data.accessUntil).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "your billing period end";
        setSubMgmtFeedback(`Subscription cancelled. You have full access until ${accessDate}.`);
        loadDashboard(storedCode);
      } else { setSubMgmtFeedback(data.error ?? "Failed to cancel subscription."); }
    } catch { setSubMgmtFeedback("Connection error. Please try again."); } finally { setSubMgmtLoading(null); }
  }

  async function handleReactivate() {
    if (!storedCode) return; setSubMgmtLoading("reactivate");
    try {
      const res = await fetch("/api/subscriptions/reactivate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) { setSubMgmtFeedback("Subscription reactivated. Welcome back!"); loadDashboard(storedCode); }
      else { setSubMgmtFeedback(data.error ?? "Failed to reactivate subscription."); }
    } catch { setSubMgmtFeedback("Connection error. Please try again."); } finally { setSubMgmtLoading(null); }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#00C2C7", fontFamily: "monospace", fontSize: "13px", letterSpacing: "0.2em" }}>AUTHENTICATING...</p>
      </div>
    );
  }

  // ── Auth gate ─────────────────────────────────────────────────────────────

  if (phase === "auth") {
    return (
      <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ position: "relative", width: "40px", height: "40px", flexShrink: 0 }}>
                <Image src="/OCWS_Logo_Transparent.png" alt="OCWS" fill sizes="40px" style={{ objectFit: "contain" }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ color: "#ffffff", fontSize: "16px", fontWeight: 700, margin: 0 }}>Corvus Dashboard</p>
                <p style={{ color: "#00C2C7", fontSize: "11px", margin: 0 }}>Old Crows Wireless Solutions</p>
              </div>
            </div>
            <p style={{ color: "#888888", fontSize: "13px" }}>Enter your Subscription ID to access your dashboard.</p>
          </div>
          <form onSubmit={handleLoginWrapped} style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "32px" }}>
            <label style={{ display: "block", color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Subscription ID</label>
            <input type="password" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="text" placeholder="OCWS-NEST-XXXXXXXX" value={codeInput} onChange={e => setCodeInput(e.target.value)}
              style={{ ...inputStyle, marginBottom: authError ? "8px" : "20px" }} />
            {authError && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "16px" }}>{authError}</p>}
            <button type="submit" disabled={validating || !codeInput.trim()}
              style={{ width: "100%", padding: "12px", background: validating || !codeInput.trim() ? "#0D6E7A" : "#00C2C7", color: "#0D1520", borderRadius: "10px", border: "none", fontSize: "14px", fontWeight: 700, cursor: validating || !codeInput.trim() ? "not-allowed" : "pointer", letterSpacing: "0.05em" }}>
              {validating ? "Validating..." : "Access Dashboard"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#555555" }}>
            Don&rsquo;t have a subscription?{" "}
            <Link href="/crows-eye" style={{ color: "#00C2C7" }}>Get Corvus&rsquo; Verdict</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  const isVIP       = sub?.type === "vip";
  const isSubType   = sub?.type === "subscription";
  const tier        = sub?.tier ?? "nest";
  const isFledgling = isSubType && tier === "fledgling";
  const tc          = TIER_CONFIG[tier as SubscriptionTier] ?? TIER_CONFIG["nest"];
  const isUnlimited = sub?.verdicts_unlimited ?? false;
  const verdictsRemaining = sub?.verdicts_remaining ?? 0;
  const verdictsUsed = isUnlimited ? 0 : Math.max(0, tc.monthlyVerdicts - verdictsRemaining);
  const progressPct = isUnlimited ? 0 : Math.min(100, (verdictsUsed / tc.monthlyVerdicts) * 100);
  const rec      = sub?.reckonings_remaining  ?? { small: 0, standard: 0, commercial: 0 };
  const recUnlim = sub?.reckonings_unlimited  ?? { small: false, standard: false, commercial: false };
  const hasTeam    = isSubType && (tier === "flock" || tier === "murder");
  const hasReports = !(isSubType && tier === "nest");

  // Tab definitions per user type
  const fledglingTabs: { id: SubTab; label: string }[] = [
    { id: "chat",      label: "Ask Corvus"   },
    { id: "crow",      label: "🦅 My Verdict" },
    { id: "help",      label: "Help"          },
    { id: "settings",  label: "Settings"      },
  ];

  const subTabs: { id: SubTab; label: string }[] = [
    { id: "overview",   label: "Overview"    },
    { id: "crow",       label: "🦅 Crow's Eye" },
    ...(hasReports ? [{ id: "reports" as SubTab, label: "My Reports" }] : []),
    { id: "analytics",  label: "Analytics"   },
    { id: "credits",    label: "Buy Credits" },
    ...(hasTeam || isVIP ? [{ id: "team" as SubTab, label: "Team" }] : []),
    ...(isSubType ? [{ id: "billing" as SubTab, label: "Account & Billing" }] : []),
    { id: "products",   label: "Products"    },
    { id: "chat",       label: "Ask Corvus"  },
    { id: "settings",   label: "Settings"    },
    { id: "help",       label: "Help"        },
  ];

  const vipTabs: { id: VIPTab; label: string }[] = [
    { id: "overview",   label: "Overview"    },
    { id: "crow",       label: "🦅 Crow's Eye" },
    { id: "reports",    label: "My Reports"  },
    { id: "analytics",  label: "Analytics"   },
    { id: "codes",      label: "Sub Codes"   },
    { id: "team",       label: "Team Activity" },
    { id: "products",   label: "Products"    },
    { id: "chat",       label: "Ask Corvus"  },
    { id: "settings",   label: "Settings"    },
    { id: "help",       label: "Help"        },
  ];

  const tabs = isVIP ? vipTabs : isFledgling ? fledglingTabs : subTabs;

  // ── Shared section renderers ──────────────────────────────────────────────

  function renderOverview() {
    const lastReport = reports[0];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Credits row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px" }}>
          <div style={card}>
            <p style={{ ...sectionLabel, marginBottom: "8px" }}>Verdict Credits</p>
            <p style={{ color: "#ffffff", fontSize: "52px", fontWeight: 800, lineHeight: 1, marginBottom: "4px" }}>
              {isUnlimited ? "∞" : verdictsRemaining}
            </p>
            <p style={{ color: "#888888", fontSize: "12px", marginBottom: "12px" }}>
              {isUnlimited ? "Unlimited this period" : `of ${tc.monthlyVerdicts} remaining`}
            </p>
            {!isUnlimited && (
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "100px", height: "6px", overflow: "hidden", marginBottom: "12px" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: progressPct > 80 ? "#F87171" : "#00C2C7", borderRadius: "100px", transition: "width 0.4s ease" }} />
              </div>
            )}
            {details?.current_period_end && <p style={{ color: "#555555", fontSize: "11px" }}>Resets {fmtDate(details.current_period_end)}</p>}
          </div>

          <div style={card}>
            <p style={{ color: "#B8922A", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>Reckoning Credits</p>
            {(["small", "standard", "commercial"] as const).map(key => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ color: "#888888", fontSize: "13px", textTransform: "capitalize" }}>{key}</span>
                <span style={{ color: recUnlim[key] ? "#B8922A" : rec[key] > 0 ? "#ffffff" : "#444444", fontSize: "14px", fontWeight: 700, fontFamily: "monospace" }}>
                  {recUnlim[key] ? "∞" : rec[key]}
                </span>
              </div>
            ))}
          </div>

          <div style={card}>
            <p style={{ ...sectionLabel, marginBottom: "8px" }}>Quick Actions</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/crows-eye" onClick={handleGoToCrowsEye} style={{ display: "block", background: "#00C2C7", color: "#0D1520", borderRadius: "10px", padding: "11px 16px", fontSize: "13px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                Run a Verdict →
              </Link>
              <Link href="/crows-eye" onClick={handleGoToCrowsEye} style={{ display: "block", background: "rgba(184,146,42,0.1)", border: "1px solid rgba(184,146,42,0.3)", color: "#B8922A", borderRadius: "10px", padding: "11px 16px", fontSize: "13px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                Run a Reckoning →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        {reports.length > 0 && (
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ ...sectionLabel, marginBottom: 0 }}>Recent Activity</p>
              {hasReports && <button onClick={() => navigateTab("reports")} style={{ background: "none", border: "none", color: "#00C2C7", fontSize: "12px", cursor: "pointer" }}>View all →</button>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {reports.slice(0, 3).map(r => {
                const sev = SEVERITY_COLORS[r.severity] ?? SEVERITY_COLORS.info;
                return (
                  <div key={r.reportId} style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <p style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600, margin: 0 }}>{r.locationName || "Untitled"}</p>
                      <p style={{ color: "#555555", fontSize: "11px", margin: "3px 0 0" }}>
                        {new Date(r.createdAt).toLocaleDateString()} · {REPORT_TYPE_LABELS[r.type]} · {r.findingCount} finding{r.findingCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: "20px", background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                      {r.severity.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {reports.length === 0 && !reportsLoading && (
          <div style={{ ...card, textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#555555", fontSize: "14px", marginBottom: "8px" }}>No scans yet.</p>
            <p style={{ color: "#888888", fontSize: "13px", marginBottom: "20px" }}>Run your first Verdict or Reckoning to start tracking.</p>
            <Link href="/crows-eye" onClick={handleGoToCrowsEye} style={{ display: "inline-block", background: "#00C2C7", color: "#0D1520", borderRadius: "10px", padding: "10px 24px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>
              Go to Crow&rsquo;s Eye →
            </Link>
          </div>
        )}

        {lastReport && myAnalytics && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
            {([
              { label: "Total Scans",      value: myAnalytics.totalScans,         color: "#00C2C7" },
              { label: "Critical Findings",value: myAnalytics.totalCritical,       color: "#F87171" },
              { label: "Avg Findings",     value: myAnalytics.avgFindingsPerScan.toFixed(1), color: "#aaaaaa" },
              { label: "Last Scan",        value: myAnalytics.lastScan ? new Date(myAnalytics.lastScan).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—", color: "#555555" },
            ] as { label: string; value: string | number; color: string }[]).map(({ label, value, color }) => (
              <div key={label} style={{ ...card, padding: "16px" }}>
                <p style={{ color: "#333", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>{label}</p>
                <p style={{ color, fontSize: "22px", fontWeight: 800, lineHeight: 1, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderReports() {
    if (isSubType && tier === "nest") {
      return (
        <div style={{ ...card, textAlign: "center", padding: "48px" }}>
          <p style={{ color: "#888888", fontSize: "14px" }}>Nest plan does not include report storage.</p>
          <p style={{ color: "#555555", fontSize: "13px", marginTop: "8px" }}>Download your reports immediately after each scan. Upgrade to Flock for 6-month history.</p>
        </div>
      );
    }
    return (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "10px" }}>
          <p style={{ ...sectionLabel, marginBottom: 0 }}>Past Verdicts &amp; Reckonings</p>
          {reports.length > 0 && <span style={{ color: "#555555", fontSize: "12px" }}>{reports.length} report{reports.length !== 1 ? "s" : ""}</span>}
        </div>
        {isSubType && tier === "flock" && <p style={{ color: "#888888", fontSize: "12px", marginBottom: "16px" }}>Reports stored for 6 months</p>}
        {(isSubType && tier === "murder" || isVIP) && <p style={{ color: "#888888", fontSize: "12px", marginBottom: "16px" }}>Reports stored for 12 months</p>}
        {reportsLoading ? (
          <p style={{ color: "#555555", fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.1em" }}>Loading reports...</p>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <p style={{ color: "#555555", fontSize: "14px", marginBottom: "10px" }}>No reports yet.</p>
            <Link href="/crows-eye" onClick={handleGoToCrowsEye} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#00C2C7", color: "#0D1520", borderRadius: "10px", padding: "10px 26px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>
              Go to Crow&rsquo;s Eye →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reports.map((r) => {
              const sev = SEVERITY_COLORS[r.severity] ?? SEVERITY_COLORS.info;
              const isOpen = expandedReport === r.reportId;
              let parsed: { full_findings?: Array<{ severity: string; title: string; description: string; fix: string }> } = {};
              try { parsed = JSON.parse(r.reportData); } catch { /* */ }
              return (
                <div key={r.reportId} style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      <span style={{ background: "rgba(0,194,199,0.12)", color: "#00C2C7", fontSize: "9px", fontWeight: 800, letterSpacing: "0.18em", padding: "3px 8px", borderRadius: "20px", border: "1px solid rgba(0,194,199,0.25)", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {REPORT_TYPE_LABELS[r.type] ?? r.type}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.locationName || "Untitled"}</p>
                        <p style={{ color: "#555555", fontSize: "11px", margin: 0 }}>{new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <span style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`, fontSize: "9px", fontWeight: 800, letterSpacing: "0.15em", padding: "3px 8px", borderRadius: "20px" }}>
                        {r.severity.toUpperCase()}
                      </span>
                      <span style={{ color: "#555555", fontSize: "11px" }}>{r.findingCount} finding{r.findingCount !== 1 ? "s" : ""}</span>
                      <button onClick={() => setExpandedReport(isOpen ? null : r.reportId)}
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "#00C2C7", fontSize: "11px", fontWeight: 600, padding: "5px 12px", cursor: "pointer" }}>
                        {isOpen ? "Collapse" : "View Report"}
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px" }}>
                      {parsed.full_findings && parsed.full_findings.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {parsed.full_findings.map((f, i) => {
                            const fc = f.severity === "CRITICAL" ? { color: "#f87171", border: "rgba(239,68,68,0.3)" } : f.severity === "GOOD" ? { color: "#4ade80", border: "rgba(34,197,94,0.3)" } : { color: "#fbbf24", border: "rgba(234,179,8,0.3)" };
                            return (
                              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${fc.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                  <span style={{ color: fc.color, fontSize: "9px", fontWeight: 800, letterSpacing: "0.15em" }}>{f.severity}</span>
                                  <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600 }}>{f.title}</span>
                                </div>
                                <p style={{ color: "#888888", fontSize: "12px", marginBottom: "6px", lineHeight: 1.6 }}>{f.description}</p>
                                {f.fix && <p style={{ color: "#00C2C7", fontSize: "12px", lineHeight: 1.6 }}><strong>Fix:</strong> {f.fix}</p>}
                              </div>
                            );
                          })}
                        </div>
                      ) : <p style={{ color: "#555555", fontSize: "13px" }}>No detailed findings stored for this report.</p>}
                      <p style={{ color: "#444444", fontSize: "10px", marginTop: "12px", fontFamily: "monospace" }}>Report ID: {r.reportId}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function renderAnalytics() {
    return (
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <p style={{ ...sectionLabel, marginBottom: 0 }}>My Analytics</p>
            <p style={{ color: "#555555", fontSize: "11px", marginTop: "4px" }}>Your usage history with Corvus</p>
          </div>
          <button onClick={() => loadMyAnalytics(storedCode)} disabled={analyticsLoading}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#888888", fontSize: "12px", padding: "7px 14px", cursor: "pointer" }}>
            {analyticsLoading ? "Loading…" : "↻ Refresh"}
          </button>
        </div>
        {analyticsLoading && <p style={{ color: "#444444", fontSize: "13px" }}>Loading analytics…</p>}
        {!analyticsLoading && myAnalytics && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "12px", marginBottom: "20px" }}>
              {([
                { label: "Total Scans",      value: myAnalytics.totalScans,         color: "#00C2C7" },
                { label: "Critical Findings",value: myAnalytics.totalCritical,       color: "#F87171" },
                { label: "Avg Findings",     value: myAnalytics.avgFindingsPerScan.toFixed(1), color: "#aaaaaa" },
                { label: "Last Scan",        value: myAnalytics.lastScan ? new Date(myAnalytics.lastScan).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—", color: "#555555" },
              ] as { label: string; value: string | number; color: string }[]).map(({ label, value, color }) => (
                <div key={label} style={{ background: "#0D1520", borderRadius: "10px", padding: "14px 16px" }}>
                  <p style={{ color: "#333", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>{label}</p>
                  <p style={{ color, fontSize: "22px", fontWeight: 800, lineHeight: 1, margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
            {(Object.keys(myAnalytics.productBreakdown ?? {}).length > 0 || Object.keys(myAnalytics.severityBreakdown ?? {}).length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                {Object.keys(myAnalytics.productBreakdown ?? {}).length > 0 && (
                  <div style={{ background: "#0D1520", borderRadius: "10px", padding: "14px 16px" }}>
                    <p style={{ color: "#444", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>By Product</p>
                    {Object.entries(myAnalytics.productBreakdown).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ color: "#888888", fontSize: "12px" }}>{k.replace(/_/g, " ")}</span>
                        <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 700, fontFamily: "monospace" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {Object.keys(myAnalytics.severityBreakdown ?? {}).length > 0 && (
                  <div style={{ background: "#0D1520", borderRadius: "10px", padding: "14px 16px" }}>
                    <p style={{ color: "#444", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>By Severity</p>
                    {[["critical","#F87171"],["warning","#FBBF24"],["info","#4ADE80"]].map(([k, color]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ color: "#888888", fontSize: "12px", textTransform: "capitalize" }}>{k}</span>
                        <span style={{ color, fontSize: "12px", fontWeight: 700, fontFamily: "monospace" }}>{(myAnalytics.severityBreakdown ?? {})[k] ?? 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div style={{ background: "#0D1520", borderRadius: "10px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: analyticsNarrative ? "16px" : "0" }}>
                <p style={{ color: "#B8922A", fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>Corvus Take on My Usage</p>
                <button onClick={handleGetMyNarrative} disabled={narrativeLoading}
                  style={{ background: narrativeLoading ? "rgba(184,146,42,0.06)" : "rgba(184,146,42,0.1)", border: "1px solid rgba(184,146,42,0.25)", borderRadius: "8px", color: "#B8922A", fontSize: "12px", padding: "7px 14px", cursor: narrativeLoading ? "not-allowed" : "pointer" }}>
                  {narrativeLoading ? "Corvus is thinking…" : "Get Corvus' Take"}
                </button>
              </div>
              {analyticsNarrative && <p style={{ color: "#aaaaaa", fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>{analyticsNarrative}</p>}
              {!analyticsNarrative && !narrativeLoading && <p style={{ color: "#2a2a2a", fontSize: "12px", fontStyle: "italic", margin: 0 }}>Click to get Corvus&apos; take on your usage patterns.</p>}
            </div>
          </>
        )}
        {!analyticsLoading && !myAnalytics && <p style={{ color: "#333333", fontSize: "13px", fontStyle: "italic" }}>No scan history yet. Run your first Verdict or Reckoning to start tracking.</p>}
      </div>
    );
  }

  function renderCredits() {
    if (!isSubType) return (
      <div style={{ ...card, textAlign: "center", padding: "40px" }}>
        <p style={{ color: "#888888", fontSize: "14px" }}>Credit purchases are available for subscription plans.</p>
        <Link href="/#pricing" style={{ display: "inline-block", marginTop: "16px", background: "#00C2C7", color: "#0D1520", borderRadius: "10px", padding: "10px 24px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>View Plans →</Link>
      </div>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Buy More Verdicts */}
        <div style={card}>
          <p style={sectionLabel}>Buy More Verdicts</p>
          {tier === "murder" ? (
            <p style={{ color: "#555555", fontSize: "13px" }}>Murder subscribers have unlimited Verdict credits — no purchase needed.</p>
          ) : (() => {
            const cp = sub?.credit_pricing;
            const sp = cp?.singlePrice ?? 0;
            const packs: { pack: "single" | "6pack" | "12pack"; label: string; price: number; savings: string | null }[] = [
              { pack: "single",  label: "Single",  price: sp,                   savings: null },
              { pack: "6pack",   label: "6-Pack",  price: cp?.sixPackPrice ?? 0, savings: cp ? `saves $${sp * 6  - cp.sixPackPrice}`  : null },
              { pack: "12pack",  label: "12-Pack", price: cp?.twelvePackPrice ?? 0, savings: cp ? `saves $${sp * 12 - cp.twelvePackPrice}` : null },
            ];
            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
                {packs.map(({ pack, label, price, savings }) => (
                  <div key={pack} style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                    <p style={{ color: "#888888", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>{label}</p>
                    <p style={{ color: "#00C2C7", fontSize: "26px", fontWeight: 800, lineHeight: 1, marginBottom: "4px" }}>${price}</p>
                    {savings ? <p style={{ color: "#4ADE80", fontSize: "10px", marginBottom: "10px" }}>{savings}</p> : <div style={{ height: "18px", marginBottom: "10px" }} />}
                    <button onClick={() => handleBuyCredits(pack)} disabled={buyingCredits !== null}
                      style={{ width: "100%", background: buyingCredits === pack ? "#0D6E7A" : "#00C2C7", color: "#0D1520", border: "none", borderRadius: "7px", padding: "8px", fontSize: "12px", fontWeight: 700, cursor: buyingCredits !== null ? "not-allowed" : "pointer" }}>
                      {buyingCredits === pack ? "Redirecting…" : "Buy Now"}
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Buy More Reckonings */}
        <div style={card}>
          <p style={{ color: "#B8922A", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>Buy More Reckonings</p>
          {tier === "murder" ? (
            <p style={{ color: "#555555", fontSize: "13px" }}>Murder subscribers have unlimited Reckonings — no purchase needed.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
              {(["small","standard","commercial"] as const).map(key => {
                const prices = { small: tier === "nest" ? 50 : 35, standard: 75, commercial: 200 };
                const available = key === "small" || tier === "flock";
                return available ? (
                  <div key={key} style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                    <p style={{ color: "#888888", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "capitalize" as const, marginBottom: "6px" }}>{key}</p>
                    <p style={{ color: "#B8922A", fontSize: "26px", fontWeight: 800, lineHeight: 1, marginBottom: "10px" }}>${prices[key]}</p>
                    <button onClick={() => handleBuyReckoning(key)} disabled={buyingReckoning !== null}
                      style={{ width: "100%", background: buyingReckoning === key ? "#0D6E7A" : "#B8922A", color: "#0D1520", border: "none", borderRadius: "7px", padding: "8px", fontSize: "12px", fontWeight: 700, cursor: buyingReckoning !== null ? "not-allowed" : "pointer" }}>
                      {buyingReckoning === key ? "Redirecting…" : "Buy Now"}
                    </button>
                  </div>
                ) : (
                  <div key={key} style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                    <p style={{ color: "#444", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "capitalize" as const, marginBottom: "6px" }}>{key}</p>
                    <p style={{ color: "#333333", fontSize: "12px" }}>Flock plan required</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Honor code */}
        <div style={{ ...card, background: "rgba(184,146,42,0.06)", border: "1px solid rgba(184,146,42,0.2)" }}>
          <p style={{ color: "#B8922A", fontSize: "12px" }}>
            Military or First Responder? Enter <code style={{ fontFamily: "monospace", background: "rgba(184,146,42,0.1)", padding: "2px 6px", borderRadius: "4px" }}>CORVUS-HONOR</code> at checkout for your discount.
          </p>
        </div>
      </div>
    );
  }

  function renderTeam() {
    if (isVIP) {
      // VIP team = subordinate codes (rendered in codes tab separately)
      return renderVipTeamActivity();
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Seat management */}
        {isSubType && seatInfo && (
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <p style={{ ...sectionLabel, marginBottom: 0 }}>Team Seats — {seatInfo.totalSeats} of {seatInfo.maxTotal} maximum</p>
              {tier !== "nest" && seatInfo.totalSeats < seatInfo.maxTotal && (
                <button onClick={() => { setShowInviteModal(true); setInviteError(""); }}
                  style={{ background: "rgba(0,194,199,0.1)", border: "1px solid rgba(0,194,199,0.3)", borderRadius: "8px", color: "#00C2C7", fontSize: "12px", fontWeight: 600, padding: "7px 14px", cursor: "pointer" }}>
                  + Invite Team Member
                </button>
              )}
            </div>
            {tier === "nest" ? (
              <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Your plan includes 1 seat.</p>
                <p style={{ color: "#888888", fontSize: "13px", marginBottom: "16px" }}>Upgrade to Flock to add up to 4 additional team members.</p>
                <a href="/#pricing" style={{ display: "inline-block", background: "#B8922A", color: "#0D1520", borderRadius: "8px", fontSize: "13px", fontWeight: 700, padding: "9px 20px", textDecoration: "none" }}>Upgrade to Flock →</a>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#888888", fontSize: "12px" }}>{seatInfo.members.length} member{seatInfo.members.length !== 1 ? "s" : ""} invited</span>
                    <span style={{ color: "#555555", fontSize: "12px" }}>{seatInfo.totalSeats} / {seatInfo.maxTotal}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "6px" }}>
                    <div style={{ background: seatInfo.totalSeats >= seatInfo.maxTotal ? "#F87171" : "#00C2C7", borderRadius: "4px", height: "6px", width: `${Math.min(100, (seatInfo.totalSeats / seatInfo.maxTotal) * 100)}%`, transition: "width 0.3s" }} />
                  </div>
                </div>
                {seatInfo.members.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    {seatInfo.members.map((m) => (
                      <div key={m.email} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div>
                          <p style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600, margin: 0 }}>{m.name}</p>
                          <p style={{ color: "#555555", fontSize: "11px", margin: "2px 0 0" }}>{m.email}</p>
                          <p style={{ color: "#333333", fontSize: "10px", fontFamily: "monospace", margin: "2px 0 0" }}>{m.code}</p>
                        </div>
                        <button onClick={() => handleRemoveMember(m.email)} disabled={removingMember === m.email}
                          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "6px", color: "#F87171", fontSize: "11px", padding: "4px 10px", cursor: removingMember ? "not-allowed" : "pointer" }}>
                          {removingMember === m.email ? "Removing…" : "Remove"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {seatInfo.totalSeats < seatInfo.maxTotal && (
                  <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px" }}>
                    <p style={{ color: "#888888", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Add More Seats</p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "12px" }}>
                      <select value={seatAddCount} onChange={(e) => setSeatAddCount(Number(e.target.value))}
                        style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", padding: "8px 12px", cursor: "pointer" }}>
                        {Array.from({ length: seatInfo.maxAdditional - seatInfo.additionalSeats }, (_, i) => i + 1).map(n => {
                          const priceMap = tier === "flock" ? { 1: 25, 2: 45, 3: 60, 4: 75 } as Record<number, number> : { 1: 75, 2: 140, 3: 195, 4: 240, 5: 275, 6: 300, 7: 315, 8: 320, 9: 325, 10: 330 } as Record<number, number>;
                          const price = priceMap[n] ?? 0;
                          return <option key={n} value={n}>{n} seat{n !== 1 ? "s" : ""} (+${seatBillingPeriod === "annual" ? Math.round(price * 12 * 0.8) : price}/{seatBillingPeriod === "annual" ? "yr" : "mo"})</option>;
                        })}
                      </select>
                      <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {(["monthly", "annual"] as const).map(p => (
                          <button key={p} type="button" onClick={() => setSeatBillingPeriod(p)}
                            style={{ padding: "8px 14px", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer", background: seatBillingPeriod === p ? "rgba(0,194,199,0.15)" : "rgba(255,255,255,0.04)", color: seatBillingPeriod === p ? "#00C2C7" : "rgba(255,255,255,0.5)" }}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </button>
                        ))}
                      </div>
                      {seatBillingPeriod === "annual" && <span style={{ color: "#4ADE80", fontSize: "11px", fontWeight: 600 }}>Save 20%</span>}
                    </div>
                    <button onClick={handleBuySeats} disabled={buyingSeats}
                      style={{ background: buyingSeats ? "#0D6E7A" : "#00C2C7", color: "#0D1520", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, padding: "10px 20px", cursor: buyingSeats ? "not-allowed" : "pointer" }}>
                      {buyingSeats ? "Redirecting…" : "Add Seats"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Team Lead / Team Activity */}
        {hasTeam && (
          <div style={card}>
            {tier === "murder" || teamLeadActive ? (
              <>
                {/* ── Report Builder ─────────────────────────────────────── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <p style={{ ...sectionLabel, marginBottom: 0 }}>Team Activity Report</p>
                    {tier === "murder" && <p style={{ color: "#555555", fontSize: "11px", marginTop: "4px" }}>Team Lead included with Murder tier</p>}
                  </div>
                  {teamReport && (
                    <button onClick={handleExportCSV}
                      style={{ background: "rgba(0,194,199,0.08)", border: "1px solid rgba(0,194,199,0.25)", borderRadius: "8px", color: "#00C2C7", fontSize: "11px", fontWeight: 600, padding: "6px 14px", cursor: "pointer" }}>
                      Export CSV
                    </button>
                  )}
                </div>

                {/* Interval selector */}
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>Time Period</p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                    {([ ["7d","Last 7 days"], ["30d","Last 30 days"], ["90d","Last 90 days"], ["this_month","This Month"], ["last_month","Last Month"] ] as [string, string][]).map(([iv, lbl]) => (
                      <button key={iv} onClick={() => setTeamReportInterval(iv)}
                        style={{ padding: "5px 12px", fontSize: "11px", fontWeight: 600, border: `1px solid ${teamReportInterval === iv ? "rgba(0,194,199,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: "20px", cursor: "pointer", background: teamReportInterval === iv ? "rgba(0,194,199,0.12)" : "transparent", color: teamReportInterval === iv ? "#00C2C7" : "rgba(255,255,255,0.45)", transition: "all 0.15s" }}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                  {teamAvailableMonths.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {teamAvailableMonths.map((m) => (
                        <button key={m} onClick={() => setTeamReportInterval(m)}
                          style={{ padding: "4px 10px", fontSize: "10px", fontWeight: 600, border: `1px solid ${teamReportInterval === m ? "rgba(184,146,42,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: "20px", cursor: "pointer", background: teamReportInterval === m ? "rgba(184,146,42,0.1)" : "transparent", color: teamReportInterval === m ? "#D4AF37" : "rgba(255,255,255,0.35)" }}>
                          {new Date(m + "-02").toLocaleString("en-US", { month: "short", year: "2-digit" })}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => loadTeamReport(storedCode, teamReportInterval)} disabled={teamReportLoading}
                  style={{ background: teamReportLoading ? "#0D6E7A" : "#00C2C7", color: "#0D1520", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, padding: "8px 20px", cursor: teamReportLoading ? "not-allowed" : "pointer", marginBottom: "20px" }}>
                  {teamReportLoading ? "Analyzing…" : "Generate Report"}
                </button>

                {/* Report output */}
                {teamReport && !teamReportLoading && (
                  <>
                    {/* Stats row */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "16px" }}>
                      {[
                        { label: "Total Scans",      value: String(teamReport.totalTeamScans),       color: "#00C2C7" },
                        { label: "Active Members",   value: `${teamReport.memberReports.filter(m => m.totalScans > 0).length} / ${teamReport.memberReports.length}`, color: "#4ADE80" },
                        { label: "Critical Findings",value: String(teamReport.totalCriticalFindings),  color: "#F87171" },
                        { label: "Avg Scans/Member", value: String(teamReport.avgScansPerMember), color: "#FBBF24" },
                      ].map((s) => (
                        <div key={s.label} style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px 14px" }}>
                          <p style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 4px" }}>{s.label}</p>
                          <p style={{ color: s.color, fontSize: "22px", fontWeight: 700, margin: 0, lineHeight: 1 }}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Corvus briefing */}
                    {(teamReport.corvusBriefing || teamBriefingLoading) && (
                      <div style={{ background: "rgba(0,194,199,0.04)", border: "1px solid rgba(0,194,199,0.15)", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/corvus_still.png" alt="Corvus" style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, marginTop: "2px" }} />
                        {teamBriefingLoading ? (
                          <p style={{ color: "#555555", fontSize: "13px", fontStyle: "italic", margin: 0 }}>Corvus is analyzing…</p>
                        ) : (
                          <p style={{ color: "#cccccc", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{teamReport.corvusBriefing}</p>
                        )}
                      </div>
                    )}

                    {/* Member breakdown */}
                    <p style={{ ...sectionLabel, marginBottom: "10px" }}>Member Breakdown</p>
                    {teamReport.memberReports.length === 0 ? (
                      <p style={{ color: "#555555", fontSize: "13px" }}>No members in this report.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {teamReport.memberReports.map((m) => (
                          <button key={m.code} onClick={() => setMemberModalCode(m.code)}
                            style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", width: "100%", flexWrap: "wrap", gap: "8px" }}>
                            <div>
                              <p style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600, margin: 0 }}>{m.codeMasked}</p>
                              <p style={{ color: "#444444", fontSize: "10px", fontFamily: "monospace", margin: "2px 0 0", letterSpacing: "0.08em" }}>{m.mostUsedProduct !== "—" ? m.mostUsedProduct : ""}</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <span style={{ color: "#00C2C7", fontSize: "12px", fontWeight: 600 }}>{m.totalScans} scan{m.totalScans !== 1 ? "s" : ""}</span>
                              {m.criticalFindings > 0 && <span style={{ color: "#F87171", fontSize: "11px" }}>{m.criticalFindings} critical</span>}
                              <span style={{ color: "#555555", fontSize: "11px" }}>{m.lastActive ? new Date(m.lastActive).toLocaleDateString() : "No activity"}</span>
                              <span style={{ color: "#444444", fontSize: "12px" }}>›</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <p style={{ color: "#555555", fontSize: "10px", marginTop: "12px" }}>Period: {teamReport.intervalLabel} · Generated {new Date(teamReport.generatedAt).toLocaleString()}</p>
                  </>
                )}
              </>
            ) : (
              <>
                <p style={{ ...sectionLabel, marginBottom: "8px" }}>Team Lead</p>
                <p style={{ color: "#888888", fontSize: "13px", marginBottom: "16px", lineHeight: 1.6 }}>See everything your team runs. All reports from all seats flow into a single dashboard.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                  {(["monthly", "annual"] as const).map((p) => (
                    <div key={p} onClick={() => setTeamLeadBilling(p)} style={{ background: teamLeadBilling === p ? "rgba(0,194,199,0.08)" : "#0D1520", border: `1px solid ${teamLeadBilling === p ? "rgba(0,194,199,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "12px", padding: "16px", textAlign: "center", cursor: "pointer" }}>
                      <p style={{ color: "#888888", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>{p === "monthly" ? "Monthly" : "Annual"}</p>
                      <p style={{ color: teamLeadBilling === p ? "#00C2C7" : "#ffffff", fontSize: "24px", fontWeight: 800, lineHeight: 1, marginBottom: "4px" }}>{p === "monthly" ? "+$35/mo" : "+$300/yr"}</p>
                      {p === "annual" && <p style={{ color: "#4ADE80", fontSize: "10px" }}>save $120</p>}
                    </div>
                  ))}
                </div>
                <button onClick={handleUpgradeTeamLead} disabled={buyingTeamLead}
                  style={{ background: buyingTeamLead ? "#0D6E7A" : "#00C2C7", color: "#0D1520", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, padding: "11px 24px", cursor: buyingTeamLead ? "not-allowed" : "pointer" }}>
                  {buyingTeamLead ? "Redirecting…" : "Upgrade to Team Lead →"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderVipCodes() {
    return (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <p style={{ ...sectionLabel, marginBottom: 0, color: "#D4AF37" }}>Subordinate Code Manager</p>
          <span style={{ color: "#888888", fontSize: "12px" }}>{vipSubordinates.length} of {sub?.vip_max_subordinates ?? 5} active</span>
        </div>
        {vipLoadingSubordinates ? (
          <p style={{ color: "#555555", fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.1em" }}>Loading codes...</p>
        ) : vipSubordinates.length > 0 ? (
          <div style={{ marginBottom: "24px" }}>
            {vipSubordinates.map((s) => {
              const isExpired = new Date() >= new Date(s.expiresAt);
              return (
                <div key={s.code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <p style={{ color: "#ffffff", fontSize: "13px", fontFamily: "monospace", fontWeight: 600, margin: 0 }}>{s.code}</p>
                    <p style={{ color: "#555555", fontSize: "11px", margin: "3px 0 0" }}>
                      Issued {new Date(s.issuedAt).toLocaleDateString()} · Expires {new Date(s.expiresAt).toLocaleDateString()} · {s.expiryType} · {s.usageCount} use{s.usageCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: "20px", background: isExpired ? "rgba(85,85,85,0.15)" : "rgba(74,222,128,0.12)", color: isExpired ? "#555555" : "#4ADE80", border: `1px solid ${isExpired ? "rgba(85,85,85,0.25)" : "rgba(74,222,128,0.25)"}` }}>
                      {isExpired ? "EXPIRED" : "ACTIVE"}
                    </span>
                    <button onClick={() => handleRevokeSubordinate(s.code)}
                      style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "6px", color: "#F87171", fontSize: "11px", padding: "4px 10px", cursor: "pointer" }}>
                      Revoke
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "#555555", fontSize: "13px", marginBottom: "20px" }}>No active subordinate codes. Generate one below.</p>
        )}
        {vipSubordinates.length < (sub?.vip_max_subordinates ?? 5) ? (
          <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "18px" }}>
            <p style={{ color: "#888888", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>Generate New Code</p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "14px" }}>
              <select value={vipSubExpiryType} onChange={(e) => setVipSubExpiryType(e.target.value)}
                style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", padding: "8px 12px", cursor: "pointer" }}>
                <option value="1_use">1 use only</option>
                <option value="24h">24 hours</option>
                <option value="48h">48 hours</option>
                <option value="72h">72 hours</option>
                <option value="7d">7 days</option>
                <option value="14d">14 days</option>
                <option value="30d">30 days</option>
              </select>
              <button onClick={handleGenerateSubordinate} disabled={vipGenerating}
                style={{ background: vipGenerating ? "#0D6E7A" : "#D4AF37", color: "#0D1520", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, padding: "9px 20px", cursor: vipGenerating ? "not-allowed" : "pointer" }}>
                {vipGenerating ? "Generating…" : "Generate Code"}
              </button>
            </div>
            {vipGeneratedCode && (
              <div style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <p style={{ color: "#D4AF37", fontSize: "14px", fontFamily: "monospace", fontWeight: 700, margin: 0, letterSpacing: "0.08em" }}>{vipGeneratedCode}</p>
                <button onClick={() => { navigator.clipboard.writeText(vipGeneratedCode); setVipCopied(true); setTimeout(() => setVipCopied(false), 2000); }}
                  style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "6px", color: "#D4AF37", fontSize: "11px", fontWeight: 700, padding: "6px 12px", cursor: "pointer" }}>
                  {vipCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
            <p style={{ color: "#888888", fontSize: "13px" }}>Maximum {sub?.vip_max_subordinates ?? 5} active codes. Revoke one to generate another.</p>
          </div>
        )}
      </div>
    );
  }

  function renderVipTeamActivity() {
    return (
      <div style={card}>
        {/* ── Report Builder ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <p style={{ ...sectionLabel, marginBottom: 0, color: "#D4AF37" }}>Team Activity Report</p>
          {teamReport && (
            <button onClick={handleExportCSV}
              style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "8px", color: "#D4AF37", fontSize: "11px", fontWeight: 600, padding: "6px 14px", cursor: "pointer" }}>
              Export CSV
            </button>
          )}
        </div>

        {/* Interval selector */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>Time Period</p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
            {([ ["7d","Last 7 days"], ["30d","Last 30 days"], ["90d","Last 90 days"], ["this_month","This Month"], ["last_month","Last Month"] ] as [string, string][]).map(([iv, lbl]) => (
              <button key={iv} onClick={() => setTeamReportInterval(iv)}
                style={{ padding: "5px 12px", fontSize: "11px", fontWeight: 600, border: `1px solid ${teamReportInterval === iv ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: "20px", cursor: "pointer", background: teamReportInterval === iv ? "rgba(212,175,55,0.1)" : "transparent", color: teamReportInterval === iv ? "#D4AF37" : "rgba(255,255,255,0.45)", transition: "all 0.15s" }}>
                {lbl}
              </button>
            ))}
          </div>
          {teamAvailableMonths.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {teamAvailableMonths.map((m) => (
                <button key={m} onClick={() => setTeamReportInterval(m)}
                  style={{ padding: "4px 10px", fontSize: "10px", fontWeight: 600, border: `1px solid ${teamReportInterval === m ? "rgba(184,146,42,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: "20px", cursor: "pointer", background: teamReportInterval === m ? "rgba(184,146,42,0.1)" : "transparent", color: teamReportInterval === m ? "#D4AF37" : "rgba(255,255,255,0.35)" }}>
                  {new Date(m + "-02").toLocaleString("en-US", { month: "short", year: "2-digit" })}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => loadTeamReport(storedCode, teamReportInterval)} disabled={teamReportLoading}
          style={{ background: teamReportLoading ? "rgba(184,146,42,0.3)" : "rgba(212,175,55,0.15)", color: teamReportLoading ? "#888888" : "#D4AF37", border: "1px solid rgba(212,175,55,0.35)", borderRadius: "8px", fontSize: "12px", fontWeight: 700, padding: "8px 20px", cursor: teamReportLoading ? "not-allowed" : "pointer", marginBottom: "20px" }}>
          {teamReportLoading ? "Analyzing…" : "Generate Report"}
        </button>

        {/* Report output */}
        {teamReport && !teamReportLoading && (
          <>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "16px" }}>
              {[
                { label: "Total Scans",      value: String(teamReport.totalTeamScans),       color: "#D4AF37" },
                { label: "Active Members",   value: `${teamReport.memberReports.filter(m => m.totalScans > 0).length} / ${teamReport.memberReports.length}`, color: "#4ADE80" },
                { label: "Critical Findings",value: String(teamReport.totalCriticalFindings),  color: "#F87171" },
                { label: "Avg Scans/Member", value: String(teamReport.avgScansPerMember), color: "#FBBF24" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px 14px" }}>
                  <p style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 4px" }}>{s.label}</p>
                  <p style={{ color: s.color, fontSize: "22px", fontWeight: 700, margin: 0, lineHeight: 1 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Corvus briefing */}
            {(teamReport.corvusBriefing || teamBriefingLoading) && (
              <div style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/corvus_still.png" alt="Corvus" style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, marginTop: "2px" }} />
                {teamBriefingLoading ? (
                  <p style={{ color: "#555555", fontSize: "13px", fontStyle: "italic", margin: 0 }}>Corvus is analyzing…</p>
                ) : (
                  <p style={{ color: "#cccccc", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{teamReport.corvusBriefing}</p>
                )}
              </div>
            )}

            {/* Member breakdown */}
            <p style={{ ...sectionLabel, marginBottom: "10px", color: "#D4AF37" }}>Member Breakdown</p>
            {teamReport.memberReports.length === 0 ? (
              <p style={{ color: "#555555", fontSize: "13px" }}>No subordinate activity in this period.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {teamReport.memberReports.map((m) => (
                  <button key={m.code} onClick={() => setMemberModalCode(m.code)}
                    style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", width: "100%", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <p style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600, margin: 0 }}>{m.codeMasked}</p>
                      <p style={{ color: "#444444", fontSize: "10px", fontFamily: "monospace", margin: "2px 0 0", letterSpacing: "0.08em" }}>{m.mostUsedProduct !== "—" ? m.mostUsedProduct : ""}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ color: "#D4AF37", fontSize: "12px", fontWeight: 600 }}>{m.totalScans} scan{m.totalScans !== 1 ? "s" : ""}</span>
                      {m.criticalFindings > 0 && <span style={{ color: "#F87171", fontSize: "11px" }}>{m.criticalFindings} critical</span>}
                      <span style={{ color: "#555555", fontSize: "11px" }}>{m.lastActive ? new Date(m.lastActive).toLocaleDateString() : "No activity"}</span>
                      <span style={{ color: "#444444", fontSize: "12px" }}>›</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <p style={{ color: "#555555", fontSize: "10px", marginTop: "12px" }}>Period: {teamReport.intervalLabel} · Generated {new Date(teamReport.generatedAt).toLocaleString()}</p>
          </>
        )}

        {/* Fallback: raw activity list when no report generated */}
        {!teamReportGenerated && !teamReportLoading && vipLoadingActivity && (
          <p style={{ color: "#555555", fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.1em", marginTop: "16px" }}>Loading activity…</p>
        )}
      </div>
    );
  }

  function renderBilling() {
    if (!isSubType) return (
      <div style={{ ...card, textAlign: "center", padding: "40px" }}>
        <p style={{ color: "#888888", fontSize: "14px" }}>Billing details are not applicable for this access type.</p>
      </div>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Account details */}
        <div style={card}>
          <p style={sectionLabel}>Account</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {([
                ["Email on file",  details?.customer_email ?? "—"],
                ["Plan",           `${tc.label} — ${tc.price}`],
                ["Status",         details?.status ?? "active"],
                ["Member since",   fmtDate(details?.created_at)],
                ["Billing period", details?.current_period_start && details?.current_period_end
                  ? `${fmtDate(details.current_period_start)} → ${fmtDate(details.current_period_end)}` : "—"],
              ] as [string, string][]).map(([label, value]) => (
                <tr key={label}>
                  <td style={{ color: "#888888", fontSize: "13px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", width: "45%" }}>{label}</td>
                  <td style={{ color: "#ffffff", fontSize: "13px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textAlign: "right" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button disabled style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#444444", fontSize: "13px", padding: "8px 16px", cursor: "not-allowed" }}>
              Manage Billing (coming soon)
            </button>
          </div>
          <p style={{ color: "#555555", fontSize: "11px", marginTop: "12px" }}>
            To cancel, contact{" "}
            <a href="mailto:joshua@oldcrowswireless.com" style={{ color: "#00C2C7" }}>joshua@oldcrowswireless.com</a>.
          </p>
        </div>

        {/* Subscriber code */}
        <div style={card}>
          <p style={sectionLabel}>Your Subscriber Code</p>
          <div style={{ background: "#0D1520", border: "1px solid #0D6E7A", borderRadius: "12px", padding: "20px 24px", textAlign: "center", marginBottom: "16px" }}>
            <p style={{ color: "#00C2C7", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>Subscriber Code</p>
            <p style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.1em" }}>{codeVisible ? storedCode : "••••••••••••••••••••"}</p>
            {codeStats && <p style={{ color: "#555555", fontSize: "11px", marginTop: "8px" }}>Used {codeStats.usageCount} time{codeStats.usageCount !== 1 ? "s" : ""}{codeStats.lastUsed ? ` · last used ${fmtDate(codeStats.lastUsed)}` : ""}</p>}
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
            <button onClick={() => setCodeVisible(v => !v)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", padding: "8px 16px", cursor: "pointer" }}>
              {codeVisible ? "Hide Code" : "Show Code"}
            </button>
            <button onClick={copyCode} style={{ background: codeCopied ? "rgba(0,194,199,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${codeCopied ? "rgba(0,194,199,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", color: codeCopied ? "#00C2C7" : "#ffffff", fontSize: "13px", padding: "8px 16px", cursor: "pointer" }}>
              {codeCopied ? "Copied!" : "Copy Code"}
            </button>
            {details?.customer_email && (
              <button onClick={handleResendCode} disabled={resending || resent} style={{ background: resent ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.05)", border: `1px solid ${resent ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", color: resent ? "#4ADE80" : "#888888", fontSize: "13px", padding: "8px 16px", cursor: resending || resent ? "not-allowed" : "pointer" }}>
                {resent ? "Sent!" : resending ? "Sending…" : "Resend Code to Email"}
              </button>
            )}
          </div>
          <p style={{ color: "#444444", fontSize: "11px" }}>Lost your code? <a href="/recover-code" style={{ color: "#00C2C7" }}>Recover it here</a></p>
        </div>

        {/* Subscription management */}
        {details && (
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <p style={{ ...sectionLabel, marginBottom: 0 }}>Subscription Management</p>
              {(() => {
                const st = details.status ?? "active";
                const color = st === "active" ? "#4ADE80" : st === "paused" ? "#FBBF24" : st === "cancelling" ? "#F87171" : "#888888";
                return <span style={{ color, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: "20px", fontSize: "11px", fontWeight: 700, padding: "3px 10px" }}>{st === "cancelling" ? "Cancelling" : st.charAt(0).toUpperCase() + st.slice(1)}</span>;
              })()}
            </div>
            {subMgmtFeedback && <div style={{ background: "rgba(0,194,199,0.08)", border: "1px solid rgba(0,194,199,0.25)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}><p style={{ color: "#00C2C7", fontSize: "13px", margin: 0 }}>{subMgmtFeedback}</p></div>}
            {(details.status === "active" || !details.status) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "18px" }}>
                  <p style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Need a break?</p>
                  <p style={{ color: "#888888", fontSize: "12px", marginBottom: "14px", lineHeight: 1.5 }}>Pause and keep access until end of billing period.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button onClick={() => setSubMgmtConfirm("pause30")} disabled={subMgmtLoading !== null} style={{ width: "100%", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "8px", color: "#FBBF24", fontSize: "12px", fontWeight: 700, padding: "8px", cursor: "pointer" }}>Pause 30 days</button>
                    <button onClick={() => setSubMgmtConfirm("pause60")} disabled={subMgmtLoading !== null} style={{ width: "100%", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)", borderRadius: "8px", color: "#FBBF24", fontSize: "12px", fontWeight: 600, padding: "8px", cursor: "pointer" }}>Pause 60 days</button>
                  </div>
                </div>
                <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "18px" }}>
                  <p style={{ color: "#888888", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Cancel subscription</p>
                  <p style={{ color: "#666666", fontSize: "12px", marginBottom: "14px", lineHeight: 1.5 }}>Cancel anytime. Keep access until billing period ends.</p>
                  <button onClick={() => setSubMgmtConfirm("cancel")} disabled={subMgmtLoading !== null} style={{ width: "100%", background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px", color: "#F87171", fontSize: "12px", fontWeight: 600, padding: "8px", cursor: "pointer" }}>Cancel Subscription</button>
                </div>
              </div>
            )}
            {(details.status as string) === "paused" && (
              <div style={{ background: "#0D1520", border: "1px solid rgba(251,191,36,0.25)", borderRadius: "12px", padding: "20px" }}>
                <p style={{ color: "#FBBF24", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>Your subscription is paused.</p>
                <button onClick={handleReactivate} disabled={subMgmtLoading === "reactivate"} style={{ background: "#00C2C7", color: "#0D1520", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, padding: "10px 20px", cursor: "pointer" }}>
                  {subMgmtLoading === "reactivate" ? "Reactivating…" : "Reactivate Now"}
                </button>
              </div>
            )}
            {(details.status as string) === "cancelling" && (
              <div style={{ background: "#0D1520", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "12px", padding: "20px" }}>
                <p style={{ color: "#F87171", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Your subscription will end on {details.current_period_end ? fmtDate(details.current_period_end) : "your next billing date"}.</p>
                <p style={{ color: "#888888", fontSize: "12px", marginBottom: "16px" }}>You have full access until then.</p>
                <button onClick={handleReactivate} disabled={subMgmtLoading === "reactivate"} style={{ background: "rgba(0,194,199,0.1)", border: "1px solid rgba(0,194,199,0.3)", color: "#00C2C7", borderRadius: "8px", fontSize: "13px", fontWeight: 700, padding: "10px 20px", cursor: "pointer" }}>
                  {subMgmtLoading === "reactivate" ? "Reactivating…" : "Keep My Subscription"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderChat() {
    return (
      <div style={{ height: "600px" }}>
        <CorvusChat
          code={storedCode}
          hasRecentVerdict={reports.length > 0}
          expanded={true}
          isVIP={isVIP}
        />
      </div>
    );
  }

  function renderProducts() {
    const accentGold   = "#B8922A";
    const accentCyan   = "#00C2C7";

    interface Product {
      id: string; name: string; tagline: string; description: string;
      comingSoon?: boolean; requiresTier?: SubscriptionTier; accent: string; link?: string;
    }

    const products: Product[] = [
      {
        id: "verdict",
        name: "Corvus' Verdict",
        tagline: "Real-time RF intelligence scan",
        description: "Instant wireless signal analysis — signal strength, interference sources, channel congestion, and actionable recommendations. Results in seconds.",
        accent: accentCyan,
        link: "/crows-eye",
      },
      {
        id: "reckoning_small",
        name: "Small Reckoning",
        tagline: "Residential deep-dive survey",
        description: "Comprehensive RF assessment for homes and small spaces up to ~2,500 sq ft. Includes interference mapping, channel analysis, and full PDF report.",
        requiresTier: "flock",
        accent: accentGold,
        link: "/crows-eye",
      },
      {
        id: "reckoning_standard",
        name: "Standard Reckoning",
        tagline: "Commercial baseline survey",
        description: "Full RF baseline for offices and mid-size commercial spaces. Coverage gap analysis, multi-AP interference, tenant isolation, and remediation plan.",
        requiresTier: "flock",
        accent: accentGold,
        link: "/crows-eye",
      },
      {
        id: "reckoning_commercial",
        name: "Commercial Reckoning",
        tagline: "Enterprise RF baseline",
        description: "Comprehensive enterprise-grade survey covering large facilities, multi-floor deployments, and complex RF environments. Full remediation roadmap included.",
        requiresTier: "murder",
        accent: "#9B1C1C",
        link: "/crows-eye",
      },
      {
        id: "hybrid",
        name: "Hybrid Survey Mode",
        tagline: "Cross-structure RF analysis",
        description: "Analyze wireless environments that span multiple structures or mixed indoor/outdoor zones. Captures inter-building interference and coverage hand-off gaps.",
        accent: accentCyan,
        link: "/crows-eye",
      },
      {
        id: "reckoning_pro",
        name: "Pro Reckoning",
        tagline: "Multi-site portfolio analysis",
        description: "Unified RF assessment across multiple locations with comparative benchmarking, trend identification, and portfolio-level remediation prioritization.",
        comingSoon: true,
        accent: accentGold,
      },
      {
        id: "historical",
        name: "Historical Trend Analysis",
        tagline: "RF environment over time",
        description: "Track how your wireless environment evolves across multiple scans. Identify degradation patterns, seasonal interference, and infrastructure drift.",
        comingSoon: true,
        accent: accentCyan,
      },
      {
        id: "api",
        name: "API Access",
        tagline: "Integrate Corvus into your stack",
        description: "Programmatic access to Corvus scanning, report generation, and data export. Webhooks, JSON output, and SDK support for custom integrations.",
        comingSoon: true,
        accent: "#9B1C1C",
      },
    ];

    const tierOrder: Record<SubscriptionTier, number> = { fledgling: -1, nest: 0, flock: 1, murder: 2 };
    const userTierNum = tierOrder[tier] ?? 0;

    function productAccess(p: Product): "available" | "upgrade" | "coming-soon" {
      if (p.comingSoon) return "coming-soon";
      if (isVIP) return "available";
      if (!p.requiresTier) return "available";
      return userTierNum >= tierOrder[p.requiresTier] ? "available" : "upgrade";
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={card}>
          <p style={sectionLabel}>Corvus Product Suite</p>
          <p style={{ color: "#888888", fontSize: "13px", lineHeight: 1.6, marginBottom: "0" }}>
            All products accessible through the{" "}
            <a href="/crows-eye" style={{ color: accentCyan, textDecoration: "none" }}>Crow&rsquo;s Eye</a>{" "}
            interface. Your subscription tier determines which assessments are included in your plan.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {products.map(p => {
            const access = productAccess(p);
            const isAvail = access === "available";
            const isComing = access === "coming-soon";
            const isUpgrade = access === "upgrade";
            return (
              <div key={p.id} style={{
                background: "#1A2332",
                border: `1px solid ${isAvail ? `${p.accent}40` : "rgba(255,255,255,0.07)"}`,
                borderRadius: "14px", padding: "20px",
                opacity: isComing ? 0.65 : 1,
                display: "flex", flexDirection: "column", gap: "10px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isAvail ? p.accent : isComing ? "#555" : "#B8922A", marginTop: "4px", flexShrink: 0 }} />
                  {isComing && (
                    <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.06)", color: "#888", borderRadius: "20px", padding: "2px 10px", fontFamily: "monospace" }}>
                      🥚 Coming Soon
                    </span>
                  )}
                  {isUpgrade && (
                    <span style={{ fontSize: "10px", background: "rgba(184,146,42,0.12)", color: accentGold, border: `1px solid rgba(184,146,42,0.3)`, borderRadius: "20px", padding: "2px 10px", fontFamily: "monospace" }}>
                      Upgrade Required
                    </span>
                  )}
                  {isAvail && (
                    <span style={{ fontSize: "10px", background: "rgba(74,222,128,0.1)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "20px", padding: "2px 10px", fontFamily: "monospace" }}>
                      Included
                    </span>
                  )}
                </div>

                <div>
                  <p style={{ color: "#ffffff", fontSize: "15px", fontWeight: 700, margin: "0 0 2px" }}>{p.name}</p>
                  <p style={{ color: p.accent, fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>{p.tagline}</p>
                </div>

                <p style={{ color: "#888888", fontSize: "12px", lineHeight: 1.6, margin: 0 }}>{p.description}</p>

                {isAvail && p.link && (
                  <a href={p.link} onClick={handleGoToCrowsEye as React.MouseEventHandler<HTMLAnchorElement>}
                    style={{ marginTop: "auto", display: "block", textAlign: "center", background: p.accent, color: p.accent === "#9B1C1C" ? "#ffffff" : "#0D1520", borderRadius: "8px", padding: "9px 16px", fontSize: "12px", fontWeight: 700, textDecoration: "none", cursor: "pointer" }}>
                    Open in Crow&rsquo;s Eye →
                  </a>
                )}
                {isUpgrade && (
                  <button onClick={() => navigateTab("billing" as AnyTab)}
                    style={{ marginTop: "auto", background: "rgba(184,146,42,0.1)", border: `1px solid rgba(184,146,42,0.3)`, color: accentGold, borderRadius: "8px", padding: "9px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                    Upgrade Plan →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderCrowsEye() {
    return (
      <CrowsEyeTab
        code={storedCode}
        isVIP={isVIP}
        tier={tier}
        creditsRemaining={verdictsRemaining}
        reckoningCredits={rec}
        onScanComplete={() => loadReports(storedCode)}
        navigateToChat={() => navigateTab("chat")}
      />
    );
  }

  function renderHelp() {
    const role: 'vip' | 'team_lead' | 'subscriber' =
      isVIP ? 'vip' :
      (teamLeadActive ? 'team_lead' : 'subscriber');

    const availableTours = Object.values(TOURS).filter(t => t.applicableTo.includes(role));

    return (
      <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
          <p style={{ color: "#00C2C7", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Help & Training</p>
          <p style={{ color: "#888888", fontSize: "0.78rem", marginBottom: 20, lineHeight: 1.6 }}>
            Corvus will walk you through each section of the dashboard. Select a tour and I&apos;ll guide you step by step with live highlights.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {availableTours.map(tour => (
              <div key={tour.id} style={{ background: "rgba(13,21,32,0.8)", border: "1px solid rgba(0,194,199,0.12)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#F4F6F8", fontSize: "0.88rem", fontWeight: 600, marginBottom: 4 }}>
                    🐦‍⬛ {tour.name}
                  </p>
                  <p style={{ color: "#888888", fontSize: "0.75rem" }}>{tour.description}</p>
                  <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", color: "#555", letterSpacing: "0.1em", marginTop: 6 }}>
                    {tour.steps.length} steps
                  </p>
                </div>
                <button
                  onClick={() => setActiveTour(tour)}
                  style={{ padding: "8px 20px", background: "rgba(0,194,199,0.1)", border: "1px solid rgba(0,194,199,0.3)", borderRadius: 8, color: "#00C2C7", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}
                >
                  Start Tour →
                </button>
              </div>
            ))}
          </div>

          {availableTours.length === 0 && (
            <p style={{ color: "#555", fontSize: "0.78rem", fontStyle: "italic" }}>No tours available for your current access level.</p>
          )}
        </div>

        <div style={{ background: "rgba(184,146,42,0.05)", border: "1px solid rgba(184,146,42,0.15)", borderRadius: 12, padding: "14px 18px" }}>
          <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: "#B8922A", letterSpacing: "0.12em", marginBottom: 6 }}>QUESTIONS?</p>
          <p style={{ color: "#888888", fontSize: "0.75rem", lineHeight: 1.6 }}>
            Tours cover the UI. For RF questions, technical analysis, or help interpreting your scan results — use the <strong style={{ color: "#F4F6F8" }}>Ask Corvus</strong> tab. I&apos;m there.
          </p>
        </div>
      </div>
    );
  }

  function renderFledglingVerdict() {
    const verdictLine = corvusLineFresh(
      fledglingVerdictUsed ? CORVUS_FLEDGLING_VERDICT_USED : (fledglingIsFirst ? CORVUS_FLEDGLING_FIRST : CORVUS_FLEDGLING_RETURNING),
      "fledgling_verdict"
    );
    if (fledglingVerdictUsed) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ background: "rgba(184,146,42,0.06)", border: "1px solid rgba(184,146,42,0.2)", borderRadius: "16px", padding: "32px", textAlign: "center" }}>
            <p style={{ color: "#B8922A", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>FREE VERDICT USED</p>
            <p style={{ color: "#F4F6F8", fontSize: "15px", fontStyle: "italic", lineHeight: 1.7, marginBottom: "24px" }}>&ldquo;{verdictLine}&rdquo;</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "360px", margin: "0 auto" }}>
              <a href="/#pricing" style={{ display: "block", background: "#00C2C7", color: "#0D1520", borderRadius: "10px", padding: "12px 20px", fontSize: "14px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                Upgrade to Nest — $20/mo →
              </a>
              <p style={{ color: "#555555", fontSize: "12px" }}>3 Verdicts/mo · Small Reckonings · Full platform access</p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ background: "rgba(184,146,42,0.06)", border: "1px solid rgba(184,146,42,0.3)", borderRadius: "16px", padding: "28px" }}>
          <p style={{ color: "#B8922A", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>YOUR FREE VERDICT</p>
          <p style={{ color: "#F4F6F8", fontSize: "14px", fontStyle: "italic", lineHeight: 1.7, marginBottom: "20px" }}>&ldquo;{verdictLine}&rdquo;</p>
          <div style={{ background: "rgba(0,194,199,0.06)", border: "1px solid rgba(0,194,199,0.15)", borderRadius: "10px", padding: "16px 18px", marginBottom: "20px" }}>
            <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>How to use it</p>
            <ol style={{ color: "#aaaaaa", fontSize: "13px", margin: 0, paddingLeft: "18px", lineHeight: 1.8 }}>
              <li>Download WiFi Analyzer (free — Google Play or App Store)</li>
              <li>Take three screenshots: Access Points, 2.4 GHz graph, 5 GHz graph</li>
              <li>Go to Crow&apos;s Eye and upload your screenshots</li>
              <li>Enter your subscriber code to unlock your free full Verdict</li>
            </ol>
          </div>
          <a href="/crows-eye" onClick={handleGoToCrowsEye} style={{ display: "inline-block", background: "#B8922A", color: "#0D1520", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>
            Go to Crow&apos;s Eye →
          </a>
        </div>
        <div style={{ background: "rgba(0,194,199,0.04)", border: "1px solid rgba(0,194,199,0.1)", borderRadius: "12px", padding: "16px 20px" }}>
          <p style={{ color: "#555555", fontSize: "12px", lineHeight: 1.6 }}>
            Ready for more? <a href="/#pricing" style={{ color: "#00C2C7" }}>Upgrade to Nest</a> for 3 Verdicts/month, Small Reckonings, and the full Corvus platform.
          </p>
        </div>
      </div>
    );
  }

  function renderTabContent() {
    if (isFledgling) {
      switch (activeTab as SubTab) {
        case "chat":     return renderChat();
        case "crow":     return renderFledglingVerdict();
        case "settings": return <SettingsTab code={storedCode} isVIP={false} />;
        case "help":     return renderHelp();
        default:         return renderChat();
      }
    }
    if (isVIP) {
      switch (activeTab as VIPTab) {
        case "overview":   return renderOverview();
        case "crow":       return renderCrowsEye();
        case "reports":    return renderReports();
        case "analytics":  return renderAnalytics();
        case "codes":      return renderVipCodes();
        case "team":       return renderVipTeamActivity();
        case "products":   return renderProducts();
        case "chat":       return renderChat();
        case "settings":   return <SettingsTab code={storedCode} isVIP={isVIP} />;
        case "help":       return renderHelp();
        default:           return renderOverview();
      }
    }
    switch (activeTab as SubTab) {
      case "overview":   return renderOverview();
      case "crow":       return renderCrowsEye();
      case "reports":    return renderReports();
      case "analytics":  return renderAnalytics();
      case "credits":    return renderCredits();
      case "team":       return renderTeam();
      case "billing":    return renderBilling();
      case "products":   return renderProducts();
      case "chat":       return renderChat();
      case "settings":   return <SettingsTab code={storedCode} isVIP={isVIP} />;
      case "help":       return renderHelp();
      default:           return renderOverview();
    }
  }

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 16px 80px" }}>

      {/* Auto-tour on first login */}
      {autoTourLevel && (
        <CorvusTourPlayer
          level={autoTourLevel}
          visitorName={sub?.vip_name?.split(' ')[0] ?? details?.customer_name?.split(' ')[0] ?? undefined}
          onComplete={() => {
            try { localStorage.setItem(`corvus_tour_seen_${storedCode}`, 'true'); } catch { /* */ }
            setAutoTourLevel(null);
          }}
          inline={false}
        />
      )}

      {/* Admin impersonation banner */}
      {isAdminView && (
        <div style={{ background: "#B8922A", color: "#0D1520", borderRadius: "12px", padding: "14px 20px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>
            🔐 ADMIN VIEW — Viewing as <span style={{ fontFamily: "monospace", letterSpacing: "0.08em" }}>{storedCode}</span>
          </p>
          <button onClick={() => { try { localStorage.removeItem("corvus_admin_impersonating"); localStorage.removeItem("corvus_sub_code"); } catch { /* */ } window.location.href = "/admin"; }}
            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(0,0,0,0.3)", borderRadius: "8px", color: "#0D1520", fontSize: "12px", fontWeight: 700, padding: "6px 14px", cursor: "pointer" }}>
            Exit Admin View
          </button>
        </div>
      )}

      {/* Fledgling Banner */}
      {isFledgling && (
        <div style={{ background: "linear-gradient(135deg, #7A5A1A 0%, #B8922A 50%, #7A5A1A 100%)", borderRadius: "12px", padding: "16px 24px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <p style={{ color: "#0D1520", fontSize: "13px", fontWeight: 800, letterSpacing: "0.1em", margin: "0 0 4px" }}>
              🐦 FLEDGLING — {details?.customer_name ?? "Subscriber"}
            </p>
            <p style={{ color: "rgba(13,21,32,0.7)", fontSize: "12px", margin: 0 }}>
              {fledglingVerdictUsed ? "Free Verdict used · Upgrade to Nest for more" : "1 free Verdict ready · Ask Corvus anything"}
            </p>
          </div>
          <span style={{ color: "#0D1520", fontSize: "11px", fontWeight: 700, background: "rgba(0,0,0,0.12)", borderRadius: "20px", padding: "4px 12px" }}>FLEDGLING</span>
        </div>
      )}

      {/* VIP Gold Banner */}
      {isVIP && (
        <div style={{ background: "linear-gradient(135deg, #B8922A 0%, #D4AF37 50%, #B8922A 100%)", borderRadius: "12px", padding: "18px 24px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <p style={{ color: "#0D1520", fontSize: "13px", fontWeight: 800, letterSpacing: "0.1em", margin: "0 0 4px" }}>
              👑 VIP ACCESS — {sub?.vip_name} · {sub?.vip_title}
            </p>
            <p style={{ color: "rgba(13,21,32,0.7)", fontSize: "12px", margin: 0 }}>{sub?.vip_company} · Unlimited Verdicts · Unlimited Reckonings · Team Lead</p>
          </div>
          <span style={{ color: "#0D1520", fontSize: "11px", fontWeight: 700, background: "rgba(0,0,0,0.12)", borderRadius: "20px", padding: "4px 12px" }}>FOUNDING MEMBER</span>
        </div>
      )}

      {/* Dashboard header */}
      <div style={{ ...card, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", justifyContent: "space-between", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
          <div style={{ position: "relative", width: "44px", height: "44px", flexShrink: 0 }}>
            <Image src="/OCWS_Logo_Transparent.png" alt="OCWS" fill sizes="44px" style={{ objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700 }}>{sub?.customer_name ?? details?.customer_name ?? "Subscriber"}</span>
              {!isVIP && <span style={{ background: tc.color, color: tc.textColor, fontSize: "10px", fontWeight: 800, letterSpacing: "0.18em", padding: "3px 10px", borderRadius: "20px" }}>{tc.label}</span>}
              {isVIP && <span style={{ background: "linear-gradient(90deg, #B8922A, #D4AF37)", color: "#0D1520", fontSize: "10px", fontWeight: 800, letterSpacing: "0.18em", padding: "3px 10px", borderRadius: "20px" }}>VIP</span>}
              {!isSubType && !isVIP && (sub?.type === "admin" || sub?.type === "founder") && <span style={{ background: "rgba(184,146,42,0.15)", color: "#B8922A", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", padding: "3px 8px", borderRadius: "20px", border: "1px solid rgba(184,146,42,0.3)" }}>{sub.type.toUpperCase()} ACCESS</span>}
            </div>
            <p style={{ color: "#888888", fontSize: "12px", marginTop: "2px" }}>Corvus Subscriber Dashboard</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>ID</span>
            <span style={{ color: "#ffffff", fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.08em" }}>{codeVisible ? storedCode : "••••••••••••••"}</span>
            <button onClick={() => setCodeVisible(v => !v)} style={{ background: "none", border: "none", color: "#00C2C7", fontSize: "11px", cursor: "pointer", padding: "2px 6px" }}>{codeVisible ? "Hide" : "Show"}</button>
          </div>
          <AudioToggle />
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888888", fontSize: "12px", padding: "6px 14px", cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      {/* Corvus greeting panel */}
      <CorvusDashGreeting
        storedCode={storedCode}
        reportsCount={reports.length}
        teamReportsCount={isVIP ? vipTeamActivity.length : teamActivity.length}
        activeSubordinatesCount={vipSubordinates.filter(s => s.active).length}
        verdictsRemaining={verdictsRemaining}
        isVIP={isVIP}
        isSubType={isSubType}
        tier={tier}
        customerName={sub?.customer_name ?? details?.customer_name ?? null}
        vipCompany={sub?.vip_company ?? null}
      />

      {/* Tab navigation */}
      <TabBar tabs={tabs as { id: AnyTab; label: string }[]} active={activeTab} onSelect={navigateTab} />

      {/* Tab content */}
      {renderTabContent()}

      {/* Member detail modal */}
      {memberModalCode && teamReport && (() => {
        const m = teamReport.memberReports.find((x) => x.code === memberModalCode);
        if (!m) return null;
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
            onClick={(e) => { if (e.target === e.currentTarget) setMemberModalCode(null); }}>
            <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "520px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 4px" }}>Member Detail</p>
                  <p style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, margin: 0 }}>{m.codeMasked}</p>
                  <p style={{ color: "#444444", fontSize: "11px", fontFamily: "monospace", margin: "4px 0 0", letterSpacing: "0.08em" }}>Last active: {m.lastActive ? new Date(m.lastActive).toLocaleDateString() : "Never"}</p>
                </div>
                <button onClick={() => setMemberModalCode(null)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888888", fontSize: "13px", padding: "6px 12px", cursor: "pointer", flexShrink: 0 }}>
                  Close
                </button>
              </div>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "20px" }}>
                {[
                  { label: "Scans",        value: String(m.totalScans),          color: "#00C2C7" },
                  { label: "Critical",     value: String(m.criticalFindings),     color: "#F87171" },
                  { label: "Avg/Scan",     value: String(m.avgFindingsPerScan),   color: "#FBBF24" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "#1A2332", borderRadius: "8px", padding: "10px 12px", textAlign: "center" }}>
                    <p style={{ color: "#555555", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 4px" }}>{s.label}</p>
                    <p style={{ color: s.color, fontSize: "20px", fontWeight: 700, margin: 0, lineHeight: 1 }}>{s.value}</p>
                  </div>
                ))}
              </div>
              {/* Top issues */}
              {m.topIssues.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>Top Issues</p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {m.topIssues.map((issue) => (
                      <span key={issue} style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "20px", color: "#F87171", fontSize: "11px", fontWeight: 600, padding: "3px 10px" }}>
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Locations */}
              {m.locationsScanned.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>Locations ({m.locationsScanned.length})</p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {m.locationsScanned.slice(0, 5).map((loc) => (
                      <span key={loc} style={{ background: "rgba(0,194,199,0.06)", border: "1px solid rgba(0,194,199,0.15)", borderRadius: "20px", color: "#00C2C7", fontSize: "11px", padding: "3px 10px" }}>
                        {loc}
                      </span>
                    ))}
                    {m.locationsScanned.length > 5 && <span style={{ color: "#555555", fontSize: "11px", alignSelf: "center" }}>+{m.locationsScanned.length - 5} more</span>}
                  </div>
                </div>
              )}
              {/* Most used product */}
              <p style={{ color: "#888888", fontSize: "12px" }}>Most used product: <span style={{ color: "#ffffff" }}>{m.mostUsedProduct}</span></p>
              <p style={{ color: "#555555", fontSize: "10px", marginTop: "8px" }}>Period: {teamReport.intervalLabel}</p>
            </div>
          </div>
        );
      })()}

      {/* Invite modal */}
      {showInviteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px" }}>
            <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>Invite Team Member</p>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ color: "#888888", fontSize: "12px", display: "block", marginBottom: "6px" }}>Name</label>
              <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Jane Smith" autoComplete="off" autoCorrect="off" spellCheck={false} style={inputStyle} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "#888888", fontSize: "12px", display: "block", marginBottom: "6px" }}>Email</label>
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="jane@company.com" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} inputMode="email" style={inputStyle} />
            </div>
            {inviteError && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "12px" }}>{inviteError}</p>}
            <p style={{ color: "#555555", fontSize: "11px", marginBottom: "16px", lineHeight: 1.6 }}>A personal access code will be generated and sent to their email.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleInviteMember} disabled={inviting || !inviteName.trim() || !inviteEmail.trim()}
                style={{ flex: 1, background: inviting ? "#0D6E7A" : "#00C2C7", color: "#0D1520", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, padding: "10px", cursor: inviting || !inviteName.trim() || !inviteEmail.trim() ? "not-allowed" : "pointer", opacity: !inviteName.trim() || !inviteEmail.trim() ? 0.5 : 1 }}>
                {inviting ? "Sending…" : "Send Invite"}
              </button>
              <button onClick={() => { setShowInviteModal(false); setInviteError(""); setInviteName(""); setInviteEmail(""); }}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888888", fontSize: "13px", padding: "10px 16px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub management confirm modal */}
      {subMgmtConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "440px" }}>
            {subMgmtConfirm === "pause30" || subMgmtConfirm === "pause60" ? (
              <>
                <p style={{ color: "#FBBF24", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>Pause Subscription</p>
                <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Pause for {subMgmtConfirm === "pause30" ? "30" : "60"} days?</p>
                <p style={{ color: "#888888", fontSize: "13px", marginBottom: "20px", lineHeight: 1.6 }}>
                  Your subscription will pause and resume automatically. You keep full access until the end of your current billing period.
                  {details?.current_period_end && ` Current period ends ${fmtDate(details.current_period_end)}.`}
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handlePause(subMgmtConfirm === "pause30" ? 30 : 60)} disabled={subMgmtLoading !== null}
                    style={{ flex: 1, background: "#FBBF24", color: "#0D1520", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, padding: "10px", cursor: "pointer" }}>
                    {subMgmtLoading ? "Pausing…" : "Confirm Pause"}
                  </button>
                  <button onClick={() => setSubMgmtConfirm(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888888", fontSize: "13px", padding: "10px 16px", cursor: "pointer" }}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: "#F87171", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>Cancel Subscription</p>
                <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Are you sure you want to cancel?</p>
                <p style={{ color: "#888888", fontSize: "13px", marginBottom: "20px", lineHeight: 1.6 }}>
                  You&rsquo;ll keep full access until the end of your current billing period.
                  {details?.current_period_end && ` Access ends ${fmtDate(details.current_period_end)}.`}
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleCancel} disabled={subMgmtLoading !== null}
                    style={{ flex: 1, background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)", color: "#F87171", borderRadius: "8px", fontSize: "13px", fontWeight: 700, padding: "10px", cursor: "pointer" }}>
                    {subMgmtLoading ? "Cancelling…" : "Yes, Cancel"}
                  </button>
                  <button onClick={() => setSubMgmtConfirm(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888888", fontSize: "13px", padding: "10px 16px", cursor: "pointer" }}>Keep My Subscription</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Guided tour overlay */}
      {activeTour && (
        <CorvusTour
          tour={activeTour}
          onComplete={() => {
            fetch('/api/tours/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: storedCode, tourId: activeTour.id }),
            }).catch(() => { /* non-fatal */ });
            setActiveTour(null);
          }}
          onSkip={() => setActiveTour(null)}
        />
      )}
    </div>
  );
}
