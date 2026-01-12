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
];

/**
 * Map industry slug -> list of service hrefs recommended for that industry.
 * Add/edit slugs here to match app/data/industries.ts (ind.slug values).
 */
export const INDUSTRY_TO_SERVICE_HREFS: Record<string, string[]> = {
  // Residential
  "homes-estates": [
    "/services/premium-home-rf-optimization",
    "/services/rfi-hunting",
  ],

  // Healthcare / clinics
  healthcare: [
    "/services/cellular-das-design",
    "/services/rfi-hunting",
  ],

  // Hospitality
  hospitality: [
    "/services/rfi-hunting",
    "/services/cellular-das-design",
  ],

  // Small business / office (use your actual slug if different)
  "small-business": [
    "/services/rfi-hunting",
    "/services/cellular-das-design",
  ],

  // Commercial / enterprise (use your actual slug if different)
  commercial: [
    "/services/cellular-das-design",
    "/services/rfi-hunting",
  ],

  // Public safety / government (use your actual slug if different)
  "public-safety": [
    "/services/p25-survey",
    "/services/cellular-das-design",
  ],
};
