// app/data/industries.ts

export type Industry = {
  slug: string;
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  badge?: string;
};

export const industries: Industry[] = [
  {
    slug: "homes-estates",
    name: "Homes & Estates",
    description:
      "Premium residential and home-office environments where reliability matters.",
    imageSrc: "/industries/home.png",
    imageAlt: "Premium home environment",
    badge: "Premium residential",
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    description:
      "Clinics and medical offices that need dependable connectivity for operations.",
    imageSrc: "/industries/healthcare.png",
    imageAlt: "Healthcare environment",
    badge: "Documentation-ready",
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    description:
      "Guest-facing environments where experience and uptime are critical.",
    imageSrc: "/industries/hospitality.png",
    imageAlt: "Hospitality environment",
    badge: "Guest experience",
  },
  {
    slug: "small-business",
    name: "Small Business",
    description:
      "Signal and Wi-Fi reliability for customer-facing operations, VoIP, and day-to-day productivity.",
    imageSrc: "/industries/small-business.png",
    imageAlt: "Professional services office setting",
    badge: "Professional services",
  },
  {
    slug: "retail",
    name: "Retail",
    description:
      "Checkout systems, inventory, staff handhelds, and customer experience depend on uptime.",
    imageSrc: "/industries/retail.png",
    imageAlt: "Retail environment",
  },
  {
    slug: "industrial",
    name: "Industrial",
    description:
      "Facilities where RF noise, machinery, and coverage gaps can disrupt operations.",
    imageSrc: "/industries/industrial.png",
    imageAlt: "Industrial environment",
  },
  {
    slug: "public-safety",
    name: "Public Safety",
    description:
      "Radio coverage validation and reporting to support AHJ / Fire Marshal compliance workflows.",
    imageSrc: "/industries/public-safety.png",
    imageAlt: "Public safety environment",
    badge: "Compliance",
  },
  {
    slug: "education",
    name: "Education",
    description:
      "Campuses and classrooms where coverage consistency and capacity matter.",
    imageSrc: "/industries/education.png",
    imageAlt: "Education environment",
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    description:
      "Large, complex environments where scale, uptime, and planning are essential.",
    imageSrc: "/industries/enterprise.png",
    imageAlt: "Enterprise environment",
  },
  {
    slug: "government",
    name: "Government",
    description:
      "Operational environments where dependable communications support continuity and mission.",
    imageSrc: "/industries/government.png",
    imageAlt: "Government environment",
  },
];
