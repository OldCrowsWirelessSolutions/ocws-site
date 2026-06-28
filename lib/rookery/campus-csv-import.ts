import {
  campusImportRuns,
  ferpaAudit,
  institutions as institutionsRepo,
  learners as learnersRepo,
  supervisors as supervisorsRepo,
  type LearnerSurface,
  type Sex
} from "./edu-repo";

/**
 * CSV bulk-import for Campus learners — async (Turso) port of the desktop
 * electron/services/campus-csv-import.ts. previewCsv + the CSV parser are pure
 * (copied verbatim); commitCsv's repo reads/writes are awaited.
 *
 * Two-phase: previewCsv parses + validates without writing; commitCsv writes
 * after confirmation, records a campus_import_runs row and a single
 * 'bulk_import' FERPA audit entry per commit.
 */

export interface CsvParsedRow {
  rowNumber: number;
  externalId: string | null;
  firstName: string;
  lastName: string | null;
  email: string | null;
  gradeLevel: string;
  sex: Sex | null;
  courseCodes: string[];
  iepFlag: boolean;
  fourOhFourFlag: boolean;
  major: string | null;
  department: string | null;
  errors: string[];
}

export interface CsvPreviewResult {
  rows: CsvParsedRow[];
  totalRows: number;
  validRows: number;
  errorRows: number;
}

export function previewCsv(csvText: string): CsvPreviewResult {
  const lines = csvText.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim());
  if (lines.length === 0) {
    return { rows: [], totalRows: 0, validRows: 0, errorRows: 0 };
  }
  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const idx = (col: string): number => header.indexOf(col);
  const colIdx = {
    external_id: idx("external_id"),
    first_name: idx("first_name"),
    last_name: idx("last_name"),
    email: idx("email"),
    grade_level: idx("grade_level"),
    sex: idx("sex"),
    course_codes: idx("course_codes"),
    iep_flag: idx("iep_flag"),
    four_oh_four_flag: idx("four_oh_four_flag"),
    major: idx("major"),
    department: idx("department")
  };

  // Required: first_name, grade_level. Everything else optional.
  const rows: CsvParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const errors: string[] = [];
    const get = (k: keyof typeof colIdx): string =>
      colIdx[k] >= 0 ? (fields[colIdx[k]] ?? "").trim() : "";
    const firstName = get("first_name");
    const gradeLevel = get("grade_level") || "K";
    if (!firstName) errors.push("first_name is required");
    const rawSex = get("sex").toLowerCase();
    const sex: Sex | null =
      rawSex === "m" || rawSex === "male"
        ? "male"
        : rawSex === "f" || rawSex === "female"
        ? "female"
        : null;
    if (rawSex && !sex) errors.push(`sex must be male or female; got "${rawSex}"`);
    const iepFlag = parseBool(get("iep_flag"));
    const fourOhFourFlag = parseBool(get("four_oh_four_flag"));
    const courseCodesRaw = get("course_codes");
    const courseCodes = courseCodesRaw
      ? courseCodesRaw.split(/[;,\s]+/).map((s) => s.trim()).filter(Boolean)
      : [];
    rows.push({
      rowNumber: i + 1,
      externalId: get("external_id") || null,
      firstName,
      lastName: get("last_name") || null,
      email: get("email") || null,
      gradeLevel,
      sex,
      courseCodes,
      iepFlag,
      fourOhFourFlag,
      major: get("major") || null,
      department: get("department") || null,
      errors
    });
  }
  const validRows = rows.filter((r) => r.errors.length === 0).length;
  return {
    rows,
    totalRows: rows.length,
    validRows,
    errorRows: rows.length - validRows
  };
}

export interface CsvCommitInput {
  institutionId: string;
  supervisorId: string | null;
  csvText: string;
  /** When true, rows that fail validation are skipped; otherwise the whole import aborts. */
  partial: boolean;
}

export interface CsvCommitResult {
  totalRows: number;
  created: number;
  updated: number;
  skipped: number;
  errors: { rowNumber: number; errors: string[] }[];
  importRunId: string;
}

export async function commitCsv(input: CsvCommitInput): Promise<CsvCommitResult> {
  const inst = await institutionsRepo.get(input.institutionId);
  if (!inst) throw new Error(`commitCsv: institution ${input.institutionId} not found`);
  const preview = previewCsv(input.csvText);

  // If not partial mode and any row has errors, abort before writing.
  const hadErrors = preview.rows.some((r) => r.errors.length > 0);
  if (hadErrors && !input.partial) {
    throw new Error(
      "CSV has validation errors. Re-run with partial=true to skip bad rows, or fix the file."
    );
  }

  const surface: LearnerSurface =
    inst.type === "k12_school" || inst.type === "k12_district"
      ? "campus_k12"
      : "campus_higher_ed";

  // One scan of the institution's existing learners, reused for external_id
  // matching across all rows (desktop re-scanned per row; here we fetch once).
  const existingLearners = await learnersRepo.byInstitution(input.institutionId);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errorList: { rowNumber: number; errors: string[] }[] = [];

  for (const r of preview.rows) {
    if (r.errors.length > 0) {
      skipped++;
      errorList.push({ rowNumber: r.rowNumber, errors: r.errors });
      continue;
    }
    const existing = r.externalId
      ? existingLearners.find((l) => l.externalId === r.externalId)
      : null;

    const iep504: { has_iep: boolean; has_504: boolean } = {
      has_iep: r.iepFlag,
      has_504: r.fourOhFourFlag
    };

    const payload = {
      surface,
      parentAccountId: null,
      institutionId: input.institutionId,
      firstName: r.firstName,
      preferredName: null,
      lastName: r.lastName,
      birthdate: null,
      age: null,
      defaultGradeLevel: r.gradeLevel,
      sex: r.sex,
      cognitiveProfileJson: null,
      perSubjectGradeOverrideJson: null,
      goalsJson: null,
      iep504FlagsJson:
        r.iepFlag || r.fourOhFourFlag ? JSON.stringify(iep504) : null,
      major: r.major,
      department: r.department,
      enrolledCoursesJson:
        r.courseCodes.length > 0 ? JSON.stringify(r.courseCodes) : null,
      email: r.email,
      externalId: r.externalId,
      mentorBirdPref: null,
      interestsStructuredJson: null,
      uxBandOverride: null
    };
    if (existing) {
      const after = await learnersRepo.update(existing.id, payload);
      if (after) {
        updated++;
      } else {
        skipped++;
        errorList.push({ rowNumber: r.rowNumber, errors: ["update failed"] });
        continue;
      }
    } else {
      await learnersRepo.create(payload);
      created++;
    }
  }

  const importRun = await campusImportRuns.record({
    institutionId: input.institutionId,
    supervisorId: input.supervisorId,
    source: "csv",
    rowsTotal: preview.totalRows,
    rowsCreated: created,
    rowsUpdated: updated,
    rowsSkipped: skipped,
    errorsJson: errorList.length > 0 ? JSON.stringify(errorList) : null
  });

  // FERPA audit — single row capturing the whole bulk action.
  await ferpaAudit.log({
    institutionId: input.institutionId,
    supervisorId: input.supervisorId,
    learnerId: null,
    accessType: "bulk_import",
    details: `CSV import: ${created} created, ${updated} updated, ${skipped} skipped of ${preview.totalRows} rows.`
  });

  // Informational: validate supervisor existed if specified (no error path).
  if (input.supervisorId && !(await supervisorsRepo.get(input.supervisorId))) {
    // ignore; we still recorded the import run
  }

  return {
    totalRows: preview.totalRows,
    created,
    updated,
    skipped,
    errors: errorList,
    importRunId: importRun.id
  };
}

// ---- Helpers (pure; copied verbatim) ----

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let s = "";
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          s += '"';
          i += 2;
          continue;
        }
        if (line[i] === '"') {
          i++;
          break;
        }
        s += line[i];
        i++;
      }
      out.push(s);
      if (line[i] === ",") i++;
    } else {
      let s = "";
      while (i < line.length && line[i] !== ",") {
        s += line[i];
        i++;
      }
      out.push(s);
      if (line[i] === ",") i++;
    }
  }
  return out;
}

function parseBool(s: string): boolean {
  const t = s.trim().toLowerCase();
  return t === "1" || t === "true" || t === "yes" || t === "y";
}
