// app/data/catalog.ts
// Final compatibility catalog.
// Key fix: `images` is a STRING ARRAY so your [service] pages can `.map()` and pass strings to <Image src="...">.

export type ServiceKey =
  | "premium-home-rf-optimization"
  | "p25-network-survey"
  | "das-design-sow"
  | "rfi-hunting"
  | "post-install-validation";

export type VerticalKey = "residential" | "commercial" | "public-safety";

export type IndustryKey =
  | "residential"
  | "small-business"
  | "healthcare"
  | "hospitality"
  | "education"
  | "industrial";

export type Vertical = {
  key: VerticalKey;
  name: string;
  short: string;
  description: string;
};

export type Service = {
  key: ServiceKey;
  name: string;
  short: string;

  // Learn page content blocks
  headline: string;
  whatItIs: string;
  whyYouNeedIt: string[];

  // Buckets (support both names)
  verticals: VerticalKey[];
  forVerticals: VerticalKey[];
  forIndustries: IndustryKey[];

  // UI fields used by multiple components
  bullets: string[];
  deliverables: string[];
  networksCovered: string[];

  // Learn page sections
  commonMisconceptions: string[];
  whatYouGet: string[];
  goodFitIf: string[];

  // Routing + cards
  href: string;
  image?: string;

  // IMPORTANT: string[] so `.map()` works and <Image src={img}> works
  images: string[];

  startingPrice?: string;
  typicalDuration?: string;
};

export type Industry = {
  key: IndustryKey;
  name: string;
  short: string;
  tagline: string;
  description: string;

  verticals: VerticalKey[];
  recommendedServices?: ServiceKey[];

  href: string;
  image?: string;
};

export const verticals: Vertical[] = [
  {
    key: "residential",
    name: "Residential",
    short: "Home & home office performance",
    description: "High-performance home and home office wireless optimization.",
  },
  {
    key: "commercial",
    name: "Commercial",
    short: "Business & enterprise environments",
    description: "RF survey, validation, and design support across commercial sites.",
  },
  {
    key: "public-safety",
    name: "Public Safety / Compliance",
    short: "AHJ-driven coverage documentation",
    description: "Code-aligned survey and documentation for AHJ review and acceptance.",
  },
];

export const services: Service[] = [
  {
    key: "premium-home-rf-optimization",
    name: "Premium Home & Home Office RF Optimization",
    short: "Diagnose interference and performance bottlenecks with a clear action plan.",
    headline: "Stop guessing. Identify the real RF issues and fix them with a clear plan.",
    whatItIs:
      "A premium diagnostic engagement focused on identifying hidden RF interference, Wi-Fi congestion, and placement issues impacting real-world performance (video calls, streaming, smart home reliability).",
    whyYouNeedIt: [
      "Consumer tools don’t show non-Wi-Fi interference or the full RF picture.",
      "Good RSSI doesn’t always mean good performance—channel contention and noise floor matter.",
      "A data-backed plan prevents wasted money on random extenders and trial-and-error.",
    ],
    verticals: ["residential"],
    forVerticals: ["residential"],
    forIndustries: ["residential"],
    bullets: [
      "Expose interference consumer apps can’t see",
      "Stabilize VoIP/video calls and critical work devices",
      "Action plan you can implement immediately",
    ],
    deliverables: [
      "RF spectrum findings summary",
      "Wi-Fi channel/congestion analysis",
      "Prioritized optimization plan (placement + settings recommendations)",
    ],
    networksCovered: ["Wi-Fi (2.4/5 GHz)", "Cellular (observed)"],
    commonMisconceptions: [
      "“More bars means better internet.” (Not always—SNR/airtime/latency can still be bad.)",
      "“A bigger router fixes everything.” (Placement and interference often matter more.)",
      "“Extenders always help.” (They often add latency and reduce throughput.)",
    ],
    whatYouGet: [
      "Clear findings with plain-English explanations",
      "Prioritized fixes (what to do first, second, third)",
      "Placement guidance for existing hardware",
      "Configuration recommendations (channels, power, band steering as applicable)",
    ],
    goodFitIf: [
      "You rely on video calls/VoIP for work",
      "Your home has dead zones or inconsistent performance",
      "You’ve tried extenders/mesh and still have issues",
      "You want a professional plan instead of trial-and-error",
    ],
    href: "/learn/premium-home-rf-optimization",
    image: "/services/premium-home-1.jpg",
    images: [
      "/services/premium-home-1.jpg",
      "/services/premium-home-2.jpg",
      "/services/premium-home-3.jpg",
    ],
    startingPrice: "$750 (typical)",
    typicalDuration: "Single site visit (approx. 3–4 hours) + report delivery",
  },

  {
    key: "p25-network-survey",
    name: "Public Safety (P25) ERRC Survey",
    short: "Grid testing + PASS/FAIL reporting aligned to AHJ requirements.",
    headline: "Compliance-ready documentation for AHJ review—clear PASS/FAIL outcomes.",
    whatItIs:
      "A public safety radio coverage survey intended to support code-driven compliance requirements, including grid testing and critical-area verification suitable for AHJ review.",
    whyYouNeedIt: [
      "Public safety coverage requirements can delay occupancy if documentation is weak or incomplete.",
      "A defensible PASS/FAIL report reduces rework and inspection risk.",
      "Objective testing clarifies where remediation is required (if any).",
    ],
    verticals: ["public-safety"],
    forVerticals: ["public-safety"],
    forIndustries: ["education", "healthcare", "hospitality", "industrial", "small-business"],
    bullets: [
      "Grid-based testing aligned to AHJ requirements",
      "Clear PASS/FAIL outcome with defensible documentation",
      "Critical area focus (stairs/elevators/command areas as required)",
    ],
    deliverables: [
      "Grid test documentation (per floor/area)",
      "Heatmaps / coverage visuals (as applicable)",
      "PASS/FAIL summary + compliance notes",
    ],
    networksCovered: ["P25 / LMR (per AHJ)"],
    commonMisconceptions: [
      "“We have radios, so we’re compliant.” (Coverage must be verified and documented.)",
      "“A single reading is enough.” (Coverage requires systematic testing.)",
      "“If it fails, the survey was wrong.” (It usually indicates a real coverage gap.)",
    ],
    whatYouGet: [
      "Survey methodology aligned to AHJ expectations",
      "Clear documentation for stakeholder review",
      "Deficiency notes (if any) for remediation planning",
    ],
    goodFitIf: [
      "Your site requires public safety coverage documentation",
      "You need AHJ-ready reporting",
      "You want objective PASS/FAIL verification",
    ],
    href: "/learn/p25-network-survey",
    image: "/services/p25-1.jpg",
    images: ["/services/p25-1.jpg", "/services/p25-2.jpg", "/services/p25-3.jpg"],
    startingPrice: "Quoted per project",
    typicalDuration: "Per-floor survey + report delivery",
  },

  {
    key: "das-design-sow",
    name: "Enterprise Cellular/DAS Initial Survey & Design Blueprint",
    short: "Survey + initial design blueprint to guide integrators and reduce rework.",
    headline: "Get a practical blueprint built from real measurements—not guesses.",
    whatItIs:
      "An enterprise engagement including donor signal evaluation and in-building coverage gap mapping, culminating in an initial design blueprint package to guide a DAS effort.",
    whyYouNeedIt: [
      "A measurement-driven baseline prevents costly rework later.",
      "A clear blueprint accelerates integrator implementation and budgeting.",
      "Carrier-agnostic design supports future approvals and refinement.",
    ],
    verticals: ["commercial"],
    forVerticals: ["commercial"],
    forIndustries: ["small-business", "healthcare", "hospitality", "education", "industrial"],
    bullets: [
      "Donor signal evaluation (rooftop/perimeter as applicable)",
      "In-building coverage gap mapping",
      "Blueprint package to accelerate integrator execution",
    ],
    deliverables: [
      "Outdoor donor measurements (RSSI/SINR) as applicable",
      "In-building coverage gap maps",
      "Initial design blueprint package (placement guidance + conceptual BOM)",
    ],
    networksCovered: ["Cellular (carrier targets as required)"],
    commonMisconceptions: [
      "“A few antennas will fix it.” (Placement and donor conditions matter.)",
      "“Design can be done without a baseline.” (Baseline drives correct assumptions.)",
      "“Blueprint equals carrier approval.” (Approval is separate; blueprint supports it.)",
    ],
    whatYouGet: [
      "Coverage gap analysis stakeholders can understand",
      "A starter blueprint that reduces integrator uncertainty",
      "A defensible baseline for future refinement and approvals",
    ],
    goodFitIf: [
      "You’re planning a DAS and need a real baseline",
      "You want a blueprint to reduce integrator rework",
      "You need budgeting guidance before committing to installation",
    ],
    href: "/learn/das-design-sow",
    image: "/services/das-1.jpg",
    images: ["/services/das-1.jpg", "/services/das-2.jpg", "/services/das-3.jpg"],
    startingPrice: "Quoted per project",
    typicalDuration: "Survey + design package delivery",
  },

  {
    key: "rfi-hunting",
    name: "RFI Hunting & Advanced Diagnostics",
    short: "Locate and characterize RF interference sources impacting operations.",
    headline: "Find the interference source—capture evidence—and act with confidence.",
    whatItIs:
      "A high-precision diagnostic service to capture, identify, and localize disruptive RF emissions, then provide mitigation steps tied to root cause.",
    whyYouNeedIt: [
      "Interference is often intermittent and invisible to standard tools.",
      "Root cause evidence prevents endless “swap and pray” troubleshooting.",
      "Quick identification reduces downtime and operational risk.",
    ],
    verticals: ["commercial", "public-safety"],
    forVerticals: ["commercial", "public-safety"],
    forIndustries: ["small-business", "healthcare", "hospitality", "education", "industrial"],
    bullets: [
      "Capture time/frequency-domain evidence of the signal",
      "Directional finding / localization (as applicable)",
      "Mitigation recommendations tied to root cause",
    ],
    deliverables: [
      "Spectrum trace evidence (time/frequency domain)",
      "Directional findings / location notes (as applicable)",
      "Mitigation recommendations report",
    ],
    networksCovered: ["Wi-Fi", "Cellular", "Licensed/Industrial (as applicable)"],
    commonMisconceptions: [
      "“It’s just slow internet.” (It can be RF noise, not bandwidth.)",
      "“If it stops, it’s gone.” (Interference often returns on schedule.)",
      "“A new router fixes it.” (Not if the noise source remains.)",
    ],
    whatYouGet: [
      "Evidence captures you can show stakeholders/vendors",
      "A narrowed suspect list (device/type/location)",
      "Mitigation steps prioritized by impact and feasibility",
    ],
    goodFitIf: [
      "You have intermittent dropouts, unexplained latency, or degraded throughput",
      "You suspect a device or environment is emitting noise",
      "Downtime costs money and you need root cause quickly",
    ],
    href: "/learn/rfi-hunting",
    image: "/services/rfi-1.jpg",
    images: ["/services/rfi-1.jpg", "/services/rfi-2.jpg", "/services/rfi-3.jpg"],
    startingPrice: "Retainer + hourly",
    typicalDuration: "Variable (depends on source behavior)",
  },

  {
    key: "post-install-validation",
    name: "Post-Installation Validation & Acceptance",
    short: "Independent verification that installed systems meet original specs.",
    headline: "Verify performance before final payment—PASS/FAIL with a punch list if needed.",
    whatItIs:
      "An independent validation survey to confirm installed wireless systems align to original design or acceptance criteria, producing clear PASS/FAIL documentation and deficiencies (if any).",
    whyYouNeedIt: [
      "Avoid paying in full for systems that don’t meet contractual targets.",
      "Objective results reduce disputes and accelerate remediation.",
      "Documentation supports stakeholder confidence and project closeout.",
    ],
    verticals: ["commercial", "public-safety"],
    forVerticals: ["commercial", "public-safety"],
    forIndustries: ["small-business", "healthcare", "hospitality", "education", "industrial"],
    bullets: [
      "Validate performance against original acceptance criteria",
      "Acceptance matrix + clear PASS/FAIL outcome",
      "Punch list documentation for deficiencies (if any)",
    ],
    deliverables: [
      "Acceptance criteria review",
      "Measured performance verification (maps/tables as applicable)",
      "PASS/FAIL report + punch list if needed",
    ],
    networksCovered: ["Wi-Fi", "Cellular/DAS", "Public Safety (as applicable)"],
    commonMisconceptions: [
      "“Install complete means performance is guaranteed.” (Validation is still required.)",
      "“Speed test = acceptance.” (Acceptance is multi-metric and area-based.)",
      "“If it fails, it’s minor.” (Small issues often indicate systemic gaps.)",
    ],
    whatYouGet: [
      "Independent verification aligned to acceptance criteria",
      "Clear documentation for closeout and payment decisions",
      "Objective deficiency list for remediation planning",
    ],
    goodFitIf: [
      "A new system was installed and you need objective verification",
      "You’re closing out a project with acceptance criteria",
      "You want a punch list that’s data-driven, not opinion-driven",
    ],
    href: "/learn/post-install-validation",
    image: "/services/validation-1.jpg",
    images: ["/services/validation-1.jpg", "/services/validation-2.jpg", "/services/validation-3.jpg"],
    startingPrice: "Quoted per project",
    typicalDuration: "Survey + 48-hour report delivery (typical)",
  },
];

export const serviceKeys: ServiceKey[] = services.map((s) => s.key);

export const industries: Industry[] = [
  {
    key: "residential",
    name: "Residential",
    short: "Home & home office performance",
    tagline: "Reliable connectivity where you work and live.",
    description:
      "Premium diagnostics and optimization for connectivity reliability and performance in modern homes.",
    verticals: ["residential"],
    recommendedServices: ["premium-home-rf-optimization", "rfi-hunting"],
    href: "/industries/residential",
    image: "/industries/residential.jpg",
  },
  {
    key: "small-business",
    name: "Small Business",
    short: "Operational connectivity",
    tagline: "Stability for the systems your business depends on.",
    description:
      "Coverage and performance diagnostics to stabilize Wi-Fi and cellular-dependent operations.",
    verticals: ["commercial"],
    recommendedServices: ["rfi-hunting", "post-install-validation", "das-design-sow"],
    href: "/industries/small-business",
    image: "/industries/small-business.jpg",
  },
  {
    key: "healthcare",
    name: "Healthcare",
    short: "Clinic environments",
    tagline: "Consistent performance in mission-critical spaces.",
    description:
      "RF-focused assessments designed to improve reliability without accessing sensitive data.",
    verticals: ["commercial", "public-safety"],
    recommendedServices: ["post-install-validation", "rfi-hunting", "p25-network-survey"],
    href: "/industries/healthcare",
    image: "/industries/healthcare.jpg",
  },
  {
    key: "hospitality",
    name: "Hospitality",
    short: "Guest + staff performance",
    tagline: "A better guest experience starts with stable wireless.",
    description:
      "Survey and validation support for reliable guest experience and staff operations.",
    verticals: ["commercial"],
    recommendedServices: ["post-install-validation", "rfi-hunting", "das-design-sow"],
    href: "/industries/hospitality",
    image: "/industries/hospitality.jpg",
  },
  {
    key: "education",
    name: "Education",
    short: "High-density usage zones",
    tagline: "Performance that holds up under real student load.",
    description:
      "Coverage assessment and performance validation across classrooms and common areas.",
    verticals: ["commercial", "public-safety"],
    recommendedServices: ["post-install-validation", "rfi-hunting", "p25-network-survey"],
    href: "/industries/education",
    image: "/industries/education.jpg",
  },
  {
    key: "industrial",
    name: "Industrial",
    short: "RFI + uptime protection",
    tagline: "Find interference before it becomes downtime.",
    description:
      "Interference identification and coverage diagnostics in environments where downtime is expensive.",
    verticals: ["commercial"],
    recommendedServices: ["rfi-hunting", "post-install-validation", "das-design-sow"],
    href: "/industries/industrial",
    image: "/industries/industrial.jpg",
  },
];

export function getService(key: string) {
  return services.find((s) => s.key === key) ?? null;
}

export function getIndustry(key: string) {
  return industries.find((i) => i.key === key) ?? null;
}
