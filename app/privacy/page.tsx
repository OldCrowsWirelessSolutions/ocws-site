// app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Crow's Eye — Old Crows Wireless Solutions",
  description:
    "Privacy policy for Crow's Eye and oldcrowswireless.com. What we collect, how we use it, and your rights.",
};

const EFFECTIVE_DATE = "April 2026";

export default function PrivacyPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>

      {/* Header */}
      <section
        style={{
          background: "#0D1520",
          padding: "64px 0 48px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="ocws-container max-w-3xl mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#22D6DC", letterSpacing: "0.18em", fontFamily: "'Share Tech Mono', monospace" }}
          >
            Old Crows Wireless Solutions LLC
          </p>
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-sm" style={{ color: "#6A8A9A" }}>
            Effective date: {EFFECTIVE_DATE} &nbsp;&middot;&nbsp; Applies to Crow&rsquo;s Eye app and oldcrowswireless.com
          </p>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: "64px 0 80px" }}>
        <div className="ocws-container max-w-3xl mx-auto">
          <div className="space-y-12" style={{ color: "#B8CCD8", fontSize: "0.95rem", lineHeight: 1.8 }}>

            {/* Intro */}
            <div>
              <p>
                Old Crows Wireless Solutions LLC (&ldquo;OCWS,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) builds Crow&rsquo;s Eye
                — an AI-powered wireless diagnostics app. This policy explains what information we collect
                when you use the Crow&rsquo;s Eye app or website, how we use it, and what rights you have
                over your data.
              </p>
              <p className="mt-4">
                We wrote this policy to be genuinely readable. If something is unclear, email us at{" "}
                <a href="mailto:joshua@oldcrowswireless.com" style={{ color: "#22D6DC" }}>
                  joshua@oldcrowswireless.com
                </a>
                .
              </p>
            </div>

            <PolicySection title="What We Collect">
              <PolicySubsection title="Account Information">
                <p>
                  When you create an account, we collect your <strong>name</strong>,{" "}
                  <strong>email address</strong>, and a <strong>hashed password</strong>. We never store
                  your password in plain text — it is hashed using bcrypt before storage.
                </p>
              </PolicySubsection>

              <PolicySubsection title="Scan Data">
                <p>
                  When you run a scan, the app collects WiFi network information visible to your device:
                  WiFi network names (SSIDs), router hardware addresses (BSSIDs), signal strength, channel
                  assignments, and encryption type. This data is collected <em>only during active scans
                  you initiate</em>. It is sent to Corvus for analysis and stored as part of your
                  WiFi Health Report history in your account.
                </p>
                <p className="mt-3">
                  We do <strong>not</strong> collect the content of network traffic. We do not intercept,
                  monitor, or store any data transmitted over the networks your device detects.
                </p>
              </PolicySubsection>

              <PolicySubsection title="Location Data">
                <p>
                  GPS coordinates may be used to generate a location address for your scan report.
                  Location data is not stored permanently — it is used only during report generation
                  and is not associated with your account long-term.
                </p>
              </PolicySubsection>

              <PolicySubsection title="Device Information">
                <p>
                  We collect device type, operating system version, and app version for diagnostic
                  and support purposes.
                </p>
              </PolicySubsection>

              <PolicySubsection title="Usage Data">
                <p>
                  We collect basic usage information — which features you use, scan frequency — to
                  improve the product. This data is not sold or shared with advertisers.
                </p>
              </PolicySubsection>

              <PolicySubsection title="Payment Information">
                <p>
                  Payment processing is handled entirely by <strong>Stripe</strong>. We do not store
                  card numbers, CVV codes, or any raw payment data. Stripe provides us with a
                  subscription ID and status indicator. See{" "}
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#22D6DC" }}>
                    Stripe&rsquo;s Privacy Policy
                  </a>{" "}
                  for how they handle payment data.
                </p>
              </PolicySubsection>
            </PolicySection>

            <PolicySection title="What We Do Not Collect">
              <ul className="space-y-2 list-none pl-0">
                {[
                  "The content of any network traffic or communications",
                  "Passwords, browsing history, or personal files from devices on detected networks",
                  "Data from networks you do not own or have permission to scan",
                  "Personal information from children under 13",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span style={{ color: "#22D6DC", marginTop: "2px", flexShrink: 0 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </PolicySection>

            <PolicySection title="How We Use Your Data">
              <ul className="space-y-3 list-none pl-0">
                {[
                  ["To generate WiFi Health Reports and Whole-Home Surveys", "Your scan data is sent to the Corvus AI engine to produce your analysis."],
                  ["To maintain your account and subscription", "We use your email and subscription ID to authenticate you and manage billing through Stripe."],
                  ["To provide Talk to Corvus", "Conversation data is sent to the Anthropic Claude API for AI processing. Conversations may be stored in your account history."],
                  ["To improve Corvus AI analysis", "Aggregated, anonymized scan data may be used to improve analysis accuracy. Personally identifying information is not used for model training."],
                  ["To send transactional emails", "We send account confirmation emails and purchase receipts. We do not send marketing emails without your explicit consent."],
                ].map(([title, desc]) => (
                  <li key={title as string} className="flex gap-3 items-start">
                    <span style={{ color: "#22D6DC", marginTop: "2px", flexShrink: 0 }}>→</span>
                    <span><strong style={{ color: "#fff" }}>{title}</strong> — {desc}</span>
                  </li>
                ))}
              </ul>
            </PolicySection>

            <PolicySection title="Data Storage">
              <p>
                Account data is stored securely via <strong>Upstash Redis</strong>, a managed database
                service. Scan data is processed in real time and stored only as part of your WiFi Health Report
                history. All data is stored in the United States.
              </p>
              <p className="mt-3">
                You can delete your account and all associated data by contacting us at{" "}
                <a href="mailto:joshua@oldcrowswireless.com" style={{ color: "#22D6DC" }}>
                  joshua@oldcrowswireless.com
                </a>
                . Deletion requests are processed within 7 business days.
              </p>
            </PolicySection>

            <PolicySection title="Third-Party Services">
              <p className="mb-4">
                We use the following third-party services to operate Crow&rsquo;s Eye:
              </p>
              <div className="space-y-3">
                {[
                  ["Anthropic Claude API", "AI analysis processing for WiFi Health Reports and Talk to Corvus"],
                  ["ElevenLabs", "Voice synthesis for Corvus audio responses"],
                  ["Stripe", "Payment processing and subscription management"],
                  ["Upstash Redis", "Account and scan data storage"],
                  ["Vercel", "Web hosting for oldcrowswireless.com"],
                  ["Google Play", "Android app distribution"],
                ].map(([name, desc]) => (
                  <div
                    key={name as string}
                    className="flex gap-4 items-start rounded-lg px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="font-semibold shrink-0" style={{ color: "#fff", minWidth: "160px" }}>{name}</span>
                    <span style={{ color: "#8AAABB" }}>{desc}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4" style={{ color: "#6A8A9A", fontSize: "0.85rem" }}>
                Each service operates under its own privacy policy. We do not sell your data to any
                of these providers for advertising purposes.
              </p>
            </PolicySection>

            <PolicySection title="Your Rights">
              <p className="mb-4">You have the right to:</p>
              <ul className="space-y-2 list-none pl-0">
                {[
                  "Access the personal data we hold about you",
                  "Correct inaccurate information in your account",
                  "Delete your account and all associated data",
                  "Receive a copy of your data in a portable format",
                  "Opt out of non-essential communications",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span style={{ color: "#22D6DC", marginTop: "2px", flexShrink: 0 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                To exercise any of these rights, email{" "}
                <a href="mailto:joshua@oldcrowswireless.com" style={{ color: "#22D6DC" }}>
                  joshua@oldcrowswireless.com
                </a>
                . We will respond within 7 business days. To delete your account,
                see our{" "}
                <Link href="/account-deletion" style={{ color: "#22D6DC" }}>
                  Account Deletion page
                </Link>
                .
              </p>
            </PolicySection>

            <PolicySection title="Children">
              <p>
                Crow&rsquo;s Eye is not directed at children under 13. We do not knowingly collect
                personal information from children under 13. If you believe a child under 13 has
                provided us with personal data, please contact us immediately and we will delete
                that information.
              </p>
            </PolicySection>

            <PolicySection title="Changes to This Policy">
              <p>
                We will notify users of material changes to this policy via email or in-app
                notification at least 14 days before the changes take effect. Continued use of
                Crow&rsquo;s Eye after that date constitutes acceptance of the updated policy.
              </p>
              <p className="mt-3">
                The current version of this policy is always available at{" "}
                <Link href="/privacy" style={{ color: "#22D6DC" }}>
                  oldcrowswireless.com/privacy
                </Link>
                .
              </p>
            </PolicySection>

            <PolicySection title="Contact">
              <div
                className="rounded-xl p-6"
                style={{ background: "#1A2332", border: "1px solid rgba(34,214,220,0.15)" }}
              >
                <p className="font-semibold text-white mb-1">Joshua Turner, Managing Member</p>
                <p style={{ color: "#7A9AAB" }}>Old Crows Wireless Solutions LLC</p>
                <p style={{ color: "#7A9AAB" }}>Pensacola, FL</p>
                <a
                  href="mailto:joshua@oldcrowswireless.com"
                  className="mt-3 inline-block"
                  style={{ color: "#22D6DC" }}
                >
                  joshua@oldcrowswireless.com
                </a>
              </div>
            </PolicySection>

          </div>
        </div>
      </section>

    </main>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-xl font-bold text-white mb-4 pb-3"
        style={{ borderBottom: "1px solid rgba(34,214,220,0.2)" }}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function PolicySubsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold mb-2" style={{ color: "#fff" }}>{title}</h3>
      <div style={{ color: "#B8CCD8" }}>{children}</div>
    </div>
  );
}
