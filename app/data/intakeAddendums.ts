// app/data/intakeAddendums.ts

export type AddendumKey =
  | "large-property-adjacent-structures"
  | "multi-floor-multi-tenant"
  | "complex-rf-environment"
  | "public-safety-errc-context"
  | "post-install-validation-scope"
  | "travel-outside-region";

export type Addendum = {
  key: AddendumKey;
  title: string;
  description: string;
  appliesToServiceHrefs?: string[]; // optional filter
};

export const ADDENDUMS: Record<AddendumKey, Addendum> = {
  "large-property-adjacent-structures": {
    key: "large-property-adjacent-structures",
    title: "Large Property & Adjacent Structure Addendum",
    description:
      "Use when detached buildings (shop/barn/garage/guest house) or large acreage requires expanded walkdown, measurement, and documentation across multiple structures and outdoor paths.",
    appliesToServiceHrefs: ["/services/premium-home-rf-optimization"],
  },
  "multi-floor-multi-tenant": {
    key: "multi-floor-multi-tenant",
    title: "Multi-Floor / Multi-Tenant Complexity Addendum",
    description:
      "Use when the environment includes multiple floors, multiple suites/tenants, shared risers, IDFs/MDFs, or complicated coverage boundaries requiring expanded mapping and coordination.",
    appliesToServiceHrefs: [
      "/services/commercial-connectivity-rf-baseline-survey",
      "/services/cellular-das-design",
      "/services/post-install-validation",
      "/services/p25-survey",
    ],
  },
  "complex-rf-environment": {
    key: "complex-rf-environment",
    title: "Complex RF Environment Addendum",
    description:
      "Use when high interference, heavy machinery, dense RF devices, repeaters/boosters, or suspected non-Wi-Fi interference suggests expanded spectrum analysis and deeper diagnostics.",
    appliesToServiceHrefs: [
      "/services/premium-home-rf-optimization",
      "/services/commercial-connectivity-rf-baseline-survey",
      "/services/rfi-hunting",
      "/services/post-install-validation",
      "/services/cellular-das-design",
    ],
  },
  "public-safety-errc-context": {
    key: "public-safety-errc-context",
    title: "Public Safety / ERRC Context Addendum",
    description:
      "Use when the request relates to ERRC / public safety radios, BDA/DAS for first responders, AHJ expectations, or acceptance workflows (even if the client is unsure).",
    appliesToServiceHrefs: ["/services/p25-survey", "/services/post-install-validation"],
  },
  "post-install-validation-scope": {
    key: "post-install-validation-scope",
    title: "Post-Install Validation Scope Addendum",
    description:
      "Use when verifying an installed system (DAS/P25/Wi-Fi) against requirements, acceptance metrics, or punch-list outcomes. Helps capture integrator handoff details.",
    appliesToServiceHrefs: ["/services/post-install-validation"],
  },
  "travel-outside-region": {
    key: "travel-outside-region",
    title: "Travel / Mobilization Addendum",
    description:
      "Use when the site is outside the standard service region and requires travel, mobilization time, or multi-day scheduling.",
  },
};

export type IntakeInputs = {
  // What they are asking for
  serviceHref?: string;
  industrySlug?: string;

  // Simple triggers
  hasDetachedStructures?: boolean; // home/estate properties
  acreage?: number | null;

  floors?: number | null;
  multiTenant?: boolean;

  hasIdfMdf?: boolean; // commercial wiring closets / comm rooms
  criticalAreas?: boolean; // stairwells, server rooms, fire command, etc

  suspectedInterference?: boolean; // “intermittent drops”, “mystery outages”
  machineryOrMedical?: boolean; // industrial, imaging, etc
  boostersRepeatersPresent?: boolean;

  publicSafetyConcern?: boolean; // ERRC / radios / AHJ
  postInstallVerification?: boolean; // validating an install / punch list

  outsideRegionTravel?: boolean;
};

function matchesService(add: Addendum, serviceHref?: string) {
  if (!add.appliesToServiceHrefs?.length) return true;
  if (!serviceHref) return false;
  return add.appliesToServiceHrefs.includes(serviceHref);
}

export function computeRecommendedAddendums(inputs: IntakeInputs): Addendum[] {
  const service = inputs.serviceHref;

  const rec: AddendumKey[] = [];

  // Home large-property addendum
  if (
    service === "/services/premium-home-rf-optimization" &&
    ((inputs.acreage ?? 0) >= 1 || inputs.hasDetachedStructures)
  ) {
    rec.push("large-property-adjacent-structures");
  }

  // Multi-floor / multi-tenant / IDF complexity
  if (
    (inputs.floors ?? 1) >= 2 ||
    inputs.multiTenant ||
    inputs.hasIdfMdf ||
    inputs.criticalAreas
  ) {
    rec.push("multi-floor-multi-tenant");
  }

  // Complex RF environment triggers
  if (
    inputs.suspectedInterference ||
    inputs.machineryOrMedical ||
    inputs.boostersRepeatersPresent
  ) {
    rec.push("complex-rf-environment");
  }

  // Public safety / ERRC triggers
  if (inputs.publicSafetyConcern) {
    rec.push("public-safety-errc-context");
  }

  // Post install validation triggers
  if (service === "/services/post-install-validation" || inputs.postInstallVerification) {
    rec.push("post-install-validation-scope");
  }

  // Travel trigger
  if (inputs.outsideRegionTravel) {
    rec.push("travel-outside-region");
  }

  // Deduplicate + filter by service applicability
  const unique = Array.from(new Set(rec));
  return unique
    .map((k) => ADDENDUMS[k])
    .filter((a) => matchesService(a, service));
}
