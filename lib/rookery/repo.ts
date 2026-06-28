import { randomUUID } from "node:crypto";
import type { InArgs } from "@libsql/client";
import { getDb } from "./db";

/**
 * Async (libSQL/Turso) port of the desktop electron/services/repo.ts — the
 * Field workbench repository (projects / sites / verdicts / reckoning captures /
 * network plans / device builds). Mechanical conversion of the better-sqlite3
 * sync repo: SQL strings + row→domain mappers copied verbatim; only the
 * execution layer changes (prepare/get/all/run → a single `await execute`).
 */

const now = (): number => Date.now();

async function allRows<T>(sql: string, args: InArgs, map: (r: any) => T): Promise<T[]> {
  const res = await getDb().execute({ sql, args });
  return res.rows.map((r) => map(r));
}
async function oneRow<T>(sql: string, args: InArgs, map: (r: any) => T): Promise<T | null> {
  const res = await getDb().execute({ sql, args });
  return res.rows[0] ? map(res.rows[0]) : null;
}
async function exec(sql: string, args: InArgs): Promise<number> {
  const res = await getDb().execute({ sql, args });
  return Number(res.rowsAffected ?? 0);
}

// ---------- Projects ----------

export interface Project {
  id: string;
  name: string;
  client: string | null;
  notes: string | null;
  archived: boolean;
  /** Rookery account CODE that owns this project (multi-tenant scoping). Null = legacy/unowned. */
  ownerAccountId: string | null;
  createdAt: number;
  updatedAt: number;
}

const rowToProject = (r: any): Project => ({
  id: r.id,
  name: r.name,
  client: r.client ?? null,
  notes: r.notes ?? null,
  archived: !!r.archived,
  ownerAccountId: r.owner_account_id ?? null,
  createdAt: Number(r.created_at),
  updatedAt: Number(r.updated_at)
});

export const projects = {
  /** When `ownerAccountId` is provided, only that account's projects are returned (tenant scope). */
  list: (includeArchived = false, ownerAccountId?: string) => {
    const where: string[] = [];
    const args: (string | number)[] = [];
    if (!includeArchived) where.push("archived = 0");
    if (ownerAccountId !== undefined) {
      where.push("owner_account_id = ?");
      args.push(ownerAccountId);
    }
    const sql = `SELECT * FROM projects${where.length ? " WHERE " + where.join(" AND ") : ""} ORDER BY updated_at DESC`;
    return allRows(sql, args, rowToProject);
  },
  get: (id: string) => oneRow("SELECT * FROM projects WHERE id = ?", [id], rowToProject),
  async create(input: {
    name: string;
    client?: string | null;
    notes?: string | null;
    ownerAccountId?: string | null;
  }): Promise<Project> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO projects (id, name, client, notes, archived, owner_account_id, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?)",
      [id, input.name, input.client ?? null, input.notes ?? null, input.ownerAccountId ?? null, ts, ts]
    );
    return (await projects.get(id))!;
  },
  async update(id: string, patch: Partial<Omit<Project, "id" | "createdAt">>): Promise<Project | null> {
    const existing = await projects.get(id);
    if (!existing) return null;
    const merged: Project = { ...existing, ...patch, updatedAt: now() };
    await exec(
      "UPDATE projects SET name=?, client=?, notes=?, archived=?, updated_at=? WHERE id=?",
      [merged.name, merged.client, merged.notes, merged.archived ? 1 : 0, merged.updatedAt, id]
    );
    return merged;
  },
  remove: async (id: string) => (await exec("DELETE FROM projects WHERE id = ?", [id])) > 0
};

// ---------- Sites ----------

export interface Site {
  id: string;
  projectId: string;
  name: string;
  address: string | null;
  sqft: number | null;
  users: number | null;
  density: string | null;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
}

const rowToSite = (r: any): Site => ({
  id: r.id,
  projectId: r.project_id,
  name: r.name,
  address: r.address ?? null,
  sqft: r.sqft != null ? Number(r.sqft) : null,
  users: r.users != null ? Number(r.users) : null,
  density: r.density ?? null,
  notes: r.notes ?? null,
  createdAt: Number(r.created_at),
  updatedAt: Number(r.updated_at)
});

export const sites = {
  listByProject: (projectId: string) =>
    allRows("SELECT * FROM sites WHERE project_id = ? ORDER BY updated_at DESC", [projectId], rowToSite),
  get: (id: string) => oneRow("SELECT * FROM sites WHERE id = ?", [id], rowToSite),
  async create(input: Omit<Site, "id" | "createdAt" | "updatedAt">): Promise<Site> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO sites (id, project_id, name, address, sqft, users, density, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, input.projectId, input.name, input.address, input.sqft, input.users, input.density, input.notes, ts, ts]
    );
    return (await sites.get(id))!;
  },
  async update(
    id: string,
    patch: Partial<Omit<Site, "id" | "projectId" | "createdAt">>
  ): Promise<Site | null> {
    const existing = await sites.get(id);
    if (!existing) return null;
    const merged: Site = { ...existing, ...patch, updatedAt: now() };
    await exec(
      "UPDATE sites SET name=?, address=?, sqft=?, users=?, density=?, notes=?, updated_at=? WHERE id=?",
      [merged.name, merged.address, merged.sqft, merged.users, merged.density, merged.notes, merged.updatedAt, id]
    );
    return merged;
  },
  remove: async (id: string) => (await exec("DELETE FROM sites WHERE id = ?", [id])) > 0
};

// ---------- Verdicts ----------

export interface Verdict {
  id: string;
  projectId: string;
  siteId: string | null;
  kind: string;
  title: string;
  body: string | null;
  findingsCount: number;
  severity: string | null;
  sourceKind: string;
  sourcePath: string | null;
  createdAt: number;
}

const rowToVerdict = (r: any): Verdict => ({
  id: r.id,
  projectId: r.project_id,
  siteId: r.site_id ?? null,
  kind: r.kind,
  title: r.title,
  body: r.body ?? null,
  findingsCount: Number(r.findings_count),
  severity: r.severity ?? null,
  sourceKind: r.source_kind,
  sourcePath: r.source_path ?? null,
  createdAt: Number(r.created_at)
});

export const verdicts = {
  listByProject: (projectId: string) =>
    allRows(
      "SELECT * FROM verdicts WHERE project_id = ? ORDER BY created_at DESC",
      [projectId],
      rowToVerdict
    ),
  async create(input: Omit<Verdict, "id" | "createdAt"> & { createdAt?: number }): Promise<Verdict> {
    const id = randomUUID();
    // Accept an optional historical timestamp — CSV imports preserve the
    // original scan date rather than stamping everything as "now".
    const ts = input.createdAt ?? now();
    await exec(
      "INSERT INTO verdicts (id, project_id, site_id, kind, title, body, findings_count, severity, source_kind, source_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.projectId,
        input.siteId,
        input.kind,
        input.title,
        input.body,
        input.findingsCount,
        input.severity,
        input.sourceKind,
        input.sourcePath,
        ts
      ]
    );
    return { ...input, id, createdAt: ts };
  },
  remove: async (id: string) => (await exec("DELETE FROM verdicts WHERE id = ?", [id])) > 0
};

// ---------- Reckoning captures ----------

export interface ReckoningCapture {
  id: string;
  projectId: string;
  siteId: string | null;
  name: string;
  sourcePath: string | null;
  capturedAt: number | null;
  trailPoints: number;
  photoCount: number;
  noteCount: number;
  bundleJson: string | null;
  createdAt: number;
}

const rowToReckoning = (r: any): ReckoningCapture => ({
  id: r.id,
  projectId: r.project_id,
  siteId: r.site_id ?? null,
  name: r.name,
  sourcePath: r.source_path ?? null,
  capturedAt: r.captured_at != null ? Number(r.captured_at) : null,
  trailPoints: Number(r.trail_points),
  photoCount: Number(r.photo_count),
  noteCount: Number(r.note_count),
  bundleJson: r.bundle_json ?? null,
  createdAt: Number(r.created_at)
});

export const reckonings = {
  listByProject: (projectId: string) =>
    allRows(
      "SELECT * FROM reckoning_captures WHERE project_id = ? ORDER BY created_at DESC",
      [projectId],
      rowToReckoning
    ),
  async create(input: Omit<ReckoningCapture, "id" | "createdAt">): Promise<ReckoningCapture> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO reckoning_captures (id, project_id, site_id, name, source_path, captured_at, trail_points, photo_count, note_count, bundle_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.projectId,
        input.siteId,
        input.name,
        input.sourcePath,
        input.capturedAt,
        input.trailPoints,
        input.photoCount,
        input.noteCount,
        input.bundleJson,
        ts
      ]
    );
    return { ...input, id, createdAt: ts };
  },
  remove: async (id: string) =>
    (await exec("DELETE FROM reckoning_captures WHERE id = ?", [id])) > 0
};

// ---------- Network plans ----------

export interface NetworkPlanRecord {
  id: string;
  projectId: string;
  siteId: string | null;
  name: string;
  planJson: string;
  costEstimate: number | null;
  createdAt: number;
  updatedAt: number;
}

const rowToNetworkPlan = (r: any): NetworkPlanRecord => ({
  id: r.id,
  projectId: r.project_id,
  siteId: r.site_id ?? null,
  name: r.name,
  planJson: r.plan_json,
  costEstimate: r.cost_estimate != null ? Number(r.cost_estimate) : null,
  createdAt: Number(r.created_at),
  updatedAt: Number(r.updated_at)
});

export const networkPlans = {
  listByProject: (projectId: string) =>
    allRows(
      "SELECT * FROM network_plans WHERE project_id = ? ORDER BY updated_at DESC",
      [projectId],
      rowToNetworkPlan
    ),
  async create(input: Omit<NetworkPlanRecord, "id" | "createdAt" | "updatedAt">): Promise<NetworkPlanRecord> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO network_plans (id, project_id, site_id, name, plan_json, cost_estimate, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, input.projectId, input.siteId, input.name, input.planJson, input.costEstimate, ts, ts]
    );
    return { ...input, id, createdAt: ts, updatedAt: ts };
  },
  async update(
    id: string,
    patch: Partial<Omit<NetworkPlanRecord, "id" | "projectId" | "createdAt">>
  ): Promise<NetworkPlanRecord | null> {
    const existing = await oneRow("SELECT * FROM network_plans WHERE id = ?", [id], rowToNetworkPlan);
    if (!existing) return null;
    const merged = { ...existing, ...patch, updatedAt: now() };
    await exec(
      "UPDATE network_plans SET name=?, plan_json=?, cost_estimate=?, updated_at=? WHERE id=?",
      [merged.name, merged.planJson, merged.costEstimate, merged.updatedAt, id]
    );
    return merged;
  },
  remove: async (id: string) => (await exec("DELETE FROM network_plans WHERE id = ?", [id])) > 0
};

// ---------- Device builds ----------

export interface DeviceBuildRecord {
  id: string;
  projectId: string;
  name: string;
  sheetJson: string;
  createdAt: number;
  updatedAt: number;
}

const rowToDeviceBuild = (r: any): DeviceBuildRecord => ({
  id: r.id,
  projectId: r.project_id,
  name: r.name,
  sheetJson: r.sheet_json,
  createdAt: Number(r.created_at),
  updatedAt: Number(r.updated_at)
});

export const deviceBuilds = {
  listByProject: (projectId: string) =>
    allRows(
      "SELECT * FROM device_builds WHERE project_id = ? ORDER BY updated_at DESC",
      [projectId],
      rowToDeviceBuild
    ),
  async create(input: Omit<DeviceBuildRecord, "id" | "createdAt" | "updatedAt">): Promise<DeviceBuildRecord> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO device_builds (id, project_id, name, sheet_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      [id, input.projectId, input.name, input.sheetJson, ts, ts]
    );
    return { ...input, id, createdAt: ts, updatedAt: ts };
  },
  async update(
    id: string,
    patch: Partial<Omit<DeviceBuildRecord, "id" | "projectId" | "createdAt">>
  ): Promise<DeviceBuildRecord | null> {
    const existing = await oneRow("SELECT * FROM device_builds WHERE id = ?", [id], rowToDeviceBuild);
    if (!existing) return null;
    const merged = { ...existing, ...patch, updatedAt: now() };
    await exec(
      "UPDATE device_builds SET name=?, sheet_json=?, updated_at=? WHERE id=?",
      [merged.name, merged.sheetJson, merged.updatedAt, id]
    );
    return merged;
  },
  remove: async (id: string) => (await exec("DELETE FROM device_builds WHERE id = ?", [id])) > 0
};
