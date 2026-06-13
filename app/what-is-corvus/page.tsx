import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What is Corvus? — Crow's Eye | OCWS",
  description:
    "Corvus is an app that scans your WiFi, tells you in plain English what's making it slow or dropping, and shows you exactly how to fix it. For homes and businesses.",
};

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.oldcrowswireless.corvus";

// What it does — four plain beats.
const STEPS = [
  {
    icon: "📲",
    title: "Tap scan",
    body: "Open the app and tap scan. Corvus checks your WiFi on its own — no screenshots, no setup, nothing to plug in.",
  },
  {
    icon: "🔎",
    title: "It finds the problem",
    body: "Corvus pinpoints what's actually making your WiFi slow, drop calls, or leave dead spots — and spots security risks too.",
  },
  {
    icon: "📋",
    title: "It tells you how to fix it",
    body: "You get a clear report: what's wrong, how serious it is, and the exact steps to fix it. Plain English — no tech know-how needed.",
  },
  {
    icon: "💬",
    title: "Ask anything",
    body: "Not sure about something? Just ask Corvus — like texting a friend who happens to be a WiFi expert.",
  },
];

// Who it's for — home first, then business, then bigger needs. Plain words only.
const AUDIENCES = [
  {
    emoji: "🏠",
    name: "At home",
    accent: "#22D6DC",
    problem:
      "Streaming buffers. Video calls drop. The back bedroom is a dead zone. You don't know if it's your router, your internet, or something else entirely.",
    does:
      "Corvus finds the real reason and walks you through the fix — no calling tech support, no waiting on hold, no $150-an-hour visit.",
    plan: "Fledgling ($10/mo) or Nest ($20/mo)",
    note: "Plenty of questions for Corvus included",
    uses: [
      "Track down dead zones, room by room",
      "Check a new house or apartment before you move in",
      "Fix gaming lag and dropped work-from-home calls",
      'Finally answer "is it my router, or my internet?"',
    ],
    cta: { label: "See home plans →", href: "/pricing" },
  },
  {
    emoji: "🏪",
    name: "For your business",
    accent: "#22D6DC",
    problem:
      "Customers complain your guest WiFi is slow. The back office loses signal. You just want it to work — and to look professional when it does.",
    does:
      "Check WiFi across your whole space as often as you need, fix the problems, and hand your team or your clients a clean, professional report.",
    plan: "Flock ($100/mo)",
    note: "Room for your whole team",
    uses: [
      "Fix coverage in a shop, office, or cafe",
      "Make guest WiFi something you're proud of",
      "Give a client a professional report",
      "Check a space before you move in",
    ],
    cta: { label: "See business plan →", href: "/pricing" },
  },
  {
    emoji: "🏢",
    name: "Bigger needs",
    accent: "#D8AC32",
    problem:
      "Lots of locations, a large building, or you need an official report for insurance, a landlord, or a board? You need the full picture — and proof.",
    does:
      "Unlimited WiFi checks across every space, room for your whole team, and the option to have Joshua personally inspect and certify your site in person.",
    plan: "Murder ($950/mo) + on-site certified option",
    note: "Official, signed reports when you need them",
    uses: [
      "Cover many locations or one big building",
      "Get an official, signed report",
      "Have an expert inspect and certify in person",
      "Double-check a contractor's quote before you pay",
    ],
    cta: { label: "Talk to us →", href: "/contact?type=enterprise" },
  },
];

// Plain "you are…" → plan map. Prices and checkout live on /pricing.
const TIER_ROWS = [
  { who: "At home", plan: "Fledgling", price: "$10/mo", gets: "1 WiFi report a month + how to fix it", chat: "100 questions/mo" },
  { who: "At home (more)", plan: "Nest", price: "$20/mo", gets: "3 reports + a whole-home checkup", chat: "250 questions/mo" },
  { who: "A business", plan: "Flock", price: "$100/mo", gets: "15 reports/mo, your whole space, team access", chat: "1,000 questions/mo" },
  { who: "Lots of locations", plan: "Murder", price: "$950/mo", gets: "Unlimited reports, whole team", chat: "Unlimited", gold: true },
  { who: "Want it certified", plan: "On-site Pro", price: "from $750", gets: "Joshua inspects & certifies, in person", chat: "—", gold: true },
  { who: "Just once", plan: "Pay per report", price: "$50", gets: "One WiFi report + fixes, no subscription", chat: "—" },
];

const eyebrow: React.CSSProperties = {
  color: "#22D6DC",
  letterSpacing: "0.18em",
  fontFamily: "'Share Tech Mono', monospace",
};

export default function WhatIsCorvusPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>

      {/* Hero — say what it does, fast */}
      <section
        style={{
          background: "#0D1520",
          padding: "80px 0 64px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backgroundImage: `
            linear-gradient(rgba(34,214,220,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,214,220,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      >
        <div className="ocws-container text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={eyebrow}>
            Crow&rsquo;s Eye &middot; What it does
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Slow WiFi? Dead zones?
            <br />
            <span style={{ color: "#22D6DC" }}>Corvus tells you exactly what&rsquo;s wrong — and how to fix it.</span>
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-base md:text-lg" style={{ color: "rgba(244,246,248,0.82)" }}>
            It&rsquo;s an app. Open it, tap scan, and in a couple of minutes you get a plain-English report on
            everything hurting your WiFi — plus the simple steps to fix it. No tech know-how required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition"
              style={{ background: "#22D6DC", color: "#0D1520" }}
            >
              Get the App — Free
            </a>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition ocws-glow-hover"
              style={{ background: "transparent", color: "#22D6DC", border: "1px solid rgba(34,214,220,0.4)" }}
            >
              See Plans
            </Link>
          </div>
          <p className="mt-4 text-xs" style={{ color: "#777" }}>
            Free to download &middot; Your first scan is free &middot; Works on Android
          </p>
        </div>
      </section>

      {/* What it does */}
      <section className="py-16" style={{ background: "#0D1520" }}>
        <div className="ocws-container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">How it works</h2>
            <p className="mt-2 text-sm" style={{ color: "#888" }}>
              Start to finish in minutes. <Link href="/how-it-works" style={{ color: "#22D6DC" }}>See more →</Link>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-2xl p-6 ocws-card-glow" style={{ background: "#0D1520", border: "1px solid #0D6E7A" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: "rgba(34,214,220,0.6)", fontFamily: "'Share Tech Mono', monospace" }}>
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>{s.body}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm mx-auto max-w-2xl" style={{ color: "#9fb0bb" }}>
            Behind the scenes, Corvus is built on 17 years of U.S. Navy wireless expertise — so it catches the
            things other apps miss. You just see the plain-English answer.
          </p>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-16" style={{ background: "#1A2332" }}>
        <div className="ocws-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Who it&rsquo;s for</h2>
            <p className="mt-2 text-sm" style={{ color: "#888" }}>
              Same app, sized to what you need. Find yourself below.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {AUDIENCES.map((a) => (
              <div
                key={a.name}
                className="flex flex-col rounded-2xl p-6 ocws-card-glow"
                style={{ background: "#0D1520", border: `1px solid ${a.accent === "#D8AC32" ? "rgba(216,172,50,0.5)" : "#0D6E7A"}` }}
              >
                <div className="mb-4">
                  <span className="text-3xl">{a.emoji}</span>
                  <h3 className="mt-2 text-lg font-bold text-white">{a.name}</h3>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#9fb0bb", fontStyle: "italic" }}>
                  {a.problem}
                </p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#ccd5da" }}>
                  {a.does}
                </p>
                <ul className="space-y-2 mb-5">
                  {a.uses.map((u) => (
                    <li key={u} className="flex items-start gap-2 text-sm" style={{ color: "#aaa" }}>
                      <span style={{ color: a.accent, flexShrink: 0, marginTop: "2px" }}>✓</span>
                      {u}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-xs mb-0.5" style={{ color: "#888" }}>Best fit</p>
                  <p className="text-sm font-semibold mb-1" style={{ color: a.accent }}>{a.plan}</p>
                  <p className="text-xs mb-4" style={{ color: "#777" }}>{a.note}</p>
                  <Link
                    href={a.cta.href}
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold w-full transition"
                    style={{
                      background: a.accent === "#D8AC32" ? "rgba(216,172,50,0.14)" : "rgba(34,214,220,0.12)",
                      color: a.accent,
                      border: `1px solid ${a.accent === "#D8AC32" ? "rgba(216,172,50,0.4)" : "rgba(34,214,220,0.35)"}`,
                    }}
                  >
                    {a.cta.label}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For pros — your logo on the reports (in the works) */}
      <section className="py-16" style={{ background: "#0D1520" }}>
        <div className="ocws-container">
          <div
            className="rounded-2xl p-8"
            style={{ background: "rgba(216,172,50,0.06)", border: "1px solid rgba(216,172,50,0.3)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ ...eyebrow, color: "#D8AC32" }}>
              🥚 In the works
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Fix WiFi for a living?</h2>
            <p className="text-sm md:text-base leading-relaxed max-w-3xl mb-5" style={{ color: "#ccd5da" }}>
              If you set up or fix WiFi for other people, you&rsquo;ll soon be able to put your own logo and name
              on the reports — so the work looks like yours, start to finish. We&rsquo;re building this now.
              Want it? Tell us and we&rsquo;ll bring you in early.
            </p>
            <Link
              href="/contact?type=enterprise"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ocws-glow-hover-gold"
              style={{ background: "transparent", color: "#D8AC32", border: "1px solid #D8AC32" }}
            >
              Get early access →
            </Link>
          </div>
        </div>
      </section>

      {/* Which plan fits */}
      <section className="py-16" style={{ background: "#1A2332" }}>
        <div className="ocws-container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Which plan fits</h2>
            <p className="mt-2 text-sm" style={{ color: "#888" }}>
              A quick map. Full details and sign-up on the <Link href="/pricing" style={{ color: "#22D6DC" }}>Pricing page</Link>.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse", minWidth: "640px" }}>
              <thead>
                <tr style={{ color: "#888" }}>
                  <th className="text-left font-semibold py-3 px-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>You&rsquo;re…</th>
                  <th className="text-left font-semibold py-3 px-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>Plan</th>
                  <th className="text-left font-semibold py-3 px-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>From</th>
                  <th className="text-left font-semibold py-3 px-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>What you get</th>
                  <th className="text-left font-semibold py-3 px-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>Ask Corvus</th>
                </tr>
              </thead>
              <tbody>
                {TIER_ROWS.map((r) => (
                  <tr key={r.plan}>
                    <td className="py-3 px-3" style={{ color: "#aaa", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{r.who}</td>
                    <td className="py-3 px-3 font-bold" style={{ color: r.gold ? "#D8AC32" : "#22D6DC", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{r.plan}</td>
                    <td className="py-3 px-3 font-semibold text-white" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{r.price}</td>
                    <td className="py-3 px-3" style={{ color: "#ccd5da", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{r.gets}</td>
                    <td className="py-3 px-3" style={{ color: "#aaa", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{r.chat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs" style={{ color: "#666" }}>
            Run out of questions for Corvus? You can top up any time — no plan change needed.
          </p>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-16" style={{ background: "#0D1520", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="ocws-container text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Stop guessing. See what&rsquo;s wrong with your WiFi.</h2>
          <p className="text-sm mb-7 mx-auto max-w-xl" style={{ color: "#888" }}>
            Download the app and run your first scan free.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition"
              style={{ background: "#22D6DC", color: "#0D1520" }}
            >
              Get the App — Free
            </a>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition ocws-glow-hover"
              style={{ background: "transparent", color: "#22D6DC", border: "1px solid rgba(34,214,220,0.4)" }}
            >
              See Plans
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
