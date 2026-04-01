import Link from 'next/link';
import Image from 'next/image';

const sections = [
  {
    id: 'getting-started',
    icon: '🚀',
    title: 'Getting Started',
    content: [
      {
        heading: 'What is Crow\'s Eye?',
        text: "Crow's Eye is an AI-powered wireless diagnostic platform. You upload scan data from your phone, and Corvus — our RF intelligence engine — analyzes your wireless environment and renders a Verdict.",
      },
      {
        heading: 'What do I need?',
        text: 'A phone. That\'s it. iOS users use AirPort Utility (free, by Apple). Android users use WiFiman (free, by Ubiquiti). Both apps let you scan every nearby wireless network without any special hardware.',
      },
      {
        heading: 'How long does it take?',
        text: 'Scanning takes about 30 seconds. Corvus analyzes in under 2 minutes. You\'ll have a branded PDF Verdict ready to download in under 3 minutes total.',
      },
    ],
  },
  {
    id: 'how-to-scan',
    icon: '📱',
    title: 'How to Scan Your Network',
    content: [
      {
        heading: 'iOS — AirPort Utility by Apple',
        text: '1. Download AirPort Utility from the App Store (free, App Store ID 427276530).\n2. Open the iOS Settings app → AirPort Utility → enable "Wi-Fi Scanner".\n3. Open AirPort Utility → tap "Wi-Fi Scan" in the top right.\n4. Tap "Scan" — let it run for 15-30 seconds.\n5. Screenshot or export the results.\n6. Upload to Crow\'s Eye.',
      },
      {
        heading: 'Android — WiFiman by Ubiquiti',
        text: '1. Download WiFiman from the Play Store (free).\n2. Open WiFiman → tap "Networks".\n3. Let the scan populate — wait 15-30 seconds for full results.\n4. Screenshot the Networks tab.\n5. Use the export function if available.\n6. Upload to Crow\'s Eye.',
      },
      {
        heading: 'What am I uploading?',
        text: 'Three scan types: your full network list (all visible SSIDs), your 2.4 GHz networks, and your 5 GHz networks. Each goes into its own upload slot. The more complete your uploads, the sharper Corvus\'s analysis.',
      },
    ],
  },
  {
    id: 'understanding-verdict',
    icon: '📄',
    title: 'Understanding Your Verdict',
    content: [
      {
        heading: 'What is a Verdict?',
        text: 'A Corvus Verdict is a full RF diagnostic report for a single location. It identifies interference sources, channel conflicts, co-channel and adjacent-channel problems, signal overlap, hidden network security issues, and AP placement gaps.',
      },
      {
        heading: 'Severity Levels',
        text: 'Critical — requires immediate attention. High — significant impact on performance. Medium — notable issue, addressable. Low — minor, informational. Corvus ranks every finding so you know exactly where to start.',
      },
      {
        heading: 'The PDF',
        text: 'Every Verdict generates a branded PDF you can download, print, or send to a client. It includes your findings, fix instructions, router-specific guidance, and Corvus\'s closing statement. Murder and OCWS Pro subscribers get the full design suite included.',
      },
    ],
  },
  {
    id: 'full-reckoning',
    icon: '💀',
    title: 'The Full Reckoning',
    content: [
      {
        heading: 'What is a Reckoning?',
        text: 'The Full Reckoning is a multi-location site survey. Upload scan data from up to 15 locations simultaneously, and Corvus produces a consolidated diagnostic report across your entire property or portfolio.',
      },
      {
        heading: 'Reckoning Sizes',
        text: 'Small: 1–5 locations ($150). Standard: 6–15 locations ($350). Commercial: 16+ locations ($750). Hybrid properties with detached structures start at $350 + $50 per additional detached structure. OCWS Pro Certified: $1,500 — Joshua certifies every one personally.',
      },
      {
        heading: 'When do I need a Reckoning?',
        text: 'Multi-floor buildings, campuses, retail chains, healthcare facilities, hospitality properties, warehouses, and any environment where a single AP scan won\'t capture the full picture.',
      },
    ],
  },
  {
    id: 'subscriptions',
    icon: '🪺',
    title: 'Subscription Tiers',
    content: [
      {
        heading: 'Fledgling — $10/mo or $100/yr',
        text: '1 Verdict per month. Corvus chat access. 30-day report history. Perfect for homeowners who want to check in on their network periodically.',
      },
      {
        heading: '🪺 Nest — $19/mo or $149/yr',
        text: '3 Verdicts per month. 90-day report history. Extra Verdict credits available. The everyday diagnostic tier for power users and small businesses.',
      },
      {
        heading: '🐦‍⬛ Flock — $99/mo or $899/yr',
        text: '15 Verdicts per month. White-label PDF branding. Full Reckoning included. Team features. 180-day history. Built for MSPs, IT consultants, and field teams.',
      },
      {
        heading: '💀 Murder — $249/mo or $1,999/yr',
        text: 'Unlimited Verdicts. Full design suite. Wireless Design Brief (AP placement + coverage analysis). 365-day history. The enterprise-grade tier.',
      },
    ],
  },
  {
    id: 'corvus-chat',
    icon: '💬',
    title: 'Corvus Chat',
    content: [
      {
        heading: 'What can I ask Corvus?',
        text: 'Anything about your wireless environment. Ask him to explain a finding in plain language, compare your 2.4 GHz and 5 GHz performance, recommend a channel strategy, or walk you through a specific router\'s fix steps.',
      },
      {
        heading: 'Does Corvus remember my scan?',
        text: 'Yes. Corvus receives your last 5 scan reports as context. You don\'t need to re-explain your environment — he already knows what he found.',
      },
      {
        heading: 'Can I upload files to chat?',
        text: 'Yes. You can attach images and PDFs directly in the chat. Corvus will analyze them in context. Murder and VIP subscribers can upload floor plans for placement guidance.',
      },
      {
        heading: 'Tips for better answers',
        text: 'Be specific. Instead of "my WiFi is slow," ask "my 2.4 GHz drops in the back bedroom — what\'s causing it and how do I fix it?" Corvus responds to precision.',
      },
    ],
  },
];

export default function LearnPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0D1520', color: '#F4F6F8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1A2332', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Image src="/OCWS_Logo_Transparent.png" alt="OCWS" width={120} height={40} style={{ objectFit: 'contain' }} />
        </Link>
        <Link href="/crows-eye" style={{
          background: '#0D6E7A', color: '#F4F6F8', padding: '8px 18px', borderRadius: '6px',
          textDecoration: 'none', fontSize: '13px', fontWeight: 'bold',
        }}>
          Open Crow&apos;s Eye →
        </Link>
      </div>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', letterSpacing: '0.1em', marginBottom: '12px' }}>
            CORVUS KNOWLEDGE BASE
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#F4F6F8', margin: '0 0 16px' }}>
            Learn How Crow&apos;s Eye Works
          </h1>
          <p style={{ color: '#888', fontSize: '16px', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
            Everything you need to go from raw scan data to a client-ready Verdict. Corvus doesn&apos;t guess. Here&apos;s how he thinks.
          </p>
        </div>

        {/* Quick nav */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '48px', justifyContent: 'center' }}>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{
              background: '#1A2332', color: '#888', padding: '6px 14px', borderRadius: '20px',
              textDecoration: 'none', fontSize: '13px', border: '1px solid #1A2332',
              transition: 'all 0.2s',
            }}>
              {s.icon} {s.title}
            </a>
          ))}
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.id} id={section.id} style={{ marginBottom: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1A2332' }}>
              <span style={{ fontSize: '28px' }}>{section.icon}</span>
              <h2 style={{ color: '#F4F6F8', fontSize: '22px', fontWeight: 700, margin: 0 }}>{section.title}</h2>
            </div>

            {section.content.map((item, ii) => (
              <div key={ii} style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#00C2C7', fontSize: '14px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '10px', letterSpacing: '0.03em' }}>
                  {item.heading}
                </h3>
                <div style={{ color: '#888', fontSize: '14px', lineHeight: 1.8 }}>
                  {item.text.split('\n').map((line, li) => (
                    <span key={li}>{line}{li < item.text.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* CTA */}
        <div style={{ background: '#1A2332', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #0D6E7A' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>🐦‍⬛</div>
          <h2 style={{ color: '#F4F6F8', fontSize: '20px', marginBottom: '10px' }}>Ready to run your first Verdict?</h2>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Scan your network. Upload the files. Let Corvus do the rest.</p>
          <Link href="/crows-eye" style={{
            display: 'inline-block', background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)',
            color: '#0D1520', padding: '14px 32px', borderRadius: '8px',
            textDecoration: 'none', fontWeight: 'bold', fontFamily: 'Share Tech Mono, monospace',
            letterSpacing: '0.05em', fontSize: '14px',
          }}>
            OPEN CROW&apos;S EYE →
          </Link>
        </div>
      </div>
    </main>
  );
}
