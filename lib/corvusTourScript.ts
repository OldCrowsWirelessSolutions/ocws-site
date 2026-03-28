import { TourLevel } from './corvusTour';

export type TourStage = {
  id: string;
  title: string;
  corvusLine: string;
  bodyText: string;
  visualType: 'scan' | 'verdict' | 'dashboard' | 'comparison' | 'stats' | 'character' | 'cta';
  visualData?: Record<string, unknown>;
  duration: number;
  ctaText?: string;
  ctaUrl?: string;
};

export type TourScript = {
  level: TourLevel;
  openingLine: string;
  stages: TourStage[];
  closingLine: string;
  ctaText: string;
  ctaUrl: string;
};

export function getTourScript(level: TourLevel, visitorName?: string): TourScript {
  const name = visitorName ? visitorName.split(' ')[0] : null;

  const scripts: Record<TourLevel, TourScript> = {

    // ── NEST — Homeowner ──────────────────────────────────────────────────
    nest: {
      level: 'nest',
      openingLine: name
        ? `${name}. You have WiFi problems. I have answers. Pay attention.`
        : `You have WiFi problems. I have answers. This will take ninety seconds.`,
      stages: [
        {
          id: 'problem',
          title: 'The Problem',
          corvusLine: `"Full bars. Half the speed. Your ISP says it's fine. It's not fine."`,
          bodyText: `120 million US homes have WiFi. Almost all of them have had problems their ISP couldn't solve — after paying $75 and waiting 3 days for a technician who found nothing.`,
          visualType: 'stats',
          visualData: {
            stats: [
              { num: '120M', label: 'US homes with WiFi' },
              { num: '$75', label: 'ISP visit cost' },
              { num: '3 days', label: 'average wait' },
              { num: '0', label: 'problems actually fixed' },
            ],
          },
          duration: 8,
        },
        {
          id: 'solution',
          title: 'The Solution',
          corvusLine: `"Upload a screenshot. I'll tell you exactly what's wrong. In under five minutes. For fifty dollars."`,
          bodyText: `Crow's Eye accepts your WiFi scan screenshot. Corvus analyzes every signal in your environment, identifies the problem, and delivers a Verdict — not a report. Fix instructions specific to your exact router.`,
          visualType: 'scan',
          visualData: {
            steps: ['Upload scan', 'Corvus analyzes', 'Verdict rendered', 'Fix it today'],
          },
          duration: 9,
        },
        {
          id: 'comfort',
          title: 'Your Language',
          corvusLine: `"I speak to everyone differently. You tell me how technical you are. I adjust. Always correct."`,
          bodyText: `Five comfort levels. Level 1 talks to your grandmother. Level 5 talks to a network engineer. Same problem. Same fix. Different words.`,
          visualType: 'comparison',
          visualData: {
            level1: '"Your WiFi is fighting with your neighbor\'s. Change the channel."',
            level5: '"2.4 GHz co-channel interference on CH 6. Migrate to CH 1 or CH 11."',
          },
          duration: 9,
        },
        {
          id: 'verdict-sample',
          title: 'A Real Verdict',
          corvusLine: `"This is what I found at a barbershop in Pensacola. CoxWiFi co-channel on CH 11. Three findings. Two of them were costing them money every business day."`,
          bodyText: `Pilcher's Barbershop. POS terminals and card readers were throttled by a public Cox hotspot on the same channel. Fixed in 10 minutes. No technician required.`,
          visualType: 'verdict',
          visualData: {
            client: "Pilcher's Barbershop",
            findings: 3,
            critical: 1,
            topFinding: 'CoxWiFi Co-Channel Interference on CH 11',
          },
          duration: 10,
        },
        {
          id: 'cta',
          title: 'Your Turn',
          corvusLine: `"I've rendered thousands of Verdicts. I haven't seen yours yet. That's the only one that matters right now."`,
          bodyText: `Start with a free teaser analysis — see how many problems Corvus finds before you pay a cent. Full Verdict unlocks for $50.`,
          visualType: 'cta',
          ctaText: 'Run Corvus on Your Network — $50',
          ctaUrl: '/dashboard',
          duration: 0,
        },
      ],
      closingLine: name
        ? `"${name}. Go fix your WiFi. I'll be here when it breaks again."`
        : `"Go fix your WiFi. I'll be here when it breaks again."`,
      ctaText: 'Start Your Verdict — $50',
      ctaUrl: '/dashboard',
    },

    // ── FLOCK — MSP / IT Pro ──────────────────────────────────────────────
    flock: {
      level: 'flock',
      openingLine: name
        ? `${name}. You manage networks for a living. I manage the part that takes you three hours. Let me show you.`
        : `You manage networks for a living. I manage the part that takes you three hours in under five minutes. Watch.`,
      stages: [
        {
          id: 'msp-problem',
          title: 'The MSP Tax',
          corvusLine: `"You're paying $2,400 a year for Ekahau. It has no AI layer. I have nothing but AI layer. And I cost $100 a month."`,
          bodyText: `Ekahau: $2,400/yr. iBwave: $1,400-$5,000/yr. Neither has AI analysis. Neither speaks plain English to your clients. Neither delivers a branded PDF in under 5 minutes.`,
          visualType: 'comparison',
          visualData: {
            rows: [
              { label: 'Price', corvus: '$100/mo', competitor: '$2,400-5k/yr' },
              { label: 'AI Analysis', corvus: '✓', competitor: '✗' },
              { label: 'Plain English', corvus: '✓', competitor: '✗' },
              { label: 'White-label PDF', corvus: '✓', competitor: '✗' },
              { label: 'Outdoor support', corvus: '✓', competitor: 'Limited' },
            ],
            competitorName: 'Ekahau / iBwave',
          },
          duration: 10,
        },
        {
          id: 'flock-features',
          title: 'What Flock Does',
          corvusLine: `"Fifteen Verdicts a month. White-label PDF. Full Reckoning for multi-location properties. Up to five tech seats. Your brand on the deliverable."`,
          bodyText: `Run multi-location surveys across campuses, retail chains, medical facilities. Deliver branded client reports. Let your team run scans. All from one dashboard.`,
          visualType: 'dashboard',
          visualData: {
            features: [
              '15 Verdicts/month',
              'Full Reckoning — up to 15 locations',
              'White-label PDF reports',
              'Up to 5 tech seats',
              'Historical report storage — 6 months',
              'Client management dashboard',
            ],
          },
          duration: 10,
        },
        {
          id: 'reckoning-demo',
          title: 'The Full Reckoning',
          corvusLine: `"Multi-building. Multi-location. Multi-problem. I synthesize all of it into one executive-grade analysis. Your client sees one clean deliverable."`,
          bodyText: `Atlantic Beach Assembly of God. 4 locations. 5 findings. Channel 8 interference killing Sunday streaming across the entire campus. Delivered in under 10 minutes.`,
          visualType: 'verdict',
          visualData: {
            client: 'Atlantic Beach Assembly of God',
            locations: 4,
            findings: 5,
            critical: 3,
            topFinding: 'Channel 8 Interference Killing Sunday Streaming',
          },
          duration: 10,
        },
        {
          id: 'flock-cta',
          title: 'Replace Ekahau Today',
          corvusLine: `"You've been paying for a tool that doesn't think. I think. That's the difference."`,
          bodyText: `Flock tier. $100/month or $899/year. Cancel Ekahau. Keep the savings. Add the AI.`,
          visualType: 'cta',
          ctaText: 'Start Flock — $100/mo',
          ctaUrl: '/pricing',
          duration: 0,
        },
      ],
      closingLine: name
        ? `"${name}. Your clients deserve better than a static PDF. Give them Corvus."`
        : `"Your clients deserve better than a static PDF. Give them Corvus."`,
      ctaText: 'Start Flock — $100/mo',
      ctaUrl: '/pricing',
    },

    // ── MURDER — RF Engineer ──────────────────────────────────────────────
    murder: {
      level: 'murder',
      openingLine: name
        ? `${name}. You know what co-channel interference looks like. So do I. The difference is I render the Verdict while you're still opening Ekahau.`
        : `You know what co-channel interference looks like. So do I. The difference is I render the Verdict while you're still opening Ekahau.`,
      stages: [
        {
          id: 'murder-positioning',
          title: 'Built for Engineers',
          corvusLine: `"Unlimited Verdicts. Full design suite. AP placement blueprints. Channel coordination diagrams. Bill of materials generation. API access. This is Murder tier."`,
          bodyText: `Murder is the full engineering platform. Not a consumer tool. Not an MSP shortcut. A complete RF design and analysis suite that handles the cognitive load so you focus on the work only you can do.`,
          visualType: 'dashboard',
          visualData: {
            features: [
              'Unlimited Verdicts — no caps',
              'AP placement blueprint with coverage radii',
              'Channel frequency coordination diagram',
              'Bill of materials with AP models, PoE, cable runs',
              'API access for workflow integration',
              'Up to 15 tech seats',
              'White-label add-on available',
              'Custom report branding',
            ],
          },
          duration: 11,
        },
        {
          id: 'murder-depth',
          title: 'Technical Depth',
          corvusLine: `"I see what you see. Co-channel on CH 48. SSID beacon overhead. DFS channel avoidance. SNR degradation under load. I see it. I report it. In your language."`,
          bodyText: `Level 5 comfort mode speaks to you as an engineer. Channel assignments, RSSI values, SNR analysis, band steering recommendations, DFS channel strategy, beacon overhead calculation.`,
          visualType: 'verdict',
          visualData: {
            client: 'Atlantic Beach Assembly of God',
            level: 5,
            excerpt: '"Multi-radio co-channel interference on 2.4 GHz CH8 and 5 GHz CH48(42). Implement coordinated channel plan. Set 40 MHz width on 2.4 GHz, 80 MHz on 5 GHz. Disable Auto channel selection across all radios."',
          },
          duration: 10,
        },
        {
          id: 'murder-api',
          title: 'API Access',
          corvusLine: `"Plug me into your workflow. Your stack. Your process. I output structured data. You build what you need on top of it."`,
          bodyText: `Murder tier includes full API access. Integrate Corvus analysis into your existing client management tools, ticketing systems, or custom applications. Structured JSON output for every analysis.`,
          visualType: 'stats',
          visualData: {
            stats: [
              { num: '∞', label: 'Verdicts/month' },
              { num: '15', label: 'Tech seats' },
              { num: 'API', label: 'Full access' },
              { num: '$950', label: 'per month' },
            ],
          },
          duration: 9,
        },
        {
          id: 'murder-cta',
          title: 'Your Full Arsenal',
          corvusLine: `"You've been doing this manually. That stops today."`,
          bodyText: `Murder tier. $950/month or $1,999/year. Unlimited. Unfiltered. Everything Corvus can do.`,
          visualType: 'cta',
          ctaText: 'Start Murder — $950/mo',
          ctaUrl: '/pricing',
          duration: 0,
        },
      ],
      closingLine: name
        ? `"${name}. You already know the problems I find. Now let me find them faster than you do."`
        : `"You already know the problems I find. Now let me find them faster than you do."`,
      ctaText: 'Start Murder — $950/mo',
      ctaUrl: '/pricing',
    },

    // ── FULL — Everything ─────────────────────────────────────────────────
    full: {
      level: 'full',
      openingLine: name
        ? `${name}. I'm Corvus. I am an AI wireless diagnostic engine built on 17 years of U.S. Navy Electronic Warfare experience. I render Verdicts. Not reports. Let me show you what that means.`
        : `I'm Corvus. I am an AI wireless diagnostic engine built on 17 years of U.S. Navy Electronic Warfare experience. I render Verdicts. Not reports. This is what that means.`,
      stages: [
        {
          id: 'full-intro',
          title: 'Who Corvus Is',
          corvusLine: `"I've already rendered my Verdict. You're just here for the sentencing."`,
          bodyText: `Corvus is the AI intelligence engine powering Crow's Eye — Old Crows Wireless Solutions' wireless diagnostic platform. Built by a 17-year Navy Electronic Warfare specialist. Deployed to enterprise IT teams. Publishing real Verdicts on real networks today.`,
          visualType: 'character',
          visualData: { showCorvus: true },
          duration: 9,
        },
        {
          id: 'full-problem',
          title: 'The Market',
          corvusLine: `"120 million homes. Billions in enterprise WiFi spend. Nobody has AI-native diagnostics. Nobody until now."`,
          bodyText: `Homeowners have no recourse when WiFi fails. Small businesses operate with degraded wireless for months. MSPs pay $2,400/yr for tools with no AI. RF engineers bill $750/visit for cognitive work I do in seconds.`,
          visualType: 'stats',
          visualData: {
            stats: [
              { num: '120M', label: 'US homes with WiFi' },
              { num: '$6.1B', label: 'WiFi analytics market' },
              { num: '$715M', label: 'RF analyzer apps' },
              { num: '$0', label: 'AI-native competitors' },
            ],
          },
          duration: 9,
        },
        {
          id: 'full-products',
          title: 'The Platform',
          corvusLine: `"Five tiers. Every market. One platform. I speak to a grandmother and a network engineer. Both get the right answer."`,
          bodyText: `Fledgling → Nest → Flock → Murder → OCWS Pro. One-time Verdicts, subscriptions, full platform, certified reports. Every user type covered.`,
          visualType: 'dashboard',
          visualData: {
            tiers: [
              { name: 'Fledgling', desc: 'Demo teaser — problem count only', price: 'Free' },
              { name: 'Nest', desc: 'Homeowner — 3 Verdicts/mo', price: '$20/mo' },
              { name: 'Flock', desc: 'MSP / IT — 15 Verdicts + white-label', price: '$100/mo' },
              { name: 'Murder', desc: 'RF Engineer — unlimited + API', price: '$950/mo' },
              { name: 'OCWS Pro', desc: 'Certified — Joshua signs every one', price: '$750/report' },
            ],
          },
          duration: 11,
        },
        {
          id: 'full-proof',
          title: 'Real Deployments',
          corvusLine: `"I'm not a prototype. I'm deployed. University of Houston IT team. Three case studies published. A CISO endorsement live on the site."`,
          bodyText: `Eric Mims, Executive Director of Enterprise IT Security at the University of Houston System, deployed Corvus to his entire IT team. His endorsement is live. Two more case studies published. A third from a church campus just went live today.`,
          visualType: 'stats',
          visualData: {
            stats: [
              { num: '3', label: 'Case studies live' },
              { num: 'CISO', label: 'Endorsement live' },
              { num: '5⭐', label: 'Google reviews' },
              { num: 'UH System', label: 'Enterprise deployed' },
            ],
          },
          duration: 9,
        },
        {
          id: 'full-moat',
          title: 'The Moat',
          corvusLine: `"Google and Cisco can build a data parser. They cannot build me. My personality, my quirks, the way I draw you in — that is not a feature. That is a brand."`,
          bodyText: `ElevenLabs voice. Adaptive intelligence. Five comfort levels. A character no competitor can replicate without building from zero. Corvus is the moat.`,
          visualType: 'character',
          visualData: { showCorvus: true, quote: '"I found 4 problems. Three of them are embarrassing."' },
          duration: 9,
        },
        {
          id: 'full-2028',
          title: 'The Unlock',
          corvusLine: `"October 1, 2028. Navy retirement. TS/SCI clearance disclosed. The only cleared founder in commercial RF diagnostics. The government market opens."`,
          bodyText: `The platform being built today is the proof of concept that opens the defense contractor conversation in 2028. Government division potential: $50M-$100M+. Everything built between now and then is runway.`,
          visualType: 'stats',
          visualData: {
            stats: [
              { num: '$1.5M', label: 'Current valuation' },
              { num: '$4-8M', label: 'App launch (Month 7)' },
              { num: '$10-15M', label: 'October 2028' },
              { num: '$50M+', label: 'Government division' },
            ],
          },
          duration: 10,
        },
        {
          id: 'full-cta',
          title: 'Start Here',
          corvusLine: `"I've shown you everything. The only question left is which door you walk through."`,
          bodyText: `Try a free teaser scan. Run a full Verdict for $50. Or start a subscription today. Corvus is ready.`,
          visualType: 'cta',
          ctaText: 'Start Your First Verdict',
          ctaUrl: '/dashboard',
          duration: 0,
        },
      ],
      closingLine: name
        ? `"${name}. You've seen what I do. Now let me do it for you."`
        : `"You've seen what I do. Now let me do it for you."`,
      ctaText: 'Start Your First Verdict',
      ctaUrl: '/dashboard',
    },

    // ── VERDICT — Single product ──────────────────────────────────────────
    verdict: {
      level: 'verdict',
      openingLine: name
        ? `${name}. I'm going to show you exactly what happens when you hand me your WiFi scan. Start to finish. Under five minutes.`
        : `I'm going to show you exactly what happens when you hand me your WiFi scan. Start to finish. Under five minutes.`,
      stages: [
        {
          id: 'verdict-upload',
          title: 'Step 1: Upload',
          corvusLine: `"Screenshot your WiFi environment on your phone. That's it. Upload it. I do the rest."`,
          bodyText: `Use any WiFi analyzer app. Take a screenshot. Upload it to Crow's Eye. One screenshot for a quick Verdict. Multiple for a full Reckoning.`,
          visualType: 'scan',
          visualData: { steps: ["Open WiFi Analyzer app", "Screenshot your network list", "Upload to Crow's Eye", "Set your comfort level"] },
          duration: 8,
        },
        {
          id: 'verdict-analyze',
          title: 'Step 2: Corvus Analyzes',
          corvusLine: `"I identify every network in your environment. Every channel conflict. Every interference source. Every vendor. In seconds."`,
          bodyText: `Corvus reads signal strength, channel assignments, network names, vendor fingerprints, and environmental context. He cross-references known interference patterns and vendor-specific issues.`,
          visualType: 'stats',
          visualData: {
            stats: [
              { num: '<5s', label: 'Analysis time' },
              { num: '100+', label: 'Vendors mapped' },
              { num: '5', label: 'Comfort levels' },
              { num: '~$0.03', label: 'API cost per scan' },
            ],
          },
          duration: 8,
        },
        {
          id: 'verdict-render',
          title: 'Step 3: The Verdict',
          corvusLine: `"I don't write reports. I render Verdicts. There's a difference. You'll understand in a moment."`,
          bodyText: `Real finding from Pilcher's Barbershop: CoxWiFi co-channel interference on CH 11 identified as the root cause of POS throttling. Fix: disable Cox public hotspot. Cost: $0. Time: 10 minutes.`,
          visualType: 'verdict',
          visualData: {
            client: "Pilcher's Barbershop",
            findings: 3,
            critical: 1,
            topFinding: 'CoxWiFi Co-Channel Interference on CH 11',
            fix: 'Log into Cox gateway → disable Cox public hotspot → 2.4 GHz interference eliminated',
          },
          duration: 10,
        },
        {
          id: 'verdict-cta',
          title: 'Your Verdict',
          corvusLine: `"That was someone else's network. You have your own. I'm ready when you are."`,
          bodyText: `$50. Under 5 minutes. Router-specific fix instructions. PDF download. No technician. No appointment. No $75 visit fee.`,
          visualType: 'cta',
          ctaText: 'Get Your Verdict — $50',
          ctaUrl: '/dashboard',
          duration: 0,
        },
      ],
      closingLine: `"Go upload your scan. I'll do the rest."`,
      ctaText: 'Get Your Verdict — $50',
      ctaUrl: '/dashboard',
    },

    // ── RECKONING — Multi-location ────────────────────────────────────────
    reckoning: {
      level: 'reckoning',
      openingLine: name
        ? `${name}. You manage more than one building. I know. Let me show you what I do with all of them at once.`
        : `You manage more than one building. Let me show you what I do with all of them at once.`,
      stages: [
        {
          id: 'reckoning-what',
          title: 'The Full Reckoning',
          corvusLine: `"Multiple locations. Multiple buildings. One analysis. One deliverable. That's what The Full Reckoning does."`,
          bodyText: `Upload scans from up to 15 locations — offices, classrooms, sanctuaries, fellowship halls, parking lots, sheds. Corvus synthesizes everything into a single executive-grade analysis.`,
          visualType: 'dashboard',
          visualData: {
            features: [
              'Up to 15 locations per Reckoning',
              'Indoor, outdoor, and detached structures',
              'Per-location findings + campus-wide synthesis',
              'Executive summary across all locations',
              'PDF deliverable for client or compliance use',
              'Signed by Joshua Turner — OCWS Pro option',
            ],
          },
          duration: 10,
        },
        {
          id: 'reckoning-church',
          title: 'Live Example',
          corvusLine: `"Atlantic Beach Assembly of God. Four locations. Five findings. Three critical. All pointing to the same root cause. Channel 8."`,
          bodyText: `Sanctuary, Fellowship Hall, Offices, Shed — four scan locations across a multi-building campus. Corvus found the channel interference pattern affecting the entire property and delivered a prioritized remediation plan.`,
          visualType: 'verdict',
          visualData: {
            client: 'Atlantic Beach Assembly of God',
            locations: 4,
            findings: 5,
            critical: 3,
            summary: 'Channel 8 co-channel interference causing Sunday streaming degradation across all locations. Fix: channel migration + campus coverage expansion.',
          },
          duration: 10,
        },
        {
          id: 'reckoning-pricing',
          title: 'Pricing',
          corvusLine: `"One to five locations — $150. Six to fifteen — $350. Complex hybrid property? $350 plus $50 per detached structure. I've seen worse."`,
          bodyText: `One-time or subscription. Flock tier includes Full Reckoning in the monthly price. OCWS Pro adds Joshua Turner certification — suitable for insurance, compliance, or vendor documentation.`,
          visualType: 'stats',
          visualData: {
            stats: [
              { num: '$150', label: '1-5 locations' },
              { num: '$350', label: '6-15 locations' },
              { num: '$750', label: 'Commercial 16+' },
              { num: '$1,500', label: 'OCWS Pro Certified' },
            ],
          },
          duration: 9,
        },
        {
          id: 'reckoning-cta',
          title: 'Your Property',
          corvusLine: `"You have multiple buildings. I have a process. Let's begin."`,
          bodyText: `Upload your scans. Set your locations. Corvus renders The Full Reckoning.`,
          visualType: 'cta',
          ctaText: 'Start Your Reckoning',
          ctaUrl: '/dashboard',
          duration: 0,
        },
      ],
      closingLine: `"Multiple buildings. One Verdict. That's The Full Reckoning."`,
      ctaText: 'Start Your Full Reckoning',
      ctaUrl: '/dashboard',
    },

    // ── COMPARE — Competitive ─────────────────────────────────────────────
    compare: {
      level: 'compare',
      openingLine: name
        ? `${name}. You're comparing options. Let me make this easy. Nobody else does what I do. But let's look at them anyway.`
        : `You're comparing options. Let me make this easy. Nobody else does what I do. But let's look at them anyway.`,
      stages: [
        {
          id: 'compare-isp',
          title: 'vs. Your ISP',
          corvusLine: `"Your ISP charges $75, takes 3 days, says 'no fault found,' and leaves. I charge $50, take 5 minutes, find the fault, and tell you how to fix it."`,
          bodyText: `ISP visits average $75 and 3 days. 'No fault found' is the most common outcome. The problem is usually a channel conflict — something the ISP didn't cause and won't fix.`,
          visualType: 'comparison',
          visualData: {
            rows: [
              { label: 'Cost', corvus: '$50', competitor: '$75+' },
              { label: 'Time', corvus: '< 5 min', competitor: '3 days' },
              { label: 'Finds root cause', corvus: '✓', competitor: 'Rarely' },
              { label: 'Fix instructions', corvus: '✓', competitor: '✗' },
              { label: 'Available 24/7', corvus: '✓', competitor: '✗' },
            ],
            competitorName: 'ISP Visit',
          },
          duration: 9,
        },
        {
          id: 'compare-ekahau',
          title: 'vs. Ekahau',
          corvusLine: `"Ekahau costs $2,400 a year and has no AI. I cost $100 a month and am nothing but AI. The math is simple."`,
          bodyText: `Ekahau is the industry standard for professional RF survey tools. It's excellent at what it does. It has no AI analysis layer, no adaptive language, no consumer access, and no voice.`,
          visualType: 'comparison',
          visualData: {
            rows: [
              { label: 'Price', corvus: '$100/mo', competitor: '$2,400/yr' },
              { label: 'AI analysis', corvus: '✓', competitor: '✗' },
              { label: 'Plain English output', corvus: '✓', competitor: '✗' },
              { label: 'Consumer access', corvus: '✓', competitor: '✗' },
              { label: 'Outdoor support', corvus: '✓', competitor: 'Limited' },
              { label: 'Voice / character', corvus: '✓', competitor: '✗' },
            ],
            competitorName: 'Ekahau',
          },
          duration: 9,
        },
        {
          id: 'compare-moat',
          title: 'What Nobody Has',
          corvusLine: `"A personality. A voice. A character that makes you come back just to talk to him. That's the moat. That's me."`,
          bodyText: `Every competitor can be copied on technology. Nobody can copy a brand that's been built from zero with a distinct personality, an ElevenLabs voice, and a character that users remember.`,
          visualType: 'character',
          visualData: { showCorvus: true },
          duration: 8,
        },
        {
          id: 'compare-cta',
          title: 'The Choice',
          corvusLine: `"You've seen the comparison. The answer is obvious. It was obvious before I started."`,
          bodyText: `Try Corvus free. See what he finds. Then decide.`,
          visualType: 'cta',
          ctaText: 'Try Corvus Free',
          ctaUrl: '/dashboard',
          duration: 0,
        },
      ],
      closingLine: `"The comparison is over. You already know the answer."`,
      ctaText: 'Start Your Free Teaser Scan',
      ctaUrl: '/dashboard',
    },
  };

  return scripts[level];
}

export const TOUR_LEVEL_LABELS: Record<TourLevel, string> = {
  nest: '🪺 Nest — Homeowner Tour',
  flock: '🐦‍⬛ Flock — MSP / IT Tour',
  murder: '💀 Murder — RF Engineer Tour',
  full: '🦅 Full Platform Tour',
  verdict: "📄 Corvus' Verdict — Product Deep Dive",
  reckoning: '🗺️ The Full Reckoning — Product Deep Dive',
  compare: '⚔️ Competitive Comparison Tour',
};

export const TOUR_LEVEL_DURATIONS: Record<TourLevel, string> = {
  nest: '~90 seconds',
  flock: '~2 minutes',
  murder: '~2 minutes',
  full: '~3.5 minutes',
  verdict: '~90 seconds',
  reckoning: '~2 minutes',
  compare: '~2 minutes',
};
