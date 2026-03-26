// lib/endorsements.ts
// Static endorsements from named professionals.
// Add entries here to make them appear on the homepage and /endorsements page.
// Remove or comment out an entry to hide it everywhere.

export interface Endorsement {
  id: string;
  name: string;
  title: string;
  company: string;
  location?: string;
  quote: string;
  quotes?: { id: string; label: string; text: string }[];
  linkedinUrl?: string;
  photoUrl?: string;   // optional headshot; initials used as fallback
  approved: boolean;   // only true entries render publicly
}

export const ENDORSEMENTS: Endorsement[] = [
  {
    id: 'eric-mims',
    name: 'Eric Mims',
    title: 'Director of Enterprise IT Security & CISO',
    company: 'University of Houston System',
    location: 'Houston, TX',
    photoUrl: undefined,
    approved: true,
    quote: "Having managed WiFi deployments since the 802.11g era, I've seen how labor-intensive traditional site surveys can be; Crow's Eye by Corvus effectively condenses a week's worth of manual engineering into a single afternoon.",
    quotes: [
      {
        id: 'leadership',
        label: 'For IT Leadership',
        text: "Having managed WiFi deployments since the 802.11g era, I've seen how labor-intensive traditional site surveys can be; Crow's Eye by Corvus effectively condenses a week's worth of manual engineering into a single afternoon. It provides the granular visibility and actionable recommendations necessary to eliminate channel overlap and optimize signal strength across complex enterprise environments. For any leader looking to slash operational overhead while ensuring peak network performance, this tool is an essential investment.",
      },
      {
        id: 'engineers',
        label: 'For Network Engineers',
        text: "After three decades in IT, I've finally found a tool that replaces the tedious 'AP-on-a-stick' manual testing of the past with streamlined, intelligent spectrum analysis. Crow's Eye by Corvus immediately identified subtle interference issues and configuration errors in my environment, proving its value within the first run. It is a game-changer for maintaining high-density WLANs where reliability and signal integrity are non-negotiable.",
      }
    ]
  },
];

/** Returns only approved endorsements. */
export function getApprovedEndorsements(): Endorsement[] {
  return ENDORSEMENTS.filter(e => e.approved);
}
