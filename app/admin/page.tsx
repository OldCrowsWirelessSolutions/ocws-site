"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CorvusChat from "@/app/components/CorvusChat";
import CrowsEyeTab from "@/app/components/CrowsEyeTab";
import SettingsTab from "@/app/components/SettingsTab";
import { CORVUS_JOSHUA_DASHBOARD_LOAD } from "@/lib/corvus-ui-strings";

function AdminCrowsEyeTab() {
  return (
    <CrowsEyeTab
      code="CORVUS-ADMIN"
      isVIP={true}
      tier="vip"
      creditsRemaining={999999}
      reckoningCredits={{ small: 999999, standard: 999999, commercial: 999999 }}
    />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SubscriptionTier  = "fledgling" | "nest" | "flock" | "murder";
type SubscriptionStatus = "active" | "cancelled" | "past_due" | "expired";

type PromoType = "verdict" | "reckoning_small" | "reckoning_standard" | "reckoning_commercial" | "reckoning_pro";
type PromoStatus = "active" | "used" | "expired" | "deactivated";

interface PromoCodeRecord {
  code: string;
  type: PromoType;
  createdAt: string;
  note: string;
  used: boolean;
  usedAt: string | null;
  usedBy: string | null;
  expiresAt: string | null;
  deactivated?: boolean;
}

const PROMO_TYPE_LABELS: Record<PromoType, string> = {
  verdict:               "Verdict",
  reckoning_small:       "Small Reckoning",
  reckoning_standard:    "Standard Reckoning",
  reckoning_commercial:  "Commercial Reckoning",
  reckoning_pro:         "Pro Reckoning",
};

function getPromoStatus(p: PromoCodeRecord): PromoStatus {
  if (p.used) return "used";
  if (p.deactivated) return "deactivated";
  if (p.expiresAt && new Date() >= new Date(p.expiresAt)) return "expired";
  return "active";
}

const PROMO_STATUS_COLORS: Record<PromoStatus, string> = {
  active:      "#4ADE80",
  used:        "#888888",
  expired:     "#555555",
  deactivated: "#F87171",
};

interface SeatMemberAdmin { email: string; name: string; addedAt: string; code: string; }

interface SubRecord {
  subscription_id: string;
  customer_email: string;
  customer_name: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  verdicts_used: number;
  extra_verdict_credits: number;
  reckonings_used: { small: number; standard: number; commercial: number };
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  stripe_subscription_id: string | null;
  additionalSeats?: number;
  seatMembers?: SeatMemberAdmin[];
}

type AdminTab = "intel" | "subscribers" | "codes" | "testimonials" | "vip" | "reports" | "products" | "chat" | "crow" | "settings";

const ADMIN_TABS: { id: AdminTab; label: string }[] = [
  { id: "intel",        label: "Platform Intelligence" },
  { id: "subscribers",  label: "Subscribers" },
  { id: "codes",        label: "Codes & Promos" },
  { id: "testimonials", label: "Testimonials" },
  { id: "vip",          label: "VIP Activity" },
  { id: "reports",      label: "Reports" },
  { id: "products",     label: "Products" },
  { id: "chat",         label: "Talk to Corvus" },
  { id: "crow",         label: "🦅 Crow's Eye" },
  { id: "settings",     label: "Settings" },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "SpectrumLife2026!!";

const TIER_COLORS: Record<SubscriptionTier, { bg: string; text: string }> = {
  fledgling: { bg: "#7A5A1A", text: "#ffffff" },
  nest:      { bg: "#00C2C7", text: "#0D1520" },
  flock:     { bg: "#B8922A", text: "#0D1520" },
  murder:    { bg: "#9B1C1C", text: "#ffffff" },
};

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  active:    "#4ADE80",
  cancelled: "#F87171",
  past_due:  "#FBBF24",
  expired:   "#555555",
};

const MONTHLY_VERDICTS: Record<SubscriptionTier, number> = {
  fledgling: 0, nest: 3, flock: 15, murder: 999999,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined, short = false) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", short
    ? { month: "short", day: "numeric", year: "numeric" }
    : { year: "numeric", month: "long", day: "numeric" }
  );
}

function creditsLeft(sub: SubRecord): string {
  const monthly = MONTHLY_VERDICTS[sub.tier];
  if (monthly >= 999999) return "∞";
  return String(Math.max(0, monthly - sub.verdicts_used) + sub.extra_verdict_credits);
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange, badge }: {
  tabs: { id: AdminTab; label: string }[];
  active: AdminTab;
  onChange: (t: AdminTab) => void;
  badge?: Partial<Record<AdminTab, number>>;
}) {
  return (
    <div style={{ overflowX: "auto", marginBottom: "28px" }}>
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0", minWidth: "max-content" }}>
        {tabs.map((t) => {
          const isActive = t.id === active;
          const count = badge?.[t.id];
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              style={{
                padding: "10px 16px",
                fontSize: "12px",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#00C2C7" : "#555555",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid #00C2C7" : "2px solid transparent",
                cursor: "pointer",
                transition: "color 0.15s",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "-1px",
              }}
            >
              {t.label}
              {count != null && count > 0 && (
                <span style={{ background: "#B8922A", color: "#0D1520", fontSize: "9px", fontWeight: 800, padding: "1px 6px", borderRadius: "20px" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Admin Corvus greeting (module-level — must NOT be inside AdminPage) ──────

function AdminCorvusGreeting({
  greetingRef,
  statsReady,
}: {
  greetingRef: React.RefObject<string>;
  statsReady: boolean;
}) {
  const [displayed, setDisplayed] = useState("");
  const [line, setLine] = useState("");
  const startedRef = useRef(false);

  useEffect(() => {
    if (!statsReady || startedRef.current) return;
    const text = greetingRef.current ?? "";
    if (!text) return;
    startedRef.current = true;
    setLine(text);
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [statsReady, greetingRef]);

  if (!line) return null;

  return (
    <div className="corvus-dash-panel" style={{ marginBottom: "20px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/corvus_still.png" className="corvus-dash-avatar" alt="Corvus" />
      <span className="corvus-dash-text">
        {displayed}
        {displayed.length < line.length && (
          <span className="corvus-speech-cursor">▋</span>
        )}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [phase, setPhase]       = useState<"auth" | "dashboard">("auth");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState<AdminTab>("intel");
  const tabInitialized = useRef(false);

  // Founder stats for personalized greeting
  interface FounderStats { totalScans: number; newScans: number; activeSubscribers: number; pendingTestimonials: number; }
  const [founderStats, setFounderStats] = useState<FounderStats | null>(null);
  const dashGreetingRef = useRef("");

  // Lifetime members (Kyle)
  interface LifetimeMemberRecord { code: string; name: string; title: string; company: string; tier: string; creditsMonthly: number; creditsRemaining: number; seats: number; billing: string; note: string; }
  const [lifetimeMembers, setLifetimeMembers] = useState<LifetimeMemberRecord[]>([]);

  const [subscribers, setSubscribers] = useState<SubRecord[]>([]);
  const [loading, setLoading]         = useState(false);
  const [loadError, setLoadError]     = useState("");

  // Generate form
  const [genTier, setGenTier]   = useState<SubscriptionTier>("nest");
  const [genEmail, setGenEmail] = useState("");
  const [genName, setGenName]   = useState("");
  const [generating, setGenerating]   = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [genError, setGenError] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  // Credits form
  const [credSubId, setCredSubId]     = useState("");
  const [credAmount, setCredAmount]   = useState("5");
  const [addingCredits, setAddingCredits] = useState(false);
  const [credFeedback, setCredFeedback]   = useState("");

  // Promo code generator
  type PromoProduct2 = "verdict" | "reckoning_small" | "reckoning_standard" | "reckoning_commercial" | "reckoning_pro" | "all_reckonings" | "both";
  type ExpiryType2   = "single_use" | "24h" | "48h" | "72h" | "7d" | "14d" | "30d";
  const [promoProducts, setPromoProducts] = useState<PromoProduct2>("verdict");
  const [promoExpiryType, setPromoExpiryType] = useState<ExpiryType2>("single_use");
  const [promoNote, setPromoNote]         = useState("");
  const [promoExpires, setPromoExpires]   = useState("");
  const [generatingPromo, setGeneratingPromo]     = useState(false);
  const [generatedPromoCode, setGeneratedPromoCode] = useState("");
  const [promoGenError, setPromoGenError] = useState("");
  const [promoCodes, setPromoCodes]       = useState<PromoCodeRecord[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [promoCopied, setPromoCopied]     = useState(false);

  // Testimonials
  interface PendingTestimonial {
    id: string; name: string; location: string; testimonial: string;
    rating: number; email: string | null; submittedAt: string;
  }
  const [pendingTestimonials, setPendingTestimonials] = useState<PendingTestimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  const [testimonialMsg, setTestimonialMsg]           = useState("");

  // Code revocation
  const [revokeInput, setRevokeInput]   = useState("");
  const [revoking, setRevoking]         = useState(false);
  const [revokeResult, setRevokeResult] = useState("");

  // VIP activity
  interface VIPSubRecord {
    vipCode: string; vipName: string; maxSubordinates: number;
    subordinates: {
      code: string; issuedAt: string; expiresAt: string;
      expiryType: string; active: boolean; usageCount: number;
    }[];
  }
  const [vipData, setVipData]           = useState<VIPSubRecord[]>([]);
  const [loadingVip, setLoadingVip]     = useState(false);
  const [vipPasswords, setVipPasswords] = useState<Record<string, boolean>>({});
  const [resettingPw, setResettingPw]   = useState<string | null>(null);

  // Platform analytics
  interface DailyScanData { date: string; count: number; }
  interface PlatformAnalytics {
    totalScans: number;
    scansToday: number;
    activeSubscriptions: number;
    activeCodes: number;
    totalCritical: number;
    dailyScans: DailyScanData[];
    productBreakdown: Record<string, number>;
    severityBreakdown: Record<string, number>;
    tierBreakdown: Record<string, number>;
  }
  const [platformAnalytics, setPlatformAnalytics]   = useState<PlatformAnalytics | null>(null);
  const [loadingPlatform, setLoadingPlatform]       = useState(false);
  const [platformNarrative, setPlatformNarrative]   = useState("");
  const [loadingNarrative, setLoadingNarrative]     = useState(false);

  // Knowledge base state
  const [knowledgeLastUpdated, setKnowledgeLastUpdated]   = useState<string | null>(null);
  const [knowledgeNextScheduled, setKnowledgeNextScheduled] = useState<string>("");
  const [knowledgeSize, setKnowledgeSize]                 = useState<number | null>(null);
  const [knowledgeUpdating, setKnowledgeUpdating]         = useState(false);
  const [knowledgePreview, setKnowledgePreview]           = useState<string | null>(null);
  const chartsInitRef = useRef(false);

  interface ChatAnalytics {
    totalMessages: number;
    messagesToday: number;
    messagesThisWeek: number;
    topChatters: Array<{ code: string; count: number }>;
  }
  const [chatAnalytics, setChatAnalytics]   = useState<ChatAnalytics | null>(null);
  const [loadingChat, setLoadingChat]       = useState(false);

  // Action feedback
  const [actionMsg, setActionMsg] = useState("");

  // Reports
  type ReportType2 = "verdict" | "reckoning_small" | "reckoning_standard" | "reckoning_commercial" | "reckoning_pro";
  type ReportSeverity2 = "critical" | "warning" | "info";
  interface AdminReportRecord {
    reportId: string;
    type: ReportType2;
    subscriptionId: string | null;
    email: string | null;
    codeUsed: string;
    createdAt: string;
    locationName: string;
    findingCount: number;
    severity: ReportSeverity2;
    reportData: string;
    pdfAvailable: boolean;
  }
  const REPORT_TYPE_LABELS2: Record<ReportType2, string> = {
    verdict:              "Verdict",
    reckoning_small:      "Small Reckoning",
    reckoning_standard:   "Standard Reckoning",
    reckoning_commercial: "Commercial Reckoning",
    reckoning_pro:        "Pro Reckoning",
  };

  const [allReports, setAllReports]           = useState<AdminReportRecord[]>([]);
  const [loadingReports, setLoadingReports]   = useState(false);
  const [expandedAdminReport, setExpandedAdminReport] = useState<string | null>(null);
  const [expandedSubscriber, setExpandedSubscriber]   = useState<string | null>(null);

  // Remote access / impersonation
  const [impersonateCode, setImpersonateCode]       = useState("");
  const [impersonateVisible, setImpersonateVisible] = useState(false);
  const [impersonating, setImpersonating]           = useState(false);
  const [impersonateError, setImpersonateError]     = useState("");

  // ── Tab navigation ─────────────────────────────────────────────────────────

  function navigateTab(t: AdminTab) {
    setActiveTab(t);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${t}`);
    }
  }

  // Read hash on mount (after auth) + listen for FAB hash changes
  useEffect(() => {
    if (phase !== "dashboard") return;
    if (!tabInitialized.current) {
      tabInitialized.current = true;
      const hash = window.location.hash.replace("#", "") as AdminTab;
      const valid = ADMIN_TABS.map(t => t.id);
      if (valid.includes(hash)) setActiveTab(hash);
    }
    function onHashChange() {
      const hash = window.location.hash.replace("#", "") as AdminTab;
      const valid = ADMIN_TABS.map(t => t.id);
      if (valid.includes(hash)) setActiveTab(hash);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [phase]);

  // Fetch founder stats on dashboard load for personalized greeting
  useEffect(() => {
    if (phase !== "dashboard") return;
    fetch("/api/analytics/founder-stats", {
      headers: { "x-admin-key": ADMIN_KEY },
    })
      .then(r => r.ok ? r.json() : null)
      .then((data: FounderStats | null) => {
        if (!data) return;
        setFounderStats(data);
        const lines = CORVUS_JOSHUA_DASHBOARD_LOAD(data.newScans, data.activeSubscribers);
        dashGreetingRef.current = lines[Math.floor(Math.random() * lines.length)];
      })
      .catch(() => { /* non-fatal */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Data load ──────────────────────────────────────────────────────────────

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/admin/subscribers", {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      const subs: SubRecord[] = data.subscribers ?? [];

      const withSeats = await Promise.all(
        subs.map(async (s) => {
          if (s.tier !== "flock" && s.tier !== "murder") return s;
          try {
            const seatRes = await fetch("/api/subscriptions/seat-info", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: s.subscription_id }),
            });
            if (seatRes.ok) {
              const seatData = await seatRes.json() as {
                additionalSeats: number;
                members: SeatMemberAdmin[];
              };
              return { ...s, additionalSeats: seatData.additionalSeats, seatMembers: seatData.members };
            }
          } catch { /* non-fatal */ }
          return s;
        })
      );

      setSubscribers(withSeats);
    } catch {
      setLoadError("Failed to load subscribers. Check connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPromoCodes = useCallback(async () => {
    setLoadingPromos(true);
    try {
      const res = await fetch("/api/admin/promo/list", {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      const data = await res.json();
      setPromoCodes(data.codes ?? []);
    } catch { /* non-fatal */ }
    finally { setLoadingPromos(false); }
  }, []);

  const loadAdminReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const res = await fetch("/api/admin/reports", {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (res.ok) {
        const data = await res.json();
        setAllReports(data.reports ?? []);
      }
    } catch { /* non-fatal */ }
    finally { setLoadingReports(false); }
  }, []);

  const loadVipActivity = useCallback(async () => {
    setLoadingVip(true);
    try {
      const res = await fetch("/api/admin/vip/activity", {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (res.ok) {
        const data = await res.json();
        setVipData(data.vips ?? []);
      }
    } catch { /* non-fatal */ }
    finally { setLoadingVip(false); }
  }, []);

  const loadVipPasswords = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/vip/password-status", {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (res.ok) {
        const data = await res.json() as { statuses?: Record<string, boolean> };
        setVipPasswords(data.statuses ?? {});
      }
    } catch { /* non-fatal */ }
  }, []);

  const loadPlatformAnalytics = useCallback(async () => {
    setLoadingPlatform(true);
    try {
      const res = await fetch("/api/analytics/platform", {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (res.ok) {
        const data = await res.json();
        setPlatformAnalytics(data.analytics ?? null);
      }
    } catch { /* non-fatal */ }
    finally { setLoadingPlatform(false); }
  }, []);

  const loadChatAnalytics = useCallback(async () => {
    setLoadingChat(true);
    try {
      const res = await fetch("/api/analytics/chat", {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (res.ok) setChatAnalytics(await res.json());
    } catch { /* non-fatal */ }
    finally { setLoadingChat(false); }
  }, []);

  const loadPendingTestimonials = useCallback(async () => {
    setLoadingTestimonials(true);
    try {
      const res = await fetch("/api/admin/testimonials/pending", {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingTestimonials(data.testimonials ?? []);
      }
    } catch { /* non-fatal */ }
    finally { setLoadingTestimonials(false); }
  }, []);

  const loadLifetimeMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/lifetime-members", {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (res.ok) {
        const data = await res.json() as { members?: LifetimeMemberRecord[] };
        setLifetimeMembers(data.members ?? []);
      }
    } catch { /* non-fatal */ }
  }, []);

  function loadAll() {
    loadSubscribers();
    loadPromoCodes();
    loadAdminReports();
    loadPendingTestimonials();
    loadVipActivity();
    loadVipPasswords();
    loadPlatformAnalytics();
    loadChatAnalytics();
    loadLifetimeMembers();
  }

  useEffect(() => {
    try {
      if (localStorage.getItem("corvus_admin_auth") === ADMIN_KEY) {
        setPhase("dashboard");
        loadAll();
      }
    } catch { /* */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chart.js rendering when platform analytics load
  useEffect(() => {
    if (!platformAnalytics) return;

    function renderCharts() {
      if (!platformAnalytics) return;
      type ChartType = { new (el: HTMLCanvasElement, cfg: unknown): { destroy(): void } };
      const ChartJS = (window as unknown as { Chart?: ChartType }).Chart;
      if (!ChartJS) return;

      type CanvasWithChart = HTMLCanvasElement & { _chartInstance?: { destroy(): void } };
      ["chart-daily-scans","chart-products","chart-severity","chart-tiers"].forEach((id) => {
        const el = document.getElementById(id) as CanvasWithChart | null;
        if (el?._chartInstance) { el._chartInstance.destroy(); el._chartInstance = undefined; }
      });

      const daily = platformAnalytics.dailyScans ?? [];
      const dailyEl = document.getElementById("chart-daily-scans") as CanvasWithChart | null;
      if (dailyEl) {
        dailyEl._chartInstance = new ChartJS(dailyEl, {
          type: "line",
          data: { labels: daily.map((d) => d.date.slice(5)), datasets: [{ label: "Scans", data: daily.map((d) => d.count), borderColor: "#00C2C7", backgroundColor: "rgba(0,194,199,0.08)", tension: 0.3, fill: true, pointRadius: 3 }] },
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: "#555" }, grid: { color: "rgba(255,255,255,0.04)" } }, y: { ticks: { color: "#555" }, grid: { color: "rgba(255,255,255,0.04)" }, beginAtZero: true } } },
        });
      }

      const prod = platformAnalytics.productBreakdown ?? {};
      const prodLabels = Object.keys(prod);
      const prodEl = document.getElementById("chart-products") as CanvasWithChart | null;
      if (prodEl && prodLabels.length) {
        prodEl._chartInstance = new ChartJS(prodEl, {
          type: "doughnut",
          data: { labels: prodLabels, datasets: [{ data: prodLabels.map((k) => prod[k]), backgroundColor: ["#00C2C7","#B8922A","#9B1C1C","#4ADE80","#FBBF24"], borderWidth: 0 }] },
          options: { responsive: true, plugins: { legend: { labels: { color: "#888", font: { size: 10 } } } } },
        });
      }

      const sev = platformAnalytics.severityBreakdown ?? {};
      const sevEl = document.getElementById("chart-severity") as CanvasWithChart | null;
      if (sevEl) {
        sevEl._chartInstance = new ChartJS(sevEl, {
          type: "bar",
          data: { labels: ["Critical","Warning","Info"], datasets: [{ data: [sev.critical ?? 0, sev.warning ?? 0, sev.info ?? 0], backgroundColor: ["rgba(239,68,68,0.6)","rgba(234,179,8,0.6)","rgba(34,197,94,0.6)"], borderRadius: 4 }] },
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: "#555" }, grid: { display: false } }, y: { ticks: { color: "#555" }, grid: { color: "rgba(255,255,255,0.04)" }, beginAtZero: true } } },
        });
      }

      const tiers = platformAnalytics.tierBreakdown ?? {};
      const tierLabels = Object.keys(tiers);
      const tierEl = document.getElementById("chart-tiers") as CanvasWithChart | null;
      if (tierEl && tierLabels.length) {
        tierEl._chartInstance = new ChartJS(tierEl, {
          type: "doughnut",
          data: { labels: tierLabels, datasets: [{ data: tierLabels.map((k) => tiers[k]), backgroundColor: ["#00C2C7","#B8922A","#9B1C1C","#aaaaaa"], borderWidth: 0 }] },
          options: { responsive: true, plugins: { legend: { labels: { color: "#888", font: { size: 10 } } } } },
        });
      }
    }

    if ((window as unknown as { Chart?: unknown }).Chart) {
      renderCharts();
    } else if (!chartsInitRef.current) {
      chartsInitRef.current = true;
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js";
      script.onload = renderCharts;
      document.head.appendChild(script);
    }
  }, [platformAnalytics]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_KEY) {
      try { localStorage.setItem("corvus_admin_auth", ADMIN_KEY); } catch { /* */ }
      setPhase("dashboard");
      loadAll();
    } else {
      setAuthError("Incorrect password.");
    }
  }

  async function handleImpersonate(e: React.FormEvent) {
    e.preventDefault();
    const code = impersonateCode.trim().toUpperCase();
    if (!code) return;
    setImpersonateError("");
    setImpersonating(true);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ code }),
      });
      const data = await res.json() as { valid?: boolean; subscriptionId?: string };
      if (data.valid) {
        const subCode = data.subscriptionId ?? code;
        try {
          localStorage.setItem("corvus_sub_code", subCode);
          localStorage.setItem("corvus_admin_impersonating", "true");
        } catch { /* */ }
        window.open("/dashboard", "_blank");
        setImpersonateCode("");
      } else {
        setImpersonateError("Code not found in system.");
      }
    } catch {
      setImpersonateError("Connection error. Please try again.");
    } finally {
      setImpersonating(false);
    }
  }

  async function handleResetVipPassword(code: string) {
    if (!confirm(`Reset password for ${code}? They will be prompted to create a new password on next login.`)) return;
    setResettingPw(code);
    try {
      const res = await fetch("/api/admin/vip/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ code }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) {
        flash(`Password reset for ${code}.`);
        loadVipPasswords();
      } else {
        flash(data.error ?? "Reset failed.");
      }
    } catch {
      flash("Connection error.");
    } finally {
      setResettingPw(null);
    }
  }

  function handleLogout() {
    try { localStorage.removeItem("corvus_admin_auth"); } catch { /* */ }
    router.push("/login");
  }

  async function handleDeactivate(subscription_id: string) {
    if (!confirm(`Deactivate ${subscription_id}? This cannot be undone from the dashboard.`)) return;
    try {
      const res = await fetch("/api/admin/codes/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ subscription_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      flash(`Deactivated: ${subscription_id}`);
      loadSubscribers();
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : "Deactivation failed.", true);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!genEmail.trim()) return;
    setGenerating(true);
    setGenError("");
    setGeneratedCode("");
    try {
      const res = await fetch("/api/admin/codes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({
          tier: genTier,
          email: genEmail.trim().toLowerCase(),
          name: genName.trim() || genEmail.trim(),
          send_email: sendEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setGeneratedCode(data.subscription_id);
      setGenEmail("");
      setGenName("");
      loadSubscribers();
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleAddCredits(e: React.FormEvent) {
    e.preventDefault();
    if (!credSubId.trim()) return;
    setAddingCredits(true);
    setCredFeedback("");
    try {
      const res = await fetch("/api/admin/credits/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({
          subscription_id: credSubId.trim().toUpperCase(),
          credits: Number(credAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setCredFeedback(`✓ Added ${credAmount} credits to ${credSubId.trim().toUpperCase()}`);
      setCredSubId("");
      loadSubscribers();
    } catch (e: unknown) {
      setCredFeedback(e instanceof Error ? e.message : "Failed to add credits.");
    } finally {
      setAddingCredits(false);
      setTimeout(() => setCredFeedback(""), 5000);
    }
  }

  async function handleGeneratePromo(e: React.FormEvent) {
    e.preventDefault();
    setGeneratingPromo(true);
    setPromoGenError("");
    setGeneratedPromoCode("");
    setPromoCopied(false);
    const derivedType: PromoType =
      promoProducts === "verdict" ? "verdict"
      : promoProducts === "reckoning_small" ? "reckoning_small"
      : promoProducts === "reckoning_standard" ? "reckoning_standard"
      : promoProducts === "reckoning_commercial" ? "reckoning_commercial"
      : promoProducts === "reckoning_pro" ? "reckoning_pro"
      : "verdict";
    try {
      const res = await fetch("/api/admin/promo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({
          type: derivedType,
          products: promoProducts,
          expiryType: promoExpiryType,
          note: promoNote.trim(),
          expiresAt: promoExpires ? new Date(promoExpires).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setGeneratedPromoCode(data.code);
      setPromoNote("");
      setPromoExpires("");
      loadPromoCodes();
    } catch (e: unknown) {
      setPromoGenError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGeneratingPromo(false);
    }
  }

  async function handleDeactivatePromo(code: string) {
    if (!confirm(`Deactivate promo code ${code}?`)) return;
    try {
      const res = await fetch("/api/admin/promo/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      flash(`Deactivated: ${code}`);
      loadPromoCodes();
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : "Deactivation failed.", true);
    }
  }

  async function handleRevokeCode(e: React.FormEvent) {
    e.preventDefault();
    const code = revokeInput.trim().toUpperCase();
    if (!code) return;
    setRevoking(true);
    setRevokeResult("");
    try {
      const res = await fetch("/api/admin/codes/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ code }),
      });
      const data = await res.json() as { revoked?: boolean; codeType?: string; error?: string };
      if (data.revoked) {
        setRevokeResult(`✓ Code ${code} revoked (${data.codeType ?? "unknown type"}).`);
        setRevokeInput("");
        loadSubscribers();
        loadVipActivity();
      } else {
        setRevokeResult(`✗ ${data.error ?? "Code not found in system."}`);
      }
    } catch {
      setRevokeResult("✗ Connection error. Please try again.");
    } finally {
      setRevoking(false);
      setTimeout(() => setRevokeResult(""), 6000);
    }
  }

  async function handleGetPlatformNarrative() {
    if (!platformAnalytics) return;
    setLoadingNarrative(true);
    setPlatformNarrative("");
    try {
      const res = await fetch("/api/analytics/corvus-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "platform", data: platformAnalytics }),
      });
      const data = await res.json() as { narrative?: string };
      setPlatformNarrative(data.narrative ?? "No briefing returned.");
    } catch {
      setPlatformNarrative("Failed to reach Corvus. Try again.");
    } finally {
      setLoadingNarrative(false);
    }
  }

  async function loadKnowledgeStatus() {
    try {
      const res = await fetch('/api/admin/knowledge/status', {
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      if (res.ok) {
        const data = await res.json() as { lastUpdated: string | null; nextScheduled: string; knowledgeSize: number };
        setKnowledgeLastUpdated(data.lastUpdated);
        setKnowledgeNextScheduled(data.nextScheduled);
        setKnowledgeSize(data.knowledgeSize);
      }
    } catch { /* non-fatal */ }
  }

  async function handleManualKnowledgeUpdate() {
    setKnowledgeUpdating(true);
    setKnowledgePreview(null);
    try {
      const res = await fetch('/api/admin/knowledge/update', {
        method: 'POST',
        headers: { 'x-admin-key': ADMIN_KEY },
      });
      const data = await res.json() as { success?: boolean; preview?: string; error?: string };
      if (data.success) {
        setKnowledgePreview(data.preview ?? 'Update applied.');
        await loadKnowledgeStatus();
      } else {
        setKnowledgePreview(`Error: ${data.error ?? 'Update failed'}`);
      }
    } catch {
      setKnowledgePreview('Network error. Try again.');
    } finally {
      setKnowledgeUpdating(false);
    }
  }

  function flash(msg: string, _isError = false) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 4000);
  }

  async function handleApproveTestimonial(id: string) {
    try {
      const res = await fetch("/api/admin/testimonials/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed");
      setTestimonialMsg("Approved and published.");
      setTimeout(() => setTestimonialMsg(""), 3000);
      loadPendingTestimonials();
    } catch { setTestimonialMsg("Approval failed."); setTimeout(() => setTestimonialMsg(""), 3000); }
  }

  async function handleDenyTestimonial(id: string, name: string) {
    if (!confirm(`Deny and delete testimonial from ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/testimonials/deny", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed");
      setTestimonialMsg("Testimonial denied and deleted.");
      setTimeout(() => setTestimonialMsg(""), 3000);
      loadPendingTestimonials();
    } catch { setTestimonialMsg("Denial failed."); setTimeout(() => setTestimonialMsg(""), 3000); }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  const active             = subscribers.filter(s => s.status === "active");
  const promoActive        = promoCodes.filter(p => getPromoStatus(p) === "active").length;
  const promoUsed          = promoCodes.filter(p => p.used).length;
  const promoDeactivated   = promoCodes.filter(p => (p.deactivated ?? false) && !p.used).length;
  const totalConsumed      = subscribers.reduce((n, s) => n + s.verdicts_used, 0);
  const recentActivity     = [...subscribers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12);

  // ── Shared styles ─────────────────────────────────────────────────────────

  const card: React.CSSProperties = {
    background: "#1A2332",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
  };

  const inp: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    background: "#0D1520",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "7px",
    color: "#ffffff",
    padding: "9px 11px",
    fontSize: "16px",
    outline: "none",
  };

  // ── Auth ──────────────────────────────────────────────────────────────────

  if (phase === "auth") {
    return (
      <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ position: "relative", width: "34px", height: "34px" }}>
                <Image src="/OCWS_Logo_Transparent.png" alt="OCWS" fill sizes="34px" style={{ objectFit: "contain" }} />
              </div>
              <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 700 }}>Corvus Admin</span>
            </div>
            <p style={{ color: "#444444", fontSize: "11px", letterSpacing: "0.1em" }}>RESTRICTED ACCESS</p>
          </div>

          <form onSubmit={handleLogin}
            style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "28px" }}>
            <label style={{ display: "block", color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Admin Password
            </label>
            <input
              type="password"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...inp, marginBottom: authError ? "8px" : "16px" }}
            />
            {authError && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "12px" }}>{authError}</p>}
            <button type="submit"
              style={{ width: "100%", background: "#00C2C7", color: "#0D1520", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Tab content renderers ─────────────────────────────────────────────────

  function renderIntel() {
    return (
      <>
        {/* Platform Intelligence */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>Platform Intelligence</p>
              <p style={{ color: "#555555", fontSize: "12px" }}>30-day usage analytics across all subscribers</p>
            </div>
            <button onClick={loadPlatformAnalytics} disabled={loadingPlatform}
              style={{ background: "rgba(0,194,199,0.08)", border: "1px solid rgba(0,194,199,0.2)", borderRadius: "8px", color: "#00C2C7", fontSize: "12px", padding: "7px 14px", cursor: "pointer" }}>
              {loadingPlatform ? "Loading…" : "↻ Refresh"}
            </button>
          </div>

          {platformAnalytics && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "12px", marginBottom: "24px" }}>
              {([
                { label: "Total Scans",       value: platformAnalytics.totalScans,          color: "#00C2C7" },
                { label: "Scans Today",       value: platformAnalytics.scansToday,          color: "#4ADE80" },
                { label: "Active Subs",       value: platformAnalytics.activeSubscriptions, color: "#B8922A" },
                { label: "Active Codes",      value: platformAnalytics.activeCodes,         color: "#aaaaaa" },
                { label: "Critical Findings", value: platformAnalytics.totalCritical,       color: "#F87171" },
              ] as { label: string; value: number; color: string }[]).map(({ label, value, color }) => (
                <div key={label} style={{ background: "#0D1520", borderRadius: "10px", padding: "14px 16px" }}>
                  <p style={{ color: "#444", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>{label}</p>
                  <p style={{ color, fontSize: "26px", fontWeight: 800, lineHeight: 1 }}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {platformAnalytics && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "16px", marginBottom: "24px" }}>
              <div style={{ background: "#0D1520", borderRadius: "10px", padding: "16px" }}>
                <p style={{ color: "#555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Daily Scans (30 days)</p>
                <canvas id="chart-daily-scans" style={{ maxHeight: "160px" }} />
              </div>
              <div style={{ background: "#0D1520", borderRadius: "10px", padding: "16px" }}>
                <p style={{ color: "#555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Product Breakdown</p>
                <canvas id="chart-products" style={{ maxHeight: "160px" }} />
              </div>
              <div style={{ background: "#0D1520", borderRadius: "10px", padding: "16px" }}>
                <p style={{ color: "#555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Severity Distribution</p>
                <canvas id="chart-severity" style={{ maxHeight: "160px" }} />
              </div>
              <div style={{ background: "#0D1520", borderRadius: "10px", padding: "16px" }}>
                <p style={{ color: "#555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Scans by Tier</p>
                <canvas id="chart-tiers" style={{ maxHeight: "160px" }} />
              </div>
            </div>
          )}

          <div style={{ background: "#0D1520", borderRadius: "10px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: platformNarrative ? "16px" : "0" }}>
              <p style={{ color: "#B8922A", fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Corvus Platform Briefing</p>
              <button
                onClick={handleGetPlatformNarrative}
                disabled={loadingNarrative || !platformAnalytics}
                style={{ background: loadingNarrative ? "rgba(184,146,42,0.08)" : "rgba(184,146,42,0.12)", border: "1px solid rgba(184,146,42,0.3)", borderRadius: "8px", color: "#B8922A", fontSize: "12px", padding: "7px 16px", cursor: loadingNarrative || !platformAnalytics ? "not-allowed" : "pointer", opacity: !platformAnalytics ? 0.4 : 1 }}>
                {loadingNarrative ? "Corvus is thinking…" : "Get Corvus' Briefing"}
              </button>
            </div>
            {platformNarrative && (
              <p style={{ color: "#aaaaaa", fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                {platformNarrative}
              </p>
            )}
            {!platformNarrative && !loadingNarrative && (
              <p style={{ color: "#333333", fontSize: "12px", fontStyle: "italic" }}>
                {platformAnalytics ? "Click the button to get Corvus' intelligence briefing on platform activity." : "Load analytics data first."}
              </p>
            )}
          </div>
        </div>

        {/* Knowledge Base */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>Corvus Knowledge Base</p>
              <p style={{ color: "#555555", fontSize: "12px" }}>RF/wireless technical knowledge injected into every Corvus conversation</p>
            </div>
            <button
              onClick={knowledgeLastUpdated === undefined ? loadKnowledgeStatus : handleManualKnowledgeUpdate}
              disabled={knowledgeUpdating}
              style={{ background: knowledgeUpdating ? "rgba(0,194,199,0.04)" : "rgba(0,194,199,0.08)", border: "1px solid rgba(0,194,199,0.2)", borderRadius: "8px", color: "#00C2C7", fontSize: "12px", padding: "7px 14px", cursor: knowledgeUpdating ? "not-allowed" : "pointer", opacity: knowledgeUpdating ? 0.6 : 1 }}
            >
              {knowledgeUpdating ? "🐦‍⬛ Corvus is learning…" : knowledgeLastUpdated === undefined ? "↻ Check Status" : "⚡ Manual Update"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: "#0D1520", borderRadius: "10px", padding: "14px 16px" }}>
              <p style={{ color: "#444", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Last Updated</p>
              <p style={{ color: "#F4F6F8", fontSize: "13px", fontWeight: 600 }}>
                {knowledgeLastUpdated ? new Date(knowledgeLastUpdated).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Static build — no updates yet"}
              </p>
            </div>
            <div style={{ background: "#0D1520", borderRadius: "10px", padding: "14px 16px" }}>
              <p style={{ color: "#444", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Next Scheduled</p>
              <p style={{ color: "#B8922A", fontSize: "13px", fontWeight: 600 }}>
                {knowledgeNextScheduled || "—"}
              </p>
            </div>
            {knowledgeSize !== null && (
              <div style={{ background: "#0D1520", borderRadius: "10px", padding: "14px 16px" }}>
                <p style={{ color: "#444", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Knowledge Size</p>
                <p style={{ color: "#4ADE80", fontSize: "13px", fontWeight: 600 }}>{(knowledgeSize / 1000).toFixed(1)}k chars</p>
              </div>
            )}
          </div>

          {!knowledgeLastUpdated && knowledgeLastUpdated !== undefined && (
            <button onClick={loadKnowledgeStatus} style={{ background: "rgba(0,194,199,0.06)", border: "1px solid rgba(0,194,199,0.15)", borderRadius: "8px", color: "#00C2C7", fontSize: "12px", padding: "8px 16px", cursor: "pointer", marginBottom: "12px" }}>
              Load Status
            </button>
          )}

          {knowledgePreview && (
            <div style={{ background: "#0D1520", borderRadius: "10px", padding: "14px 16px" }}>
              <p style={{ color: "#444", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>Last Update Preview</p>
              <p style={{ color: "#aaaaaa", fontSize: "12px", lineHeight: 1.6, margin: 0 }}>{knowledgePreview}</p>
            </div>
          )}
        </div>

        {/* Chat Intelligence */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>Chat Intelligence</p>
              <p style={{ color: "#555555", fontSize: "12px" }}>Corvus AI chat usage across all subscribers</p>
            </div>
            <button onClick={loadChatAnalytics} disabled={loadingChat}
              style={{ background: "rgba(0,194,199,0.08)", border: "1px solid rgba(0,194,199,0.2)", borderRadius: "8px", color: "#00C2C7", fontSize: "12px", padding: "7px 14px", cursor: "pointer" }}>
              {loadingChat ? "Loading…" : "↻ Refresh"}
            </button>
          </div>
          {chatAnalytics ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "12px", marginBottom: "20px" }}>
                {([
                  { label: "Total Messages", value: chatAnalytics.totalMessages,    color: "#00C2C7" },
                  { label: "Today",          value: chatAnalytics.messagesToday,    color: "#4ADE80" },
                  { label: "This Week",      value: chatAnalytics.messagesThisWeek, color: "#B8922A" },
                ] as { label: string; value: number; color: string }[]).map(({ label, value, color }) => (
                  <div key={label} style={{ background: "#0D1520", borderRadius: "10px", padding: "14px 16px" }}>
                    <p style={{ color: "#444", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>{label}</p>
                    <p style={{ color, fontSize: "26px", fontWeight: 800, lineHeight: 1 }}>{value}</p>
                  </div>
                ))}
              </div>
              {chatAnalytics.topChatters.length > 0 && (
                <div style={{ background: "#0D1520", borderRadius: "10px", padding: "16px" }}>
                  <p style={{ color: "#555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Top Chatters</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {chatAnalytics.topChatters.slice(0, 5).map(({ code, count }) => (
                      <div key={code} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#888888", fontFamily: "monospace", fontSize: "12px" }}>{code}</span>
                        <span style={{ color: "#00C2C7", fontSize: "12px", fontWeight: 700 }}>{count} msg{count !== 1 ? "s" : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: "#333333", fontSize: "12px", fontStyle: "italic" }}>
              {loadingChat ? "Loading chat analytics…" : "No chat data yet."}
            </p>
          )}
        </div>
      </>
    );
  }

  function renderSubscribers() {
    return (
      <>
        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "14px", marginBottom: "24px" }}>
          {([
            { label: "Active Subscribers", value: active.length,      color: "#00C2C7" },
            { label: "Total Subscribers",  value: subscribers.length, color: "#aaaaaa" },
            { label: "Credits Consumed",   value: totalConsumed,      color: "#B8922A" },
            { label: "Revenue",            value: "$—",               color: "#444444" },
          ] as { label: string; value: string | number; color: string }[]).map(({ label, value, color }) => (
            <div key={label} style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "18px 20px" }}>
              <p style={{ color: "#444444", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>{label}</p>
              <p style={{ color, fontSize: "30px", fontWeight: 800, lineHeight: 1 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Lifetime Members */}
        {lifetimeMembers.length > 0 && (
          <div style={card}>
            <p style={{ color: "#B8922A", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
              Lifetime Members
            </p>
            {lifetimeMembers.map(m => (
              <div key={m.code} style={{ background: "#0D1520", border: "1px solid rgba(184,146,42,0.2)", borderRadius: "10px", padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <p style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>{m.name}</p>
                    <p style={{ color: "#555555", fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.08em" }}>{m.code}</p>
                    <p style={{ color: "#444444", fontSize: "10px", marginTop: "2px" }}>{m.title} · {m.company}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "#B8922A", fontSize: "11px", fontWeight: 700, marginBottom: "2px", textTransform: "capitalize" }}>
                      {m.tier} (Lifetime)
                    </p>
                    <p style={{ color: "#3DBA7A", fontSize: "11px" }}>Active — Lifetime</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <p style={{ color: "#444444", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>Credits Remaining</p>
                    <p style={{ color: "#00C2C7", fontSize: "18px", fontWeight: 800, lineHeight: 1 }}>
                      {m.creditsRemaining} <span style={{ color: "#333333", fontSize: "11px" }}>/ {m.creditsMonthly}</span>
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "#444444", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>Seats</p>
                    <p style={{ color: "#888888", fontSize: "14px", fontWeight: 700 }}>{m.seats}</p>
                  </div>
                  <div>
                    <p style={{ color: "#444444", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>Billing</p>
                    <p style={{ color: "#555555", fontSize: "12px" }}>Lifetime — No Charge</p>
                  </div>
                </div>
                <p style={{ color: "#2a2a2a", fontSize: "10px", fontFamily: "monospace", fontStyle: "italic" }}>{m.note}</p>
              </div>
            ))}
          </div>
        )}

        {/* Subscriber table */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Subscribers ({subscribers.length})
            </p>
            <button onClick={loadSubscribers} disabled={loading}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888888", fontSize: "12px", padding: "7px 14px", cursor: "pointer" }}>
              {loading ? "Loading…" : "↻ Refresh"}
            </button>
          </div>

          {loadError && (
            <p style={{ color: "#F87171", fontSize: "13px", marginBottom: "12px" }}>{loadError}</p>
          )}

          {subscribers.length === 0 && !loading ? (
            <p style={{ color: "#444444", fontSize: "13px", padding: "16px 0" }}>No subscribers found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "700px" }}>
                <thead>
                  <tr>
                    {["Email", "Name", "Tier", "Status", "Credits Left", "Seats", "Code", "Joined", "Actions"].map(h => (
                      <th key={h} style={{ color: "#444444", fontWeight: 600, textAlign: "left", padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(sub => {
                    const seatRules = { fledgling: { included: 1, max: 1 }, nest: { included: 1, max: 1 }, flock: { included: 1, max: 5 }, murder: { included: 5, max: 15 } }[sub.tier] ?? { included: 1, max: 1 };
                    const totalSeats = seatRules.included + (sub.additionalSeats ?? 0);
                    const isExpanded = expandedSubscriber === sub.subscription_id;
                    return (
                      <>
                        <tr key={sub.subscription_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer" }}
                          onClick={() => setExpandedSubscriber(isExpanded ? null : sub.subscription_id)}>
                          <td style={{ color: "#aaaaaa", padding: "10px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {sub.customer_email}
                          </td>
                          <td style={{ color: "#888888", padding: "10px", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {sub.customer_name}
                          </td>
                          <td style={{ padding: "10px" }}>
                            <span style={{ background: TIER_COLORS[sub.tier].bg, color: TIER_COLORS[sub.tier].text, fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: "20px" }}>
                              {sub.tier.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "10px" }}>
                            <span style={{ color: STATUS_COLORS[sub.status], fontSize: "11px", fontWeight: 600 }}>
                              {sub.status}
                            </span>
                          </td>
                          <td style={{ color: "#ffffff", padding: "10px", fontFamily: "monospace", fontWeight: 700 }}>
                            {creditsLeft(sub)}
                          </td>
                          <td style={{ color: "#aaaaaa", padding: "10px", fontFamily: "monospace", fontSize: "11px" }}>
                            {(sub.tier === "flock" || sub.tier === "murder") ? (
                              <span title={`${sub.additionalSeats ?? 0} purchased + ${seatRules.included} included`}>
                                {totalSeats}/{seatRules.max}
                                {(sub.seatMembers?.length ?? 0) > 0 && (
                                  <span style={{ color: "#00C2C7", marginLeft: "4px" }}>
                                    ({sub.seatMembers?.length} member{sub.seatMembers?.length !== 1 ? "s" : ""})
                                  </span>
                                )}
                              </span>
                            ) : "1/1"}
                          </td>
                          <td style={{ color: "#555555", padding: "10px", fontFamily: "monospace", fontSize: "11px", whiteSpace: "nowrap" }}>
                            {sub.subscription_id}
                          </td>
                          <td style={{ color: "#444444", padding: "10px", whiteSpace: "nowrap" }}>
                            {fmtDate(sub.created_at, true)}
                          </td>
                          <td style={{ padding: "10px" }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeactivate(sub.subscription_id); }}
                              disabled={sub.status === "cancelled" || sub.status === "expired"}
                              style={{
                                background: "rgba(248,113,113,0.08)",
                                border: "1px solid rgba(248,113,113,0.2)",
                                borderRadius: "6px",
                                color: (sub.status === "cancelled" || sub.status === "expired") ? "#444444" : "#F87171",
                                fontSize: "11px", padding: "4px 10px",
                                cursor: (sub.status === "cancelled" || sub.status === "expired") ? "not-allowed" : "pointer",
                              }}>
                              Deactivate
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${sub.subscription_id}-exp`}>
                            <td colSpan={9} style={{ padding: "0 10px 12px", background: "rgba(0,0,0,0.2)" }}>
                              <div style={{ padding: "12px", borderRadius: "8px", background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <p style={{ color: "#00C2C7", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                                  Seat Detail — {sub.tier.toUpperCase()}
                                </p>
                                <p style={{ color: "#888888", fontSize: "11px", marginBottom: "8px" }}>
                                  {seatRules.included} included + {sub.additionalSeats ?? 0} purchased = {totalSeats} total (max {seatRules.max})
                                </p>
                                {(sub.seatMembers?.length ?? 0) > 0 ? (
                                  <div>
                                    {sub.seatMembers!.map(m => (
                                      <div key={m.email} style={{ display: "flex", gap: "16px", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap" }}>
                                        <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 600, minWidth: "120px" }}>{m.name}</span>
                                        <span style={{ color: "#888888", fontSize: "11px", minWidth: "160px" }}>{m.email}</span>
                                        <span style={{ color: "#00C2C7", fontSize: "11px", fontFamily: "monospace" }}>{m.code}</span>
                                        <span style={{ color: "#444444", fontSize: "10px" }}>{m.addedAt ? new Date(m.addedAt).toLocaleDateString() : ""}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p style={{ color: "#444444", fontSize: "12px" }}>No seat members invited yet.</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div style={card}>
          <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
            Recent Activity
          </p>
          {recentActivity.length === 0 ? (
            <p style={{ color: "#444444", fontSize: "13px" }}>No activity yet.</p>
          ) : (
            <div>
              {recentActivity.map(sub => (
                <div key={sub.subscription_id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap" }}>
                  <span style={{ color: "#444444", fontSize: "11px", minWidth: "110px", whiteSpace: "nowrap" }}>
                    {fmtDate(sub.created_at, true)}
                  </span>
                  <span style={{ color: "#888888", fontSize: "12px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: "120px" }}>
                    {sub.customer_email}
                  </span>
                  <span style={{ background: TIER_COLORS[sub.tier].bg, color: TIER_COLORS[sub.tier].text, fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em", padding: "2px 7px", borderRadius: "20px", flexShrink: 0 }}>
                    {sub.tier.toUpperCase()}
                  </span>
                  <span style={{ color: STATUS_COLORS[sub.status], fontSize: "11px", fontWeight: 600, flexShrink: 0 }}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Remote Dashboard Access */}
        <div style={card}>
          <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>
            Remote Dashboard Access
          </p>
          <p style={{ color: "#888888", fontSize: "13px", marginBottom: "20px" }}>
            Log in to any subscriber dashboard for support or verification.
          </p>
          <form onSubmit={handleImpersonate} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "480px" }}>
            <div>
              <label style={{ display: "block", color: "#888888", fontSize: "11px", fontWeight: 600, marginBottom: "6px" }}>
                Subscriber Code
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={impersonateVisible ? "text" : "password"}
                  placeholder="OCWS-NEST-XXXXXXXX or CORVUS-NEST"
                  autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="text"
                  value={impersonateCode}
                  onChange={e => setImpersonateCode(e.target.value)}
                  style={{ ...inp, paddingRight: "60px" }}
                />
                <button
                  type="button"
                  onClick={() => setImpersonateVisible(v => !v)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", fontSize: "11px", cursor: "pointer" }}
                >
                  {impersonateVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {impersonateError && (
              <p style={{ color: "#F87171", fontSize: "12px" }}>{impersonateError}</p>
            )}
            <button
              type="submit"
              disabled={impersonating || !impersonateCode.trim()}
              style={{
                padding: "10px 20px",
                background: impersonating || !impersonateCode.trim() ? "#0D6E7A" : "#00C2C7",
                color: "#0D1520", border: "none", borderRadius: "8px",
                fontSize: "13px", fontWeight: 700,
                cursor: impersonating || !impersonateCode.trim() ? "not-allowed" : "pointer",
                alignSelf: "flex-start",
              }}
            >
              {impersonating ? "Connecting..." : "Access Dashboard"}
            </button>
          </form>
          <p style={{ color: "#444444", fontSize: "11px", marginTop: "14px", lineHeight: 1.6 }}>
            Opens subscriber&rsquo;s dashboard in a new tab. Admin session is preserved in this tab.
            A gold banner will appear in the new tab indicating admin view.
          </p>
        </div>
      </>
    );
  }

  function renderCodes() {
    return (
      <>
        {/* Generate + Credits */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "16px", marginBottom: "20px" }}>
          {/* Generate subscription code */}
          <div style={card}>
            <p style={{ color: "#B8922A", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
              Generate Subscription Code
            </p>
            <form onSubmit={handleGenerate}>
              <div style={{ marginBottom: "11px" }}>
                <label style={{ display: "block", color: "#555555", fontSize: "11px", marginBottom: "5px" }}>Tier</label>
                <select value={genTier} onChange={e => setGenTier(e.target.value as SubscriptionTier)} style={{ ...inp }}>
                  <option value="nest">Nest — $20/mo</option>
                  <option value="flock">Flock — $100/mo</option>
                  <option value="murder">Murder — $950/mo</option>
                </select>
              </div>
              <div style={{ marginBottom: "11px" }}>
                <label style={{ display: "block", color: "#555555", fontSize: "11px", marginBottom: "5px" }}>Email *</label>
                <input type="email" value={genEmail} onChange={e => setGenEmail(e.target.value)}
                  placeholder="subscriber@example.com" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} inputMode="email" style={inp} required />
              </div>
              <div style={{ marginBottom: "11px" }}>
                <label style={{ display: "block", color: "#555555", fontSize: "11px", marginBottom: "5px" }}>Name (optional)</label>
                <input type="text" value={genName} onChange={e => setGenName(e.target.value)}
                  placeholder="Full name" autoComplete="off" autoCorrect="off" spellCheck={false} style={inp} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <input type="checkbox" id="sendEmail" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
                  style={{ accentColor: "#00C2C7" }} />
                <label htmlFor="sendEmail" style={{ color: "#888888", fontSize: "12px", cursor: "pointer" }}>
                  Send confirmation email
                </label>
              </div>
              {genError && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "8px" }}>{genError}</p>}
              <button type="submit" disabled={generating || !genEmail.trim()}
                style={{ width: "100%", background: generating || !genEmail.trim() ? "#0D6E7A" : "#B8922A", color: "#0D1520", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: generating || !genEmail.trim() ? "not-allowed" : "pointer" }}>
                {generating ? "Generating…" : "Generate Code"}
              </button>
            </form>
            {generatedCode && (
              <div style={{ marginTop: "14px", background: "#0D1520", border: "1px solid #0D6E7A", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
                <p style={{ color: "#555555", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>Generated Code</p>
                <p style={{ color: "#00C2C7", fontSize: "15px", fontFamily: "monospace", fontWeight: 700 }}>{generatedCode}</p>
              </div>
            )}
          </div>

          {/* Add credits */}
          <div style={card}>
            <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
              Add Verdict Credits
            </p>
            <form onSubmit={handleAddCredits}>
              <div style={{ marginBottom: "11px" }}>
                <label style={{ display: "block", color: "#555555", fontSize: "11px", marginBottom: "5px" }}>Subscription ID</label>
                <input type="text" value={credSubId} onChange={e => setCredSubId(e.target.value)}
                  placeholder="OCWS-NEST-XXXXXXXX" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="text" style={{ ...inp, fontFamily: "monospace" }} />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "#555555", fontSize: "11px", marginBottom: "5px" }}>Credits to Add</label>
                <input type="number" min="1" max="500" value={credAmount}
                  onChange={e => setCredAmount(e.target.value)} style={inp} />
              </div>
              {credFeedback && (
                <p style={{ color: credFeedback.startsWith("✓") ? "#4ADE80" : "#F87171", fontSize: "12px", marginBottom: "8px" }}>
                  {credFeedback}
                </p>
              )}
              <button type="submit" disabled={addingCredits || !credSubId.trim()}
                style={{ width: "100%", background: addingCredits || !credSubId.trim() ? "#0D6E7A" : "#00C2C7", color: "#0D1520", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: addingCredits || !credSubId.trim() ? "not-allowed" : "pointer" }}>
                {addingCredits ? "Adding…" : "Add Credits"}
              </button>
            </form>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "20px", paddingTop: "14px" }}>
              <p style={{ color: "#444444", fontSize: "11px", lineHeight: 1.6 }}>
                Added credits are non-expiring and deplete before the subscriber&rsquo;s monthly allotment.
              </p>
            </div>
          </div>
        </div>

        {/* Code revocation */}
        <div style={card}>
          <p style={{ color: "#F87171", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>
            Revoke Any Code
          </p>
          <p style={{ color: "#888888", fontSize: "12px", marginBottom: "16px" }}>
            Immediately deactivate any subscriber, subordinate, or promo code.
          </p>
          <form onSubmit={handleRevokeCode} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              value={revokeInput}
              onChange={e => setRevokeInput(e.target.value)}
              placeholder="Enter code to revoke (e.g. CORVUS-SUB-X7K2M9)"
              autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="text"
              style={{ ...inp, flex: 1, minWidth: "240px" }}
            />
            <button
              type="submit"
              disabled={revoking || !revokeInput.trim()}
              style={{
                background: revoking || !revokeInput.trim() ? "rgba(248,113,113,0.1)" : "rgba(248,113,113,0.15)",
                border: "1px solid rgba(248,113,113,0.4)",
                borderRadius: "8px", color: "#F87171", fontSize: "13px", fontWeight: 700,
                padding: "9px 20px", cursor: revoking || !revokeInput.trim() ? "not-allowed" : "pointer",
                opacity: !revokeInput.trim() ? 0.5 : 1,
              }}>
              {revoking ? "Revoking…" : "Revoke Code"}
            </button>
          </form>
          {revokeResult && (
            <p style={{ marginTop: "12px", fontSize: "13px", color: revokeResult.startsWith("✓") ? "#4ADE80" : "#F87171" }}>
              {revokeResult}
            </p>
          )}
        </div>

        {/* Promo code generator */}
        <div style={card}>
          <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
            One-Time Promo Codes
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "10px", marginBottom: "20px" }}>
            {([
              { label: "Total",       value: promoCodes.length, color: "#aaaaaa" },
              { label: "Active",      value: promoActive,       color: "#4ADE80" },
              { label: "Used",        value: promoUsed,         color: "#888888" },
              { label: "Deactivated", value: promoDeactivated,  color: "#F87171" },
            ] as { label: string; value: number; color: string }[]).map(({ label, value, color }) => (
              <div key={label} style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px 14px" }}>
                <p style={{ color: "#444", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>{label}</p>
                <p style={{ color, fontSize: "22px", fontWeight: 800, lineHeight: 1 }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px", marginBottom: "20px" }}>
            <form onSubmit={handleGeneratePromo}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", color: "#555555", fontSize: "11px", marginBottom: "8px" }}>Expiry</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" }}>
                  {([
                    { val: "single_use", label: "1 Use" },
                    { val: "24h",  label: "24h" },
                    { val: "48h",  label: "48h" },
                    { val: "72h",  label: "72h" },
                    { val: "7d",   label: "7 days" },
                    { val: "14d",  label: "14 days" },
                    { val: "30d",  label: "30 days" },
                  ] as { val: ExpiryType2; label: string }[]).map(({ val, label }) => (
                    <button key={val} type="button" onClick={() => setPromoExpiryType(val)}
                      style={{ padding: "6px 4px", fontSize: "11px", fontWeight: 600, borderRadius: "6px", cursor: "pointer", background: promoExpiryType === val ? "rgba(0,194,199,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${promoExpiryType === val ? "rgba(0,194,199,0.4)" : "rgba(255,255,255,0.08)"}`, color: promoExpiryType === val ? "#00C2C7" : "#888" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label style={{ color: "#555555", fontSize: "11px" }}>Product</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button type="button" onClick={() => setPromoProducts("both")}
                      style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", cursor: "pointer", background: "rgba(184,146,42,0.1)", border: "1px solid rgba(184,146,42,0.3)", color: "#B8922A" }}>
                      All
                    </button>
                    <button type="button" onClick={() => setPromoProducts("all_reckonings")}
                      style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", cursor: "pointer", background: "rgba(184,146,42,0.06)", border: "1px solid rgba(184,146,42,0.2)", color: "#888" }}>
                      All Reckonings
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {([
                    { val: "verdict",              label: "Single Verdict" },
                    { val: "reckoning_small",      label: "Small Reckoning" },
                    { val: "reckoning_standard",   label: "Standard Reckoning" },
                    { val: "reckoning_commercial", label: "Commercial Reckoning" },
                    { val: "reckoning_pro",        label: "Pro Reckoning" },
                    { val: "all_reckonings",       label: "All Reckonings" },
                    { val: "both",                 label: "Verdict + All Reckonings" },
                  ] as { val: PromoProduct2; label: string }[]).map(({ val, label }) => (
                    <button key={val} type="button" onClick={() => setPromoProducts(val)}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", fontSize: "12px", borderRadius: "7px", cursor: "pointer", textAlign: "left", background: promoProducts === val ? "rgba(0,194,199,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${promoProducts === val ? "rgba(0,194,199,0.35)" : "rgba(255,255,255,0.07)"}`, color: promoProducts === val ? "#00C2C7" : "#888" }}>
                      <span style={{ width: "14px", height: "14px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", background: promoProducts === val ? "#00C2C7" : "transparent", border: `2px solid ${promoProducts === val ? "#00C2C7" : "#444"}`, color: "#0D1520" }}>
                        {promoProducts === val ? "✓" : ""}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", color: "#555555", fontSize: "11px", marginBottom: "5px" }}>Note (who is this for?)</label>
                <input type="text" value={promoNote} onChange={e => setPromoNote(e.target.value)}
                  placeholder="e.g. Reddit giveaway, Nate Farrelly" autoComplete="off" autoCorrect="off" spellCheck={false} style={inp} />
              </div>

              <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px" }}>
                <p style={{ color: "#555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Preview</p>
                <p style={{ color: "#aaa", fontSize: "12px" }}>
                  Valid for: <span style={{ color: "#00C2C7" }}>{promoProducts.replace(/_/g, " ")}</span> ·{" "}
                  Expiry: <span style={{ color: "#00C2C7" }}>{promoExpiryType === "single_use" ? "1 use (no time limit)" : promoExpiryType}</span>
                </p>
              </div>

              {promoGenError && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "8px" }}>{promoGenError}</p>}
              <button type="submit" disabled={generatingPromo}
                style={{ width: "100%", background: generatingPromo ? "#0D6E7A" : "#00C2C7", color: "#0D1520", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: generatingPromo ? "not-allowed" : "pointer" }}>
                {generatingPromo ? "Generating…" : "Generate Code"}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {generatedPromoCode ? (
                <div style={{ background: "#0D1520", border: "1px solid #0D6E7A", borderRadius: "12px", padding: "20px 24px", textAlign: "center", width: "100%" }}>
                  <p style={{ color: "#444", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "10px" }}>Generated Code</p>
                  <p style={{ color: "#00C2C7", fontSize: "17px", fontFamily: "monospace", fontWeight: 800, letterSpacing: "0.08em", marginBottom: "14px", wordBreak: "break-all" }}>
                    {generatedPromoCode}
                  </p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(generatedPromoCode).then(() => { setPromoCopied(true); setTimeout(() => setPromoCopied(false), 2000); }); }}
                    style={{ background: promoCopied ? "rgba(74,222,128,0.15)" : "rgba(0,194,199,0.1)", border: `1px solid ${promoCopied ? "rgba(74,222,128,0.4)" : "rgba(0,194,199,0.3)"}`, borderRadius: "7px", color: promoCopied ? "#4ADE80" : "#00C2C7", fontSize: "12px", fontWeight: 600, padding: "7px 18px", cursor: "pointer" }}>
                    {promoCopied ? "✓ Copied" : "Copy to Clipboard"}
                  </button>
                </div>
              ) : (
                <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px 24px", textAlign: "center", width: "100%" }}>
                  <p style={{ color: "#333", fontSize: "13px" }}>Generated code will appear here</p>
                </div>
              )}
            </div>
          </div>

          {promoCodes.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "700px" }}>
                <thead>
                  <tr>
                    {["Code", "Type", "Note", "Created", "Expires", "Status", "Used By", "Actions"].map(h => (
                      <th key={h} style={{ color: "#444", fontWeight: 600, textAlign: "left", padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {promoCodes.map(p => {
                    const status = getPromoStatus(p);
                    return (
                      <tr key={p.code} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ color: "#00C2C7", padding: "10px", fontFamily: "monospace", fontSize: "11px", whiteSpace: "nowrap" }}>{p.code}</td>
                        <td style={{ color: "#aaa", padding: "10px", whiteSpace: "nowrap" }}>{PROMO_TYPE_LABELS[p.type]}</td>
                        <td style={{ color: "#666", padding: "10px", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.note || "—"}</td>
                        <td style={{ color: "#444", padding: "10px", whiteSpace: "nowrap" }}>{fmtDate(p.createdAt, true)}</td>
                        <td style={{ color: "#444", padding: "10px", whiteSpace: "nowrap" }}>{p.expiresAt ? fmtDate(p.expiresAt, true) : "—"}</td>
                        <td style={{ padding: "10px" }}>
                          <span style={{ color: PROMO_STATUS_COLORS[status], fontSize: "11px", fontWeight: 600 }}>{status}</span>
                        </td>
                        <td style={{ color: "#555", padding: "10px", fontSize: "11px", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.usedBy ?? (p.usedAt ? fmtDate(p.usedAt, true) : "—")}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <button
                            onClick={() => handleDeactivatePromo(p.code)}
                            disabled={status !== "active"}
                            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "6px", color: status === "active" ? "#F87171" : "#444", fontSize: "11px", padding: "4px 10px", cursor: status === "active" ? "pointer" : "not-allowed" }}>
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!loadingPromos && promoCodes.length === 0 && (
            <p style={{ color: "#333", fontSize: "13px", paddingTop: "8px" }}>No promo codes generated yet.</p>
          )}
        </div>
      </>
    );
  }

  function renderTestimonials() {
    return (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
              Pending Testimonials
            </p>
            {pendingTestimonials.length > 0 && (
              <span style={{ background: "#B8922A", color: "#0D1520", fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "20px" }}>
                {pendingTestimonials.length}
              </span>
            )}
          </div>
          <button onClick={loadPendingTestimonials} disabled={loadingTestimonials}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888888", fontSize: "12px", padding: "6px 14px", cursor: "pointer" }}>
            {loadingTestimonials ? "Loading..." : "Refresh"}
          </button>
        </div>
        {testimonialMsg && (
          <p style={{ color: "#4ADE80", fontSize: "12px", marginBottom: "12px" }}>{testimonialMsg}</p>
        )}
        {loadingTestimonials ? (
          <p style={{ color: "#555555", fontSize: "13px", fontFamily: "monospace" }}>Loading testimonials...</p>
        ) : pendingTestimonials.length === 0 ? (
          <p style={{ color: "#444444", fontSize: "13px" }}>No pending testimonials.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {pendingTestimonials.map((t) => (
              <div key={t.id} style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: 700 }}>{t.name}</span>
                    {t.location && <span style={{ color: "#555555", fontSize: "11px", marginLeft: "8px" }}>{t.location}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#B8922A", fontSize: "13px" }}>{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</span>
                    <span style={{ color: "#444444", fontSize: "11px" }}>{new Date(t.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
                <p style={{ color: "#aaaaaa", fontSize: "13px", lineHeight: 1.6, marginBottom: "14px", whiteSpace: "pre-wrap" }}>&ldquo;{t.testimonial}&rdquo;</p>
                {t.email && <p style={{ color: "#444444", fontSize: "11px", marginBottom: "14px" }}>Email: {t.email}</p>}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleApproveTestimonial(t.id)}
                    style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "7px", color: "#4ADE80", fontSize: "12px", fontWeight: 700, padding: "7px 16px", cursor: "pointer" }}>
                    ✓ Approve &amp; Publish
                  </button>
                  <button onClick={() => handleDenyTestimonial(t.id, t.name)}
                    style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "7px", color: "#F87171", fontSize: "12px", fontWeight: 600, padding: "7px 16px", cursor: "pointer" }}>
                    ✕ Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderVIP() {
    return (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <p style={{ color: "#D4AF37", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            VIP Founding Members
          </p>
          <button onClick={loadVipActivity} disabled={loadingVip}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "#888888", fontSize: "11px", padding: "5px 12px", cursor: "pointer" }}>
            {loadingVip ? "Loading…" : "↻ Refresh"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "12px", marginBottom: "20px" }}>
          <div style={{ background: "#0D1520", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "10px", padding: "14px 16px" }}>
            <p style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Total Active Sub Codes</p>
            <p style={{ color: "#D4AF37", fontSize: "24px", fontWeight: 800, margin: 0 }}>
              {vipData.reduce((n, v) => n + v.subordinates.length, 0)}
            </p>
          </div>
          {vipData.map((v) => (
            <div key={v.vipCode} style={{ background: "#0D1520", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "10px", padding: "14px 16px" }}>
              <p style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>{v.vipName.split(" ")[0]}</p>
              <p style={{ color: "#D4AF37", fontSize: "20px", fontWeight: 800, margin: 0 }}>
                {v.subordinates.length}<span style={{ color: "#555555", fontSize: "12px" }}> / {v.maxSubordinates}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Password status per VIP */}
        <div style={{ background: "#0D1520", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
          <p style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            Password Status
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {["CORVUS-NEST","CORVUS-NATE","CORVUS-MIKE","CORVUS-ERIC"].map((code) => {
              const pwSet = vipPasswords[code];
              const isResetting = resettingPw === code;
              return (
                <div key={code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#888888", fontFamily: "monospace", fontSize: "12px" }}>{code}</span>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px",
                      background: pwSet ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)",
                      color: pwSet ? "#4ADE80" : "#555555",
                    }}>
                      {pwSet === undefined ? "—" : pwSet ? "Password Set" : "No Password"}
                    </span>
                  </div>
                  {pwSet && (
                    <button
                      onClick={() => handleResetVipPassword(code)}
                      disabled={isResetting}
                      style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "6px", color: "#F87171", fontSize: "11px", padding: "4px 12px", cursor: isResetting ? "not-allowed" : "pointer", opacity: isResetting ? 0.6 : 1 }}>
                      {isResetting ? "Resetting…" : "Reset Password"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {vipData.map((v) => v.subordinates.length > 0 && (
          <div key={v.vipCode} style={{ marginBottom: "20px" }}>
            <p style={{ color: "#888888", fontSize: "12px", fontWeight: 700, marginBottom: "10px" }}>{v.vipName} ({v.vipCode})</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr>
                    {["Code", "Issued", "Expires", "Type", "Uses", "Status", "Actions"].map(h => (
                      <th key={h} style={{ color: "#444444", fontWeight: 600, textAlign: "left", padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {v.subordinates.map((s) => {
                    const isExpired = new Date() >= new Date(s.expiresAt);
                    return (
                      <tr key={s.code} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ color: "#ffffff", padding: "8px 10px", fontFamily: "monospace", fontSize: "11px" }}>{s.code}</td>
                        <td style={{ color: "#888888", padding: "8px 10px" }}>{new Date(s.issuedAt).toLocaleDateString()}</td>
                        <td style={{ color: "#888888", padding: "8px 10px" }}>{new Date(s.expiresAt).toLocaleDateString()}</td>
                        <td style={{ color: "#888888", padding: "8px 10px", fontFamily: "monospace" }}>{s.expiryType}</td>
                        <td style={{ color: "#ffffff", padding: "8px 10px", fontFamily: "monospace" }}>{s.usageCount}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "10px", background: isExpired ? "rgba(85,85,85,0.15)" : "rgba(74,222,128,0.12)", color: isExpired ? "#555555" : "#4ADE80" }}>
                            {isExpired ? "Expired" : "Active"}
                          </span>
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          {s.active && !isExpired && (
                            <button
                              onClick={async () => {
                                await fetch("/api/admin/codes/revoke", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
                                  body: JSON.stringify({ code: s.code }),
                                });
                                loadVipActivity();
                                flash(`Revoked: ${s.code}`);
                              }}
                              style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "5px", color: "#F87171", fontSize: "10px", padding: "3px 8px", cursor: "pointer" }}>
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {vipData.every(v => v.subordinates.length === 0) && !loadingVip && (
          <p style={{ color: "#444444", fontSize: "13px" }}>No active subordinate codes issued yet.</p>
        )}
      </div>
    );
  }

  function renderReports() {
    return (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>All Reports</p>
            <p style={{ color: "#555555", fontSize: "12px" }}>
              {allReports.length} total across all subscribers
            </p>
          </div>
          <button onClick={loadAdminReports} disabled={loadingReports}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888888", fontSize: "12px", padding: "6px 14px", cursor: loadingReports ? "not-allowed" : "pointer" }}>
            {loadingReports ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loadingReports ? (
          <p style={{ color: "#555555", fontSize: "13px", fontFamily: "monospace" }}>Loading reports...</p>
        ) : allReports.length === 0 ? (
          <p style={{ color: "#555555", fontSize: "13px" }}>No reports yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr>
                  {["Report ID", "Type", "Code Used", "Location", "Date", "Findings", "Severity"].map(h => (
                    <th key={h} style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 10px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allReports.map((r) => (
                  <>
                    <tr
                      key={r.reportId}
                      onClick={() => setExpandedAdminReport(expandedAdminReport === r.reportId ? null : r.reportId)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ color: "#555555", fontSize: "10px", fontFamily: "monospace", padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        {r.reportId}
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ background: "rgba(0,194,199,0.1)", color: "#00C2C7", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", padding: "2px 7px", borderRadius: "20px" }}>
                          {REPORT_TYPE_LABELS2[r.type] ?? r.type}
                        </span>
                      </td>
                      <td style={{ color: "#888888", fontSize: "11px", fontFamily: "monospace", padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        {r.codeUsed}
                      </td>
                      <td style={{ color: "#ffffff", fontSize: "12px", padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.locationName || "—"}
                      </td>
                      <td style={{ color: "#555555", fontSize: "11px", padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap" }}>
                        {fmtDate(r.createdAt)}
                      </td>
                      <td style={{ color: "#888888", fontSize: "12px", padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                        {r.findingCount}
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", padding: "2px 7px", borderRadius: "20px", background: r.severity === "critical" ? "rgba(239,68,68,0.12)" : r.severity === "warning" ? "rgba(234,179,8,0.12)" : "rgba(34,197,94,0.12)", color: r.severity === "critical" ? "#f87171" : r.severity === "warning" ? "#fbbf24" : "#4ade80" }}>
                          {r.severity.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                    {expandedAdminReport === r.reportId && (() => {
                      let parsed: { full_findings?: Array<{ severity: string; title: string; description: string }> } = {};
                      try { parsed = JSON.parse(r.reportData); } catch { /* */ }
                      return (
                        <tr key={`${r.reportId}-exp`}>
                          <td colSpan={7} style={{ padding: "0 10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ background: "#0D1520", borderRadius: "8px", padding: "12px 14px" }}>
                              {parsed.full_findings?.map((f, i) => (
                                <div key={i} style={{ marginBottom: "8px" }}>
                                  <span style={{ color: f.severity === "CRITICAL" ? "#f87171" : f.severity === "GOOD" ? "#4ade80" : "#fbbf24", fontSize: "9px", fontWeight: 700, marginRight: "8px" }}>
                                    {f.severity}
                                  </span>
                                  <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 600 }}>{f.title}</span>
                                  <p style={{ color: "#555555", fontSize: "11px", marginTop: "2px" }}>{f.description}</p>
                                </div>
                              )) ?? <p style={{ color: "#555555", fontSize: "12px" }}>No findings stored.</p>}
                            </div>
                          </td>
                        </tr>
                      );
                    })()}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function renderSettings() {
    return (
      <div>
        {/* Refresh panel */}
        <div style={{ ...card, marginBottom: 20 }}>
          <p style={{ color: "#888888", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Refresh All Data</p>
          <p style={{ color: "#555555", fontSize: "12px", marginBottom: "14px" }}>
            Pull fresh data from Redis across all admin panels.
          </p>
          <button
            onClick={() => { loadAll(); flash("All data refreshed."); }}
            style={{ background: "rgba(0,194,199,0.08)", border: "1px solid rgba(0,194,199,0.2)", borderRadius: "8px", color: "#00C2C7", fontSize: "13px", fontWeight: 600, padding: "9px 20px", cursor: "pointer" }}>
            ↻ Refresh All
          </button>
        </div>

        {/* Session settings shared component */}
        <SettingsTab code="CORVUS-ADMIN" isAdmin={true} />
      </div>
    );
  }

  function renderProducts() {
    const accentGold = "#B8922A";
    const accentCyan = "#00C2C7";

    interface ProductDef {
      id: string; name: string; tagline: string; description: string;
      tiers: string[]; comingSoon?: boolean; accent: string;
    }

    const products: ProductDef[] = [
      {
        id: "verdict",
        name: "Corvus' Verdict",
        tagline: "Real-time RF intelligence scan",
        description: "Instant wireless signal analysis — signal strength, interference, channel congestion, and actionable recommendations. Results in seconds.",
        tiers: ["nest", "flock", "murder", "vip"],
        accent: accentCyan,
      },
      {
        id: "reckoning_small",
        name: "Small Reckoning",
        tagline: "Residential deep-dive survey",
        description: "Comprehensive RF assessment for homes and small spaces. Interference mapping, channel analysis, and full PDF report.",
        tiers: ["flock", "murder", "vip"],
        accent: accentGold,
      },
      {
        id: "reckoning_standard",
        name: "Standard Reckoning",
        tagline: "Commercial baseline survey",
        description: "Full RF baseline for offices and mid-size commercial spaces. Multi-AP interference, tenant isolation, and remediation plan.",
        tiers: ["flock", "murder", "vip"],
        accent: accentGold,
      },
      {
        id: "reckoning_commercial",
        name: "Commercial Reckoning",
        tagline: "Enterprise RF baseline",
        description: "Enterprise-grade survey for large facilities, multi-floor deployments, and complex RF environments. Full remediation roadmap.",
        tiers: ["murder", "vip"],
        accent: "#9B1C1C",
      },
      {
        id: "hybrid",
        name: "Hybrid Survey Mode",
        tagline: "Cross-structure RF analysis",
        description: "Wireless environments spanning multiple structures or mixed indoor/outdoor zones. Inter-building interference and coverage hand-off analysis.",
        tiers: ["nest", "flock", "murder", "vip"],
        accent: accentCyan,
      },
      {
        id: "reckoning_pro",
        name: "Pro Reckoning",
        tagline: "Multi-site portfolio analysis",
        description: "Unified RF assessment across multiple locations with comparative benchmarking and portfolio-level remediation prioritization.",
        tiers: [],
        comingSoon: true,
        accent: accentGold,
      },
      {
        id: "historical",
        name: "Historical Trend Analysis",
        tagline: "RF environment over time",
        description: "Track how wireless environments evolve across multiple scans. Degradation patterns, seasonal interference, and infrastructure drift.",
        tiers: [],
        comingSoon: true,
        accent: accentCyan,
      },
      {
        id: "api",
        name: "API Access",
        tagline: "Integrate Corvus into any stack",
        description: "Programmatic access to Corvus scanning, report generation, and data export. Webhooks, JSON output, and SDK support.",
        tiers: [],
        comingSoon: true,
        accent: "#9B1C1C",
      },
    ];

    const adminCard: React.CSSProperties = {
      background: "#1A2332", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "14px", padding: "20px",
    };

    const tierBadgeColor: Record<string, string> = {
      nest: "#00C2C7", flock: "#B8922A", murder: "#9B1C1C", vip: "#D4AF37",
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={adminCard}>
          <p style={{ color: accentCyan, fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
            Product Catalog
          </p>
          <p style={{ color: "#888888", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
            Full catalog of Corvus products. Active products are live in Crow&rsquo;s Eye. Coming-soon items are roadmap items not yet in production.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {products.map(p => (
            <div key={p.id} style={{
              ...adminCard,
              border: `1px solid ${p.comingSoon ? "rgba(255,255,255,0.07)" : `${p.accent}40`}`,
              opacity: p.comingSoon ? 0.7 : 1,
              display: "flex", flexDirection: "column", gap: "12px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: 700, margin: "0 0 3px" }}>{p.name}</p>
                  <p style={{ color: p.accent, fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>{p.tagline}</p>
                </div>
                {p.comingSoon
                  ? <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.05)", color: "#888", borderRadius: "20px", padding: "2px 10px", fontFamily: "monospace", whiteSpace: "nowrap" }}>🥚 Coming Soon</span>
                  : <span style={{ fontSize: "10px", background: "rgba(74,222,128,0.1)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "20px", padding: "2px 10px", fontFamily: "monospace", whiteSpace: "nowrap" }}>Live</span>
                }
              </div>

              <p style={{ color: "#888888", fontSize: "12px", lineHeight: 1.6, margin: 0 }}>{p.description}</p>

              {!p.comingSoon && (
                <div>
                  <p style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Available on</p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {p.tiers.map(t => (
                      <span key={t} style={{
                        fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "2px 10px", borderRadius: "20px",
                        background: `${tierBadgeColor[t] ?? "#888"}22`,
                        color: tierBadgeColor[t] ?? "#888",
                        border: `1px solid ${tierBadgeColor[t] ?? "#888"}44`,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderAdminChat() {
    return (
      <div style={{ height: "620px" }}>
        <CorvusChat
          code="CORVUS-ADMIN"
          expanded={true}
          isFounder={true}
        />
      </div>
    );
  }

  function renderTabContent() {
    switch (activeTab) {
      case "intel":        return renderIntel();
      case "subscribers":  return renderSubscribers();
      case "codes":        return renderCodes();
      case "testimonials": return renderTestimonials();
      case "vip":          return renderVIP();
      case "reports":      return renderReports();
      case "products":     return renderProducts();
      case "chat":         return renderAdminChat();
      case "crow":         return renderAdminCrowsEye();
      case "settings":     return renderSettings();
    }
  }

  function renderAdminCrowsEye() {
    return (
      <div>
        <AdminCrowsEyeTab />
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "32px 16px 64px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p style={{ color: "#00C2C7", fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Old Crows Wireless Solutions
          </p>
          <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 800, margin: 0 }}>Admin Dashboard</h1>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => navigateTab("settings")}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888888", fontSize: "12px", padding: "7px 14px", cursor: "pointer" }}>
            Settings
          </button>
          <button onClick={handleLogout}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888888", fontSize: "12px", padding: "7px 14px", cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ background: "rgba(0,194,199,0.08)", border: "1px solid rgba(0,194,199,0.25)", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", color: "#00C2C7", fontSize: "13px" }}>
          {actionMsg}
        </div>
      )}

      {/* Corvus founder greeting */}
      <AdminCorvusGreeting greetingRef={dashGreetingRef} statsReady={founderStats !== null} />

      <TabBar
        tabs={ADMIN_TABS}
        active={activeTab}
        onChange={navigateTab}
        badge={{ testimonials: pendingTestimonials.length }}
      />

      {renderTabContent()}

    </div>
  );
}
