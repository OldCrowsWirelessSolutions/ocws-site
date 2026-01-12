// app/data/industryServiceMap.ts

export type ServiceCard = {
  href: string;
  title: string;
  description: string;
  footnote?: string;
};

export const ALL_SERVICES: ServiceCard[] = [
  {
    href: "/services/premium-home-rf-optimization",
    title: "Premium Home & Home Office RF Optimization",
    description:
      "Diagnose interference and performance bottlenecks with a clear, evidence-driven action plan.",
    footnote: "Most popular",
  },
  {
    href: "/services/rfi-hunting",
    title: "Radio Frequency Interference (RFI) Hunting",
    description:
      "Locate and characterize disruptive RF sources impacting critical wireless systems or electronics.",
    footnote: "Advanced diagnostics",
  },
  {
    href: "/services/p25-survey",
    title: "Public Safety (P25) ERRC Survey",
    description:
      "Grid testing and reporting to support AHJ / Fire Marshal review and compliance workflows.",
    footnote: "Compliance-ready evidence",
  },
  {
    href: "/services/cellular-das-design",
    title: "Cellular / DAS Survey & Design Blueprint",
    description:
      "Donor signal survey + in-building gap analysis + blueprint outputs to guide integrators and budgeting.",
    footnote: "Commercial environments",
  },

  // NEW — baseline survey for small business and above
  {
    href: "/services/commercial-connectivity-rf-baseline-survey",
    title: "Commercial Connectivity & RF Baseline Survey",
    description:
      "Establish a defensible baseline across cellular, Wi-Fi, and RF conditions—then receive prioritized recommendations and next-step options for your environment.",
    footnote: "Recommended first step (B2B)",
  },

  // NOTE: Option A decision — Small Business uses the Baseline Survey as the single recommended
  // starting point. The "Small Business Connectivity & RF Assessment" service is intentionally
  // not listed here to avoid redundant/overlapping recommendations in the UI.
];

/**
 * Map industry slug -> list of service hrefs recommended for that industry.
 * Slugs must match app/data/industries.ts (ind.slug).
 */
export const INDUSTRY_TO_SERVICE_HREFS: Record<string, string[]> = {
  // Homes & Estates (home + home office)
  "homes-estates": [
    "/services/premium-home-rf-optimization",
    "/services/rfi-hunting",
  ],

  // Small Business (professional offices, small orgs) — Option A: one clear baseline entry
  "small-business": [
    "/services/commercial-connectivity-rf-baseline-survey",
    "/services/rfi-hunting",
    "/services/cellular-das-design",
  ],

  // Healthcare
  healthcare: [
    "/services/commercial-connectivity-rf-baseline-survey",
    "/services/cellular-das-design",
    "/services/rfi-hunting",
  ],

  // Hospitality
  hospitality: [
    "/services/commercial-connectivity-rf-baseline-survey",
    "/services/rfi-hunting",
    "/services/cellular-das-design",
  ],

  // Retail
  retail: [
    "/services/commercial-connectivity-rf-baseline-survey",
    "/services/rfi-hunting",
    "/services/cellular-das-design",
  ],

  // Industrial
  industrial: [
    "/services/commercial-connectivity-rf-baseline-survey",
    "/services/rfi-hunting",
    "/services/cellular-das-design",
  ],

  // Education
  education: [
    "/services/commercial-connectivity-rf-baseline-survey",
    "/services/cellular-das-design",
    "/services/rfi-hunting",
  ],

  // Enterprise
  enterprise: [
    "/services/commercial-connectivity-rf-baseline-survey",
    "/services/cellular-das-design",
    "/services/rfi-hunting",
  ],

  // Government (non-public-safety)
  government: [
    "/services/commercial-connectivity-rf-baseline-survey",
    "/services/cellular-das-design",
    "/services/rfi-hunting",
  ],

  // Public Safety (P25 / ERRC)
  "public-safety": [
    "/services/commercial-connectivity-rf-baseline-survey",
    "/services/p25-survey",
    "/services/cellular-das-design",
  ],
};
