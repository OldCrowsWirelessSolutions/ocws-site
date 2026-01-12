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
  {
    href: "/services/small-business-rf-assessment",
    title: "Small Business Connectivity & RF Assessment",
    description:
      "Evidence-driven RF and Wi-Fi assessment to improve reliability for staff, customers, and critical devices.",
    footnote: "Small business-ready",
  },
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

  // Small Business (professional offices, small orgs)
  "small-business": [
    "/services/small-business-rf-assessment",
    "/services/rfi-hunting",
    "/services/cellular-das-design",
  ],

  // Healthcare
  healthcare: ["/services/cellular-das-design", "/services/rfi-hunting"],

  // Hospitality
  hospitality: ["/services/rfi-hunting", "/services/cellular-das-design"],

  // Retail
  retail: ["/services/rfi-hunting", "/services/cellular-das-design"],

  // Industrial
  industrial: ["/services/rfi-hunting", "/services/cellular-das-design"],

  // Education
  education: ["/services/cellular-das-design", "/services/rfi-hunting"],

  // Enterprise
  enterprise: ["/services/cellular-das-design", "/services/rfi-hunting"],

  // Government (non-public-safety)
  government: ["/services/cellular-das-design", "/services/rfi-hunting"],

  // Public Safety (P25 / ERRC)
  "public-safety": ["/services/p25-survey", "/services/cellular-das-design"],
};
