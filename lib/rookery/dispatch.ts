import { ensureMigrated } from "./db";
import {
  subjects,
  learners,
  lessons,
  learnerMemory,
  aerieFamilies,
  supervisors,
  institutions,
  institutionalCourses,
  learnerProjects,
  siblingCollaborations,
  assessments,
  learningSessions,
  certificates,
  ferpaAudit,
  campusImportRuns
} from "./edu-repo";
import {
  generateLesson,
  generateProject,
  generateAssessment,
  gradeAssessment,
  gradeRecall,
  generateRemediation,
  summarizeWeek,
  generateNarrativeEvaluation,
  issueCertificate,
  chatWithMentor
} from "./CurriculumGenerator";
import { buildSystemPrompt, offlineGreetingFor } from "./SystemPromptBuilder";
import {
  projects,
  sites,
  verdicts,
  reckonings,
  networkPlans,
  deviceBuilds
} from "./repo";
import { curriculumStateFor } from "./curriculum";
import { getSettings, updateSettings } from "./settings-store";
import { sendCorvusMessage } from "./anthropic";
import { previewCsv, commitCsv } from "./campus-csv-import";
import { seedAcademyDemo, seedCampusDemo, seedTurnerFamily } from "./edu-seed";
import { enforce, type DispatchContext } from "./authz";
import { usageFromResult } from "./cost";
import { checkRateLimit } from "./ratelimit";
import { resolveEntitlement, resolveEduEntitlement } from "./entitlement";

// Channels resolved from the dispatch context (the caller's own account) rather
// than the handlers map — they need ctx.account, which map handlers don't get.
const CTX_CHANNELS = new Set([
  "entitlement:get",
  "entitlement:refresh",
  "entitlement:set-email",
  "edu-entitlement:get",
  "edu-entitlement:refresh",
  "edu-entitlement:grant",
  "auth:session",
  "auth:sign-in",
  "auth:sign-out",
  "field-credits:get",
  "field-credits:grant",
  "quota:status",
  "tts:speak",
  "tts:quota"
]);

export type { DispatchContext };

/**
 * Server dispatch — channel → async repo function, the ocws-site counterpart of
 * the desktop electron/ipc/* handlers and the renderer's webBridge. The
 * /api/rookery/ipc route hands (channel, args) here; the brain runs server-side
 * on Turso.
 *
 * SLICE 1: the verified lesson-flow core (subjects/learners/lessons/memory).
 * Extend with the remaining namespaces + the learning:* generators as they're
 * ported — same shape, one line each.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (...args: any[]) => unknown;

const handlers: Record<string, Handler> = {
  // Seed (demo setup)
  "seed:turner-family": (parentEmail: string) => seedTurnerFamily(parentEmail),
  "seed:campus-demo": () => seedCampusDemo(),
  "seed:academy-demo": (parentEmail: string) => seedAcademyDemo(parentEmail),

  // Subjects
  "subjects:list": () => subjects.list(),
  "subjects:get": (id: string) => subjects.get(id),
  "subjects:bySlug": (slug: string) => subjects.bySlug(slug),
  "subjects:childrenOf": (parentId: string) => subjects.childrenOf(parentId),

  // Learners
  "learners:list": (includeArchived = false) => learners.list(includeArchived),
  "learners:get": (id: string) => learners.get(id),
  "learners:bySurface": (surface: string) => learners.bySurface(surface),
  "learners:byParentAccount": (p: string) => learners.byParentAccount(p),
  "learners:byInstitution": (i: string) => learners.byInstitution(i),
  "learners:create": (input: Parameters<typeof learners.create>[0]) => learners.create(input),
  "learners:update": (id: string, patch: Parameters<typeof learners.update>[1]) => learners.update(id, patch),
  "learners:archive": (id: string) => learners.archive(id),
  "learners:resetProgress": (id: string) => learners.resetProgress(id),
  "learners:remove": (id: string) => learners.remove(id),

  // Learner memory
  "learnerMemory:forLearner": (id: string, limit?: number) => learnerMemory.forLearner(id, limit ?? 200),
  "learnerMemory:byType": (id: string, type: Parameters<typeof learnerMemory.byType>[1], limit?: number) =>
    learnerMemory.byType(id, type, limit ?? 50),
  "learnerMemory:append": (input: Parameters<typeof learnerMemory.append>[0]) => learnerMemory.append(input),
  "learnerMemory:remove": (id: string) => learnerMemory.remove(id),

  // Lessons
  "lessons:forLearner": (id: string, limit?: number) => lessons.forLearner(id, limit ?? 50),
  "lessons:get": (id: string) => lessons.get(id),
  "lessons:create": (input: Parameters<typeof lessons.create>[0]) => lessons.create(input),
  "lessons:markStarted": (id: string) => lessons.markStarted(id),
  "lessons:markCompleted": (id: string) => lessons.markCompleted(id),
  "lessons:accumulateTime": (id: string, seconds: number) => lessons.accumulateTime(id, seconds),
  "lessons:remove": (id: string) => lessons.remove(id),

  // Aerie families
  "aerieFamilies:list": () => aerieFamilies.list(),
  "aerieFamilies:get": (id: string) => aerieFamilies.get(id),
  "aerieFamilies:bySupervisor": (supervisorId: string) => aerieFamilies.bySupervisor(supervisorId),
  "aerieFamilies:create": (input: Parameters<typeof aerieFamilies.create>[0]) => aerieFamilies.create(input),
  "aerieFamilies:update": (id: string, patch: Parameters<typeof aerieFamilies.update>[1]) =>
    aerieFamilies.update(id, patch),
  "aerieFamilies:setPin": (id: string, pin: string) => aerieFamilies.setPin(id, pin),
  "aerieFamilies:clearPin": (id: string) => aerieFamilies.clearPin(id),
  "aerieFamilies:verifyPin": (id: string, pin: string) => aerieFamilies.verifyPin(id, pin),
  "aerieFamilies:linkSecondary": (familyId: string, supervisorId: string) =>
    aerieFamilies.linkSecondary(familyId, supervisorId),
  "aerieFamilies:unlinkSecondary": (familyId: string) => aerieFamilies.unlinkSecondary(familyId),

  // Supervisors
  "supervisors:list": () => supervisors.list(),
  "supervisors:get": (id: string) => supervisors.get(id),
  "supervisors:byEmail": (email: string) => supervisors.byEmail(email),
  "supervisors:byInstitution": (institutionId: string) => supervisors.byInstitution(institutionId),
  "supervisors:create": (input: Parameters<typeof supervisors.create>[0]) => supervisors.create(input),
  "supervisors:update": (id: string, patch: Parameters<typeof supervisors.update>[1]) =>
    supervisors.update(id, patch),
  "supervisors:linkLearner": async (supervisorId: string, learnerId: string, relationship: string | null) => {
    await supervisors.linkLearner(supervisorId, learnerId, relationship);
    return true;
  },
  "supervisors:unlinkLearner": async (supervisorId: string, learnerId: string) => {
    await supervisors.unlinkLearner(supervisorId, learnerId);
    return true;
  },
  "supervisors:learnerIdsFor": (supervisorId: string) => supervisors.learnerIdsFor(supervisorId),
  "supervisors:findOrCreateParent": async (input: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  }) => {
    const email = input.email.trim();
    if (!email) throw new Error("Email is required.");
    const existing = await supervisors.byEmail(email);
    if (existing) return existing;
    return supervisors.create({
      surface: "aerie",
      role: "parent",
      email,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      institutionId: null,
      hierarchyScopeJson: null
    });
  },

  // Institutions
  "institutions:list": () => institutions.list(),
  "institutions:get": (id: string) => institutions.get(id),
  "institutions:childrenOf": (parentId: string) => institutions.childrenOf(parentId),
  "institutions:create": (input: Parameters<typeof institutions.create>[0]) => institutions.create(input),
  "institutions:update": (id: string, patch: Parameters<typeof institutions.update>[1]) =>
    institutions.update(id, patch),

  // Institutional courses
  "institutionalCourses:byInstitution": (institutionId: string) =>
    institutionalCourses.byInstitution(institutionId),
  "institutionalCourses:get": (id: string) => institutionalCourses.get(id),
  "institutionalCourses:create": (input: Parameters<typeof institutionalCourses.create>[0]) =>
    institutionalCourses.create(input),
  "institutionalCourses:update": (id: string, patch: Parameters<typeof institutionalCourses.update>[1]) =>
    institutionalCourses.update(id, patch),

  // Learner projects
  "learnerProjects:forLearner": (learnerId: string, limit?: number) =>
    learnerProjects.forLearner(learnerId, limit ?? 50),
  "learnerProjects:get": (id: string) => learnerProjects.get(id),
  "learnerProjects:create": (input: Parameters<typeof learnerProjects.create>[0]) =>
    learnerProjects.create(input),
  "learnerProjects:update": (id: string, patch: Parameters<typeof learnerProjects.update>[1]) =>
    learnerProjects.update(id, patch),
  "learnerProjects:remove": (id: string) => learnerProjects.remove(id),

  // Sibling collaborations
  "siblingCollaborations:forProject": (projectId: string) => siblingCollaborations.forProject(projectId),
  "siblingCollaborations:forLearner": (learnerId: string) => siblingCollaborations.forLearner(learnerId),
  "siblingCollaborations:create": (input: Parameters<typeof siblingCollaborations.create>[0]) =>
    siblingCollaborations.create(input),

  // Assessments
  "assessments:forLearner": (learnerId: string, limit?: number) =>
    assessments.forLearner(learnerId, limit ?? 50),
  "assessments:get": (id: string) => assessments.get(id),
  "assessments:create": (input: Parameters<typeof assessments.create>[0]) => assessments.create(input),
  "assessments:submitResponses": (id: string, responsesJson: string) =>
    assessments.submitResponses(id, responsesJson),
  "assessments:grade": (id: string, grade: Parameters<typeof assessments.grade>[1]) =>
    assessments.grade(id, grade),

  // Learning sessions
  "learningSessions:forLearner": (learnerId: string, limit?: number) =>
    learningSessions.forLearner(learnerId, limit ?? 100),
  "learningSessions:get": (id: string) => learningSessions.get(id),
  "learningSessions:start": (input: Parameters<typeof learningSessions.start>[0]) =>
    learningSessions.start(input),
  "learningSessions:end": (id: string, patch: Parameters<typeof learningSessions.end>[1] = {}) =>
    learningSessions.end(id, patch),
  "learningSessions:totalSecondsForLearner": (learnerId: string, sinceMs?: number) =>
    learningSessions.totalSecondsForLearner(learnerId, sinceMs),

  // Certificates
  "certificates:forLearner": (learnerId: string) => certificates.forLearner(learnerId),
  "certificates:get": (id: string) => certificates.get(id),
  "certificates:create": (input: Parameters<typeof certificates.create>[0]) => certificates.create(input),

  // FERPA audit
  "ferpaAudit:byInstitution": (institutionId: string, limit?: number) =>
    ferpaAudit.byInstitution(institutionId, limit ?? 500),
  "ferpaAudit:byLearner": (learnerId: string, limit?: number) =>
    ferpaAudit.byLearner(learnerId, limit ?? 200),
  "ferpaAudit:recent": (limit?: number) => ferpaAudit.recent(limit ?? 200),
  "ferpaAudit:log": (input: Parameters<typeof ferpaAudit.log>[0]) => ferpaAudit.log(input),

  // Campus CSV import + import runs
  "campus:csvPreview": (csvText: string) => previewCsv(csvText),
  "campus:csvCommit": (input: Parameters<typeof commitCsv>[0]) => commitCsv(input),
  "campus:importRunsByInstitution": (institutionId: string, limit?: number) =>
    campusImportRuns.byInstitution(institutionId, limit ?? 50),

  // ---- Curriculum brain (Anthropic; runs server-side, key never leaves server)
  "learning:lesson:generate": (input: Parameters<typeof generateLesson>[0]) => generateLesson(input),
  // No SSE server-side yet — streaming requests resolve via the same generator.
  "learning:lesson:generate-streaming": (input: Parameters<typeof generateLesson>[0]) =>
    generateLesson(input),
  "learning:project:generate": (input: Parameters<typeof generateProject>[0]) =>
    generateProject(input),
  "learning:assessment:generate": (input: Parameters<typeof generateAssessment>[0]) =>
    generateAssessment(input),
  "learning:assessment:grade": (assessmentId: string) => gradeAssessment(assessmentId),
  "learning:recall:grade": (input: Parameters<typeof gradeRecall>[0]) => gradeRecall(input),
  "learning:remediate:explain": (input: Parameters<typeof generateRemediation>[0]) =>
    generateRemediation(input),
  "learning:chat:send": (input: Parameters<typeof chatWithMentor>[0]) => chatWithMentor(input),
  "learning:chat:remaining": async (learnerId: string) => {
    const learner = await learners.get(learnerId);
    if (!learner) return { limit: 0, used: 0, remaining: 0 };
    const { eduChatRemaining } = await import("./edu-pool");
    return eduChatRemaining(learnerId, learner.surface);
  },
  "learning:digest:weekly": (learnerId: string) => summarizeWeek(learnerId),
  "learning:narrative:evaluate": (input: Parameters<typeof generateNarrativeEvaluation>[0]) =>
    generateNarrativeEvaluation(input),
  "learning:certificate:issue": (input: Parameters<typeof issueCertificate>[0]) =>
    issueCertificate(input),
  "learning:greeting:offline": (learnerId: string) => offlineGreetingFor(learnerId),
  "learning:prompt:build": async (
    ctx: Parameters<typeof buildSystemPrompt>[0],
    extras?: Parameters<typeof buildSystemPrompt>[1]
  ) => {
    const result = await buildSystemPrompt(ctx, extras ?? {});
    return {
      systemPrompt: result.systemPrompt,
      learnerId: result.learner.id,
      subjectId: result.subject?.id ?? null
    };
  },

  // ---- Field workbench (projects / sites / verdicts / recon / network / device)
  "projects:list": (includeArchived = false) => projects.list(includeArchived),
  "projects:get": (id: string) => projects.get(id),
  "projects:create": (input: Parameters<typeof projects.create>[0]) => projects.create(input),
  "projects:update": (id: string, patch: Parameters<typeof projects.update>[1]) => projects.update(id, patch),
  "projects:remove": (id: string) => projects.remove(id),
  "sites:listByProject": (projectId: string) => sites.listByProject(projectId),
  "sites:get": (id: string) => sites.get(id),
  "sites:create": (input: Parameters<typeof sites.create>[0]) => sites.create(input),
  "sites:update": (id: string, patch: Parameters<typeof sites.update>[1]) => sites.update(id, patch),
  "sites:remove": (id: string) => sites.remove(id),
  "verdicts:listByProject": (projectId: string) => verdicts.listByProject(projectId),
  "verdicts:create": (input: Parameters<typeof verdicts.create>[0]) => verdicts.create(input),
  "verdicts:remove": (id: string) => verdicts.remove(id),
  "reckonings:listByProject": (projectId: string) => reckonings.listByProject(projectId),
  "reckonings:create": (input: Parameters<typeof reckonings.create>[0]) => reckonings.create(input),
  "reckonings:remove": (id: string) => reckonings.remove(id),
  "networkPlans:listByProject": (projectId: string) => networkPlans.listByProject(projectId),
  "networkPlans:create": (input: Parameters<typeof networkPlans.create>[0]) => networkPlans.create(input),
  "networkPlans:update": (id: string, patch: Parameters<typeof networkPlans.update>[1]) =>
    networkPlans.update(id, patch),
  "networkPlans:remove": (id: string) => networkPlans.remove(id),
  "deviceBuilds:listByProject": (projectId: string) => deviceBuilds.listByProject(projectId),
  "deviceBuilds:create": (input: Parameters<typeof deviceBuilds.create>[0]) => deviceBuilds.create(input),
  "deviceBuilds:update": (id: string, patch: Parameters<typeof deviceBuilds.update>[1]) =>
    deviceBuilds.update(id, patch),
  "deviceBuilds:remove": (id: string) => deviceBuilds.remove(id),

  // ---- Curriculum progression
  "curriculum:stateFor": (learnerId: string) => curriculumStateFor(learnerId),

  // ---- Settings (server: corvus.model from env; sprite/ui are client-side on web)
  "settings:get": () => getSettings(),
  "settings:update": (patch: Parameters<typeof updateSettings>[0]) => updateSettings(patch),

  // ---- Chat (Corvus free chat)
  "chat:send": (messages: Parameters<typeof sendCorvusMessage>[0]) => sendCorvusMessage(messages),

  // ---- System
  "system:health": () => ({ ok: true, surface: "server" as const })
};

export function isKnownChannel(channel: string): boolean {
  return Object.prototype.hasOwnProperty.call(handlers, channel);
}

/**
 * Run a channel against the Turso-backed brain. Ensures the schema is migrated,
 * then enforces authorization (authz.enforce — fail-closed, admin-bypass) before
 * invoking the handler. A few channels are tenant-scoped at the data layer
 * (Field projects by owner code) and are handled here rather than in the map.
 */
export async function dispatch(
  channel: string,
  args: unknown[] = [],
  ctx: DispatchContext = { account: null }
): Promise<unknown> {
  await ensureMigrated();
  if (!isKnownChannel(channel) && !CTX_CHANNELS.has(channel)) {
    throw new Error(`Unknown channel: ${channel}`);
  }

  await enforce(channel, args, ctx);

  // Owner-scoped Field handlers need the account code from ctx.
  const acct = ctx.account;

  // Abuse backstop — hard per-account hourly/daily ceiling on LLM channels.
  await checkRateLimit(channel, acct?.code ?? null, acct?.isAdmin ?? false);

  // Context-bound entitlement channels — return only the caller's own view.
  if (channel === "entitlement:get" || channel === "entitlement:refresh" || channel === "entitlement:set-email") {
    return resolveEntitlement(acct);
  }
  if (channel === "edu-entitlement:get" || channel === "edu-entitlement:refresh") {
    return resolveEduEntitlement(acct);
  }
  // Admin grant (comps / early customers / testing) — set edu products on a code.
  // Lazy-imported so the @/lib/redis account chain only loads when actually used.
  if (channel === "edu-entitlement:grant") {
    const [code, patch] = args as [string, Record<string, string>];
    if (typeof code !== "string" || !code) throw new Error("edu-entitlement:grant requires a code.");
    const { setEduProducts } = await import("../accounts");
    return setEduProducts(code, patch ?? {});
  }

  // Field credit balance — read your own; grant is admin-only (comps / testing).
  if (channel === "field-credits:get") {
    if (!acct) return 0;
    const { getFieldCredits } = await import("./field-credits");
    return getFieldCredits(acct.code);
  }
  if (channel === "field-credits:grant") {
    const [code, amount] = args as [string, number];
    if (typeof code !== "string" || !code || typeof amount !== "number") {
      throw new Error("field-credits:grant requires (code, amount).");
    }
    const { grantFieldCredits } = await import("./field-credits");
    return grantFieldCredits(code, amount);
  }

  // One-call quota snapshot for the UI meters (entitlement + chat + field credits).
  if (channel === "quota:status") {
    const { chatStatus } = await import("./chat-pool");
    const { getFieldCredits } = await import("./field-credits");
    const [chat, fieldCredits] = await Promise.all([
      chatStatus(acct),
      acct ? getFieldCredits(acct.code) : Promise.resolve(0)
    ]);
    return { entitlement: resolveEntitlement(acct), chat, fieldCredits };
  }

  // Cast voice (ElevenLabs with-timestamps) — web/mobile twin of the desktop
  // electron TTS service. Returns { audioBase64, bytes, alignment } so the
  // renderer's lip-sync is word-accurate on both transports. Lazy-imported so
  // the module only loads when voice is actually requested.
  if (channel === "tts:speak") {
    const { speak } = await import("./tts");
    return speak((args[0] ?? {}) as { text: string; voice?: "corvus" | "mira" | "pip" | "sage" });
  }
  if (channel === "tts:quota") {
    const { quotaProbe } = await import("./tts");
    return quotaProbe();
  }

  // Context-bound auth channels — "who am I". The renderer calls auth:session on
  // load; web sign-in/out is handled by the ocws-site login (the code in
  // localStorage), so those are no-ops that just echo the resolved identity.
  if (channel === "auth:session" || channel === "auth:sign-in") {
    return acct ? { code: acct.code, email: acct.email, tier: acct.tier ?? null, isAdmin: acct.isAdmin } : null;
  }
  if (channel === "auth:sign-out") {
    return null;
  }

  // Billed chat pool — consume one "talk to Corvus" turn before the LLM call.
  // Lazy-imported so the @/lib/chat-quota chain only loads when chat is used.
  if (channel === "chat:send") {
    const { consumeChatTurn } = await import("./chat-pool");
    await consumeChatTurn(acct);
  }

  // Edu mentor chat — per-LEARNER monthly pool (by surface), separate from the
  // Field/wireless economy. Ownership is enforced above by authz (INPUT_LEARNER).
  if (channel === "learning:chat:send") {
    const input = (args[0] ?? {}) as { learnerId?: string };
    if (!acct?.isAdmin && typeof input.learnerId === "string") {
      const learner = await learners.get(input.learnerId);
      if (learner) {
        const { consumeEduChatTurn } = await import("./edu-pool");
        await consumeEduChatTurn(input.learnerId, learner.surface);
      }
    }
  }

  // Field deliverable credits — charge the high-value outputs on create (Verdict /
  // Network Design / Device Build). Ownership of the parent project is enforced
  // above by authz (FIELD_INPUT_PROJECT); this charges the account's credit pool.
  if (channel === "verdicts:create" || channel === "networkPlans:create" || channel === "deviceBuilds:create") {
    const { costForChannel, consumeFieldCredits } = await import("./field-credits");
    await consumeFieldCredits(acct, costForChannel(channel, args[0]));
  }
  if (channel === "projects:list") {
    const includeArchived = (args[0] as boolean) ?? false;
    // Admin sees everything; a normal account sees only projects it owns.
    return projects.list(includeArchived, acct?.isAdmin ? undefined : acct?.code);
  }
  if (channel === "projects:create") {
    const input = (args[0] ?? {}) as Parameters<typeof projects.create>[0];
    return projects.create({ ...input, ownerAccountId: acct?.code ?? null });
  }

  const result = await handlers[channel](...(args as unknown[]));

  // Cost telemetry — token-bearing generators emit a structured usage line so
  // production yields REAL per-account COGS (see lib/rookery/cost.ts).
  const usage = usageFromResult(channel, result);
  if (usage) {
    console.log("[rookery.usage]", JSON.stringify({ ...usage, account: acct?.code ?? null }));
  }

  return result;
}
