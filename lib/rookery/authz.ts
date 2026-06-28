import { getDb } from "./db";
import {
  learners,
  supervisors,
  lessons,
  learnerProjects,
  assessments,
  learningSessions,
  certificates,
  aerieFamilies,
  institutionalCourses
} from "./edu-repo";

/**
 * Centralized authorization for the Rookery IPC dispatch — the single place that
 * decides whether the authenticated account may run a channel with given args.
 * Fail-closed: anything not explicitly allowed throws. `dispatch()` calls
 * `enforce()` before invoking a handler.
 *
 * Identity model (matches the existing schema + seed; the ONE seam to change if
 * Josh finalizes a different account↔owner mapping is `ownerSupervisorIds`):
 *   - The authenticated account is a Rookery code with an email (resolved at the
 *     route from @/lib/accounts).
 *   - A learner is owned by its `parent_account_id`, which points at a SUPERVISOR
 *     row keyed by the account email (supervisors.byEmail). `learners.byParentAccount`
 *     already unions direct + aerie-family-linked kids.
 *   - Campus staff additionally manage their `institution_id`.
 *   - Field projects are owned by `owner_account_id` = the account CODE (#4b).
 *   - Admins bypass every check.
 */

export interface DispatchContext {
  account: {
    /** Uppercased Rookery code — identity + Field owner key. */
    code: string;
    /** Lowercased email — resolves the owning supervisor(s). */
    email: string | null;
    isAdmin: boolean;
    /** ocws-site account tier (free/nest/flock/murder/...), for entitlement resolution. */
    tier?: string | null;
    /** Edu-product entitlement from the AccountRecord (Aerie/Academy/Campus). */
    eduProducts?: { aerie?: string | null; academy?: string | null; campus?: string | null } | null;
  } | null;
}

class AuthzError extends Error {}
const deny = (msg: string): never => {
  throw new AuthzError(msg);
};

// ---- Channel policy sets ----

// No account required (catalog / health only — never tenant data).
const PUBLIC = new Set<string>([
  "subjects:list",
  "subjects:get",
  "subjects:bySlug",
  "subjects:childrenOf",
  "system:health",
  // "who am I" — must work for anonymous callers (returns null), so the renderer
  // can check login state before it has a code. Returns only the caller's own id.
  "auth:session",
  "auth:sign-in",
  "auth:sign-out"
]);

// Require isAdmin (cross-tenant or system operations).
const ADMIN_ONLY = new Set<string>([
  "seed:turner-family",
  "seed:campus-demo",
  "seed:academy-demo",
  "learners:list",
  "learners:bySurface",
  "supervisors:list",
  "supervisors:create",
  "supervisors:update",
  "supervisors:linkLearner",
  "supervisors:unlinkLearner",
  "institutions:list",
  "institutions:create",
  "institutions:update",
  "aerieFamilies:list",
  "ferpaAudit:recent",
  "edu-entitlement:grant",
  "field-credits:grant"
]);

// args[n] is a learnerId the account must own.
const LEARNER_ARG: Record<string, number> = {
  "learners:get": 0,
  "learners:update": 0,
  "learners:archive": 0,
  "learners:resetProgress": 0,
  "learners:remove": 0,
  "learnerMemory:forLearner": 0,
  "learnerMemory:byType": 0,
  "lessons:forLearner": 0,
  "learnerProjects:forLearner": 0,
  "assessments:forLearner": 0,
  "learningSessions:forLearner": 0,
  "learningSessions:totalSecondsForLearner": 0,
  "certificates:forLearner": 0,
  "siblingCollaborations:forLearner": 0,
  "curriculum:stateFor": 0,
  "learning:digest:weekly": 0,
  "learning:greeting:offline": 0,
  "learning:chat:remaining": 0,
  "ferpaAudit:byLearner": 0
};

// args[n] is an input object whose `.learnerId` the account must own.
const INPUT_LEARNER: Record<string, number> = {
  "learnerMemory:append": 0,
  "lessons:create": 0,
  "learnerProjects:create": 0,
  "assessments:create": 0,
  "learningSessions:start": 0,
  "certificates:create": 0,
  "learning:lesson:generate": 0,
  "learning:lesson:generate-streaming": 0,
  "learning:project:generate": 0,
  "learning:assessment:generate": 0,
  "learning:recall:grade": 0,
  "learning:remediate:explain": 0,
  "learning:narrative:evaluate": 0,
  "learning:certificate:issue": 0,
  "learning:prompt:build": 0,
  "learning:chat:send": 0
};

// args[n] is a resource id; resolve it to its learnerId, then check ownership.
type EduResource = "lesson" | "eduProject" | "assessment" | "session" | "certificate" | "memory";
const RESOURCE_ARG: Record<string, { type: EduResource; arg: number }> = {
  "lessons:get": { type: "lesson", arg: 0 },
  "lessons:markStarted": { type: "lesson", arg: 0 },
  "lessons:markCompleted": { type: "lesson", arg: 0 },
  "lessons:accumulateTime": { type: "lesson", arg: 0 },
  "lessons:remove": { type: "lesson", arg: 0 },
  "learnerProjects:get": { type: "eduProject", arg: 0 },
  "learnerProjects:update": { type: "eduProject", arg: 0 },
  "learnerProjects:remove": { type: "eduProject", arg: 0 },
  "siblingCollaborations:forProject": { type: "eduProject", arg: 0 },
  "assessments:get": { type: "assessment", arg: 0 },
  "assessments:submitResponses": { type: "assessment", arg: 0 },
  "assessments:grade": { type: "assessment", arg: 0 },
  "learning:assessment:grade": { type: "assessment", arg: 0 },
  "learningSessions:get": { type: "session", arg: 0 },
  "learningSessions:end": { type: "session", arg: 0 },
  "certificates:get": { type: "certificate", arg: 0 },
  "learnerMemory:remove": { type: "memory", arg: 0 }
};

// Field: args[n] is a Field projectId the account's CODE must own.
const FIELD_PROJECT_ARG: Record<string, number> = {
  "projects:get": 0,
  "projects:update": 0,
  "projects:remove": 0,
  "sites:listByProject": 0,
  "verdicts:listByProject": 0,
  "reckonings:listByProject": 0,
  "networkPlans:listByProject": 0,
  "deviceBuilds:listByProject": 0
};

// Field: args[n] is a child-row id; resolve to its project, check ownership.
const FIELD_RESOURCE_ARG: Record<string, { table: string; arg: number }> = {
  "sites:get": { table: "sites", arg: 0 },
  "sites:update": { table: "sites", arg: 0 },
  "sites:remove": { table: "sites", arg: 0 },
  "verdicts:remove": { table: "verdicts", arg: 0 },
  "reckonings:remove": { table: "reckoning_captures", arg: 0 },
  "networkPlans:update": { table: "network_plans", arg: 0 },
  "networkPlans:remove": { table: "network_plans", arg: 0 },
  "deviceBuilds:update": { table: "device_builds", arg: 0 },
  "deviceBuilds:remove": { table: "device_builds", arg: 0 }
};

// Field: args[n] is an input object whose `.projectId` the account must own.
const FIELD_INPUT_PROJECT: Record<string, number> = {
  "sites:create": 0,
  "verdicts:create": 0,
  "reckonings:create": 0,
  "networkPlans:create": 0,
  "deviceBuilds:create": 0
};

// args[n] is an institutionId the account must manage (admin or staff of it).
const INSTITUTION_ARG: Record<string, number> = {
  "institutions:get": 0,
  "institutions:childrenOf": 0,
  "supervisors:byInstitution": 0,
  "institutionalCourses:byInstitution": 0,
  "ferpaAudit:byInstitution": 0,
  "campus:importRunsByInstitution": 0,
  "learners:byInstitution": 0
};

// args[n] is an aerie_families id the account must own (primary/secondary).
const FAMILY_ARG: Record<string, number> = {
  "aerieFamilies:get": 0,
  "aerieFamilies:update": 0,
  "aerieFamilies:setPin": 0,
  "aerieFamilies:clearPin": 0,
  "aerieFamilies:verifyPin": 0,
  "aerieFamilies:linkSecondary": 0,
  "aerieFamilies:unlinkSecondary": 0
};

// ---- Ownership resolvers ----

async function ownerSupervisorIds(ctx: DispatchContext): Promise<string[]> {
  if (!ctx.account?.email) return [];
  const sup = await supervisors.byEmail(ctx.account.email);
  return sup ? [sup.id] : [];
}

async function ownerSupervisor(ctx: DispatchContext) {
  if (!ctx.account?.email) return null;
  return supervisors.byEmail(ctx.account.email);
}

/** All learner ids this account may see: own kids (direct + family) + institution roster + code-keyed. */
async function visibleLearnerIds(ctx: DispatchContext): Promise<Set<string>> {
  const ids = new Set<string>();
  const supIds = await ownerSupervisorIds(ctx);
  for (const supId of supIds) {
    for (const l of await learners.byParentAccount(supId)) ids.add(l.id);
  }
  // Some flows may store the account code directly as parent_account_id.
  if (ctx.account?.code) {
    for (const l of await learners.byParentAccount(ctx.account.code)) ids.add(l.id);
  }
  // Campus staff see their institution's roster.
  const sup = await ownerSupervisor(ctx);
  if (sup?.institutionId) {
    for (const l of await learners.byInstitution(sup.institutionId)) ids.add(l.id);
  }
  return ids;
}

async function resolveResourceLearner(type: EduResource, id: string): Promise<string | null> {
  switch (type) {
    case "lesson":
      return (await lessons.get(id))?.learnerId ?? null;
    case "eduProject":
      return (await learnerProjects.get(id))?.learnerId ?? null;
    case "assessment":
      return (await assessments.get(id))?.learnerId ?? null;
    case "session":
      return (await learningSessions.get(id))?.learnerId ?? null;
    case "certificate":
      return (await certificates.get(id))?.learnerId ?? null;
    case "memory": {
      const r = await getDb().execute({
        sql: "SELECT learner_id FROM learner_memory WHERE id = ?",
        args: [id]
      });
      return r.rows[0] ? String(r.rows[0].learner_id) : null;
    }
  }
}

/** Field project owner_account_id for a child row in `table`, or for a project id. */
async function fieldProjectOwner(projectId: string): Promise<string | null> {
  const r = await getDb().execute({
    sql: "SELECT owner_account_id FROM projects WHERE id = ?",
    args: [projectId]
  });
  if (!r.rows[0]) return null;
  const v = r.rows[0].owner_account_id;
  return v == null ? null : String(v);
}

async function fieldChildProjectId(table: string, id: string): Promise<string | null> {
  // table is from a fixed internal allowlist (FIELD_RESOURCE_ARG) — never user input.
  const r = await getDb().execute({ sql: `SELECT project_id FROM ${table} WHERE id = ?`, args: [id] });
  return r.rows[0] ? String(r.rows[0].project_id) : null;
}

async function managesInstitution(ctx: DispatchContext, instId: string): Promise<boolean> {
  const sup = await ownerSupervisor(ctx);
  return !!sup?.institutionId && sup.institutionId === instId;
}

async function ownsFamily(ctx: DispatchContext, familyId: string): Promise<boolean> {
  const fam = await aerieFamilies.get(familyId);
  if (!fam) return false;
  const supIds = await ownerSupervisorIds(ctx);
  return supIds.includes(fam.primarySupervisorId) || (!!fam.secondarySupervisorId && supIds.includes(fam.secondarySupervisorId));
}

// ---- The enforcer ----

const idArg = (args: unknown[], n: number): string => {
  const v = args[n];
  if (typeof v !== "string" || !v) deny(`Expected an id at arg ${n}`);
  return v as string;
};

/**
 * Throws if the account may not run `channel` with `args`. Admins bypass all.
 * Unauthenticated callers may only run PUBLIC channels.
 */
export async function enforce(channel: string, args: unknown[], ctx: DispatchContext): Promise<void> {
  if (PUBLIC.has(channel)) return;

  const acct = ctx.account;
  if (!acct) deny("Authentication required.");
  if (acct!.isAdmin) return; // admin bypass

  if (ADMIN_ONLY.has(channel)) deny("Admin only.");

  // Learner-id arg → must own that learner.
  if (channel in LEARNER_ARG) {
    const learnerId = idArg(args, LEARNER_ARG[channel]);
    const visible = await visibleLearnerIds(ctx);
    if (!visible.has(learnerId)) deny("Not your learner.");
    return;
  }

  // Input object with .learnerId → must own it.
  if (channel in INPUT_LEARNER) {
    const input = args[INPUT_LEARNER[channel]] as { learnerId?: unknown };
    const learnerId = typeof input?.learnerId === "string" ? input.learnerId : null;
    if (!learnerId) deny("Missing learnerId.");
    const visible = await visibleLearnerIds(ctx);
    if (!visible.has(learnerId!)) deny("Not your learner.");
    return;
  }

  // Resource id → resolve to learner → must own.
  if (channel in RESOURCE_ARG) {
    const { type, arg } = RESOURCE_ARG[channel];
    const learnerId = await resolveResourceLearner(type, idArg(args, arg));
    if (!learnerId) deny("Resource not found.");
    const visible = await visibleLearnerIds(ctx);
    if (!visible.has(learnerId!)) deny("Not your resource.");
    return;
  }

  // Field project id → account code must own the project.
  if (channel in FIELD_PROJECT_ARG) {
    const owner = await fieldProjectOwner(idArg(args, FIELD_PROJECT_ARG[channel]));
    if (owner !== acct!.code) deny("Not your project.");
    return;
  }

  // Field child id → resolve to project → must own.
  if (channel in FIELD_RESOURCE_ARG) {
    const { table, arg } = FIELD_RESOURCE_ARG[channel];
    const projectId = await fieldChildProjectId(table, idArg(args, arg));
    if (!projectId) deny("Resource not found.");
    const owner = await fieldProjectOwner(projectId!);
    if (owner !== acct!.code) deny("Not your project.");
    return;
  }

  // Field input.projectId → must own.
  if (channel in FIELD_INPUT_PROJECT) {
    const input = args[FIELD_INPUT_PROJECT[channel]] as { projectId?: unknown };
    const projectId = typeof input?.projectId === "string" ? input.projectId : null;
    if (!projectId) deny("Missing projectId.");
    const owner = await fieldProjectOwner(projectId!);
    if (owner !== acct!.code) deny("Not your project.");
    return;
  }

  // Institution-scoped management.
  if (channel in INSTITUTION_ARG) {
    const instId = idArg(args, INSTITUTION_ARG[channel]);
    if (!(await managesInstitution(ctx, instId))) deny("Not your institution.");
    return;
  }

  // Family-scoped.
  if (channel in FAMILY_ARG) {
    const familyId = idArg(args, FAMILY_ARG[channel]);
    if (!(await ownsFamily(ctx, familyId))) deny("Not your family.");
    return;
  }

  // ---- Channel-specific checks ----
  switch (channel) {
    case "learners:byParentAccount": {
      const p = idArg(args, 0);
      const supIds = await ownerSupervisorIds(ctx);
      if (p !== acct!.code && !supIds.includes(p)) deny("Not your account.");
      return;
    }
    case "learners:create": {
      const input = args[0] as { parentAccountId?: unknown; institutionId?: unknown };
      const supIds = await ownerSupervisorIds(ctx);
      if (typeof input?.parentAccountId === "string" && (input.parentAccountId === acct!.code || supIds.includes(input.parentAccountId))) return;
      if (typeof input?.institutionId === "string" && (await managesInstitution(ctx, input.institutionId))) return;
      deny("Cannot create a learner outside your account.");
      return;
    }
    case "aerieFamilies:bySupervisor": {
      const supId = idArg(args, 0);
      const supIds = await ownerSupervisorIds(ctx);
      if (!supIds.includes(supId)) deny("Not your supervisor.");
      return;
    }
    case "aerieFamilies:create": {
      const input = args[0] as { primarySupervisorId?: unknown };
      const supIds = await ownerSupervisorIds(ctx);
      if (typeof input?.primarySupervisorId !== "string" || !supIds.includes(input.primarySupervisorId)) {
        deny("Family primary must be your supervisor.");
      }
      return;
    }
    case "supervisors:get":
    case "supervisors:learnerIdsFor": {
      const supId = idArg(args, 0);
      const supIds = await ownerSupervisorIds(ctx);
      if (!supIds.includes(supId)) deny("Not your supervisor.");
      return;
    }
    case "supervisors:byEmail": {
      const email = String(args[0] ?? "").toLowerCase();
      if (email !== (acct!.email ?? "")) deny("Not your email.");
      return;
    }
    case "supervisors:findOrCreateParent": {
      const input = args[0] as { email?: unknown };
      const email = String(input?.email ?? "").toLowerCase();
      if (email !== (acct!.email ?? "")) deny("Not your email.");
      return;
    }
    case "siblingCollaborations:create": {
      const input = args[0] as { primaryLearnerId?: unknown };
      const lid = typeof input?.primaryLearnerId === "string" ? input.primaryLearnerId : null;
      if (!lid) deny("Missing primaryLearnerId.");
      const visible = await visibleLearnerIds(ctx);
      if (!visible.has(lid!)) deny("Not your learner.");
      return;
    }
    case "institutionalCourses:get":
    case "institutionalCourses:update": {
      const course = await institutionalCourses.get(idArg(args, 0));
      if (!course || !(await managesInstitution(ctx, course.institutionId))) deny("Not your course.");
      return;
    }
    case "institutionalCourses:create":
    case "campus:csvCommit": {
      const input = args[0] as { institutionId?: unknown };
      const instId = typeof input?.institutionId === "string" ? input.institutionId : null;
      if (!instId || !(await managesInstitution(ctx, instId))) deny("Not your institution.");
      return;
    }
    case "ferpaAudit:log": {
      const input = args[0] as { institutionId?: unknown };
      const instId = typeof input?.institutionId === "string" ? input.institutionId : null;
      if (!instId || !(await managesInstitution(ctx, instId))) deny("Not your institution.");
      return;
    }
    // Auth-only (any signed-in account): no tenant data leak.
    case "campus:csvPreview": // parses caller-supplied text only
    // Cast voice — costs ElevenLabs credits, so require a signed-in account
    // (rate-limited in dispatch like other channels). No tenant data involved.
    case "tts:speak":
    case "tts:quota":
    case "chat:send":
    case "settings:get":
    case "settings:update":
    // Entitlement channels return ONLY the caller's own entitlement (from ctx).
    case "entitlement:get":
    case "entitlement:refresh":
    case "entitlement:set-email":
    case "edu-entitlement:get":
    case "edu-entitlement:refresh":
    case "field-credits:get":
    case "quota:status":
    // Field create/list are tenant-scoped at the data layer in dispatch():
    // create stamps owner = account code; list filters to the owner's projects.
    case "projects:create":
    case "projects:list":
      return;
    default:
      // Fail closed: an unclassified channel is denied for non-admins.
      deny(`Channel '${channel}' is not permitted for this account.`);
  }
}

export { AuthzError };
