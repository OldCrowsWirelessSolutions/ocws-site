// app/crows-eye/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// TODO: Update with your actual Play Store listing URL when published
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.oldcrowswireless.corvus";

export const metadata: Metadata = {
  title: "Crow's Eye — Download the App | OCWS",
  description:
    "Crow's Eye is now available on Android. Download the app and let Corvus run a full wireless diagnostic on your network in minutes.",
};

function PlayStoreBadge({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        background: "#000",
        color: "#fff",
        borderRadius: "10px",
        padding: "14px 28px",
        border: "1px solid rgba(255,255,255,0.2)",
        textDecoration: "none",
        fontSize: "inherit",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M2 3.27L12.73 12L2 20.73V3.27Z" fill="#4285F4" />
        <path d="M2 3.27L16.5 7.5L12.73 12L2 3.27Z" fill="#EA4335" />
        <path d="M2 20.73L12.73 12L16.5 16.5L2 20.73Z" fill="#FBBC04" />
        <path d="M16.5 7.5L22 12L16.5 16.5L12.73 12L16.5 7.5Z" fill="#34A853" />
      </svg>
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.08em", opacity: 0.75 }}>GET IT ON</div>
        <div style={{ fontSize: "20px", fontWeight: 600 }}>Google Play</div>
      </div>
    </a>
  );
}

export default function CrowsEyePage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>

      {/* Hero */}
      <section
        style={{
          background: "#0D1520",
          padding: "80px 0 72px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backgroundImage: `
            linear-gradient(rgba(0,194,199,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,194,199,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      >
        <div className="ocws-container text-center">
          {/* App icon */}
          <div
            className="mx-auto mb-8 rounded-3xl overflow-hidden flex items-center justify-center"
            style={{
              width: 120,
              height: 120,
              background: "#1A2332",
              border: "2px solid rgba(0,194,199,0.4)",
              boxShadow: "0 0 40px rgba(0,194,199,0.15)",
              position: "relative",
            }}
          >
            <div style={{ position: "relative", width: 90, height: 90 }}>
              <Image
                src="/Crows_Eye_Logo.png"
                alt="Crow's Eye App"
                fill
                sizes="90px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#00C2C7", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.2em" }}
          >
            Crow&rsquo;s Eye &middot; Now Available
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Crow&rsquo;s Eye is now<br />available on Android.
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "#8AAABB" }}>
            Download the app and let Corvus run a full wireless diagnostic on your
            network in minutes. No engineer required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <PlayStoreBadge href={PLAY_STORE_URL} />
            {/* iOS Coming Soon */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.3)",
                borderRadius: "10px",
                padding: "14px 28px",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "not-allowed",
                userSelect: "none",
              }}
              title="iOS app coming soon"
            >
              <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
                <path d="M18.5 13.8C18.5 11.1 20 9.6 21 8.9C19.9 7.2 18.1 6.2 16.2 6.1C14.2 5.9 12.3 7.2 11.3 7.2C10.3 7.2 8.6 6.1 7 6.1C4.8 6.2 2.7 7.4 1.6 9.3C-0.7 13.2 1 18.9 3.2 22C4.3 23.6 5.6 25.3 7.3 25.2C8.9 25.2 9.6 24.2 11.5 24.2C13.4 24.2 14 25.2 15.8 25.2C17.5 25.2 18.6 23.6 19.7 22C20.5 20.9 21.1 19.6 21.5 18.3C19.2 17.3 18.5 15.7 18.5 13.8Z" fill="currentColor" />
                <path d="M15 3.5C15.9 2.4 16.5 0.9 16.3 -0.5C15 -0.4 13.5 0.4 12.6 1.5C11.7 2.5 11 4 11.3 5.4C12.7 5.5 14.1 4.6 15 3.5Z" fill="currentColor" />
              </svg>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.08em" }}>COMING SOON</div>
                <div style={{ fontSize: "20px", fontWeight: 600 }}>App Store</div>
              </div>
            </span>
          </div>
        </div>
      </section>

      {/* Feature list */}
      <section style={{ background: "#0D1520", padding: "80px 0" }}>
        <div className="ocws-container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">What Corvus does in the app.</h2>
            <p className="text-sm" style={{ color: "#888" }}>
              Every feature built around one goal: telling you exactly what&rsquo;s wrong with your wireless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: "📡",
                title: "Live RF Scanning",
                body: "Corvus reads your wireless environment in real time — channels, signal strength, interference sources, and competing networks.",
              },
              {
                icon: "🧠",
                title: "AI-Powered Analysis",
                body: "Built on 17 years of U.S. Navy Electronic Warfare experience. Corvus doesn't guess. He identifies.",
              },
              {
                icon: "📋",
                title: "Signed PDF Verdicts",
                body: "Every analysis produces a branded PDF report with prioritized findings and step-by-step fix instructions.",
              },
              {
                icon: "🔒",
                title: "Security Gap Detection",
                body: "Open networks, weak encryption, exposed SSIDs, and missing VLAN segmentation — Corvus flags them all.",
              },
              {
                icon: "📊",
                title: "Channel Congestion Maps",
                body: "See exactly which channels are saturated, which neighbors are causing interference, and where to move.",
              },
              {
                icon: "💬",
                title: "Talk to Corvus",
                body: "Ask follow-up questions, get clarification on findings, and dig deeper into any issue in plain English.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl p-6"
                style={{
                  background: "#1A2332",
                  borderLeft: "3px solid #00C2C7",
                }}
              >
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#7A9AAB" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* iOS Coming Soon */}
      <section
        style={{
          background: "#0A111C",
          padding: "64px 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="ocws-container max-w-2xl mx-auto text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#888", fontFamily: "'Share Tech Mono', monospace" }}
          >
            iOS
          </p>
          <h2 className="text-2xl font-bold text-white mb-3">iPhone version coming soon.</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#7A9AAB" }}>
            Crow&rsquo;s Eye for iOS is in development. Android is live now — download it today
            and get your first Verdict.
          </p>
          <PlayStoreBadge href={PLAY_STORE_URL} />
        </div>
      </section>

      {/* Account access section */}
      <section style={{ background: "#0D1520", padding: "64px 0" }}>
        <div className="ocws-container max-w-2xl mx-auto text-center">
          <div
            className="rounded-2xl p-8"
            style={{ background: "#1A2332", border: "1px solid rgba(0,194,199,0.2)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#00C2C7", fontFamily: "'Share Tech Mono', monospace" }}
            >
              Already Have an Account?
            </p>
            <h2 className="text-xl font-bold text-white mb-3">
              Log in to your dashboard.
            </h2>
            <p className="text-sm mb-6" style={{ color: "#7A9AAB" }}>
              Access your saved Verdicts, Talk to Corvus, manage your subscription,
              and review past diagnostics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold"
                style={{ background: "#00C2C7", color: "#0D1520", textDecoration: "none" }}
              >
                Go to Dashboard
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold"
                style={{
                  border: "1px solid rgba(0,194,199,0.3)",
                  color: "#00C2C7",
                  background: "transparent",
                  textDecoration: "none",
                }}
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
