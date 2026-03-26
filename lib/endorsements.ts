// lib/endorsements.ts
// Static endorsements from named professionals.
// Add entries here to make them appear on the homepage and /endorsements page.
// Set hidden: true to suppress without deleting the record.

export interface Endorsement {
  id: string;
  name: string;
  title: string;
  company: string;
  location?: string;
  quote?: string;
  quotes?: { id: string; label: string; text: string }[];
  linkedinUrl?: string;
  photoUrl?: string;   // optional headshot; initials used as fallback
  initials?: string;   // fallback initials when no photo
  featured?: boolean;
  approved: boolean;   // only true entries render publicly
  hidden?: boolean;    // emergency hide without deleting — overrides approved
}

export const ENDORSEMENTS: Endorsement[] = [
  {
    id: 'eric-mims',
    hidden: false,
    name: 'Eric Mims',
    title: '30-Year IT Network Architect & Cyber Veteran',
    company: 'Senior IT Infrastructure and Security Professional',
    location: 'Houston, TX',
    photoUrl: '/endorsements/eric-mims.jpg',
    initials: 'EM',
    linkedinUrl: 'https://www.linkedin.com/in/emims/',
    featured: true,
    approved: true,
    quotes: [
      {
        id: 'leadership',
        label: 'For IT Leadership',
        text: "As an IT leader with over 30 years of experience in enterprise networking, I've found that Crow's Eye by Corvus effectively condenses a week's worth of manual engineering into a single afternoon. It provides the granular visibility necessary to eliminate channel overlap and optimize signal strength across complex, multi-story environments. For any leader looking to slash operational overhead while ensuring peak network performance, this tool is a high-value asset.",
      },
      {
        id: 'engineers',
        label: 'For Network Engineers',
        text: "Having managed high-density wireless deployments since the 802.11g era, I've finally found a tool that replaces the tedious manual testing of the past with streamlined, intelligent spectrum analysis. Crow's Eye by Corvus immediately identified subtle interference issues and configuration errors in my test environment, proving its value within the first run. It is a game-changer for maintaining large-scale WLANs where reliability is non-negotiable.",
      },
    ],
  },
];

/** Returns only visible (approved and not hidden) endorsements. */
export function getApprovedEndorsements(): Endorsement[] {
  return ENDORSEMENTS.filter(e => e.approved && !e.hidden);
}
