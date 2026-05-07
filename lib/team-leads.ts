// lib/team-leads.ts
// Server-authoritative team-lead system for Crow's Eye v19.
//
// In v18 and earlier, the enterprise/team-lead system was local-only on the
// mobile client (expo-secure-store). That meant a team lead could generate
// a CORVUS-ORG-* code on their phone but a subordinate on a different phone
// couldn't redeem it — the local store on the subordinate's device had
// never seen the code. This library puts everything on Upstash so codes
// generated anywhere work everywhere.
//
// Storage layout in Redis:
//   team:lead:{leadCode}             — TeamLeadRecord     (HSET-equivalent JSON)
//   team:lead:by-userid:{userId}     — leadCode (lookup helper)
//   team:lead:index                  — set of all leadCodes
//
//   team:sub:{accessCode}            — SubordinateRecord
//   team:sub:by-lead:{leadCode}      — set of accessCodes belonging to a lead
//
//   team:verdict:{verdictKey}        — TeamVerdictRecord (summary only — full
//                                      report stays on the device that ran it)
//   team:verdict:by-lead:{leadCode}  — set of verdictKeys (newest-first ordering
//                                      handled by sorting on read)
//
// Auth model: a team lead's leadCode IS their credential. Anyone holding a
// leadCode can act as that lead (generate sub-tokens, list members, revoke).
// LeadCodes are not publicly distributable — they're handed out by the org
// admin or auto-generated for promotional flock/murder subscribers. The
// surface area is small enough for this to be acceptable for HtC; we can
// harden to per-user JWT later.

import redis from "@/lib/redis";

export interface TeamLeadRecord {
  leadCode:        string;        // CORVUS-LEAD-XXXXXX (acts as credential)
  userId:          string;        // stable lookup key (e.g. lead_eric, lead_<rand>)
  name:            string;
  email:           string;
  orgId:           string;
  orgName:         string;
  maxSubordinates: number;        // 9999 = effectively unlimited
  createdAt:       string;
  source:          "vip" | "subscriber" | "manual";  // how the lead was created
}

export interface SubordinateRecord {
  accessCode:   string;           // CORVUS-ORG-XXXXXX
  leadCode:     string;
  orgId:        string;
  orgName:      string;
  leadName:     string;
  createdAt:    string;
  // Filled in on redemption
  redeemed:     boolean;
  redeemedAt:   string | null;
  redeemedBy:   string | null;    // email of the redeemer
  name:         string | null;
  email:        string | null;
  userId:       string | null;    // sub_<rand> assigned at redeem time
  lastActive:   string | null;
  revoked:      boolean;
}

export interface TeamVerdictRecord {
  verdictKey:      string;        // tv_<timestamp>_<rand>
  leadCode:        string;
  orgId:           string;
  userId:          string;        // subordinate's userId
  userEmail:       string;
  userName:        string;
  ssid:            string;
  scanLabel:       string;        // "Verdict" | "Full Reckoning" | tier-specific
  timestamp:       number;        // ms epoch
  findingsCount:   number;
  severitySummary: { critical: number; high: number; medium: number; low: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSuffix(len: number): string {
  return Array.from(
    { length: len },
    () => CHARS[Math.floor(Math.random() * CHARS.length)],
  ).join("");
}

// ─── Team Leads ───────────────────────────────────────────────────────────────

/**
 * Idempotent — returns the existing record if userId is already registered,
 * otherwise creates a new one. Used at every flock/murder redemption and at
 * VIP login bootstrap so the server is always source-of-truth.
 *
 * leadCode generation strategy:
 *   - If caller passes a stable suggestedLeadCode (e.g. CORVUS-LEAD-ERIC for
 *     hardcoded VIPs), use it. The check is on userId, so a second call from
 *     a different device for the same user returns the same record.
 *   - Otherwise generate CORVUS-LEAD-{6rand}.
 */
export async function ensureTeamLead(args: {
  userId:             string;
  name:               string;
  email:              string;
  orgId:              string;
  orgName:            string;
  maxSubordinates?:   number;
  suggestedLeadCode?: string;
  source?:            TeamLeadRecord["source"];
}): Promise<TeamLeadRecord> {
  const existingCode = await redis.get<string>(`team:lead:by-userid:${args.userId}`);
  if (existingCode) {
    const existing = await redis.get<TeamLeadRecord>(`team:lead:${existingCode}`);
    if (existing) return existing;
  }

  // Pick a lead code. If the suggested one is taken by a DIFFERENT user, fall
  // back to a random suffix to avoid collision. (This shouldn't happen in
  // practice for hardcoded VIPs since their userIds are also stable.)
  let leadCode = args.suggestedLeadCode?.toUpperCase() ?? `CORVUS-LEAD-${randomSuffix(6)}`;
  const collision = await redis.get<TeamLeadRecord>(`team:lead:${leadCode}`);
  if (collision && collision.userId !== args.userId) {
    leadCode = `CORVUS-LEAD-${randomSuffix(6)}`;
  }

  const record: TeamLeadRecord = {
    leadCode,
    userId:          args.userId,
    name:            args.name,
    email:           args.email,
    orgId:           args.orgId,
    orgName:         args.orgName,
    maxSubordinates: args.maxSubordinates ?? 25,
    createdAt:       new Date().toISOString(),
    source:          args.source ?? "manual",
  };

  await Promise.all([
    redis.set(`team:lead:${leadCode}`, record),
    redis.set(`team:lead:by-userid:${args.userId}`, leadCode),
    redis.sadd("team:lead:index", leadCode),
  ]);

  return record;
}

export async function getTeamLeadByCode(leadCode: string): Promise<TeamLeadRecord | null> {
  return redis.get<TeamLeadRecord>(`team:lead:${leadCode.toUpperCase()}`);
}

export async function getTeamLeadByUserId(userId: string): Promise<TeamLeadRecord | null> {
  const code = await redis.get<string>(`team:lead:by-userid:${userId}`);
  if (!code) return null;
  return redis.get<TeamLeadRecord>(`team:lead:${code}`);
}

// ─── Subordinates ─────────────────────────────────────────────────────────────

export async function generateSubordinateCode(leadCode: string): Promise<SubordinateRecord> {
  const lead = await getTeamLeadByCode(leadCode);
  if (!lead) throw new Error("Unknown leadCode");

  // Generate a unique CORVUS-ORG-* code. Retry on the rare collision.
  let accessCode = `CORVUS-ORG-${randomSuffix(6)}`;
  let attempts = 0;
  while (await redis.get<SubordinateRecord>(`team:sub:${accessCode}`)) {
    if (++attempts > 5) throw new Error("Failed to allocate unique sub code");
    accessCode = `CORVUS-ORG-${randomSuffix(6)}`;
  }

  const record: SubordinateRecord = {
    accessCode,
    leadCode:   lead.leadCode,
    orgId:      lead.orgId,
    orgName:    lead.orgName,
    leadName:   lead.name,
    createdAt:  new Date().toISOString(),
    redeemed:   false,
    redeemedAt: null,
    redeemedBy: null,
    name:       null,
    email:      null,
    userId:     null,
    lastActive: null,
    revoked:    false,
  };

  await Promise.all([
    redis.set(`team:sub:${accessCode}`, record),
    redis.sadd(`team:sub:by-lead:${lead.leadCode}`, accessCode),
  ]);

  return record;
}

export async function listSubordinatesByLead(leadCode: string): Promise<SubordinateRecord[]> {
  const codes = (await redis.smembers(`team:sub:by-lead:${leadCode.toUpperCase()}`)) as string[];
  if (!codes.length) return [];
  const records = await Promise.all(
    codes.map((c) => redis.get<SubordinateRecord>(`team:sub:${c}`)),
  );
  return records
    .filter((r): r is SubordinateRecord => r !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function redeemSubordinateCode(args: {
  accessCode: string;
  name:       string;
  email:      string;
}): Promise<SubordinateRecord | null> {
  const code = args.accessCode.toUpperCase();
  const record = await redis.get<SubordinateRecord>(`team:sub:${code}`);
  if (!record) return null;
  if (record.revoked) return null;
  if (record.redeemed) {
    // Already redeemed. If the same email is re-redeeming (e.g. reinstall),
    // return the existing record so they get back into the team without an
    // error. Otherwise reject — one code, one team member.
    if (record.email && record.email.toLowerCase() === args.email.trim().toLowerCase()) {
      return record;
    }
    return null;
  }

  const updated: SubordinateRecord = {
    ...record,
    redeemed:   true,
    redeemedAt: new Date().toISOString(),
    redeemedBy: args.email.trim(),
    name:       args.name.trim(),
    email:      args.email.trim(),
    userId:     `sub_${randomSuffix(8).toLowerCase()}`,
    lastActive: new Date().toISOString(),
  };

  await redis.set(`team:sub:${code}`, updated);
  return updated;
}

export async function revokeSubordinate(leadCode: string, accessCode: string): Promise<boolean> {
  const code = accessCode.toUpperCase();
  const record = await redis.get<SubordinateRecord>(`team:sub:${code}`);
  if (!record) return false;
  if (record.leadCode !== leadCode.toUpperCase()) return false; // wrong owner
  if (record.revoked) return true; // idempotent

  await redis.set(`team:sub:${code}`, { ...record, revoked: true });
  return true;
}

export async function updateSubordinateLastActive(accessCode: string): Promise<void> {
  const code = accessCode.toUpperCase();
  const record = await redis.get<SubordinateRecord>(`team:sub:${code}`);
  if (!record) return;
  await redis.set(`team:sub:${code}`, { ...record, lastActive: new Date().toISOString() });
}

// ─── Team Verdicts (summary records only) ────────────────────────────────────

export async function recordTeamVerdict(args: {
  leadCode:        string;
  orgId:           string;
  userId:          string;
  userEmail:       string;
  userName:        string;
  ssid:            string;
  scanLabel:       string;
  findingsCount:   number;
  severitySummary: TeamVerdictRecord["severitySummary"];
}): Promise<TeamVerdictRecord> {
  const verdictKey = `tv_${Date.now()}_${randomSuffix(4).toLowerCase()}`;
  const record: TeamVerdictRecord = {
    verdictKey,
    leadCode:        args.leadCode.toUpperCase(),
    orgId:           args.orgId,
    userId:          args.userId,
    userEmail:       args.userEmail,
    userName:        args.userName,
    ssid:            args.ssid,
    scanLabel:       args.scanLabel,
    timestamp:       Date.now(),
    findingsCount:   args.findingsCount,
    severitySummary: args.severitySummary,
  };

  await Promise.all([
    redis.set(`team:verdict:${verdictKey}`, record),
    redis.sadd(`team:verdict:by-lead:${record.leadCode}`, verdictKey),
  ]);

  return record;
}

export async function listVerdictsByLead(leadCode: string, limit = 200): Promise<TeamVerdictRecord[]> {
  const keys = (await redis.smembers(`team:verdict:by-lead:${leadCode.toUpperCase()}`)) as string[];
  if (!keys.length) return [];
  const records = await Promise.all(
    keys.map((k) => redis.get<TeamVerdictRecord>(`team:verdict:${k}`)),
  );
  return records
    .filter((r): r is TeamVerdictRecord => r !== null)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}
