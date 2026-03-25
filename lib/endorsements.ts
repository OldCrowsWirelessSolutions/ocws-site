// lib/endorsements.ts
// Static endorsements from named professionals.
// Add entries here to make them appear on the homepage and /endorsements page.
// Remove or comment out an entry to hide it everywhere.

export interface Endorsement {
  id: string;
  name: string;
  title: string;
  company: string;
  quote: string;
  linkedinUrl?: string;
  photoUrl?: string;   // optional headshot; initials used as fallback
  approved: boolean;   // only true entries render publicly
}

export const ENDORSEMENTS: Endorsement[] = [
  // Add approved endorsements here.
  // Example structure (remove the comment block and fill in real data when ready):
  //
  // {
  //   id: "eric-mims",
  //   name: "Eric Mims",
  //   title: "Director Enterprise IT Security & CISO",
  //   company: "University of Houston System",
  //   quote: "Corvus gave us a level of RF clarity we simply couldn't get from any other tool. It's like having a seasoned wireless engineer on call 24/7.",
  //   linkedinUrl: "https://www.linkedin.com/in/ericmims/",
  //   approved: true,
  // },
];

/** Returns only approved endorsements. */
export function getApprovedEndorsements(): Endorsement[] {
  return ENDORSEMENTS.filter(e => e.approved);
}
