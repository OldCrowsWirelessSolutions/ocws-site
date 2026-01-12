// app/data/serviceDetails.ts

export type ServiceVisual = {
  title: string;
  desc: string;
  src: string; // /public/... referenced like "/services/xxx.jpg"
  alt: string;
};

export type ServiceFAQ = {
  q: string;
  a: string;
};

export type ServiceDetail = {
  slug: string; // must match /services/[service]
  title: string;
  short: string;
  tagline: string;

  whatItIs: string;
  whyYouNeedIt: string[];
  whatYouGet: string[];

  quickFacts?: { label: string; value: string }[];
  visuals: ServiceVisual[];
  faqs?: ServiceFAQ[];
};

export const serviceDetails: ServiceDetail[] = [
  {
    slug: "premium-home-rf-optimization",
    title: "Premium Home & Home Office RF Optimization",
    short:
      "Diagnose interference and performance bottlenecks with a clear, evidence-driven action plan.",
    tagline: "Stop guessing. Identify the real RF issues and fix them with a clear plan.",

    whatItIs:
      "A premium diagnostic engagement focused on identifying hidden RF interference, Wi-Fi congestion, and placement issues impacting real-world performance (video calls, streaming, smart home reliability).",

    whyYouNeedIt: [
      "Consumer tools don’t show non-Wi-Fi interference or the full RF picture.",
      "Fast speed tests can still mean unstable calls, drops, and smart-home failures.",
      "Placement, channel strategy, and airtime contention are often the real bottlenecks.",
      "You get defensible findings and a prioritized plan—not generic guesses.",
    ],

    whatYouGet: [
      "Evidence-backed findings summary with clear root-cause language.",
      "Prioritized action list (quick wins + longer-term improvements).",
      "Placement guidance for existing equipment (router/AP/mesh).",
      "Channel/band steering recommendations when appropriate.",
    ],

    quickFacts: [
      { label: "Typical onsite time", value: "3–4 hours" },
      { label: "Report delivery", value: "Within 24 hours" },
      { label: "Best for", value: "WFH pros, smart homes, unreliable Wi-Fi/cellular" },
    ],

    visuals: [
      {
        title: "Spectrum Survey",
        desc: "Identify non-Wi-Fi interference and hidden RF noise sources that consumer tools can’t see.",
        src: "/services/premium-home-rf-1.jpg",
        alt: "RF spectrum survey example",
      },
      {
        title: "Wi-Fi Congestion Analysis",
        desc: "Reveal channel overlap, neighbor contention, and airtime bottlenecks impacting performance.",
        src: "/services/premium-home-rf-2.jpg",
        alt: "Wi-Fi congestion and channel analysis example",
      },
      {
        title: "Action Plan & Placement",
        desc: "Translate findings into a clear placement and configuration plan you can execute.",
        src: "/services/premium-home-rf-3.jpg",
        alt: "Action plan and placement example",
      },
    ],
  },

  {
    slug: "commercial-connectivity-rf-baseline-survey",
    title: "Commercial Connectivity & RF Baseline Survey",
    short:
      "Establish a defensible baseline across Wi-Fi, cellular, and RF conditions—then get prioritized recommendations and next steps.",
    tagline:
      "Get a defensible baseline first—then invest with confidence using evidence-driven recommendations.",

    whatItIs:
      "A baseline survey for small business and larger commercial environments that documents real-world connectivity performance (Wi-Fi + cellular) and the surrounding RF environment, producing a prioritized action plan and clear next-step paths.",

    whyYouNeedIt: [
      "Most “fixes” fail because the real constraint wasn’t measured first (coverage, airtime, noise, or carrier limitations).",
      "A baseline prevents wasted spend on the wrong ISP plan, the wrong AP/mesh hardware, or the wrong cellular approach.",
      "You get evidence-backed findings that support stakeholder decisions and vendor conversations.",
      "It creates a clear before/after reference point for upgrades or remediation work.",
    ],

    whatYouGet: [
      "Connectivity baseline findings summary (what is happening, where, and why).",
      "Prioritized action list (quick wins + longer-term improvements).",
      "Wi-Fi airtime / congestion observations and practical placement guidance.",
      "Cellular signal baseline snapshots (where applicable) to support carrier/booster/DAS decisions.",
    ],

    quickFacts: [
      { label: "Engagement type", value: "Commercial baseline survey" },
      { label: "Best for", value: "Offices, clinics, retail, small + mid-size facilities" },
      { label: "Outcome", value: "Defensible baseline + prioritized next steps" },
    ],

    visuals: [
      {
        title: "Baseline Survey Snapshot (1)",
        desc: "Document real-world conditions so decisions are based on measurements—not guesses.",
        src: "/services/commercial-connectivity-rf-baseline-survey-1.jpg",
        alt: "Commercial Connectivity & RF Baseline Survey image 1",
      },
      {
        title: "Baseline Survey Snapshot (2)",
        desc: "Capture the connectivity story across the space to identify true constraints and bottlenecks.",
        src: "/services/commercial-connectivity-rf-baseline-survey-2.jpg",
        alt: "Commercial Connectivity & RF Baseline Survey image 2",
      },
      {
        title: "Baseline Survey Snapshot (3)",
        desc: "Translate findings into an evidence-driven action plan and clear next-step options.",
        src: "/services/commercial-connectivity-rf-baseline-survey-3.jpg",
        alt: "Commercial Connectivity & RF Baseline Survey image 3",
      },
    ],
  },

  {
    slug: "rfi-hunting",
    title: "Radio Frequency Interference (RFI) Hunting",
    short:
      "Locate and characterize disruptive RF sources impacting critical wireless systems or electronics.",
    tagline: "Find the source. Prove the impact. Stop the disruption.",

    whatItIs:
      "An advanced diagnostic engagement using spectrum analysis techniques to locate, identify, and document disruptive interference sources—whether internal, neighboring, or intermittent.",

    whyYouNeedIt: [
      "Interference is often invisible to standard Wi-Fi apps and consumer tools.",
      "RFI can cause chronic outages, latency spikes, and unexplained device failures.",
      "You need evidence and direction-finding—not trial and error.",
    ],

    whatYouGet: [
      "Spectrum trace evidence of the interfering signal.",
      "Characterization of frequency, bandwidth, duty cycle, and likely source class.",
      "Directional finding / localization guidance to narrow the origin.",
      "Professional diagnostic summary suitable for escalation.",
    ],

    quickFacts: [
      { label: "Engagement type", value: "Advanced diagnostics" },
      { label: "Best for", value: "Intermittent drops, unexplained outages, chronic noise" },
      { label: "Deliverable", value: "Evidence + mitigation guidance" },
    ],

    visuals: [
      {
        title: "Wideband Spectrum Evidence",
        desc: "Capture time/frequency signatures that prove the interference exists.",
        src: "/services/rfi-hunting-1.jpg",
        alt: "RFI spectrum evidence example",
      },
      {
        title: "Signal Identification",
        desc: "Characterize bandwidth, duty cycle, and likely device class.",
        src: "/services/rfi-hunting-2.jpg",
        alt: "Signal identification example",
      },
      {
        title: "Localization / DF",
        desc: "Directional techniques to narrow down where the signal originates.",
        src: "/services/rfi-hunting-3.jpg",
        alt: "Directional finding and localization example",
      },
    ],
  },

  {
    slug: "p25-survey",
    title: "Public Safety (P25) Emergency Responder Radio Coverage (ERRC) Survey",
    short:
      "Grid testing and reporting to support AHJ / Fire Marshal review and compliance workflows.",
    tagline: "Compliance-ready coverage evidence for ERRC / public safety systems.",

    whatItIs:
      "A formal grid-based survey to document public safety radio coverage performance in accordance with the project’s adopted code and AHJ requirements.",

    whyYouNeedIt: [
      "AHJs require defensible documentation to approve occupancy or system acceptance.",
      "You need objective coverage data and professional reporting.",
      "Identifies failing zones early, reducing rework and delays.",
    ],

    whatYouGet: [
      "Grid-based measurement dataset (uplink/downlink as required).",
      "Visual heatmap overlays for AHJ review.",
      "Pass/Fail style summary aligned to defined criteria.",
      "Documentation of test methodology and equipment used.",
    ],

    quickFacts: [
      { label: "Typical use", value: "Initial acceptance / compliance evidence" },
      { label: "Best for", value: "GCs, developers, facility stakeholders" },
      { label: "Deliverable", value: "Compliance-ready report" },
    ],

    visuals: [
      {
        title: "Grid Test Maps",
        desc: "Point-by-point measurements displayed over floor plans.",
        src: "/services/p25-survey-1.jpg",
        alt: "P25 grid maps example",
      },
      {
        title: "Compliance Evidence",
        desc: "Clear visuals and tables to support AHJ discussions.",
        src: "/services/p25-survey-2.jpg",
        alt: "Public safety compliance evidence example",
      },
      {
        title: "Heatmap Overlays",
        desc: "Color-coded coverage views for quick decision-making.",
        src: "/services/p25-survey-3.jpg",
        alt: "P25 heatmap overlay example",
      },
    ],
  },

  {
    slug: "post-install-validation",
    title: "Post-Installation Validation & Acceptance Survey",
    short:
      "Independent verification that a newly installed DAS/P25/Wi-Fi system meets the original specs.",
    tagline: "Verify performance before final payment.",

    whatItIs:
      "An independent, third-party survey to confirm the installed system meets the original design criteria and acceptance metrics—delivered as an acceptance report or objective punch list.",

    whyYouNeedIt: [
      "Prevents signing off on systems that don’t meet contract requirements.",
      "Creates objective evidence for remediation discussions.",
      "Reduces risk of disputes and costly rework later.",
    ],

    whatYouGet: [
      "Measured performance maps and verification results.",
      "Acceptance matrix comparing target vs measured.",
      "Pass/Fail summary and punch list if needed.",
      "Professional report suitable for client/integrator alignment.",
    ],

    quickFacts: [
      { label: "Use case", value: "Independent acceptance / QA" },
      { label: "System types", value: "DAS, P25 BDA, Wi-Fi deployments" },
      { label: "Deliverable", value: "Acceptance report / punch list" },
    ],

    visuals: [
      {
        title: "Validation Heatmaps",
        desc: "Measured overlays after install to confirm real performance.",
        src: "/services/post-install-validation-1.jpg",
        alt: "Post-install validation heatmap example",
      },
      {
        title: "Acceptance Matrix",
        desc: "Quantitative comparison of target vs measured results.",
        src: "/services/post-install-validation-2.jpg",
        alt: "Acceptance matrix example",
      },
      {
        title: "Punch List Findings",
        desc: "Clear, objective deficiencies for the integrator to address.",
        src: "/services/post-install-validation-3.jpg",
        alt: "Punch list findings example",
      },
    ],
  },

  {
    slug: "cellular-das-design",
    title: "Cellular / DAS Initial Survey & Design Blueprint",
    short:
      "Donor signal survey + in-building gap analysis + blueprint outputs to guide integrators and budgeting.",
    tagline: "Measure. Model. Blueprint.",

    whatItIs:
      "A survey and blueprint engagement to capture donor signal conditions, document in-building coverage gaps, and produce early design artifacts suitable for integrator handoff.",

    whyYouNeedIt: [
      "You need a defensible starting point for DAS/BDAs and budgeting.",
      "Indoor coverage failures are often misunderstood without measurements.",
      "A blueprint reduces change orders and accelerates integrator execution.",
    ],

    whatYouGet: [
      "Outdoor donor measurement notes and recommended donor source zones.",
      "In-building gap maps and weak-zone documentation.",
      "Concept-level design artifacts for planning and installer handoff.",
      "Assumptions + risk notes to support decision-making.",
    ],

    quickFacts: [
      { label: "Best for", value: "Commercial buildings with indoor coverage issues" },
      { label: "Output", value: "Blueprint-level design artifacts" },
      { label: "Value", value: "Reduces risk, delays, and change orders" },
    ],

    visuals: [
      {
        title: "Outdoor / Donor Survey",
        desc: "Identify the strongest donor zones for target carriers.",
        src: "/services/cellular-das-design-1.jpg",
        alt: "Outdoor donor survey example",
      },
      {
        title: "Indoor Gap Analysis",
        desc: "Heatmaps showing existing indoor coverage conditions.",
        src: "/services/cellular-das-design-2.jpg",
        alt: "In-building gap analysis example",
      },
      {
        title: "Blueprint Outputs",
        desc: "Early design artifacts for budgeting and integrator execution.",
        src: "/services/cellular-das-design-3.jpg",
        alt: "DAS blueprint output example",
      },
    ],
  },
];

export function getServiceDetailBySlug(slug: string): ServiceDetail | undefined {
  return serviceDetails.find((s) => s.slug === slug);
}
