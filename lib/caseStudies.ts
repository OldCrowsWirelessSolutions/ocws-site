export type CaseStudyFinding = {
  number: number
  title: string
  severity: 'critical' | 'high' | 'moderate' | 'info'
  description: string
  fix?: string
}

export type ComfortLevelSample = {
  level: 1 | 2 | 3 | 4 | 5
  label: string
  excerpt: string
}

export type CaseStudy = {
  slug: string
  client: string
  type: string
  location: string
  date: string
  product: 'verdict' | 'reckoning'
  locations?: number
  executive: string
  findings: CaseStudyFinding[]
  comfortLevels?: ComfortLevelSample[]
  outcome: string
  testimonial?: string
  testimonialAuthor?: string
  pdfFile?: string
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'pilchers-barbershop',
    client: "Pilcher's Barbershop",
    type: 'Retail',
    location: 'Pensacola, FL',
    date: 'March 21, 2026',
    product: 'verdict',
    executive:
      "CoxWiFi co-channel interference on Channel 11 was actively degrading POS reliability. Three findings, two of them costing money every business day.",
    findings: [
      {
        number: 1,
        title: 'CoxWiFi Co-Channel Interference on CH 11',
        severity: 'critical',
        description:
          'Public Cox hotspot broadcasting on the same channel as the business network, creating sustained interference during business hours.',
        fix: 'Disable Cox public hotspot in gateway admin panel at 192.168.0.1',
      },
      {
        number: 2,
        title: 'Business SSID on 2.4 GHz Only',
        severity: 'high',
        description:
          'POS terminals and card readers sharing 2.4 GHz band with customer devices. No 5 GHz offload configured.',
        fix: 'Dedicate 5 GHz to POS and card readers exclusively.',
      },
      {
        number: 3,
        title: 'Vantiva Gateway Limited Radio Management',
        severity: 'moderate',
        description:
          'ISP combo gateway with no band steering, client isolation, or channel lock capability.',
        fix: 'Evaluate Ubiquiti UniFi or TP-Link EAP replacement ($99-249).',
      },
    ],
    outcome:
      "Single scan identified the root cause of POS slowdowns. Fix implemented same day. Zero technician visit required.",
    pdfFile: 'Corvus_Verdict__Pilchers_Barbershop.pdf',
  },
  {
    slug: 'olive-baptist-church',
    client: 'Olive Baptist Church',
    type: 'Church / Worship Facility',
    location: 'Pensacola, FL',
    date: 'March 22, 2026',
    product: 'verdict',
    executive:
      'Open network with zero security on both bands. Six findings. The entire congregation was broadcasting personal data on an unprotected network every Sunday.',
    findings: [
      {
        number: 1,
        title: 'Open Network — Zero Security on 2.4 GHz',
        severity: 'critical',
        description: 'Primary SSID broadcasting with no encryption. All traffic visible to any device in range.',
      },
      {
        number: 2,
        title: 'Open Network — Zero Security on 5 GHz',
        severity: 'critical',
        description: '5 GHz band identically misconfigured. Both radios exposed.',
      },
      {
        number: 3,
        title: 'No Guest Network Isolation',
        severity: 'high',
        description:
          'Visitor devices sharing network segment with administrative systems and giving equipment.',
      },
      {
        number: 4,
        title: 'No SSID Differentiation',
        severity: 'high',
        description: 'Staff and guest traffic indistinguishable. No QoS policy possible.',
      },
      {
        number: 5,
        title: 'Weak Signal in Sanctuary Rear',
        severity: 'moderate',
        description:
          'Signal degradation in back third of sanctuary. Streaming and presentation devices experiencing drops.',
      },
      {
        number: 6,
        title: 'No WPA3 Support',
        severity: 'moderate',
        description: 'Hardware limited to WPA2. Upgrade path available.',
      },
    ],
    outcome:
      'Security configuration corrected within 48 hours. Guest network isolated. Staff network secured. No additional hardware required.',
    pdfFile: 'Corvus_Verdict__Olive_Baptist_Church.pdf',
  },
  {
    slug: 'atlantic-beach-assembly-of-god',
    client: 'Atlantic Beach Assembly of God',
    type: 'Church / Worship Facility',
    location: 'Atlantic Beach, FL',
    date: 'March 26, 2026',
    product: 'reckoning',
    locations: 5,
    executive: 'POPULATE FROM KYLE DATA',
    findings: [],
    comfortLevels: [],
    outcome: 'POPULATE FROM KYLE DATA',
  },
]

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find(cs => cs.slug === slug)
}
