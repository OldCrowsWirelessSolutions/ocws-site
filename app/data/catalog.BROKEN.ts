// app/data/catalog.ts

// =====================
// Keys
// =====================

export const industryKeys = [
  "home",
  "healthcare",
  "education",
  "hospitality",
  "public-safety",
  "government",
  "enterprise",
  "retail",
  "industrial",
] as const;

export type IndustryKey = (typeof industryKeys)[number];

export const verticalKeys = [
  // Home
  "estates",
  "home-office",
  "large-property-detached",

  // Healthcare
  "clinics",
  "hospitals",
  "assisted-living",

  // Education
  "k12",
  "higher-ed",
  "private-education",

  // Hospitality
  "hotels-resorts",
  "restaurants",
  "venues-events",

  // Public Safety
  "police",
  "fire-ems",
  "eoc-911",

  // Government
  "city-county",
  "public-works",
  "libraries-courts",

  // Enterprise
  "law-firms",
  "office-multi-floor",
  "warehouses-ops",

  // Retail
  "big-box",
  "grocery",
  "car-dealerships",

  // Industrial
  "manufacturing",
  "distribution",
  "utilities-infrastructure",

  // Outdoor / specialty (often maps to Hospitality/Industrial/Retail)
  "campgrounds-rv-parks",
  "marinas",
] as const;

export type VerticalKey = (typeof verticalKeys)[number];

export const serviceKeys = [
  "premium-home-rf",
  "commercial-institutional-rf", // keep slug stable
  "rfi-hunting",
  "post-install-validation",
  "cellular-das-design",
  "p25-survey",
] as const;

export type ServiceKey = (typeof serviceKeys)[number];

// =====================
// Types
// =====================

export type Vertical = {
  key: VerticalKey;
  industry: IndustryKey;
  name: string;
  short: string;
};

export type Industry = {
  key: IndustryKey;
  name: string;
  tagline: string;
  image: string; // public path
  verticals?: VerticalKey[];
};

export type Service = {
  key: ServiceKey;
  name: string;
  short: string;
  headline: string;

  bullets: string[];

  whatItIs: string[];
  whyYouNeedIt: string[];
  commonMisconceptions: string[];
  whatYouGet: string[];
  goodFitIf: string[];

  networksCovered?: string[];
  images: string[];

  forIndustries: IndustryKey[];
  forVerticals?: VerticalKey[];
};

// =====================
// Verticals
// =====================

export const verticals: Vertical[] = [
  // Home
  {
    key: "estates",
    industry: "home",
    name: "Estates & High-Performance Homes",
    short: "Whole-home reliability for demanding residential environments.",
  },
  {
    key: "home-office",
    industry: "home",
    name: "Home Office & Remote Work",
    short: "Stable calls, meetings, and productivity tools—without dropouts.",
  },
  {
    key: "large-property-detached",
    industry: "home",
    name: "Large Properties & Detached Structures",
    short: "Shops, barns, garages, guest houses, and multi-structure coverage needs.",
  },

  // Healthcare
  {
    key: "clinics",
    industry: "healthcare",
    name: "Clinics & Outpatient Facilities",
    short: "Operational reliability for staff systems and patient workflows.",
  },
  {
    key: "hospitals",
    industry: "healthcare",
    name: "Hospitals & Medical Centers",
    short: "Coverage and interference risk reduction in critical areas.",
  },
  {
    key: "assisted-living",
    industry: "healthcare",
    name: "Assisted Living & Senior Care",
    short: "Connectivity for staff, resident safety systems, and operations.",
  },

  // Education
  {
    key: "k12",
    industry: "education",
    name: "K–12 Schools",
    short: "Classroom and admin reliability with predictable coverage.",
  },
  {
    key: "higher-ed",
    industry: "education",
    name: "Colleges & Universities",
    short: "Campus-wide needs with density, roaming, and multi-building complexity.",
  },
  {
    key: "private-education",
    industry: "education",
    name: "Private Education & Childcare",
    short: "Smaller environments with high reliability expectations.",
  },

  // Hospitality
  {
    key: "hotels-resorts",
    industry: "hospitality",
    name: "Hotels & Resorts",
    short: "Guest experience and operational connectivity without disruptions.",
  },
  {
    key: "restaurants",
    industry: "hospitality",
    name: "Restaurants",
    short: "POS, back-of-house, and guest Wi-Fi performance needs.",
  },
  {
    key: "venues-events",
    industry: "hospitality",
    name: "Venues & Event Spaces",
    short: "High-density peaks and performance risk management.",
  },

  // Public Safety
  {
    key: "police",
    industry: "public-safety",
    name: "Police Facilities",
    short: "Mission-critical communications risk reduction indoors.",
  },
  {
    key: "fire-ems",
    industry: "public-safety",
    name: "Fire & EMS Facilities",
    short: "Coverage expectations where reliability is non-negotiable.",
  },
  {
    key: "eoc-911",
    industry: "public-safety",
    name: "EOC / 911 / Dispatch",
    short: "Operational environments where failures carry real consequences.",
  },

  // Government
  {
    key: "city-county",
    industry: "government",
    name: "City & County Facilities",
    short: "Public buildings requiring documented reliability.",
  },
  {
    key: "public-works",
    industry: "government",
    name: "Public Works & Infrastructure",
    short: "Operations-focused reliability across complex facilities.",
  },
  {
    key: "libraries-courts",
    industry: "government",
    name: "Libraries & Courts",
    short: "Public access + staff operations with predictable performance.",
  },

  // Enterprise
  {
    key: "law-firms",
    industry: "enterprise",
    name: "Law Firms & Professional Offices",
    short: "VoIP, video calls, and confidentiality-driven reliability needs.",
  },
  {
    key: "office-multi-floor",
    industry: "enterprise",
    name: "Multi-Story Offices",
    short: "Coverage/roaming complexity across floors and dense occupancy.",
  },
  {
    key: "warehouses-ops",
    industry: "enterprise",
    name: "Operations & Warehousing",
    short: "Workflow reliability for scanners, systems, and coverage in hard areas.",
  },

  // Retail
  {
    key: "big-box",
    industry: "retail",
    name: "Big-Box Retail",
    short: "Wide coverage areas with operational + customer needs.",
  },
  {
    key: "grocery",
    industry: "retail",
    name: "Grocery",
    short: "POS and operational connectivity in RF-challenging layouts.",
  },
  {
    key: "car-dealerships",
    industry: "retail",
    name: "Car Dealerships",
    short: "Large lots + showrooms + service bays with mixed coverage needs.",
  },

  // Industrial
  {
    key: "manufacturing",
    industry: "industrial",
    name: "Manufacturing",
    short: "Challenging RF environments with interference and attenuation.",
  },
  {
    key: "distribution",
    industry: "industrial",
    name: "Distribution Centers",
    short: "Wide spaces and operational device reliability requirements.",
  },
  {
    key: "utilities-infrastructure",
    industry: "industrial",
    name: "Utilities & Infrastructure",
    short: "Facilities where reliability and documentation matter.",
  },

  // Outdoor / specialty
  {
    key: "campgrounds-rv-parks",
    industry: "hospitality",
    name: "Campgrounds & RV Parks",
    short: "Outdoor coverage expectations and multi-structure complexity.",
  },
  {
    key: "marinas",
    industry: "hospitality",
    name: "Marinas",
    short: "Outdoor + mixed structures with challenging reflections and coverage.",
  },
];

// =====================
// Industries
// =====================

export const industries: Industry[] = [
  {
    key: "home",
    name: "Homes & Estates",
    tagline: "Whole-home and home-office wireless clarity for demanding residential environments.",
    image: "/industries/home.png",
    verticals: ["estates", "home-office", "large-property-detached"],
  },
  {
    key: "healthcare",
    name: "Healthcare",
    tagline: "Reliable wireless performance for clinical, administrative, and patient-care environments.",
    image: "/industries/healthcare.png",
    verticals: ["clinics", "hospitals", "assisted-living"],
  },
  {
    key: "education",
    name: "Education",
    tagline: "Consistent connectivity across classrooms, campuses, and learning spaces.",
    image: "/industries/education.png",
    verticals: ["k12", "higher-ed", "private-education"],
  },
  {
    key: "hospitality",
    name: "Hospitality",
    tagline: "Guest-facing wireless reliability without disruption to operations.",
    image: "/industries/hospitality.png",
    verticals: ["hotels-resorts", "restaurants", "venues-events", "campgrounds-rv-parks", "marinas"],
  },
  {
    key: "public-safety",
    name: "Public Safety",
    tagline: "Mission-critical communications environments where coverage gaps are unacceptable.",
    image: "/industries/public-safety.png",
    verticals: ["police", "fire-ems", "eoc-911"],
  },
  {
    key: "government",
    name: "Government",
    tagline: "Documented wireless performance for public facilities and agencies.",
    image: "/industries/government.png",
    verticals: ["city-county", "public-works", "libraries-courts"],
  },
  {
    key: "enterprise",
    name: "Enterprise & Offices",
    tagline: "Wireless environments that support productivity, VoIP, and collaboration tools.",
    image: "/industries/enterprise.png",
    verticals: ["law-firms", "office-multi-floor", "warehouses-ops"],
  },
  {
    key: "retail",
    name: "Retail",
    tagline: "Reliable connectivity for POS systems, inventory, guest Wi-Fi, and operations.",
    image: "/industries/retail.png",
    verticals: ["big-box", "grocery", "car-dealerships"],
  },
  {
    key: "industrial",
    name: "Industrial",
    tagline: "Wireless reliability in challenging RF environments—without guesswork.",
    image: "/industries/industrial.png",
    verticals: ["manufacturing", "distribution", "utilities-infrastructure"],
  },
];

// =====================
// Services
// =====================

export const services: Service[] = [
  {
    key: "premium-home-rf",
    name: "Premium Home & Home Office RF Optimization",
    short:
      "A professional assessment of your home’s wireless environment to identify why Wi-Fi, video calls, and connected devices are unreliable—and what to do about it.",
    headline: "Premium Home & Home Office RF Optimization",
    bullets: [
      "Diagnose interference, coverage gaps, and configuration issues",
      "Validate performance with professional measurements (not speed tests alone)",
      "Actionable recommendations you can implement or hand to an installer",
      "Optional addendum support for large properties and detached structures",
    ],
    whatItIs: [
      "A structured assessment of your home’s RF and Wi-Fi environment.",
      "We identify root causes: interference, placement, channel planning, attenuation, and design limitations.",
      "You get evidence-backed next steps—not generic consumer advice.",
    ],
    whyYouNeedIt: [
      "Video calls freeze or drop during meetings.",
      "Streaming buffers even with fast internet.",
      "Smart devices disconnect randomly.",
      "Wi-Fi calling is unreliable at home.",
    ],
    commonMisconceptions: [
      "“I just need faster internet.” (Most issues happen inside the home.)",
      "“A new router or mesh will fix it.” (Hardware alone doesn’t solve RF problems.)",
      "“My ISP will fix it.” (ISP control usually stops at the modem.)",
    ],
    whatYouGet: [
      "Clear findings and practical recommendations",
      "Coverage/interference observations with explanation",
      "Configuration guidance (channels, placement, band steering, etc.)",
      "A path forward that avoids unnecessary spending",
    ],
    goodFitIf: [
      "Your home office requires stable meetings and calls.",
      "You have a large home or challenging layout/materials.",
      "You tried consumer fixes and issues persist.",
      "You want clarity before spending more money.",
    ],
    networksCovered: ["Wi-Fi (2.4/5/6 GHz)", "Wi-Fi Calling", "Smart-home RF"],
    images: ["/services/premium-home-rf/1.jpg", "/services/premium-home-rf/2.jpg", "/services/premium-home-rf/3.jpg"],
    forIndustries: ["home"],
    forVerticals: ["estates", "home-office", "large-property-detached"],
  },

  {
    key: "commercial-institutional-rf",
    name: "Enterprise & Facilities RF Assessment",
    short:
      "A scalable RF and wireless performance assessment for offices, campuses, healthcare, hospitality, retail, and government facilities—focused on measurable findings and clear scope recommendations.",
    headline: "Enterprise & Facilities RF Assessment",
    bullets: [
      "Evaluate RF conditions, coverage, interference, and performance risk",
      "Document findings for decision makers, vendors, and installers",
      "Identify root causes before spending on hardware or major changes",
      "Scope recommendations that scale from small offices to multi-building sites",
    ],
    whatItIs: [
      "A professional assessment of RF and wireless performance risks in non-residential environments.",
      "We evaluate reliability factors: RF noise/interference, attenuation, coverage expectations, roaming behavior, density/capacity, and placement constraints.",
      "You receive documentation and prioritized recommendations to support action and budgeting.",
    ],
    whyYouNeedIt: [
      "Dead zones, dropped calls, or unstable Wi-Fi in critical areas.",
      "VoIP/collaboration tools behave inconsistently.",
      "You’re planning upgrades and need evidence before purchasing hardware.",
      "You need defensible documentation for stakeholders or vendors.",
    ],
    commonMisconceptions: [
      "“It’s just the ISP.” (Internal RF/design issues are common.)",
      "“More APs will fix it.” (More RF can worsen interference if unmanaged.)",
      "“Signal bars equal performance.” (SNR, noise, and airtime matter.)",
    ],
    whatYouGet: [
      "Assessment of RF and performance risk areas",
      "Actionable recommendations and scope guidance (phased if needed)",
      "Documentation suitable for leadership, facilities, and IT stakeholders",
      "Optional post-change validation support",
    ],
    goodFitIf: [
      "Connectivity impacts operations, staff productivity, or guest experience.",
      "You manage multi-floor or high-density environments.",
      "Issues are intermittent and hard to reproduce.",
      "You want a baseline before upgrades or vendor work.",
    ],
    networksCovered: ["Wi-Fi (2.4/5/6 GHz)", "RF interference/noise floor", "In-building cellular (observational)"],
    images: [
      "/services/commercial-institutional-rf/1.jpg",
      "/services/commercial-institutional-rf/2.jpg",
      "/services/commercial-institutional-rf/3.jpg",
    ],
    forIndustries: ["healthcare", "education", "hospitality", "government", "enterprise", "retail", "industrial", "public-safety"],
    forVerticals: [
      "clinics", "hospitals", "assisted-living",
      "k12", "higher-ed", "private-education",
      "hotels-resorts", "restaurants", "venues-events", "campgrounds-rv-parks", "marinas",
      "city-county", "public-works", "libraries-courts",
      "law-firms", "office-multi-floor", "warehouses-ops",
      "big-box", "grocery", "car-dealerships",
      "manufacturing", "distribution", "utilities-infrastructure",
      "police", "fire-ems", "eoc-911",
    ],
  },

  {
    key: "rfi-hunting",
    name: "Radio Frequency Interference (RFI) Hunting",
    short:
      "Targeted interference investigation to identify and isolate RF noise sources that degrade wireless performance or cause intermittent failures.",
    headline: "Radio Frequency Interference (RFI) Hunting",
    bullets: [
      "Identify suspected interference sources and patterns",
      "Confirm RF noise impacts with measurement-based validation",
      "Recommend mitigation steps and follow-on verification",
      "Support coordination with vendors or facilities when needed",
    ],
    whatItIs: [
      "A focused investigation to locate and characterize RF interference affecting your environment.",
      "We look for patterns and emissions that correlate to instability or outages.",
    ],
    whyYouNeedIt: [
      "Intermittent outages with no clear cause.",
      "Performance drops at certain times of day.",
      "New equipment coincides with new RF problems.",
      "Troubleshooting has stalled despite changes.",
    ],
    commonMisconceptions: [
      "“Interference doesn’t matter if signal is strong.” (It absolutely can.)",
      "“Replacing equipment is faster.” (Often expensive and doesn’t fix the root cause.)",
    ],
    whatYouGet: [
      "Findings on likely interference sources and conditions",
      "Mitigation steps (reduce, relocate, shield, replace, schedule)",
      "Verification strategy to confirm improvement",
    ],
    goodFitIf: [
      "Issues are intermittent and hard to reproduce.",
      "You suspect a specific device/system is emitting noise.",
      "You need proof to justify corrective action.",
    ],
    networksCovered: ["RF spectrum observation", "Wi-Fi bands", "ISM-related interference"],
    images: ["/services/rfi-hunting/1.jpg", "/services/rfi-hunting/2.jpg", "/services/rfi-hunting/3.jpg"],
    forIndustries: industryKeys as unknown as IndustryKey[],
  },

  {
    key: "post-install-validation",
    name: "Post-Installation Validation",
    short: "Independent validation of a new wireless install or changes—confirming outcomes match expectations.",
    headline: "Post-Installation Validation",
    bullets: [
      "Verify outcomes after installation or configuration changes",
      "Document gaps and risk areas",
      "Objective report for stakeholders and vendors",
      "Support punch-list / remediation validation cycles",
    ],
    whatItIs: [
      "A measurement-driven validation of a wireless deployment after installation or major changes.",
      "We confirm whether the environment meets expectations and identify where it does not.",
    ],
    whyYouNeedIt: [
      "You invested in upgrades and need proof it worked.",
      "You suspect incomplete coverage or inconsistent performance.",
      "You need documentation for acceptance or warranty remediation.",
    ],
    commonMisconceptions: [
      "“If devices connect, the install is fine.” (Association ≠ performance.)",
      "“Speed tests are enough.” (They don’t show reliability factors.)",
    ],
    whatYouGet: ["Validation findings and a gap list", "Prioritized remediation recommendations", "Acceptance-ready documentation"],
    goodFitIf: [
      "A vendor finished an install and you want independent confirmation.",
      "Reliability is critical in your facility.",
      "You need defensible evidence for stakeholders or warranty work.",
    ],
    networksCovered: ["Wi-Fi validation", "Reliability factors"],
    images: ["/services/post-install-validation/1.jpg", "/services/post-install-validation/2.jpg", "/services/post-install-validation/3.jpg"],
    forIndustries: industryKeys as unknown as IndustryKey[],
  },

  {
    key: "cellular-das-design",
    name: "Cellular / DAS Design & Survey Support",
    short:
      "Survey support and design-aligned RF documentation for in-building cellular coverage efforts (DAS / small-cell planning support).",
    headline: "Cellular / DAS Design & Survey Support",
    bullets: [
      "Support RF survey data collection and documentation",
      "Help define coverage expectations and risk areas",
      "Provide findings for design/installer teams",
      "Assist stakeholders with scope and acceptance criteria",
    ],
    whatItIs: [
      "Survey support for in-building cellular projects where documentation is required to inform design decisions.",
      "We help collect and present findings stakeholders can act on.",
    ],
    whyYouNeedIt: [
      "Poor indoor cellular coverage.",
      "Preparing for a DAS/small-cell project and need survey support.",
      "Need documentation for stakeholders/vendors.",
    ],
    commonMisconceptions: ["“Wi-Fi calling solves everything.” (Not always reliable or permitted.)", "“Any booster will work.” (Goals/constraints vary.)"],
    whatYouGet: ["Survey-aligned documentation", "Coverage risk observations", "Scope inputs for planning"],
    goodFitIf: ["Multi-floor facility with weak indoor cellular.", "Need survey support for a vendor/design team.", "Need clarity before investing."],
    networksCovered: ["In-building cellular (observational)", "Coverage documentation support"],
    images: ["/services/cellular-das-design/1.jpg", "/services/cellular-das-design/2.jpg", "/services/cellular-das-design/3.jpg"],
    forIndustries: ["healthcare", "education", "hospitality", "public-safety", "government", "enterprise", "retail", "industrial"],
  },

  {
    key: "p25-survey",
    name: "Public Safety (P25) Network Survey",
    short:
      "Survey support for mission-critical public safety communications environments—focused on coverage documentation and risk identification.",
    headline: "Public Safety (P25) Network Survey",
    bullets: [
      "Support coverage documentation for public safety environments",
      "Identify risk areas and constraints",
      "Stakeholder-friendly reporting",
      "Align outputs with project planning needs",
    ],
    whatItIs: [
      "Survey support for public safety communication environments where coverage documentation is required or strongly recommended.",
      "We support data collection and reporting aligned to operational realities.",
    ],
    whyYouNeedIt: [
      "Need confidence in coverage for critical areas.",
      "Preparing for upgrades and need baseline documentation.",
      "Need evidence to justify remediation or funding priorities.",
    ],
    commonMisconceptions: ["“If it works outside, it works inside.” (Buildings change RF dramatically.)", "“One test spot proves coverage.” (Coverage varies.)"],
    whatYouGet: ["Documented findings and risk areas", "Next-step recommendations", "Clear stakeholder reporting"],
    goodFitIf: ["Facilities where emergency communications must work reliably.", "Need survey support aligned to public safety realities.", "Need documentation to drive decisions."],
    networksCovered: ["Public safety RF (observational)", "Coverage documentation support"],
    images: ["/services/p25-survey/1.jpg", "/services/p25-survey/2.jpg", "/services/p25-survey/3.jpg"],
    forIndustries: ["public-safety", "government", "healthcare", "education", "hospitality", "enterprise"],
  },
];
