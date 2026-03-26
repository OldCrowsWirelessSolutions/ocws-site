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
  pdfFiles?: string[]
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
    locations: 4,
    executive:
      "Found your Netgear router broadcasting 'ABAG Wifi' across four locations — solid hardware with strong 5 GHz signals where it counts. But Sunday morning streaming congestion? Channel 8 interference plus inadequate campus coverage equals bandwidth death when the pews fill up. Three critical findings. All of them fixable.",
    findings: [
      {
        number: 1,
        title: 'Channel 8 Interference Killing Sunday Streaming',
        severity: 'critical',
        description:
          'All 2.4 GHz radios broadcasting on Channel 8, which overlaps with channels 6 and 11. During Sunday services when the sanctuary fills with congregation devices, they all compete on overlapping frequencies. This is the direct cause of streaming slowdowns every Sunday morning.',
        fix: 'Log into Netgear at 192.168.1.1 (admin/password). Navigate to Wireless Settings > 2.4 GHz. Change channel from Auto/8 to Channel 1. Apply and wait 30 seconds. Immediate improvement expected.',
      },
      {
        number: 2,
        title: 'Inadequate Coverage for Multi-Building Campus',
        severity: 'critical',
        description:
          'Single router attempting to cover sanctuary, fellowship hall, offices, and detached shed. Shed receiving -48 to -66 dBm — marginal for basic internet, completely inadequate for streaming support during services. Multiple buildings require multiple access points.',
        fix: 'Install wired access points in Fellowship Hall and Shed. Configure each with same SSID but different channels. Run CAT6 ethernet from main building. Test coverage during a live Sunday service with full congregant load.',
      },
      {
        number: 3,
        title: 'Excessive SSID Count Creating Airtime Overhead',
        severity: 'critical',
        description:
          "Multiple hidden networks broadcasting alongside the main 'ABAG Wifi' network. Every SSID broadcasts beacons every 100ms consuming airtime. During Sunday streaming with many simultaneous users, this overhead compounds congestion significantly.",
        fix: 'Log into Netgear at 192.168.1.1. Navigate to Wireless Settings > Guest Network. Disable hidden networks and unnecessary guest SSIDs. Keep only main SSID and one guest SSID if required. Apply across all access points.',
      },
      {
        number: 4,
        title: 'Competing Business Networks on Adjacent Channels',
        severity: 'high',
        description:
          "Multiple business and institutional networks visible — Bedlam networks, MayportTechGuest, BUSINESS TIME — operating in the same spectrum. Heavy weekday usage may also impact Sunday morning streaming windows.",
        fix: 'After moving to Channel 1, monitor Sunday service performance. If interference persists, try Channel 6. Document patterns. Consider DFS channels in 5 GHz band during peak usage.',
      },
      {
        number: 5,
        title: 'Strong 5 GHz Performance in Main Building',
        severity: 'info',
        description:
          'Office (-29 dBm), Fellowship Hall (-23 dBm), and Sanctuary (-19 dBm) all show excellent 5 GHz signal strength. Router placement and power levels are appropriate for primary facility coverage. 5 GHz is handling bandwidth-heavy applications well where devices can reach it.',
        fix: 'Enable band steering to push congregation devices to 5 GHz automatically. Verify streaming equipment supports 5 GHz. No changes needed to current router placement.',
      },
    ],
    comfortLevels: [
      {
        level: 1,
        label: 'Basic User',
        excerpt:
          "Found your Netgear router broadcasting 'abag wifi' — and I can see exactly why your Sunday streaming chokes. You're running a single router trying to cover a church campus with multiple buildings, and it's drowning in interference. Log into your router and change your 2.4 GHz setting from channel 8 to channel 1 to eliminate interference.",
      },
      {
        level: 2,
        label: 'Just Make It Work',
        excerpt:
          "Found your abag wifi network, and it's a Netgear router drowning in its own bad decisions. Your Sunday morning streaming problems aren't a mystery — they're predictable. Your router is broadcasting on channel 8, which overlaps with every neighbor's network. During Sunday services when everyone's phones connect for streaming, they all compete for the same airspace.",
      },
      {
        level: 3,
        label: 'Somewhat Technical',
        excerpt:
          "Found your ABAG Wifi network across all four locations — solid Netgear hardware with strong signals. But Sunday morning streaming congestion? I see exactly why that's happening. Your entire 2.4 GHz infrastructure is on Channel 8. This overlaps with Channels 6 and 11, creating interference. During Sunday streaming with many concurrent users, this overlap degrades throughput significantly.",
      },
      {
        level: 4,
        label: 'IT Proficient',
        excerpt:
          "I found your Netgear router broadcasting 'abag wifi' — and Sunday morning streaming problems are about to make perfect sense. You're running a multi-band setup that's fighting itself on 2.4 GHz while your 5 GHz channels are sitting in a traffic jam. Channel 8 overlap interference and 5 GHz congestion. Fix both channel assignments and your congregation will notice the difference immediately.",
      },
      {
        level: 5,
        label: 'Network Pro',
        excerpt:
          "Your Netgear router is drowning in its own success. Multiple 'abag wifi' BSSIDs co-channel competing on 2.4 GHz CH8 and 5 GHz CH48(42) across building locations. During high-traffic Sunday services, these radios compete for airtime. Implement coordinated channel plan: 2.4 GHz radios to channels 1, 6, 11. 5 GHz across channels 36, 149, 161. Disable Auto channel selection. Set 40 MHz width on 2.4 GHz and 80 MHz on 5 GHz. Your Sunday streaming problems are self-inflicted — and entirely fixable.",
      },
    ],
    outcome:
      "Five-scan analysis across all comfort levels confirmed the same root cause: Channel 8 co-channel interference and single-router campus coverage. Immediate fix: change 2.4 GHz from Channel 8 to Channel 1 — most churches see streaming improvement within minutes. Long-term: dedicated access points for Fellowship Hall and Shed. No additional hardware required for the channel fix. Strong 5 GHz signal already in place throughout main building.",
    testimonial:
      "Corvus found exactly what our IT guy said didn't exist. We've been fighting Sunday streaming problems for two years. Turns out it was one setting on the router.",
    testimonialAuthor: 'Atlantic Beach Assembly of God — March 2026',
    pdfFiles: [
      'Corvus__Verdict_Basic_User_ABAG_-_2026-03-26.pdf',
      'Corvus__Verdict_Just_make_it_work_ABAG_-_2026-03-26.pdf',
      'Corvus__Verdict_Somewhat_Technical_ABAG_-_2026-03-26.pdf',
      'Corvus__Verdict__IT_Proficient_ABAG_-_2026-03-26.pdf',
      'Corvus__Verdict_Network_Pro_ABAG_-_2026-03-26.pdf',
    ],
  },
]

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find(cs => cs.slug === slug)
}
