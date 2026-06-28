/**
 * Server settings shim — the ocws-site counterpart of the desktop
 * electron/services/settings-store.ts. The desktop version persists to an
 * electron-store JSON file on disk; on the server there is no per-user file
 * (and serverless instances are ephemeral), so this keeps the SAME shape but
 * sources `corvus.model` from env (CORVUS_MODEL) and holds any updates in
 * process memory only. UI prefs (theme/sidebar/sprite/profile) are really a
 * client concern on web — they round-trip through here so the renderer's
 * webBridge calls don't error, but the browser is the real source of truth.
 */

export type Tier = "nest" | "flock" | "vip" | "murder" | "admin";
export type EduAerieLevel = "none" | "family" | "scholar";
export type EduAcademyLevel = "none" | "subscribed";
export type EduCampusLevel = "none" | "k12" | "higher_ed" | "both";

export interface RookerySettings {
  sprite: {
    enabled: boolean;
    showOnStartup: boolean;
    appearance: "video" | "still";
    opacity: number;
    chatterIntervalMs: number;
    position: { x: number; y: number } | null;
  };
  corvus: {
    model: string;
    extraSystemNotes: string;
    showReasoning: "auto" | "always" | "never";
  };
  ui: {
    theme: "dark" | "light";
    sidebarCollapsed: boolean;
    lastProduct: "field" | "aerie" | "academy" | "campus" | null;
    aerieActiveProfile:
      | { kind: "unset" }
      | { kind: "parent" }
      | { kind: "child"; learnerId: string };
  };
  entitlement: {
    customerEmail: string | null;
    cachedTier: Tier;
    lastResolvedAt: number | null;
  };
  eduEntitlement: {
    aerie: EduAerieLevel;
    academy: EduAcademyLevel;
    campus: EduCampusLevel;
    lastResolvedAt: number | null;
  };
}

function makeDefaults(): RookerySettings {
  return {
    sprite: {
      enabled: false,
      showOnStartup: true,
      appearance: "still",
      opacity: 0.95,
      chatterIntervalMs: 0,
      position: null
    },
    corvus: {
      model: process.env.CORVUS_MODEL ?? "claude-sonnet-4-6",
      extraSystemNotes: "",
      showReasoning: "auto"
    },
    ui: {
      theme: "dark",
      sidebarCollapsed: false,
      lastProduct: null,
      aerieActiveProfile: { kind: "unset" }
    },
    entitlement: {
      customerEmail: null,
      cachedTier: "nest",
      lastResolvedAt: null
    },
    eduEntitlement: {
      aerie: "none",
      academy: "none",
      campus: "none",
      lastResolvedAt: null
    }
  };
}

// In-memory store (per server instance). Not durable across serverless cold
// starts — intentional; durable user prefs belong to the ocws-site account
// layer or the browser, not this shim.
let current: RookerySettings = makeDefaults();

export function getSettings(): RookerySettings {
  return current;
}

export function updateSettings(patch: Partial<RookerySettings>): RookerySettings {
  current = {
    sprite: { ...current.sprite, ...(patch.sprite ?? {}) },
    corvus: { ...current.corvus, ...(patch.corvus ?? {}) },
    ui: { ...current.ui, ...(patch.ui ?? {}) },
    entitlement: { ...current.entitlement, ...(patch.entitlement ?? {}) },
    eduEntitlement: { ...current.eduEntitlement, ...(patch.eduEntitlement ?? {}) }
  };
  return current;
}
