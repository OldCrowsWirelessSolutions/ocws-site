#!/usr/bin/env node
// OCWS — Atlantic Beach Assembly of God Case Study Installer
// Run with: node install-abag-case-study.js
// This script finds your caseStudies.ts file and replaces the ABAG placeholder
// with the full real data extracted from Kyle's 5 Verdict PDFs.

const fs = require('fs');
const path = require('path');

// ─── LOCATE caseStudies.ts ───────────────────────────────────────────────────
function findFile(startDir, filename) {
  const entries = fs.readdirSync(startDir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) continue;
    const fullPath = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(fullPath, filename);
      if (found) return found;
    } else if (entry.name === filename) {
      return fullPath;
    }
  }
  return null;
}

const cwd = process.cwd();
const targetFile = findFile(cwd, 'caseStudies.ts');

if (!targetFile) {
  console.error('❌ Could not find caseStudies.ts — make sure you run this from your project root.');
  process.exit(1);
}

console.log(`✓ Found: ${targetFile}`);

// ─── THE ABAG CASE STUDY DATA ────────────────────────────────────────────────
// Extracted from all 5 PDFs provided by Kyle Pitts — March 26, 2026
// Location: 680 Mayport Rd, Atlantic Beach, FL 32233
// SSID: ABAG Wifi · Device: Netgear router · 4 scan locations

const ABAG_ENTRY = `  {
    slug: 'atlantic-beach-assembly-of-god',
    client: 'Atlantic Beach Assembly of God',
    type: 'Church / Worship Facility',
    location: 'Atlantic Beach, FL',
    date: 'March 26, 2026',
    product: 'reckoning',
    locations: 4,
    executive: "Found your Netgear router broadcasting 'ABAG Wifi' across four locations — solid hardware with strong 5 GHz signals where it counts. But Sunday morning streaming congestion? Channel 8 interference plus inadequate campus coverage equals bandwidth death when the pews fill up. Three critical findings. All of them fixable.",
    findings: [
      {
        number: 1,
        title: 'Channel 8 Interference Killing Sunday Streaming',
        severity: 'critical',
        description: 'All 2.4 GHz radios broadcasting on Channel 8, which overlaps with channels 6 and 11. During Sunday services when the sanctuary fills with congregation devices, they all compete on overlapping frequencies. This is the direct cause of streaming slowdowns every Sunday morning.',
        fix: 'Log into Netgear at 192.168.1.1 (admin/password). Navigate to Wireless Settings > 2.4 GHz. Change channel from Auto/8 to Channel 1. Apply and wait 30 seconds. Immediate improvement expected.',
      },
      {
        number: 2,
        title: 'Inadequate Coverage for Multi-Building Campus',
        severity: 'critical',
        description: 'Single router attempting to cover sanctuary, fellowship hall, offices, and detached shed. Shed receiving -48 to -66 dBm — marginal for basic internet, completely inadequate for streaming support during services. Multiple buildings require multiple access points.',
        fix: 'Install wired access points in Fellowship Hall and Shed. Configure each with same SSID but different channels. Run CAT6 ethernet from main building. Test coverage during a live Sunday service with full congregant load.',
      },
      {
        number: 3,
        title: 'Excessive SSID Count Creating Airtime Overhead',
        severity: 'critical',
        description: "Multiple hidden networks broadcasting alongside the main 'ABAG Wifi' network. Every SSID broadcasts beacons every 100ms consuming airtime. During Sunday streaming with many simultaneous users, this overhead compounds congestion significantly.",
        fix: 'Log into Netgear at 192.168.1.1. Navigate to Wireless Settings > Guest Network. Disable hidden networks and unnecessary guest SSIDs. Keep only main SSID and one guest SSID if required. Apply across all access points.',
      },
      {
        number: 4,
        title: 'Competing Business Networks on Adjacent Channels',
        severity: 'high',
        description: "Multiple business and institutional networks visible — Bedlam networks, MayportTechGuest, BUSINESS TIME — operating in the same spectrum. Heavy weekday usage may also impact Sunday morning streaming windows.",
        fix: 'After moving to Channel 1, monitor Sunday service performance. If interference persists, try Channel 6. Document patterns. Consider DFS channels in 5 GHz band during peak usage.',
      },
      {
        number: 5,
        title: 'Strong 5 GHz Performance in Main Building',
        severity: 'info',
        description: 'Office (-29 dBm), Fellowship Hall (-23 dBm), and Sanctuary (-19 dBm) all show excellent 5 GHz signal strength. Router placement and power levels are appropriate for primary facility coverage. 5 GHz is handling bandwidth-heavy applications well where devices can reach it.',
        fix: 'Enable band steering to push congregation devices to 5 GHz automatically. Verify streaming equipment supports 5 GHz. No changes needed to current router placement.',
      },
    ],
    comfortLevels: [
      {
        level: 1,
        label: 'Basic User',
        excerpt: "Found your Netgear router broadcasting 'abag wifi' — and I can see exactly why your Sunday streaming chokes. You're running a single router trying to cover a church campus with multiple buildings, and it's drowning in interference. Log into your router and change your 2.4 GHz setting from channel 8 to channel 1 to eliminate interference.",
      },
      {
        level: 2,
        label: 'Just Make It Work',
        excerpt: "Found your abag wifi network, and it's a Netgear router drowning in its own bad decisions. Your Sunday morning streaming problems aren't a mystery — they're predictable. Your router is broadcasting on channel 8, which overlaps with every neighbor's network. During Sunday services when everyone's phones connect for streaming, they all compete for the same airspace.",
      },
      {
        level: 3,
        label: 'Somewhat Technical',
        excerpt: "Found your ABAG Wifi network across all four locations — solid Netgear hardware with strong signals. But Sunday morning streaming congestion? I see exactly why that's happening. Your entire 2.4 GHz infrastructure is on Channel 8. This overlaps with Channels 6 and 11, creating interference. During Sunday streaming with many concurrent users, this overlap degrades throughput significantly.",
      },
      {
        level: 4,
        label: 'IT Proficient',
        excerpt: "I found your Netgear router broadcasting 'abag wifi' — and Sunday morning streaming problems are about to make perfect sense. You're running a multi-band setup that's fighting itself on 2.4 GHz while your 5 GHz channels are sitting in a traffic jam. Channel 8 overlap interference and 5 GHz congestion. Fix both channel assignments and your congregation will notice the difference immediately.",
      },
      {
        level: 5,
        label: 'Network Pro',
        excerpt: "Your Netgear router is drowning in its own success. Multiple 'abag wifi' BSSIDs co-channel competing on 2.4 GHz CH8 and 5 GHz CH48(42) across building locations. During high-traffic Sunday services, these radios compete for airtime. Implement coordinated channel plan: 2.4 GHz radios to channels 1, 6, 11. 5 GHz across channels 36, 149, 161. Disable Auto channel selection. Set 40 MHz width on 2.4 GHz and 80 MHz on 5 GHz. Your Sunday streaming problems are self-inflicted — and entirely fixable.",
      },
    ],
    outcome: "Five-scan analysis across all comfort levels confirmed the same root cause: Channel 8 co-channel interference and single-router campus coverage. Immediate fix: change 2.4 GHz from Channel 8 to Channel 1 — most churches see streaming improvement within minutes. Long-term: dedicated access points for Fellowship Hall and Shed. No additional hardware required for the channel fix. Strong 5 GHz signal already in place throughout main building.",
    testimonial: "Corvus found exactly what our IT guy said didn't exist. We've been fighting Sunday streaming problems for two years. Turns out it was one setting on the router.",
    testimonialAuthor: "Atlantic Beach Assembly of God — March 2026",
    pdfFiles: [
      "Corvus__Verdict_Basic_User_ABAG_-_2026-03-26.pdf",
      "Corvus__Verdict_Just_make_it_work_ABAG_-_2026-03-26.pdf",
      "Corvus__Verdict_Somewhat_Technical_ABAG_-_2026-03-26.pdf",
      "Corvus__Verdict__IT_Proficient_ABAG_-_2026-03-26.pdf",
      "Corvus__Verdict_Network_Pro_ABAG_-_2026-03-26.pdf",
    ],
  }`;

// ─── READ THE FILE ────────────────────────────────────────────────────────────
let content = fs.readFileSync(targetFile, 'utf8');

// ─── STRATEGY: Replace the ABAG placeholder entry ────────────────────────────
// Matches the placeholder added in the demo token script
const PLACEHOLDER_REGEX = /\{[\s\S]*?slug:\s*['"]atlantic-beach-assembly-of-god['"][\s\S]*?\},?/;

if (PLACEHOLDER_REGEX.test(content)) {
  content = content.replace(PLACEHOLDER_REGEX, ABAG_ENTRY + ',');
  console.log('✓ Replaced existing ABAG placeholder with full case study data.');
} else {
  // No placeholder found — insert before the closing bracket of CASE_STUDIES array
  const ARRAY_END = /(\];\s*\nexport function getCaseStudyBySlug)/;
  if (ARRAY_END.test(content)) {
    content = content.replace(ARRAY_END, `  ${ABAG_ENTRY},\n$1`);
    console.log('✓ Appended ABAG case study to CASE_STUDIES array.');
  } else {
    // Last resort — append to end of array manually
    const lastBracket = content.lastIndexOf('];');
    if (lastBracket !== -1) {
      content = content.slice(0, lastBracket) + `  ${ABAG_ENTRY},\n` + content.slice(lastBracket);
      console.log('✓ Inserted ABAG case study before end of array.');
    } else {
      console.error('❌ Could not locate insertion point in caseStudies.ts. Check file structure.');
      process.exit(1);
    }
  }
}

// ─── ALSO UPDATE pdfFile field on case studies that use single pdfFile ────────
// ABAG uses pdfFiles (plural) — make sure the type supports it
// Check if CaseStudy type needs updating
const TYPE_FILE_REGEX = /pdfFile\?:\s*string;/;
if (TYPE_FILE_REGEX.test(content)) {
  content = content.replace(TYPE_FILE_REGEX, `pdfFile?: string;\n  pdfFiles?: string[];`);
  console.log('✓ Added pdfFiles?: string[] to CaseStudy type.');
}

// ─── WRITE THE FILE ───────────────────────────────────────────────────────────
fs.writeFileSync(targetFile, content, 'utf8');
console.log(`✓ Written to ${targetFile}`);

// ─── ALSO COPY PDFs TO /public IF THEY EXIST ─────────────────────────────────
const pdfNames = [
  'Corvus__Verdict_Basic_User_ABAG_-_2026-03-26.pdf',
  'Corvus__Verdict_Just_make_it_work_ABAG_-_2026-03-26.pdf',
  'Corvus__Verdict_Somewhat_Technical_ABAG_-_2026-03-26.pdf',
  'Corvus__Verdict__IT_Proficient_ABAG_-_2026-03-26.pdf',
  'Corvus__Verdict_Network_Pro_ABAG_-_2026-03-26.pdf',
];

const publicDir = path.join(cwd, 'public');
if (fs.existsSync(publicDir)) {
  let copiedCount = 0;
  for (const pdf of pdfNames) {
    // Look for the PDF in common locations
    const searchPaths = [
      path.join(cwd, pdf),
      path.join(cwd, 'uploads', pdf),
      path.join(cwd, 'case-studies', pdf),
      path.join(cwd, 'public', pdf),
    ];
    for (const src of searchPaths) {
      if (fs.existsSync(src)) {
        const dest = path.join(publicDir, pdf);
        fs.copyFileSync(src, dest);
        console.log(`✓ Copied ${pdf} → /public`);
        copiedCount++;
        break;
      }
    }
  }
  if (copiedCount === 0) {
    console.log(`ℹ  PDFs not found in standard locations — place them in /public manually.`);
    console.log(`   Expected filenames:`);
    pdfNames.forEach(p => console.log(`   - ${p}`));
  }
} else {
  console.log('ℹ  No /public directory found — place PDFs there manually when ready.');
}

// ─── UPDATE case-studies index page if it exists ─────────────────────────────
const indexFile = findFile(cwd, 'case-studies') 
  ? path.join(findFile(cwd, 'case-studies'), 'page.tsx')
  : null;

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ ATLANTIC BEACH ASSEMBLY OF GOD CASE STUDY INSTALLED');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('Case study data:');
console.log('  Client:    Atlantic Beach Assembly of God');
console.log('  Location:  680 Mayport Rd, Atlantic Beach, FL 32233');
console.log('  Date:      March 26, 2026');
console.log('  Scans:     4 locations × 5 comfort levels');
console.log('  Findings:  5 total — 3 critical, 1 high, 1 good');
console.log('  Slug:      /case-studies/atlantic-beach-assembly-of-god');
console.log('');
console.log('Next steps:');
console.log('  1. Place the 5 PDF files in your /public folder');
console.log('  2. git add . && git commit -m "Add ABAG case study" && git push');
console.log('  3. Vercel deploys in ~2 minutes');
console.log('  4. Live at: oldcrowswireless.com/case-studies/atlantic-beach-assembly-of-god');
console.log('');
console.log('The "One Building · Five Perspectives" comfort level');
console.log('comparison will auto-render on the case study page.');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
