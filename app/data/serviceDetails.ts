// app/data/serviceDetails.ts

export type ServiceDetail = {
  slug: string;
  title: string;
  short: string;

  // Used on detail pages
  intro?: string;
  whatItIs?: string;
  whyYouNeedIt?: string[];
  deliverables?: string[];
  process?: string[];
  typicalOnsiteTime?: string;
  reportDelivery?: string;
  bestFor?: string;

  // Images shown on the service detail page
  images?: {
    src: string; // from /public
    alt: string;
  }[];
};

export const serviceDetails: ServiceDetail[] = [
  {
    slug: "premium-home-rf-optimization",
    title: "Premium Home & Home Office RF Optimization",
    short:
      "Diagnose interference and performance bottlenecks with a clear, evidence-driven action plan.",
    intro:
      "Stop guessing. Identify the real RF issues and fix them with a clear plan.",
    typicalOnsiteTime: "3–4 hours",
    reportDelivery: "Within 24 hours",
    bestFor: "WFH pros, smart homes, unreliable Wi-Fi/cellular",
    whatItIs:
      "A premium diagnostic engagement focused on identifying hidden RF interference, Wi-Fi congestion, and placement issues impacting real-world performance (video calls, streaming, smart home reliability).",
    whyYouNeedIt: [
      "Consumer tools don’t show non-Wi-Fi interference or the full RF picture.",
      "Congestion and channel overlap can create hidden airtime bottlenecks.",
      "Placement and configuration issues can limit performance even with fast internet.",
    ],
    deliverables: [
      "Findings summary (root causes + evidence)",
      "Wi-Fi congestion / airtime analysis and recommended channel plan",
      "Placement and configuration action plan (what to move/change first)",
      "Optional follow-up validation after changes (if requested)",
    ],
    images: [
      { src: "/services/premium-home-rf-1.jpg", alt: "Spectrum survey example" },
      { src: "/services/premium-home-rf-2.jpg", alt: "Wi-Fi congestion analysis example" },
      { src: "/services/premium-home-rf-3.jpg", alt: "Action plan and placement example" },
    ],
  },

  {
    slug: "rfi-hunting",
    title: "Radio Frequency Interference (RFI) Hunting",
    short:
      "Locate and characterize disruptive RF sources impacting critical wireless systems or electronics.",
    intro:
      "Track down interference sources and document them with defensible evidence.",
    whatItIs:
      "A targeted engagement to locate and characterize disruptive RF emitters and noise sources using professional survey techniques and directional methods.",
    whyYouNeedIt: [
      "Interference can appear intermittent and evade consumer troubleshooting.",
      "Unknown emitters can degrade Wi-Fi, cellular boosters, radios, and electronics.",
      "Evidence matters when escalation or mitigation is required.",
    ],
    deliverables: [
      "Interference characterization (band(s), patterns, strength)",
      "Suspected source location guidance (as feasible)",
      "Mitigation recommendations and escalation-ready documentation",
    ],
    images: [
      { src: "/services/rfi-hunting-1.jpg", alt: "RFI hunting visual 1" },
      { src: "/services/rfi-hunting-2.jpg", alt: "RFI hunting visual 2" },
      { src: "/services/rfi-hunting-3.jpg", alt: "RFI hunting visual 3" },
    ],
  },

  {
    slug: "p25-survey",
    title: "Public Safety (P25) Emergency Responder Radio Coverage (ERRC) Survey",
    short:
      "Grid testing and reporting to support AHJ / Fire Marshal review and compliance workflows.",
    intro:
      "Compliance-oriented survey workflows with clear reporting and deliverables.",
    whatItIs:
      "A structured ERRC survey workflow designed to support AHJ / Fire Marshal review for public safety radio coverage and acceptance.",
    whyYouNeedIt: [
      "Public safety coverage requirements often require documented validation.",
      "Field measurements and grid testing provide defensible results.",
      "Independent reporting supports acceptance and remediation workflows.",
    ],
    deliverables: [
      "Coverage measurement summary and observations",
      "Grid testing documentation (as applicable)",
      "Report formatted for review and follow-on actions",
    ],
    images: [
      { src: "/services/p25-survey-1.jpg", alt: "P25 survey visual 1" },
      { src: "/services/p25-survey-2.jpg", alt: "P25 survey visual 2" },
      { src: "/services/p25-survey-3.jpg", alt: "P25 survey visual 3" },
    ],
  },

  {
    slug: "post-install-validation",
    title: "Post-Installation Validation & Acceptance Survey",
    short:
      "Independent verification that a newly installed DAS/P25/Wi-Fi system meets the original specs.",
    intro:
      "Verify performance and acceptance readiness after install changes or upgrades.",
    whatItIs:
      "A verification engagement to validate that a newly installed or modified system performs as intended and aligns with baseline requirements/specs.",
    whyYouNeedIt: [
      "Install quality varies; verification catches issues early.",
      "Acceptance testing should be evidence-driven and repeatable.",
      "Documentation supports handoff, warranty, and remediation.",
    ],
    deliverables: [
      "Validation measurements and observations",
      "Comparison to requirements/specs (where provided)",
      "Acceptance-ready report package",
    ],
    images: [
      { src: "/services/post-install-validation-1.jpg", alt: "Post-install validation visual 1" },
      { src: "/services/post-install-validation-2.jpg", alt: "Post-install validation visual 2" },
      { src: "/services/post-install-validation-3.jpg", alt: "Post-install validation visual 3" },
    ],
  },

  {
    slug: "cellular-das-design",
    title: "Cellular / DAS Initial Survey & Design Blueprint",
    short:
      "Donor signal survey + in-building gap analysis + blueprint outputs to guide integrators and budgeting.",
    intro:
      "Start with measurements, then build an actionable blueprint for design and budgeting.",
    whatItIs:
      "A front-end survey engagement that captures donor signal conditions, identifies coverage gaps, and produces a practical blueprint package to guide DAS planning and integration.",
    whyYouNeedIt: [
      "Design decisions are only as good as the measurements.",
      "Early gap analysis prevents costly scope surprises later.",
      "Blueprint outputs help integrators bid and plan accurately.",
    ],
    deliverables: [
      "Donor signal assessment summary",
      "In-building gap analysis (measured findings)",
      "Blueprint outputs for planning/budgeting",
    ],
    images: [
      { src: "/services/cellular-das-design-1.jpg", alt: "Cellular/DAS design visual 1" },
      { src: "/services/cellular-das-design-2.jpg", alt: "Cellular/DAS design visual 2" },
      { src: "/services/cellular-das-design-3.jpg", alt: "Cellular/DAS design visual 3" },
    ],
  },
];

export function getServiceDetailBySlug(slug: string) {
  return serviceDetails.find((s) => s.slug === slug);
}
