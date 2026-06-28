import {
  assessments,
  lessons,
  learningSessions,
  subjects as subjectsRepo,
  type Subject
} from "./edu-repo";

/**
 * Curriculum progression engine — async (Turso) port of the desktop
 * electron/services/curriculum.ts. Decides which subject a learner is currently
 * working through and whether they've earned promotion to the next one. Logic
 * copied verbatim; only the repo reads are awaited.
 *
 * Promotion criteria (default): 3 lessons completed in current subject AND at
 * least 1 quiz/test passed at >= 70%. Failsafe: 4 hours total session time in
 * the current subject promotes even without formal completions.
 */

export const CURRICULUM_ORDER: string[] = [
  "wireless-fundamentals",
  "electronics-fundamentals",
  "antenna-design",
  "rf-physics",
  "wifi",
  "bluetooth-ble",
  "gps-gnss",
  "ham-radio",
  "cellular",
  "sdr",
  "radar",
  "lora-lpwan",
  "nfc-rfid",
  "satcom",
  "zigbee-thread-matter",
  "programming-for-wireless",
  "network-design",
  "electronic-warfare-beginner"
];

const PROMOTION_LESSON_THRESHOLD = 3;
const PROMOTION_QUIZ_PASS_THRESHOLD = 0.7;
const PROMOTION_HOURS_FAILSAFE = 4;

export interface CurriculumState {
  currentSubject: Subject;
  nextSubject: Subject | null;
  index: number;
  promotion: {
    lessonsCompleted: number;
    quizzesPassed: number;
    hoursLogged: number;
    eligibleForPromotion: boolean;
    reason: string;
  };
}

export async function curriculumStateFor(learnerId: string): Promise<CurriculumState> {
  const ordered: Subject[] = [];
  for (const slug of CURRICULUM_ORDER) {
    const s = await subjectsRepo.bySlug(slug);
    if (s) ordered.push(s);
  }
  if (ordered.length === 0) {
    throw new Error("Curriculum order references slugs that don't exist in subjects table.");
  }

  const allLessons = await lessons.forLearner(learnerId, 500);
  const allAssessments = await assessments.forLearner(learnerId, 500);
  const sessions = await learningSessions.forLearner(learnerId, 1000);

  for (let i = 0; i < ordered.length; i++) {
    const subj = ordered[i];
    const subjLessons = allLessons.filter((l) => l.subjectId === subj.id);
    const subjAssessments = allAssessments.filter((a) => {
      const lesson = a.lessonId ? allLessons.find((l) => l.id === a.lessonId) : null;
      return lesson?.subjectId === subj.id;
    });
    const subjSessions = sessions.filter((s) => {
      if (!s.referenceId) return false;
      const lesson = allLessons.find((l) => l.id === s.referenceId);
      return lesson?.subjectId === subj.id;
    });

    const lessonsCompleted = subjLessons.filter((l) => l.status === "completed").length;
    const quizzesPassed = subjAssessments.filter(
      (a) => a.status === "graded" && (a.scorePercent ?? 0) >= PROMOTION_QUIZ_PASS_THRESHOLD
    ).length;
    const hoursLogged =
      subjSessions.reduce((acc, s) => acc + (s.durationSeconds ?? 0), 0) / 3600;

    const formalEligible =
      lessonsCompleted >= PROMOTION_LESSON_THRESHOLD && quizzesPassed >= 1;
    const failsafeEligible = hoursLogged >= PROMOTION_HOURS_FAILSAFE;
    const eligibleForPromotion = formalEligible || failsafeEligible;

    if (!eligibleForPromotion || i === ordered.length - 1) {
      const reason = eligibleForPromotion
        ? "Curriculum end reached — staying here for now."
        : formalEligible
        ? "Ready to advance."
        : failsafeEligible
        ? "Failsafe hours met — ready to advance."
        : `Need ${Math.max(0, PROMOTION_LESSON_THRESHOLD - lessonsCompleted)} more lesson(s) and ${Math.max(0, 1 - quizzesPassed)} quiz pass(es); or ${Math.max(0, PROMOTION_HOURS_FAILSAFE - hoursLogged).toFixed(1)} more hour(s) logged.`;
      return {
        currentSubject: subj,
        nextSubject: i + 1 < ordered.length ? ordered[i + 1] : null,
        index: i,
        promotion: {
          lessonsCompleted,
          quizzesPassed,
          hoursLogged: Math.round(hoursLogged * 10) / 10,
          eligibleForPromotion,
          reason
        }
      };
    }
  }

  // Unreachable — the loop always returns. Defensive default:
  const first = ordered[0];
  return {
    currentSubject: first,
    nextSubject: ordered[1] ?? null,
    index: 0,
    promotion: {
      lessonsCompleted: 0,
      quizzesPassed: 0,
      hoursLogged: 0,
      eligibleForPromotion: false,
      reason: `Need ${PROMOTION_LESSON_THRESHOLD} lessons and 1 quiz pass.`
    }
  };
}
