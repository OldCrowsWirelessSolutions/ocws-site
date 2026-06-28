import {
  aerieFamilies,
  institutionalCourses,
  institutions,
  learnerMemory,
  learners,
  supervisors,
  type AerieFamily,
  type Learner
} from "./edu-repo";

/**
 * Demo seed for the education layer — async (Turso) port of the desktop
 * electron/services/edu-seed.ts. Logic + demo data copied verbatim; every repo
 * call is awaited. Two entry points:
 *   - seedTurnerFamily(parentEmail): Joshua's Aerie family (Gabriel + Luke) with
 *     primed Corvus memory.
 *   - seedAcademyDemo(parentEmail): one adult Academy learner (Sage / CCNA).
 *   - seedCampusDemo(): UH system + UHD + EE 4322, plus Pensacola district + school.
 * All idempotent — re-calling returns the existing records without duplicating.
 */

interface CognitiveProfile {
  diagnostic_hints: {
    adhd: boolean | null;
    gifted: boolean | null;
    dyslexia: boolean | null;
    asd: boolean | null;
    twice_exceptional: boolean | null;
    introvert_extrovert: "intro" | "extro" | "ambi" | null;
    reading_level_grade_band: string | null;
  };
  preferences: {
    tts_default_on: boolean;
    reduced_motion: boolean;
    low_stim_mode: boolean;
    high_contrast_mode: boolean;
    session_minutes_target: number;
    movement_break_prompts: boolean;
    on_demand_tts_button: boolean;
    persistent_glossary_sidebar: boolean;
    hands_on_first: boolean;
    narrative_anchored: boolean;
    project_oriented: boolean;
    text_dense_ok: boolean;
    gamification: { streaks: boolean; leaderboard: boolean; badges: boolean };
  };
}

function isoDateNYearsAgo(years: number, monthOffset = 0, dayOffset = 0): string {
  const today = new Date();
  const d = new Date(
    today.getFullYear() - years,
    today.getMonth() - monthOffset,
    today.getDate() - dayOffset
  );
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export interface SeedTurnerResult {
  family: AerieFamily | null;
  parentSupervisorId: string;
  gabriel: Learner;
  luke: Learner;
  alreadyExisted: boolean;
}

export async function seedTurnerFamily(parentEmail: string): Promise<SeedTurnerResult> {
  const existingSupervisor = await supervisors.byEmail(parentEmail);
  if (existingSupervisor) {
    const existingFamily = await aerieFamilies.bySupervisor(existingSupervisor.id);
    if (existingFamily) {
      const kids = await learners.byParentAccount(existingSupervisor.id);
      const gabriel = kids.find((k) => k.firstName === "Gabriel");
      const luke = kids.find((k) => k.firstName === "Luke");
      if (gabriel && luke) {
        return {
          family: existingFamily,
          parentSupervisorId: existingSupervisor.id,
          gabriel,
          luke,
          alreadyExisted: true
        };
      }
    }
  }

  const parent =
    existingSupervisor ??
    (await supervisors.create({
      surface: "aerie",
      role: "parent",
      email: parentEmail,
      firstName: "Joshua",
      lastName: "Turner",
      institutionId: null,
      hierarchyScopeJson: null
    }));

  const family = await aerieFamilies.create({
    primarySupervisorId: parent.id,
    familyName: "Turner Family",
    subscriptionTier: "aerie",
    seatCountKids: 3,
    ocwsSubscriptionId: null
  });

  // Gabriel — 8yo, 2nd grade overall, math at 7th grade. Introvert, gifted,
  // narrative-anchored. Mira is the natural mentor pick.
  const gabrielProfile: CognitiveProfile = {
    diagnostic_hints: {
      adhd: false,
      gifted: true,
      dyslexia: false,
      asd: false,
      twice_exceptional: false,
      introvert_extrovert: "intro",
      reading_level_grade_band: "5"
    },
    preferences: {
      tts_default_on: false,
      reduced_motion: false,
      low_stim_mode: false,
      high_contrast_mode: false,
      session_minutes_target: 25,
      movement_break_prompts: false,
      on_demand_tts_button: true,
      persistent_glossary_sidebar: true,
      hands_on_first: true,
      narrative_anchored: true,
      project_oriented: true,
      text_dense_ok: true,
      gamification: { streaks: true, leaderboard: false, badges: true }
    }
  };
  const gabriel = await learners.create({
    surface: "aerie",
    parentAccountId: parent.id,
    institutionId: null,
    firstName: "Gabriel",
    preferredName: null,
    lastName: "Turner",
    birthdate: isoDateNYearsAgo(8, 4, 0),
    age: 8,
    defaultGradeLevel: "2",
    sex: "male",
    cognitiveProfileJson: JSON.stringify(gabrielProfile),
    perSubjectGradeOverrideJson: JSON.stringify({ math: "7" }),
    goalsJson: null,
    iep504FlagsJson: null,
    major: null,
    department: null,
    enrolledCoursesJson: null,
    email: null,
    externalId: null,
    mentorBirdPref: "mira",
    interestsStructuredJson: JSON.stringify([
      "monster-design",
      "worldbuilding",
      "clay-sculpture",
      "writing-lore",
      "reading",
      "math",
      "solitude"
    ]),
    uxBandOverride: null
  });

  const gMem: Array<{
    type: Parameters<typeof learnerMemory.append>[0]["memoryType"];
    content: string;
    weight?: number;
  }> = [
    {
      type: "interest",
      content:
        "Builds original monsters across three mediums: imagination, clay sculpture, and written lore with abilities and rules.",
      weight: 1.5
    },
    {
      type: "interest",
      content: "Avid reader, comfortable with text-dense material above grade level.",
      weight: 1.2
    },
    {
      type: "preference",
      content:
        "Needs solitude to think; engages best asynchronously. Has a walk-in closet as his quiet space when he needs to retreat.",
      weight: 1.3
    },
    {
      type: "reference_anchor",
      content:
        "Math operates at middle-school level (6th-7th); honor that ceiling on math without forcing the rest of the curriculum to match.",
      weight: 1.5
    },
    {
      type: "reference_anchor",
      content:
        "RF physics framed as creature-ecosystem worldbuilding lands well: frequency bands as creature habitats, propagation as movement, antennas as creature anatomy.",
      weight: 1.4
    }
  ];
  for (const m of gMem) {
    await learnerMemory.append({
      learnerId: gabriel.id,
      memoryType: m.type,
      content: m.content,
      weight: m.weight
    });
  }

  // Luke — 9yo, 4th grade, ADHD-extrovert, hands-on. Pip is the match.
  const lukeProfile: CognitiveProfile = {
    diagnostic_hints: {
      adhd: true,
      gifted: false,
      dyslexia: false,
      asd: false,
      twice_exceptional: false,
      introvert_extrovert: "extro",
      reading_level_grade_band: "4"
    },
    preferences: {
      tts_default_on: false,
      reduced_motion: false,
      low_stim_mode: false,
      high_contrast_mode: false,
      session_minutes_target: 12,
      movement_break_prompts: true,
      on_demand_tts_button: true,
      persistent_glossary_sidebar: true,
      hands_on_first: true,
      narrative_anchored: false,
      project_oriented: true,
      text_dense_ok: false,
      gamification: { streaks: false, leaderboard: false, badges: true }
    }
  };
  const luke = await learners.create({
    surface: "aerie",
    parentAccountId: parent.id,
    institutionId: null,
    firstName: "Luke",
    preferredName: null,
    lastName: "Turner",
    birthdate: isoDateNYearsAgo(9, 7, 0),
    age: 9,
    defaultGradeLevel: "4",
    sex: "male",
    cognitiveProfileJson: JSON.stringify(lukeProfile),
    perSubjectGradeOverrideJson: null,
    goalsJson: null,
    iep504FlagsJson: null,
    major: null,
    department: null,
    enrolledCoursesJson: null,
    email: null,
    externalId: null,
    mentorBirdPref: "pip",
    interestsStructuredJson: JSON.stringify([
      "building",
      "circuits",
      "movement",
      "team-work",
      "puzzles"
    ]),
    uxBandOverride: null
  });

  const lMem: Array<{
    type: Parameters<typeof learnerMemory.append>[0]["memoryType"];
    content: string;
    weight?: number;
  }> = [
    {
      type: "interest",
      content: "Hands-on building, immediate feedback, fast pace. Loves the moment a circuit lights up.",
      weight: 1.5
    },
    {
      type: "preference",
      content:
        "Short bursts work better than long sessions; novelty rotation keeps engagement. Movement breaks help him reset.",
      weight: 1.4
    },
    {
      type: "reference_anchor",
      content:
        "Pip's natural tempo matches Luke's — lean into the energy, don't dampen it. The March Hare bounce is a feature, not a bug.",
      weight: 1.5
    },
    {
      type: "topic_covered",
      content:
        "Completed an LED circuit project the week of intake; asked twice about how Wi-Fi signals travel through walls. Open thread for Pip to pull.",
      weight: 1.3
    }
  ];
  for (const m of lMem) {
    await learnerMemory.append({
      learnerId: luke.id,
      memoryType: m.type,
      content: m.content,
      weight: m.weight
    });
  }

  await supervisors.linkLearner(parent.id, gabriel.id, "parent_of");
  await supervisors.linkLearner(parent.id, luke.id, "parent_of");

  await aerieFamilies.update(family.id, { seatCountUsed: 2 });

  return {
    family: await aerieFamilies.get(family.id),
    parentSupervisorId: parent.id,
    gabriel,
    luke,
    alreadyExisted: false
  };
}

// ---- Academy demo (single adult learner) ----

export interface SeedAcademyResult {
  learner: Learner;
  parentSupervisorId: string;
  alreadyExisted: boolean;
}

export async function seedAcademyDemo(parentEmail: string): Promise<SeedAcademyResult> {
  const existingSupervisor = await supervisors.byEmail(parentEmail);
  if (existingSupervisor) {
    const existingLearner = (await learners.byParentAccount(existingSupervisor.id)).find(
      (l) => l.surface === "academy"
    );
    if (existingLearner) {
      return {
        learner: existingLearner,
        parentSupervisorId: existingSupervisor.id,
        alreadyExisted: true
      };
    }
  }

  const sup =
    existingSupervisor ??
    (await supervisors.create({
      surface: "aerie", // single supervisor row; reused across surfaces
      role: "parent",
      email: parentEmail,
      firstName: "Joshua",
      lastName: "Turner",
      institutionId: null,
      hierarchyScopeJson: null
    }));

  const profile: CognitiveProfile = {
    diagnostic_hints: {
      adhd: null,
      gifted: null,
      dyslexia: null,
      asd: null,
      twice_exceptional: null,
      introvert_extrovert: null,
      reading_level_grade_band: "adult"
    },
    preferences: {
      tts_default_on: false,
      reduced_motion: false,
      low_stim_mode: false,
      high_contrast_mode: false,
      session_minutes_target: 45,
      movement_break_prompts: false,
      on_demand_tts_button: false,
      persistent_glossary_sidebar: true,
      hands_on_first: true,
      narrative_anchored: false,
      project_oriented: true,
      text_dense_ok: true,
      gamification: { streaks: false, leaderboard: false, badges: false }
    }
  };

  const learner = await learners.create({
    surface: "academy",
    parentAccountId: sup.id,
    institutionId: null,
    firstName: "Joshua",
    preferredName: null,
    lastName: "Turner",
    birthdate: null,
    age: null,
    defaultGradeLevel: "adult",
    sex: null,
    cognitiveProfileJson: JSON.stringify(profile),
    perSubjectGradeOverrideJson: null,
    goalsJson: JSON.stringify({
      primary_goal: "Certification prep",
      certification_targets: ["CCNA"],
      career_target: null,
      time_budget_hours_per_week: 5,
      target_completion_date: null
    }),
    iep504FlagsJson: null,
    major: null,
    department: null,
    enrolledCoursesJson: null,
    email: parentEmail,
    externalId: null,
    mentorBirdPref: "sage",
    interestsStructuredJson: JSON.stringify([
      "wireless-engineering",
      "certification-prep",
      "network-design"
    ]),
    uxBandOverride: "adult"
  });

  await learnerMemory.append({
    learnerId: learner.id,
    memoryType: "goal_progress",
    content: "Targeting CCNA. 5 hours/week budget. Strong RF background already.",
    weight: 1.4
  });
  await learnerMemory.append({
    learnerId: learner.id,
    memoryType: "preference",
    content: "Adult professional. Direct discourse. Skip elementary scaffolding; engage at engineer level.",
    weight: 1.5
  });

  await supervisors.linkLearner(sup.id, learner.id, "self");

  return {
    learner,
    parentSupervisorId: sup.id,
    alreadyExisted: false
  };
}

export interface SeedCampusResult {
  uhSystemId: string;
  uhMainId: string;
  uhdId: string;
  uhEricSupervisorId: string;
  ee4322CourseId: string;
  pensacolaDistrictId: string;
  pensacolaElementaryId: string;
  alreadyExisted: boolean;
}

export async function seedCampusDemo(): Promise<SeedCampusResult> {
  const all = await institutions.list();
  const existing = all.find((i) => i.name === "University of Houston System");
  if (existing) {
    const uhMain =
      all.find((i) => i.name === "University of Houston (Main Campus)") ??
      (await institutions.create({
        name: "University of Houston (Main Campus)",
        type: "higher_ed_campus",
        parentInstitutionId: existing.id,
        hierarchyPath: "uh-system/uh-main",
        contactEmail: null,
        contactName: null,
        ssoProvider: null,
        ssoConfigJson: null,
        sisProvider: null,
        sisConfigJson: null,
        standardsAlignmentDefault: "abet",
        stateCode: "TX"
      }));
    const uhd =
      all.find((i) => i.name === "University of Houston-Downtown") ??
      (await institutions.create({
        name: "University of Houston-Downtown",
        type: "higher_ed_campus",
        parentInstitutionId: existing.id,
        hierarchyPath: "uh-system/uhd",
        contactEmail: null,
        contactName: null,
        ssoProvider: null,
        ssoConfigJson: null,
        sisProvider: null,
        sisConfigJson: null,
        standardsAlignmentDefault: "abet",
        stateCode: "TX"
      }));
    const eric =
      (await supervisors.byEmail("eric.mims@uh.example")) ??
      (await supervisors.create({
        surface: "campus_higher_ed",
        role: "system_admin",
        email: "eric.mims@uh.example",
        firstName: "Eric",
        lastName: "Mims",
        institutionId: existing.id,
        hierarchyScopeJson: JSON.stringify({ type: "system", id: existing.id })
      }));
    const courses = await institutionalCourses.byInstitution(uhMain.id);
    const ee4322 =
      courses.find((c) => c.courseCode === "EE 4322") ??
      (await institutionalCourses.create({
        institutionId: uhMain.id,
        externalCourseId: null,
        courseCode: "EE 4322",
        title: "Wireless Communication Systems",
        description:
          "Senior-level survey of wireless communication: propagation, modulation, multiple access, link budgets, and modern cellular and Wi-Fi standards.",
        subjectId: null,
        instructorSupervisorId: eric.id,
        term: "Fall 2026",
        standardsAlignmentJson: JSON.stringify({ abet: ["EAC: General Criteria 3"] })
      }));

    const district =
      all.find((i) => i.name === "Pensacola Demo School District") ??
      (await institutions.create({
        name: "Pensacola Demo School District",
        type: "k12_district",
        parentInstitutionId: null,
        hierarchyPath: "pensacola-district",
        contactEmail: null,
        contactName: null,
        ssoProvider: null,
        ssoConfigJson: null,
        sisProvider: null,
        sisConfigJson: null,
        standardsAlignmentDefault: "common_core",
        stateCode: "FL"
      }));
    const elementary =
      (await institutions.childrenOf(district.id)).find(
        (i) => i.name === "Pensacola Demo Elementary"
      ) ??
      (await institutions.create({
        name: "Pensacola Demo Elementary",
        type: "k12_school",
        parentInstitutionId: district.id,
        hierarchyPath: "pensacola-district/elementary",
        contactEmail: null,
        contactName: null,
        ssoProvider: null,
        ssoConfigJson: null,
        sisProvider: null,
        sisConfigJson: null,
        standardsAlignmentDefault: "common_core",
        stateCode: "FL"
      }));

    return {
      uhSystemId: existing.id,
      uhMainId: uhMain.id,
      uhdId: uhd.id,
      uhEricSupervisorId: eric.id,
      ee4322CourseId: ee4322.id,
      pensacolaDistrictId: district.id,
      pensacolaElementaryId: elementary.id,
      alreadyExisted: true
    };
  }

  // Fresh seed.
  const uhSystem = await institutions.create({
    name: "University of Houston System",
    type: "higher_ed_system",
    parentInstitutionId: null,
    hierarchyPath: "uh-system",
    contactEmail: null,
    contactName: null,
    ssoProvider: null,
    ssoConfigJson: null,
    sisProvider: null,
    sisConfigJson: null,
    standardsAlignmentDefault: "abet",
    stateCode: "TX"
  });
  const uhMain = await institutions.create({
    name: "University of Houston (Main Campus)",
    type: "higher_ed_campus",
    parentInstitutionId: uhSystem.id,
    hierarchyPath: "uh-system/uh-main",
    contactEmail: null,
    contactName: null,
    ssoProvider: null,
    ssoConfigJson: null,
    sisProvider: null,
    sisConfigJson: null,
    standardsAlignmentDefault: "abet",
    stateCode: "TX"
  });
  const uhd = await institutions.create({
    name: "University of Houston-Downtown",
    type: "higher_ed_campus",
    parentInstitutionId: uhSystem.id,
    hierarchyPath: "uh-system/uhd",
    contactEmail: null,
    contactName: null,
    ssoProvider: null,
    ssoConfigJson: null,
    sisProvider: null,
    sisConfigJson: null,
    standardsAlignmentDefault: "abet",
    stateCode: "TX"
  });
  const eric = await supervisors.create({
    surface: "campus_higher_ed",
    role: "system_admin",
    email: "eric.mims@uh.example",
    firstName: "Eric",
    lastName: "Mims",
    institutionId: uhSystem.id,
    hierarchyScopeJson: JSON.stringify({ type: "system", id: uhSystem.id })
  });
  const ee4322 = await institutionalCourses.create({
    institutionId: uhMain.id,
    externalCourseId: null,
    courseCode: "EE 4322",
    title: "Wireless Communication Systems",
    description:
      "Senior-level survey of wireless communication: propagation, modulation, multiple access, link budgets, and modern cellular and Wi-Fi standards.",
    subjectId: null,
    instructorSupervisorId: eric.id,
    term: "Fall 2026",
    standardsAlignmentJson: JSON.stringify({ abet: ["EAC: General Criteria 3"] })
  });

  const district = await institutions.create({
    name: "Pensacola Demo School District",
    type: "k12_district",
    parentInstitutionId: null,
    hierarchyPath: "pensacola-district",
    contactEmail: null,
    contactName: null,
    ssoProvider: null,
    ssoConfigJson: null,
    sisProvider: null,
    sisConfigJson: null,
    standardsAlignmentDefault: "common_core",
    stateCode: "FL"
  });
  const elementary = await institutions.create({
    name: "Pensacola Demo Elementary",
    type: "k12_school",
    parentInstitutionId: district.id,
    hierarchyPath: "pensacola-district/elementary",
    contactEmail: null,
    contactName: null,
    ssoProvider: null,
    ssoConfigJson: null,
    sisProvider: null,
    sisConfigJson: null,
    standardsAlignmentDefault: "common_core",
    stateCode: "FL"
  });

  return {
    uhSystemId: uhSystem.id,
    uhMainId: uhMain.id,
    uhdId: uhd.id,
    uhEricSupervisorId: eric.id,
    ee4322CourseId: ee4322.id,
    pensacolaDistrictId: district.id,
    pensacolaElementaryId: elementary.id,
    alreadyExisted: false
  };
}
