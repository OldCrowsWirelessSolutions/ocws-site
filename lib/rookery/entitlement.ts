import type { DispatchContext } from "./authz";

/**
 * Server entitlement resolver — what a Rookery code is entitled to, per the
 * LOCKED v1 spec (rookery-entitlement-model memory). The renderer calls
 * `entitlement:get` / `edu-entitlement:get` on load to gate UI; this answers them
 * from the account resolved at the route. Wireless/Field tier comes from the
 * account record; edu products (aerie/academy/campus) aren't sold/stored
 * server-side yet → default "none", dev-overridable, admin sees all for testing.
 *
 * This is also the single code home for the pinned pool/cap/credit numbers, so
 * the future monthly-pool enforcement layer + pricing UI read them from here.
 */

export type Tier = "nest" | "flock" | "vip" | "murder" | "admin";
export type AerieLevel = "none" | "family" | "scholar";
export type AcademyLevel = "none" | "subscribed";
export type CampusLevel = "none" | "k12" | "higher_ed" | "both";

export interface Entitlement {
  tier: Tier;
  /** Field is always on for an authenticated account (commercial or course-scoped). */
  field: boolean;
  /** Included Corvus chat turns/month for this tier. -1 = unlimited (survives JSON; Infinity does not). */
  chatPoolPerMonth: number;
  /** Active-project cap for this tier. null = unlimited. */
  projectCap: number | null;
}

export interface EduEntitlement {
  aerie: AerieLevel;
  academy: AcademyLevel;
  campus: CampusLevel;
}

// ---- LOCKED v1 numbers (the pinned spec) ----

const UNLIMITED = -1;

/** Field standalone = the existing Nest/Flock/Murder ladder. vip ≈ flock. */
export const CHAT_POOL_BY_TIER: Record<Tier, number> = {
  nest: 250,
  flock: 1000,
  vip: 1000,
  murder: UNLIMITED,
  admin: UNLIMITED
};

export const PROJECT_CAP_BY_TIER: Record<Tier, number | null> = {
  nest: 5,
  flock: 25,
  vip: 25,
  murder: null,
  admin: null
};

/** Edu monthly chat pools (the real product cap; ratelimit.ts backstop is separate/higher). */
export const EDU_CHAT_POOL = { aerieKid: 250, academy: 400, campusSeat: 250 } as const;

/** Field deliverable credit costs (consumed by the high-value outputs). */
export const FIELD_DELIVERABLE_CREDITS = {
  verdict: 1,
  networkDesign: { small: 1, standard: 2, commercial: 4 },
  deviceBuild: { draft: 0, small: 2, standard: 4, complex: 6 }
} as const;

/** Map an ocws-site AccountTier → the renderer's wireless Tier. */
function mapAccountTier(t: string | null | undefined): Tier {
  switch (t) {
    case "admin":
    case "orgAdmin":
      return "admin";
    case "murder":
      return "murder";
    case "flock":
    case "teamLead":
    case "subordinate":
      return "flock";
    case "nest":
      return "nest";
    default:
      return "nest"; // free / fledgling → nest baseline
  }
}

export function resolveEntitlement(account: DispatchContext["account"]): Entitlement {
  const tier: Tier = account?.isAdmin ? "admin" : mapAccountTier(account?.tier);
  return {
    tier,
    field: !!account,
    chatPoolPerMonth: CHAT_POOL_BY_TIER[tier],
    projectCap: PROJECT_CAP_BY_TIER[tier]
  };
}

export function resolveEduEntitlement(account: DispatchContext["account"]): EduEntitlement {
  // Admins see everything for testing.
  if (account?.isAdmin) {
    return { aerie: "scholar", academy: "subscribed", campus: "both" };
  }
  // Source of truth: the eduProducts stored on the AccountRecord (set by the
  // Stripe edu_purchase webhook or the admin grant channel).
  const ep = account?.eduProducts;
  if (ep) {
    return {
      aerie: (ep.aerie as AerieLevel) || "none",
      academy: (ep.academy as AcademyLevel) || "none",
      campus: (ep.campus as CampusLevel) || "none"
    };
  }
  // No purchase on file → none, with dev-env overrides that mirror the desktop
  // resolver (ROOKERY_DEV_AERIE / _ACADEMY / _CAMPUS) for local testing.
  const aerie = (process.env.ROOKERY_DEV_AERIE as AerieLevel) || "none";
  const academy: AcademyLevel = process.env.ROOKERY_DEV_ACADEMY ? "subscribed" : "none";
  const campus = (process.env.ROOKERY_DEV_CAMPUS as CampusLevel) || "none";
  return { aerie, academy, campus };
}
