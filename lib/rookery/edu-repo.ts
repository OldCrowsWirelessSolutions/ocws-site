import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import type { InArgs } from "@libsql/client";
import { getDb } from "./db";

/**
 * Async (libSQL/Turso) port of the desktop electron/services/edu-repo.ts.
 *
 * Mechanical conversion of the better-sqlite3 sync repo: the SQL strings + the
 * row→domain mappers are copied verbatim (libSQL rows are keyed by column name
 * exactly like better-sqlite3, and INTEGER columns come back as JS numbers, so
 * `!!r.archived` and timestamp math work unchanged). Only the execution layer
 * changes — prepare/get/all/run become a single `await execute`.
 *
 * SLICE 1 (verified against live Turso): subjects, learners, lessons,
 * learner_memory — the lesson-flow + adaptive-loop core. The remaining
 * namespaces follow the identical pattern.
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

// ---------- Subjects ----------

export interface Subject {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parentSubjectId: string | null;
  gradeBandMin: string | null;
  gradeBandMax: string | null;
  domainTagsJson: string | null;
  standardsAlignmentJson: string | null;
}

const rowToSubject = (r: any): Subject => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  description: r.description ?? null,
  parentSubjectId: r.parent_subject_id ?? null,
  gradeBandMin: r.grade_band_min ?? null,
  gradeBandMax: r.grade_band_max ?? null,
  domainTagsJson: r.domain_tags_json ?? null,
  standardsAlignmentJson: r.standards_alignment_json ?? null
});

export const subjects = {
  list: () => allRows("SELECT * FROM subjects ORDER BY name", [], rowToSubject),
  get: (id: string) => oneRow("SELECT * FROM subjects WHERE id = ?", [id], rowToSubject),
  bySlug: (slug: string) => oneRow("SELECT * FROM subjects WHERE slug = ?", [slug], rowToSubject),
  childrenOf: (parentId: string) =>
    allRows("SELECT * FROM subjects WHERE parent_subject_id = ? ORDER BY name", [parentId], rowToSubject)
};

// ---------- Learners ----------

export type MentorBird = "corvus" | "mira" | "pip" | "sage";
export type LearnerSurface = "aerie" | "academy" | "campus_k12" | "campus_higher_ed";
export type Sex = "male" | "female";
export type UxBand = "K-2" | "3-5" | "6-8" | "9-12" | "adult";

export interface Learner {
  id: string;
  surface: string;
  parentAccountId: string | null;
  institutionId: string | null;
  firstName: string;
  preferredName: string | null;
  lastName: string | null;
  birthdate: string | null;
  age: number | null;
  defaultGradeLevel: string | null;
  sex: string | null;
  cognitiveProfileJson: string | null;
  perSubjectGradeOverrideJson: string | null;
  goalsJson: string | null;
  iep504FlagsJson: string | null;
  major: string | null;
  department: string | null;
  enrolledCoursesJson: string | null;
  email: string | null;
  externalId: string | null;
  mentorBirdPref: MentorBird | null;
  interestsStructuredJson: string | null;
  uxBandOverride: string | null;
  active: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

const rowToLearner = (r: any): Learner => ({
  id: r.id,
  surface: r.surface,
  parentAccountId: r.parent_account_id ?? null,
  institutionId: r.institution_id ?? null,
  firstName: r.first_name,
  preferredName: r.preferred_name ?? null,
  lastName: r.last_name ?? null,
  birthdate: r.birthdate ?? null,
  age: r.age ?? null,
  defaultGradeLevel: r.default_grade_level ?? null,
  sex: r.sex ?? null,
  cognitiveProfileJson: r.cognitive_profile_json ?? null,
  perSubjectGradeOverrideJson: r.per_subject_grade_override_json ?? null,
  goalsJson: r.goals_json ?? null,
  iep504FlagsJson: r.iep_504_flags_json ?? null,
  major: r.major ?? null,
  department: r.department ?? null,
  enrolledCoursesJson: r.enrolled_courses_json ?? null,
  email: r.email ?? null,
  externalId: r.external_id ?? null,
  mentorBirdPref: r.mentor_bird_pref ?? null,
  interestsStructuredJson: r.interests_structured_json ?? null,
  uxBandOverride: r.ux_band_override ?? null,
  active: !!r.active,
  archived: !!r.archived,
  createdAt: Number(r.created_at),
  updatedAt: Number(r.updated_at)
});

type LearnerCreate = Omit<Learner, "id" | "createdAt" | "updatedAt" | "active" | "archived"> &
  Partial<Pick<Learner, "active" | "archived">>;

export const learners = {
  list: (includeArchived = false) =>
    allRows(
      includeArchived
        ? "SELECT * FROM learners ORDER BY first_name"
        : "SELECT * FROM learners WHERE archived = 0 ORDER BY first_name",
      [],
      rowToLearner
    ),
  get: (id: string) => oneRow("SELECT * FROM learners WHERE id = ?", [id], rowToLearner),
  bySurface: (surface: string) =>
    allRows(
      "SELECT * FROM learners WHERE surface = ? AND archived = 0 ORDER BY first_name",
      [surface],
      rowToLearner
    ),
  byParentAccount: (parentAccountId: string) =>
    allRows(
      `SELECT DISTINCT l.* FROM learners l
       WHERE l.archived = 0
         AND ( l.parent_account_id = ?
           OR l.parent_account_id IN (
             SELECT primary_supervisor_id FROM aerie_families
             WHERE primary_supervisor_id = ? OR secondary_supervisor_id = ?
           ) )
       ORDER BY l.first_name`,
      [parentAccountId, parentAccountId, parentAccountId],
      rowToLearner
    ),
  byInstitution: (institutionId: string) =>
    allRows(
      "SELECT * FROM learners WHERE institution_id = ? AND archived = 0 ORDER BY first_name",
      [institutionId],
      rowToLearner
    ),
  async create(input: LearnerCreate): Promise<Learner> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO learners (id, surface, parent_account_id, institution_id, first_name, preferred_name, last_name, birthdate, age, default_grade_level, sex, cognitive_profile_json, per_subject_grade_override_json, goals_json, iep_504_flags_json, major, department, enrolled_courses_json, email, external_id, mentor_bird_pref, interests_structured_json, ux_band_override, active, archived, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.surface,
        input.parentAccountId ?? null,
        input.institutionId ?? null,
        input.firstName,
        input.preferredName ?? null,
        input.lastName ?? null,
        input.birthdate ?? null,
        input.age ?? null,
        input.defaultGradeLevel ?? null,
        input.sex ?? null,
        input.cognitiveProfileJson ?? null,
        input.perSubjectGradeOverrideJson ?? null,
        input.goalsJson ?? null,
        input.iep504FlagsJson ?? null,
        input.major ?? null,
        input.department ?? null,
        input.enrolledCoursesJson ?? null,
        input.email ?? null,
        input.externalId ?? null,
        input.mentorBirdPref ?? null,
        input.interestsStructuredJson ?? null,
        input.uxBandOverride ?? null,
        input.active === false ? 0 : 1,
        input.archived ? 1 : 0,
        ts,
        ts
      ]
    );
    return (await learners.get(id))!;
  },
  async update(
    id: string,
    patch: Partial<Omit<Learner, "id" | "createdAt">>
  ): Promise<Learner | null> {
    const existing = await learners.get(id);
    if (!existing) return null;
    const m = { ...existing, ...patch, updatedAt: now() };
    await exec(
      "UPDATE learners SET surface=?, parent_account_id=?, institution_id=?, first_name=?, preferred_name=?, last_name=?, birthdate=?, age=?, default_grade_level=?, sex=?, cognitive_profile_json=?, per_subject_grade_override_json=?, goals_json=?, iep_504_flags_json=?, major=?, department=?, enrolled_courses_json=?, email=?, external_id=?, mentor_bird_pref=?, interests_structured_json=?, ux_band_override=?, active=?, archived=?, updated_at=? WHERE id=?",
      [
        m.surface,
        m.parentAccountId,
        m.institutionId,
        m.firstName,
        m.preferredName,
        m.lastName,
        m.birthdate,
        m.age,
        m.defaultGradeLevel,
        m.sex,
        m.cognitiveProfileJson,
        m.perSubjectGradeOverrideJson,
        m.goalsJson,
        m.iep504FlagsJson,
        m.major,
        m.department,
        m.enrolledCoursesJson,
        m.email,
        m.externalId,
        m.mentorBirdPref,
        m.interestsStructuredJson,
        m.uxBandOverride,
        m.active ? 1 : 0,
        m.archived ? 1 : 0,
        m.updatedAt,
        id
      ]
    );
    return learners.get(id);
  },
  archive: (id: string) => learners.update(id, { archived: true, active: false }),
  /**
   * Wipe every piece of progress this learner has accumulated — lessons,
   * projects (incl. collaborations), assessments, sessions, mentor memory,
   * certificates. The learner row stays. Sequential deletes (libSQL has no
   * sync transaction wrapper here); a reset doesn't need strict atomicity.
   * Returns per-table row counts for the confirmation toast.
   */
  async resetProgress(id: string): Promise<{
    lessons: number;
    projects: number;
    assessments: number;
    sessions: number;
    memory: number;
    certificates: number;
  }> {
    const lessons = await exec("DELETE FROM lessons WHERE learner_id = ?", [id]);
    const projects = await exec(
      "DELETE FROM learner_projects WHERE learner_id = ? OR collaborative_with_learner_id = ?",
      [id, id]
    );
    const assessments = await exec("DELETE FROM assessments WHERE learner_id = ?", [id]);
    const sessions = await exec("DELETE FROM learning_sessions WHERE learner_id = ?", [id]);
    const memory = await exec("DELETE FROM learner_memory WHERE learner_id = ?", [id]);
    const certificates = await exec("DELETE FROM certificates WHERE learner_id = ?", [id]);
    return { lessons, projects, assessments, sessions, memory, certificates };
  },
  remove: async (id: string) => (await exec("DELETE FROM learners WHERE id = ?", [id])) > 0
};

// ---------- Learner memory ----------

export type MemoryType =
  | "topic_covered"
  | "topic_mastered"
  | "difficulty_observed"
  | "misconception"
  | "preference"
  | "interest"
  | "project_history"
  | "reference_anchor"
  | "sibling_collaboration"
  | "goal_progress"
  | "session_summary"
  | "corvus_observation";

export interface LearnerMemoryEntry {
  id: string;
  learnerId: string;
  memoryType: MemoryType;
  subject: string | null;
  content: string;
  weight: number;
  createdAt: number;
  lastReferencedAt: number | null;
}

const rowToMemory = (r: any): LearnerMemoryEntry => ({
  id: r.id,
  learnerId: r.learner_id,
  memoryType: r.memory_type,
  subject: r.subject ?? null,
  content: r.content,
  weight: Number(r.weight),
  createdAt: Number(r.created_at),
  lastReferencedAt: r.last_referenced_at != null ? Number(r.last_referenced_at) : null
});

export const learnerMemory = {
  forLearner: (learnerId: string, limit = 200) =>
    allRows(
      "SELECT * FROM learner_memory WHERE learner_id = ? ORDER BY created_at DESC LIMIT ?",
      [learnerId, limit],
      rowToMemory
    ),
  byType: (learnerId: string, type: MemoryType, limit = 50) =>
    allRows(
      "SELECT * FROM learner_memory WHERE learner_id = ? AND memory_type = ? ORDER BY created_at DESC LIMIT ?",
      [learnerId, type, limit],
      rowToMemory
    ),
  async append(input: {
    learnerId: string;
    memoryType: MemoryType;
    subject?: string | null;
    content: string;
    weight?: number;
  }): Promise<LearnerMemoryEntry> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO learner_memory (id, learner_id, memory_type, subject, content, weight, created_at, last_referenced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, input.learnerId, input.memoryType, input.subject ?? null, input.content, input.weight ?? 1.0, ts, null]
    );
    return {
      id,
      learnerId: input.learnerId,
      memoryType: input.memoryType,
      subject: input.subject ?? null,
      content: input.content,
      weight: input.weight ?? 1.0,
      createdAt: ts,
      lastReferencedAt: null
    };
  },
  remove: async (id: string) =>
    (await exec("DELETE FROM learner_memory WHERE id = ?", [id])) > 0
};

// ---------- Lessons ----------

export type LessonStatus = "assigned" | "in_progress" | "completed" | "skipped";

export interface Lesson {
  id: string;
  learnerId: string;
  subjectId: string | null;
  gradeLevelUsed: string;
  title: string;
  objectivesJson: string | null;
  bodyMarkdown: string;
  resourcesJson: string | null;
  estimatedDurationMinutes: number | null;
  status: LessonStatus;
  generatedAt: number;
  startedAt: number | null;
  completedAt: number | null;
  timeSpentSeconds: number;
  parentLessonId: string | null;
  notesForSupervisor: string | null;
  interactiveBlocksJson: string | null;
}

const rowToLesson = (r: any): Lesson => ({
  id: r.id,
  learnerId: r.learner_id,
  subjectId: r.subject_id ?? null,
  gradeLevelUsed: r.grade_level_used,
  title: r.title,
  objectivesJson: r.objectives_json ?? null,
  bodyMarkdown: r.body_markdown,
  resourcesJson: r.resources_json ?? null,
  estimatedDurationMinutes: r.estimated_duration_minutes != null ? Number(r.estimated_duration_minutes) : null,
  status: r.status,
  generatedAt: Number(r.generated_at),
  startedAt: r.started_at != null ? Number(r.started_at) : null,
  completedAt: r.completed_at != null ? Number(r.completed_at) : null,
  timeSpentSeconds: Number(r.time_spent_seconds),
  parentLessonId: r.parent_lesson_id ?? null,
  notesForSupervisor: r.notes_for_supervisor ?? null,
  interactiveBlocksJson: r.interactive_blocks_json ?? null
});

type LessonCreate = Omit<
  Lesson,
  "id" | "generatedAt" | "startedAt" | "completedAt" | "timeSpentSeconds" | "status" | "interactiveBlocksJson"
> &
  Partial<Pick<Lesson, "status" | "interactiveBlocksJson">>;

export const lessons = {
  forLearner: (learnerId: string, limit = 50) =>
    allRows(
      "SELECT * FROM lessons WHERE learner_id = ? ORDER BY generated_at DESC LIMIT ?",
      [learnerId, limit],
      rowToLesson
    ),
  get: (id: string) => oneRow("SELECT * FROM lessons WHERE id = ?", [id], rowToLesson),
  async create(input: LessonCreate): Promise<Lesson> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO lessons (id, learner_id, subject_id, grade_level_used, title, objectives_json, body_markdown, resources_json, estimated_duration_minutes, status, generated_at, started_at, completed_at, time_spent_seconds, parent_lesson_id, notes_for_supervisor, interactive_blocks_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.learnerId,
        input.subjectId ?? null,
        input.gradeLevelUsed,
        input.title,
        input.objectivesJson ?? null,
        input.bodyMarkdown,
        input.resourcesJson ?? null,
        input.estimatedDurationMinutes ?? null,
        input.status ?? "assigned",
        ts,
        null,
        null,
        0,
        input.parentLessonId ?? null,
        input.notesForSupervisor ?? null,
        input.interactiveBlocksJson ?? null
      ]
    );
    return (await lessons.get(id))!;
  },
  markStarted: async (id: string) => {
    await exec(
      "UPDATE lessons SET status = 'in_progress', started_at = COALESCE(started_at, ?) WHERE id = ?",
      [now(), id]
    );
    return lessons.get(id);
  },
  markCompleted: async (id: string) => {
    await exec("UPDATE lessons SET status = 'completed', completed_at = ? WHERE id = ?", [now(), id]);
    return lessons.get(id);
  },
  accumulateTime: (id: string, seconds: number) =>
    exec("UPDATE lessons SET time_spent_seconds = time_spent_seconds + ? WHERE id = ?", [seconds, id]),
  remove: async (id: string) => (await exec("DELETE FROM lessons WHERE id = ?", [id])) > 0
};

// ---------- Institutions ----------

export type InstitutionType =
  | "k12_school"
  | "k12_district"
  | "higher_ed_campus"
  | "higher_ed_system";

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  parentInstitutionId: string | null;
  hierarchyPath: string | null;
  contactEmail: string | null;
  contactName: string | null;
  ssoProvider: string | null;
  ssoConfigJson: string | null;
  sisProvider: string | null;
  sisConfigJson: string | null;
  standardsAlignmentDefault: string | null;
  stateCode: string | null;
  active: boolean;
  createdAt: number;
}

const rowToInstitution = (r: any): Institution => ({
  id: r.id,
  name: r.name,
  type: r.type,
  parentInstitutionId: r.parent_institution_id ?? null,
  hierarchyPath: r.hierarchy_path ?? null,
  contactEmail: r.contact_email ?? null,
  contactName: r.contact_name ?? null,
  ssoProvider: r.sso_provider ?? null,
  ssoConfigJson: r.sso_config_json ?? null,
  sisProvider: r.sis_provider ?? null,
  sisConfigJson: r.sis_config_json ?? null,
  standardsAlignmentDefault: r.standards_alignment_default ?? null,
  stateCode: r.state_code ?? null,
  active: !!r.active,
  createdAt: Number(r.created_at)
});

export const institutions = {
  list: () =>
    allRows("SELECT * FROM institutions WHERE active = 1 ORDER BY name", [], rowToInstitution),
  get: (id: string) => oneRow("SELECT * FROM institutions WHERE id = ?", [id], rowToInstitution),
  childrenOf: (parentId: string) =>
    allRows(
      "SELECT * FROM institutions WHERE parent_institution_id = ? AND active = 1 ORDER BY name",
      [parentId],
      rowToInstitution
    ),
  async create(
    input: Omit<Institution, "id" | "createdAt" | "active"> & { active?: boolean }
  ): Promise<Institution> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO institutions (id, name, type, parent_institution_id, hierarchy_path, contact_email, contact_name, sso_provider, sso_config_json, sis_provider, sis_config_json, standards_alignment_default, state_code, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.name,
        input.type,
        input.parentInstitutionId ?? null,
        input.hierarchyPath ?? null,
        input.contactEmail ?? null,
        input.contactName ?? null,
        input.ssoProvider ?? null,
        input.ssoConfigJson ?? null,
        input.sisProvider ?? null,
        input.sisConfigJson ?? null,
        input.standardsAlignmentDefault ?? null,
        input.stateCode ?? null,
        input.active === false ? 0 : 1,
        ts
      ]
    );
    return (await institutions.get(id))!;
  },
  async update(
    id: string,
    patch: Partial<Omit<Institution, "id" | "createdAt">>
  ): Promise<Institution | null> {
    const existing = await institutions.get(id);
    if (!existing) return null;
    const m = { ...existing, ...patch };
    await exec(
      "UPDATE institutions SET name=?, type=?, parent_institution_id=?, hierarchy_path=?, contact_email=?, contact_name=?, sso_provider=?, sso_config_json=?, sis_provider=?, sis_config_json=?, standards_alignment_default=?, state_code=?, active=? WHERE id=?",
      [
        m.name,
        m.type,
        m.parentInstitutionId,
        m.hierarchyPath,
        m.contactEmail,
        m.contactName,
        m.ssoProvider,
        m.ssoConfigJson,
        m.sisProvider,
        m.sisConfigJson,
        m.standardsAlignmentDefault,
        m.stateCode,
        m.active ? 1 : 0,
        id
      ]
    );
    return institutions.get(id);
  },
  remove: async (id: string) => (await exec("DELETE FROM institutions WHERE id = ?", [id])) > 0
};

// ---------- Learner projects ----------

export type ProjectStatus = "assigned" | "in_progress" | "submitted" | "graded" | "archived";

export interface LearnerProject {
  id: string;
  learnerId: string;
  lessonId: string | null;
  collaborativeWithLearnerId: string | null;
  title: string;
  descriptionMarkdown: string;
  rubricJson: string;
  materialsJson: string | null;
  stepsJson: string | null;
  stepsDoneJson: string | null;
  status: ProjectStatus;
  generatedAt: number;
  startedAt: number | null;
  submittedAt: number | null;
  gradedAt: number | null;
  timeSpentSeconds: number;
  artifactPathsJson: string | null;
  reflectionText: string | null;
  gradeLetter: string | null;
  gradeNumeric: number | null;
  corvusFeedbackMarkdown: string | null;
}

const rowToLearnerProject = (r: any): LearnerProject => ({
  id: r.id,
  learnerId: r.learner_id,
  lessonId: r.lesson_id ?? null,
  collaborativeWithLearnerId: r.collaborative_with_learner_id ?? null,
  title: r.title,
  descriptionMarkdown: r.description_markdown,
  rubricJson: r.rubric_json,
  materialsJson: r.materials_json ?? null,
  stepsJson: r.steps_json ?? null,
  stepsDoneJson: r.steps_done_json ?? null,
  status: r.status,
  generatedAt: Number(r.generated_at),
  startedAt: r.started_at != null ? Number(r.started_at) : null,
  submittedAt: r.submitted_at != null ? Number(r.submitted_at) : null,
  gradedAt: r.graded_at != null ? Number(r.graded_at) : null,
  timeSpentSeconds: Number(r.time_spent_seconds),
  artifactPathsJson: r.artifact_paths_json ?? null,
  reflectionText: r.reflection_text ?? null,
  gradeLetter: r.grade_letter ?? null,
  gradeNumeric: r.grade_numeric != null ? Number(r.grade_numeric) : null,
  corvusFeedbackMarkdown: r.corvus_feedback_markdown ?? null
});

type LearnerProjectCreate = Omit<
  LearnerProject,
  "id" | "generatedAt" | "startedAt" | "submittedAt" | "gradedAt" | "timeSpentSeconds" | "status"
> &
  Partial<Pick<LearnerProject, "status">>;

export const learnerProjects = {
  forLearner: (learnerId: string, limit = 50) =>
    allRows(
      "SELECT * FROM learner_projects WHERE learner_id = ? OR collaborative_with_learner_id = ? ORDER BY generated_at DESC LIMIT ?",
      [learnerId, learnerId, limit],
      rowToLearnerProject
    ),
  get: (id: string) =>
    oneRow("SELECT * FROM learner_projects WHERE id = ?", [id], rowToLearnerProject),
  async create(input: LearnerProjectCreate): Promise<LearnerProject> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO learner_projects (id, learner_id, lesson_id, collaborative_with_learner_id, title, description_markdown, rubric_json, materials_json, steps_json, steps_done_json, status, generated_at, started_at, submitted_at, graded_at, time_spent_seconds, artifact_paths_json, reflection_text, grade_letter, grade_numeric, corvus_feedback_markdown) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.learnerId,
        input.lessonId ?? null,
        input.collaborativeWithLearnerId ?? null,
        input.title,
        input.descriptionMarkdown,
        input.rubricJson,
        input.materialsJson ?? null,
        input.stepsJson ?? null,
        input.stepsDoneJson ?? null,
        input.status ?? "assigned",
        ts,
        null,
        null,
        null,
        0,
        input.artifactPathsJson ?? null,
        input.reflectionText ?? null,
        input.gradeLetter ?? null,
        input.gradeNumeric ?? null,
        input.corvusFeedbackMarkdown ?? null
      ]
    );
    return (await learnerProjects.get(id))!;
  },
  async update(
    id: string,
    patch: Partial<Omit<LearnerProject, "id" | "generatedAt">>
  ): Promise<LearnerProject | null> {
    const existing = await learnerProjects.get(id);
    if (!existing) return null;
    const m = { ...existing, ...patch };
    await exec(
      "UPDATE learner_projects SET learner_id=?, lesson_id=?, collaborative_with_learner_id=?, title=?, description_markdown=?, rubric_json=?, materials_json=?, steps_json=?, steps_done_json=?, status=?, started_at=?, submitted_at=?, graded_at=?, time_spent_seconds=?, artifact_paths_json=?, reflection_text=?, grade_letter=?, grade_numeric=?, corvus_feedback_markdown=? WHERE id=?",
      [
        m.learnerId,
        m.lessonId,
        m.collaborativeWithLearnerId,
        m.title,
        m.descriptionMarkdown,
        m.rubricJson,
        m.materialsJson,
        m.stepsJson,
        m.stepsDoneJson,
        m.status,
        m.startedAt,
        m.submittedAt,
        m.gradedAt,
        m.timeSpentSeconds,
        m.artifactPathsJson,
        m.reflectionText,
        m.gradeLetter,
        m.gradeNumeric,
        m.corvusFeedbackMarkdown,
        id
      ]
    );
    return learnerProjects.get(id);
  },
  remove: async (id: string) =>
    (await exec("DELETE FROM learner_projects WHERE id = ?", [id])) > 0
};

// ---------- Assessments ----------

export type AssessmentType =
  | "quiz"
  | "test"
  | "midterm"
  | "final"
  | "placement"
  | "practice_certification";
export type AssessmentStatus = "assigned" | "in_progress" | "submitted" | "graded";

export interface Assessment {
  id: string;
  learnerId: string;
  lessonId: string | null;
  type: AssessmentType;
  title: string;
  questionsJson: string;
  responsesJson: string | null;
  scoreNumeric: number | null;
  scorePercent: number | null;
  scoreLetter: string | null;
  status: AssessmentStatus;
  generatedAt: number;
  startedAt: number | null;
  submittedAt: number | null;
  gradedAt: number | null;
  timeSpentSeconds: number;
  corvusFeedbackMarkdown: string | null;
}

const rowToAssessment = (r: any): Assessment => ({
  id: r.id,
  learnerId: r.learner_id,
  lessonId: r.lesson_id ?? null,
  type: r.type,
  title: r.title,
  questionsJson: r.questions_json,
  responsesJson: r.responses_json ?? null,
  scoreNumeric: r.score_numeric != null ? Number(r.score_numeric) : null,
  scorePercent: r.score_percent != null ? Number(r.score_percent) : null,
  scoreLetter: r.score_letter ?? null,
  status: r.status,
  generatedAt: Number(r.generated_at),
  startedAt: r.started_at != null ? Number(r.started_at) : null,
  submittedAt: r.submitted_at != null ? Number(r.submitted_at) : null,
  gradedAt: r.graded_at != null ? Number(r.graded_at) : null,
  timeSpentSeconds: Number(r.time_spent_seconds),
  corvusFeedbackMarkdown: r.corvus_feedback_markdown ?? null
});

type AssessmentCreate = Omit<
  Assessment,
  "id" | "generatedAt" | "startedAt" | "submittedAt" | "gradedAt" | "timeSpentSeconds" | "status"
> &
  Partial<Pick<Assessment, "status">>;

export const assessments = {
  forLearner: (learnerId: string, limit = 50) =>
    allRows(
      "SELECT * FROM assessments WHERE learner_id = ? ORDER BY generated_at DESC LIMIT ?",
      [learnerId, limit],
      rowToAssessment
    ),
  get: (id: string) => oneRow("SELECT * FROM assessments WHERE id = ?", [id], rowToAssessment),
  async create(input: AssessmentCreate): Promise<Assessment> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO assessments (id, learner_id, lesson_id, type, title, questions_json, responses_json, score_numeric, score_percent, score_letter, status, generated_at, started_at, submitted_at, graded_at, time_spent_seconds, corvus_feedback_markdown) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.learnerId,
        input.lessonId ?? null,
        input.type,
        input.title,
        input.questionsJson,
        input.responsesJson ?? null,
        input.scoreNumeric ?? null,
        input.scorePercent ?? null,
        input.scoreLetter ?? null,
        input.status ?? "assigned",
        ts,
        null,
        null,
        null,
        0,
        input.corvusFeedbackMarkdown ?? null
      ]
    );
    return (await assessments.get(id))!;
  },
  async submitResponses(id: string, responsesJson: string): Promise<Assessment | null> {
    await exec(
      "UPDATE assessments SET responses_json=?, status='submitted', submitted_at=? WHERE id=?",
      [responsesJson, now(), id]
    );
    return assessments.get(id);
  },
  async grade(
    id: string,
    grade: { scoreNumeric: number; scorePercent: number; scoreLetter: string | null; feedbackMarkdown: string | null }
  ): Promise<Assessment | null> {
    await exec(
      "UPDATE assessments SET score_numeric=?, score_percent=?, score_letter=?, corvus_feedback_markdown=?, status='graded', graded_at=? WHERE id=?",
      [grade.scoreNumeric, grade.scorePercent, grade.scoreLetter, grade.feedbackMarkdown, now(), id]
    );
    return assessments.get(id);
  },
  remove: async (id: string) => (await exec("DELETE FROM assessments WHERE id = ?", [id])) > 0
};

// ---------- Learning sessions ----------

export type SessionSurface = "lesson" | "project" | "assessment" | "free_chat" | "review";

export interface LearningSession {
  id: string;
  learnerId: string;
  surfaceType: SessionSurface;
  referenceId: string | null;
  startedAt: number;
  endedAt: number | null;
  durationSeconds: number | null;
  transcriptJson: string | null;
  summaryText: string | null;
  tokensUsed: number;
}

const rowToSession = (r: any): LearningSession => ({
  id: r.id,
  learnerId: r.learner_id,
  surfaceType: r.surface_type,
  referenceId: r.reference_id ?? null,
  startedAt: Number(r.started_at),
  endedAt: r.ended_at != null ? Number(r.ended_at) : null,
  durationSeconds: r.duration_seconds != null ? Number(r.duration_seconds) : null,
  transcriptJson: r.transcript_json ?? null,
  summaryText: r.summary_text ?? null,
  tokensUsed: Number(r.tokens_used)
});

export const learningSessions = {
  forLearner: (learnerId: string, limit = 100) =>
    allRows(
      "SELECT * FROM learning_sessions WHERE learner_id = ? ORDER BY started_at DESC LIMIT ?",
      [learnerId, limit],
      rowToSession
    ),
  get: (id: string) =>
    oneRow("SELECT * FROM learning_sessions WHERE id = ?", [id], rowToSession),
  async start(input: {
    learnerId: string;
    surfaceType: SessionSurface;
    referenceId?: string | null;
  }): Promise<LearningSession> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO learning_sessions (id, learner_id, surface_type, reference_id, started_at, ended_at, duration_seconds, transcript_json, summary_text, tokens_used) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, input.learnerId, input.surfaceType, input.referenceId ?? null, ts, null, null, null, null, 0]
    );
    return {
      id,
      learnerId: input.learnerId,
      surfaceType: input.surfaceType,
      referenceId: input.referenceId ?? null,
      startedAt: ts,
      endedAt: null,
      durationSeconds: null,
      transcriptJson: null,
      summaryText: null,
      tokensUsed: 0
    };
  },
  async end(
    id: string,
    patch: { transcriptJson?: string | null; summaryText?: string | null; tokensUsed?: number } = {}
  ): Promise<LearningSession | null> {
    const session = await learningSessions.get(id);
    if (!session) return null;
    const ts = now();
    const dur = Math.max(0, Math.round((ts - session.startedAt) / 1000));
    await exec(
      "UPDATE learning_sessions SET ended_at=?, duration_seconds=?, transcript_json=?, summary_text=?, tokens_used=COALESCE(?, tokens_used) WHERE id=?",
      [
        ts,
        dur,
        patch.transcriptJson ?? session.transcriptJson,
        patch.summaryText ?? session.summaryText,
        patch.tokensUsed ?? null,
        id
      ]
    );
    return learningSessions.get(id);
  },
  async totalSecondsForLearner(learnerId: string, sinceMs?: number): Promise<number> {
    const row = sinceMs
      ? await oneRow<{ total: number }>(
          "SELECT COALESCE(SUM(duration_seconds), 0) AS total FROM learning_sessions WHERE learner_id = ? AND started_at >= ?",
          [learnerId, sinceMs],
          (r) => ({ total: Number(r.total) })
        )
      : await oneRow<{ total: number }>(
          "SELECT COALESCE(SUM(duration_seconds), 0) AS total FROM learning_sessions WHERE learner_id = ?",
          [learnerId],
          (r) => ({ total: Number(r.total) })
        );
    return row?.total ?? 0;
  },
  remove: async (id: string) =>
    (await exec("DELETE FROM learning_sessions WHERE id = ?", [id])) > 0
};

// ---------- Certificates ----------

export interface Certificate {
  id: string;
  learnerId: string;
  subjectId: string | null;
  title: string;
  issuedAt: number;
  pdfPath: string | null;
  hoursLogged: number | null;
  lessonsCompleted: number | null;
  projectsCompleted: number | null;
  assessmentsPassed: number | null;
  watermark: string | null;
  certificateDataJson: string | null;
}

const rowToCertificate = (r: any): Certificate => ({
  id: r.id,
  learnerId: r.learner_id,
  subjectId: r.subject_id ?? null,
  title: r.title,
  issuedAt: Number(r.issued_at),
  pdfPath: r.pdf_path ?? null,
  hoursLogged: r.hours_logged != null ? Number(r.hours_logged) : null,
  lessonsCompleted: r.lessons_completed != null ? Number(r.lessons_completed) : null,
  projectsCompleted: r.projects_completed != null ? Number(r.projects_completed) : null,
  assessmentsPassed: r.assessments_passed != null ? Number(r.assessments_passed) : null,
  watermark: r.watermark ?? null,
  certificateDataJson: r.certificate_data_json ?? null
});

export const certificates = {
  forLearner: (learnerId: string) =>
    allRows(
      "SELECT * FROM certificates WHERE learner_id = ? ORDER BY issued_at DESC",
      [learnerId],
      rowToCertificate
    ),
  get: (id: string) => oneRow("SELECT * FROM certificates WHERE id = ?", [id], rowToCertificate),
  async create(input: Omit<Certificate, "id" | "issuedAt"> & { issuedAt?: number }): Promise<Certificate> {
    const id = randomUUID();
    const ts = input.issuedAt ?? now();
    await exec(
      "INSERT INTO certificates (id, learner_id, subject_id, title, issued_at, pdf_path, hours_logged, lessons_completed, projects_completed, assessments_passed, watermark, certificate_data_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.learnerId,
        input.subjectId ?? null,
        input.title,
        ts,
        input.pdfPath ?? null,
        input.hoursLogged ?? null,
        input.lessonsCompleted ?? null,
        input.projectsCompleted ?? null,
        input.assessmentsPassed ?? null,
        input.watermark ?? null,
        input.certificateDataJson ?? null
      ]
    );
    return { ...input, id, issuedAt: ts };
  },
  remove: async (id: string) => (await exec("DELETE FROM certificates WHERE id = ?", [id])) > 0
};

// ---------- Supervisors ----------

export type SupervisorSurface = "aerie" | "campus_k12" | "campus_higher_ed";
export type SupervisorRole =
  | "parent"
  | "teacher"
  | "instructor"
  | "department_admin"
  | "campus_admin"
  | "system_admin"
  | "district_admin";

export interface Supervisor {
  id: string;
  surface: SupervisorSurface;
  role: SupervisorRole;
  email: string;
  firstName: string | null;
  lastName: string | null;
  institutionId: string | null;
  hierarchyScopeJson: string | null;
  active: boolean;
  createdAt: number;
}

const rowToSupervisor = (r: any): Supervisor => ({
  id: r.id,
  surface: r.surface,
  role: r.role,
  email: r.email,
  firstName: r.first_name ?? null,
  lastName: r.last_name ?? null,
  institutionId: r.institution_id ?? null,
  hierarchyScopeJson: r.hierarchy_scope_json ?? null,
  active: !!r.active,
  createdAt: Number(r.created_at)
});

export const supervisors = {
  list: () =>
    allRows(
      "SELECT * FROM supervisors WHERE active = 1 ORDER BY last_name, first_name",
      [],
      rowToSupervisor
    ),
  get: (id: string) => oneRow("SELECT * FROM supervisors WHERE id = ?", [id], rowToSupervisor),
  byEmail: (email: string) =>
    oneRow("SELECT * FROM supervisors WHERE email = ?", [email], rowToSupervisor),
  byInstitution: (institutionId: string) =>
    allRows(
      "SELECT * FROM supervisors WHERE institution_id = ? AND active = 1 ORDER BY last_name, first_name",
      [institutionId],
      rowToSupervisor
    ),
  async create(
    input: Omit<Supervisor, "id" | "createdAt" | "active"> & { active?: boolean }
  ): Promise<Supervisor> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO supervisors (id, surface, role, email, first_name, last_name, institution_id, hierarchy_scope_json, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.surface,
        input.role,
        input.email,
        input.firstName ?? null,
        input.lastName ?? null,
        input.institutionId ?? null,
        input.hierarchyScopeJson ?? null,
        input.active === false ? 0 : 1,
        ts
      ]
    );
    return (await supervisors.get(id))!;
  },
  async update(
    id: string,
    patch: Partial<Omit<Supervisor, "id" | "createdAt">>
  ): Promise<Supervisor | null> {
    const existing = await supervisors.get(id);
    if (!existing) return null;
    const m = { ...existing, ...patch };
    await exec(
      "UPDATE supervisors SET surface=?, role=?, email=?, first_name=?, last_name=?, institution_id=?, hierarchy_scope_json=?, active=? WHERE id=?",
      [
        m.surface,
        m.role,
        m.email,
        m.firstName,
        m.lastName,
        m.institutionId,
        m.hierarchyScopeJson,
        m.active ? 1 : 0,
        id
      ]
    );
    return supervisors.get(id);
  },
  remove: async (id: string) => (await exec("DELETE FROM supervisors WHERE id = ?", [id])) > 0,

  // ---- supervisor_learners join ----
  async linkLearner(supervisorId: string, learnerId: string, relationship: string | null): Promise<void> {
    await exec(
      "INSERT OR REPLACE INTO supervisor_learners (supervisor_id, learner_id, relationship) VALUES (?, ?, ?)",
      [supervisorId, learnerId, relationship]
    );
  },
  async unlinkLearner(supervisorId: string, learnerId: string): Promise<void> {
    await exec(
      "DELETE FROM supervisor_learners WHERE supervisor_id = ? AND learner_id = ?",
      [supervisorId, learnerId]
    );
  },
  learnerIdsFor: (supervisorId: string) =>
    allRows<string>(
      "SELECT learner_id FROM supervisor_learners WHERE supervisor_id = ?",
      [supervisorId],
      (r) => r.learner_id
    ),
  supervisorIdsFor: (learnerId: string) =>
    allRows<string>(
      "SELECT supervisor_id FROM supervisor_learners WHERE learner_id = ?",
      [learnerId],
      (r) => r.supervisor_id
    )
};

// ---------- Aerie families ----------

export type AerieTier = "aerie" | "aerie_scholar";

export interface AerieFamily {
  id: string;
  primarySupervisorId: string;
  secondarySupervisorId: string | null;
  familyName: string | null;
  subscriptionTier: AerieTier;
  seatCountKids: number;
  seatCountUsed: number;
  ocwsSubscriptionId: string | null;
  createdAt: number;
  parentPinHash: string | null;
  pinRequired: boolean;
}

const rowToAerieFamily = (r: any): AerieFamily => ({
  id: r.id,
  primarySupervisorId: r.primary_supervisor_id,
  secondarySupervisorId: r.secondary_supervisor_id ?? null,
  familyName: r.family_name ?? null,
  subscriptionTier: r.subscription_tier,
  seatCountKids: Number(r.seat_count_kids),
  seatCountUsed: Number(r.seat_count_used),
  ocwsSubscriptionId: r.ocws_subscription_id ?? null,
  createdAt: Number(r.created_at),
  parentPinHash: r.parent_pin_hash ?? null,
  pinRequired: !!r.pin_required
});

// scrypt + per-family random salt; format "salt-hex:hash-hex". Copied verbatim
// from the desktop edu-repo so a PIN set on either side verifies on the other.
function hashPin(pin: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pin, salt, 32);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function verifyPinHash(pin: string, stored: string): boolean {
  try {
    const [saltHex, hashHex] = stored.split(":");
    if (!saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(pin, salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export const aerieFamilies = {
  list: () =>
    allRows("SELECT * FROM aerie_families ORDER BY created_at DESC", [], rowToAerieFamily),
  get: (id: string) =>
    oneRow("SELECT * FROM aerie_families WHERE id = ?", [id], rowToAerieFamily),
  bySupervisor: (supervisorId: string) =>
    oneRow(
      "SELECT * FROM aerie_families WHERE primary_supervisor_id = ? OR secondary_supervisor_id = ? LIMIT 1",
      [supervisorId, supervisorId],
      rowToAerieFamily
    ),
  async create(
    input: Omit<
      AerieFamily,
      "id" | "createdAt" | "seatCountUsed" | "parentPinHash" | "pinRequired" | "secondarySupervisorId"
    > &
      Partial<Pick<AerieFamily, "seatCountUsed" | "parentPinHash" | "pinRequired" | "secondarySupervisorId">>
  ): Promise<AerieFamily> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO aerie_families (id, primary_supervisor_id, secondary_supervisor_id, family_name, subscription_tier, seat_count_kids, seat_count_used, ocws_subscription_id, created_at, parent_pin_hash, pin_required) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.primarySupervisorId,
        input.secondarySupervisorId ?? null,
        input.familyName ?? null,
        input.subscriptionTier,
        input.seatCountKids,
        input.seatCountUsed ?? 0,
        input.ocwsSubscriptionId ?? null,
        ts,
        input.parentPinHash ?? null,
        input.pinRequired ? 1 : 0
      ]
    );
    return (await aerieFamilies.get(id))!;
  },
  async update(
    id: string,
    patch: Partial<Omit<AerieFamily, "id" | "createdAt">>
  ): Promise<AerieFamily | null> {
    const existing = await aerieFamilies.get(id);
    if (!existing) return null;
    const m = { ...existing, ...patch };
    await exec(
      "UPDATE aerie_families SET primary_supervisor_id=?, secondary_supervisor_id=?, family_name=?, subscription_tier=?, seat_count_kids=?, seat_count_used=?, ocws_subscription_id=?, parent_pin_hash=?, pin_required=? WHERE id=?",
      [
        m.primarySupervisorId,
        m.secondarySupervisorId,
        m.familyName,
        m.subscriptionTier,
        m.seatCountKids,
        m.seatCountUsed,
        m.ocwsSubscriptionId,
        m.parentPinHash,
        m.pinRequired ? 1 : 0,
        id
      ]
    );
    return aerieFamilies.get(id);
  },
  async linkSecondary(familyId: string, supervisorId: string): Promise<AerieFamily> {
    const fam = await aerieFamilies.get(familyId);
    if (!fam) throw new Error(`Family ${familyId} not found.`);
    if (fam.primarySupervisorId === supervisorId) {
      throw new Error("That supervisor is already the primary parent on this family.");
    }
    if (fam.secondarySupervisorId && fam.secondarySupervisorId !== supervisorId) {
      throw new Error(
        "This family already has a secondary parent. Remove the existing one before adding a different one."
      );
    }
    return (await aerieFamilies.update(familyId, { secondarySupervisorId: supervisorId }))!;
  },
  async unlinkSecondary(familyId: string): Promise<AerieFamily> {
    const fam = await aerieFamilies.get(familyId);
    if (!fam) throw new Error(`Family ${familyId} not found.`);
    return (await aerieFamilies.update(familyId, { secondarySupervisorId: null }))!;
  },
  setPin(id: string, pin: string): Promise<AerieFamily | null> {
    if (!/^\d{4,8}$/.test(pin)) {
      throw new Error("PIN must be 4-8 digits.");
    }
    return aerieFamilies.update(id, { parentPinHash: hashPin(pin), pinRequired: true });
  },
  clearPin: (id: string) =>
    aerieFamilies.update(id, { parentPinHash: null, pinRequired: false }),
  async verifyPin(id: string, pin: string): Promise<boolean> {
    const fam = await aerieFamilies.get(id);
    if (!fam) return false;
    if (!fam.pinRequired) return true; // No gate set → always allow.
    if (!fam.parentPinHash) return false; // Required but not yet set.
    return verifyPinHash(pin, fam.parentPinHash);
  },
  remove: async (id: string) => (await exec("DELETE FROM aerie_families WHERE id = ?", [id])) > 0
};

// ---------- Institutional courses ----------

export interface InstitutionalCourse {
  id: string;
  institutionId: string;
  externalCourseId: string | null;
  courseCode: string | null;
  title: string;
  description: string | null;
  subjectId: string | null;
  instructorSupervisorId: string | null;
  term: string | null;
  standardsAlignmentJson: string | null;
  active: boolean;
}

const rowToCourse = (r: any): InstitutionalCourse => ({
  id: r.id,
  institutionId: r.institution_id,
  externalCourseId: r.external_course_id ?? null,
  courseCode: r.course_code ?? null,
  title: r.title,
  description: r.description ?? null,
  subjectId: r.subject_id ?? null,
  instructorSupervisorId: r.instructor_supervisor_id ?? null,
  term: r.term ?? null,
  standardsAlignmentJson: r.standards_alignment_json ?? null,
  active: !!r.active
});

export const institutionalCourses = {
  byInstitution: (institutionId: string) =>
    allRows(
      "SELECT * FROM institutional_courses WHERE institution_id = ? AND active = 1 ORDER BY course_code, title",
      [institutionId],
      rowToCourse
    ),
  get: (id: string) =>
    oneRow("SELECT * FROM institutional_courses WHERE id = ?", [id], rowToCourse),
  async create(
    input: Omit<InstitutionalCourse, "id" | "active"> & Partial<Pick<InstitutionalCourse, "active">>
  ): Promise<InstitutionalCourse> {
    const id = randomUUID();
    await exec(
      "INSERT INTO institutional_courses (id, institution_id, external_course_id, course_code, title, description, subject_id, instructor_supervisor_id, term, standards_alignment_json, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.institutionId,
        input.externalCourseId ?? null,
        input.courseCode ?? null,
        input.title,
        input.description ?? null,
        input.subjectId ?? null,
        input.instructorSupervisorId ?? null,
        input.term ?? null,
        input.standardsAlignmentJson ?? null,
        input.active === false ? 0 : 1
      ]
    );
    return (await institutionalCourses.get(id))!;
  },
  async update(
    id: string,
    patch: Partial<Omit<InstitutionalCourse, "id">>
  ): Promise<InstitutionalCourse | null> {
    const existing = await institutionalCourses.get(id);
    if (!existing) return null;
    const m = { ...existing, ...patch };
    await exec(
      "UPDATE institutional_courses SET institution_id=?, external_course_id=?, course_code=?, title=?, description=?, subject_id=?, instructor_supervisor_id=?, term=?, standards_alignment_json=?, active=? WHERE id=?",
      [
        m.institutionId,
        m.externalCourseId,
        m.courseCode,
        m.title,
        m.description,
        m.subjectId,
        m.instructorSupervisorId,
        m.term,
        m.standardsAlignmentJson,
        m.active ? 1 : 0,
        id
      ]
    );
    return institutionalCourses.get(id);
  },
  remove: async (id: string) =>
    (await exec("DELETE FROM institutional_courses WHERE id = ?", [id])) > 0
};

// ---------- Sibling collaborations ----------

export interface SiblingCollaboration {
  id: string;
  projectId: string;
  primaryLearnerId: string;
  collaboratorLearnerId: string;
  primaryRole: string | null;
  collaboratorRole: string | null;
  createdAt: number;
}

const rowToSiblingCollab = (r: any): SiblingCollaboration => ({
  id: r.id,
  projectId: r.project_id,
  primaryLearnerId: r.primary_learner_id,
  collaboratorLearnerId: r.collaborator_learner_id,
  primaryRole: r.primary_role ?? null,
  collaboratorRole: r.collaborator_role ?? null,
  createdAt: Number(r.created_at)
});

export const siblingCollaborations = {
  forProject: (projectId: string) =>
    allRows(
      "SELECT * FROM sibling_collaborations WHERE project_id = ? ORDER BY created_at",
      [projectId],
      rowToSiblingCollab
    ),
  forLearner: (learnerId: string) =>
    allRows(
      "SELECT * FROM sibling_collaborations WHERE primary_learner_id = ? OR collaborator_learner_id = ? ORDER BY created_at DESC",
      [learnerId, learnerId],
      rowToSiblingCollab
    ),
  async create(input: Omit<SiblingCollaboration, "id" | "createdAt">): Promise<SiblingCollaboration> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO sibling_collaborations (id, project_id, primary_learner_id, collaborator_learner_id, primary_role, collaborator_role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.projectId,
        input.primaryLearnerId,
        input.collaboratorLearnerId,
        input.primaryRole,
        input.collaboratorRole,
        ts
      ]
    );
    return { ...input, id, createdAt: ts };
  },
  remove: async (id: string) =>
    (await exec("DELETE FROM sibling_collaborations WHERE id = ?", [id])) > 0
};

// ---------- FERPA audit log ----------

export type FerpaAccessType =
  | "read_learner"
  | "read_lesson"
  | "read_project"
  | "read_assessment"
  | "read_session"
  | "read_memory"
  | "create_learner"
  | "update_learner"
  | "delete_learner"
  | "bulk_import"
  | "export";

export interface FerpaAuditEntry {
  id: string;
  institutionId: string | null;
  supervisorId: string | null;
  learnerId: string | null;
  accessType: FerpaAccessType;
  details: string | null;
  accessedAt: number;
}

const rowToFerpaAudit = (r: any): FerpaAuditEntry => ({
  id: r.id,
  institutionId: r.institution_id ?? null,
  supervisorId: r.supervisor_id ?? null,
  learnerId: r.learner_id ?? null,
  accessType: r.access_type,
  details: r.details ?? null,
  accessedAt: Number(r.accessed_at)
});

export const ferpaAudit = {
  async log(input: {
    institutionId: string | null;
    supervisorId: string | null;
    learnerId: string | null;
    accessType: FerpaAccessType;
    details?: string | null;
  }): Promise<FerpaAuditEntry> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO ferpa_audit_log (id, institution_id, supervisor_id, learner_id, access_type, details, accessed_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, input.institutionId, input.supervisorId, input.learnerId, input.accessType, input.details ?? null, ts]
    );
    return {
      id,
      institutionId: input.institutionId,
      supervisorId: input.supervisorId,
      learnerId: input.learnerId,
      accessType: input.accessType,
      details: input.details ?? null,
      accessedAt: ts
    };
  },
  byInstitution: (institutionId: string, limit = 500) =>
    allRows(
      "SELECT * FROM ferpa_audit_log WHERE institution_id = ? ORDER BY accessed_at DESC LIMIT ?",
      [institutionId, limit],
      rowToFerpaAudit
    ),
  byLearner: (learnerId: string, limit = 200) =>
    allRows(
      "SELECT * FROM ferpa_audit_log WHERE learner_id = ? ORDER BY accessed_at DESC LIMIT ?",
      [learnerId, limit],
      rowToFerpaAudit
    ),
  recent: (limit = 200) =>
    allRows(
      "SELECT * FROM ferpa_audit_log ORDER BY accessed_at DESC LIMIT ?",
      [limit],
      rowToFerpaAudit
    )
};

// ---------- Campus import runs ----------

export interface CampusImportRun {
  id: string;
  institutionId: string;
  supervisorId: string | null;
  source: string;
  rowsTotal: number;
  rowsCreated: number;
  rowsUpdated: number;
  rowsSkipped: number;
  errorsJson: string | null;
  ranAt: number;
}

const rowToImportRun = (r: any): CampusImportRun => ({
  id: r.id,
  institutionId: r.institution_id,
  supervisorId: r.supervisor_id ?? null,
  source: r.source,
  rowsTotal: Number(r.rows_total),
  rowsCreated: Number(r.rows_created),
  rowsUpdated: Number(r.rows_updated),
  rowsSkipped: Number(r.rows_skipped),
  errorsJson: r.errors_json ?? null,
  ranAt: Number(r.ran_at)
});

export const campusImportRuns = {
  byInstitution: (institutionId: string, limit = 50) =>
    allRows(
      "SELECT * FROM campus_import_runs WHERE institution_id = ? ORDER BY ran_at DESC LIMIT ?",
      [institutionId, limit],
      rowToImportRun
    ),
  async record(input: Omit<CampusImportRun, "id" | "ranAt">): Promise<CampusImportRun> {
    const id = randomUUID();
    const ts = now();
    await exec(
      "INSERT INTO campus_import_runs (id, institution_id, supervisor_id, source, rows_total, rows_created, rows_updated, rows_skipped, errors_json, ran_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        input.institutionId,
        input.supervisorId,
        input.source,
        input.rowsTotal,
        input.rowsCreated,
        input.rowsUpdated,
        input.rowsSkipped,
        input.errorsJson,
        ts
      ]
    );
    return { ...input, id, ranAt: ts };
  }
};
