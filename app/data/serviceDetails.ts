// app/data/serviceDetails.ts

export type ServiceVisual = {
  title: string;
  desc: string;
  src: string; // must be in /public and referenced like "/services/xxx.jpg"
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
  visuals?: ServiceVisual[];
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
        alt: "RF optimization action plan example",
      },
    ],

    faqs: [
      {
        q: "Do you install or reconfigure equipment during the visit?",
        a: "This engagement is focused on diagnostics and an actionable plan. If you want hands-on implementation, we can scope that separately or coordinate with your installer.",
      },
      {
        q: "Will this fix ISP issues?",
        a: "We isolate whether your issue is Wi-Fi/RF vs. ISP line quality. If it’s the ISP, we’ll document it clearly so you can escalate with evidence.",
      },
    ],
  },
];

export function getServiceDetailBySlug(slug: string): ServiceDetail | undefined {
  return serviceDetails.find((s) => s.slug === slug);
}
