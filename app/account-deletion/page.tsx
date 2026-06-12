// app/account-deletion/page.tsx
// Required by Google Play Store for apps that collect user data.
// URL: oldcrowswireless.com/account-deletion

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account Deletion | Crow's Eye — Old Crows Wireless Solutions",
  description:
    "Request deletion of your Crow's Eye account and all associated data. Instructions and data retention policy.",
};

export default function AccountDeletionPage() {
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
        <div className="ocws-container max-w-2xl mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#22D6DC", letterSpacing: "0.18em", fontFamily: "'Share Tech Mono', monospace" }}
          >
            Crow&rsquo;s Eye &middot; Account Management
          </p>
          <h1 className="text-4xl font-bold text-white mb-3">Account Deletion</h1>
          <p className="text-sm" style={{ color: "#6A8A9A" }}>
            Instructions for deleting your Crow&rsquo;s Eye account and all associated data.
          </p>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: "56px 0 80px" }}>
        <div className="ocws-container max-w-2xl mx-auto space-y-10" style={{ color: "#B8CCD8", fontSize: "0.95rem", lineHeight: 1.8 }}>

          {/* How to request */}
          <div>
            <h2
              className="text-xl font-bold text-white mb-4 pb-3"
              style={{ borderBottom: "1px solid rgba(34,214,220,0.2)" }}
            >
              How to Request Account Deletion
            </h2>
            <p className="mb-4">
              To delete your Crow&rsquo;s Eye account and all associated data, send an email to:
            </p>
            <div
              className="rounded-xl p-5 mb-4"
              style={{ background: "#1A2332", border: "1px solid rgba(34,214,220,0.2)" }}
            >
              <p className="font-semibold text-white mb-1">Email</p>
              <a
                href="mailto:joshua@oldcrowswireless.com?subject=Account%20Deletion%20Request"
                style={{ color: "#22D6DC", fontSize: "1rem" }}
              >
                joshua@oldcrowswireless.com
              </a>
              <p className="mt-3 font-semibold text-white mb-1">Subject line</p>
              <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.85rem", color: "#B8CCD8" }}>
                Account Deletion Request
              </p>
              <p className="mt-3 font-semibold text-white mb-1">Include</p>
              <p>The email address registered to your Crow&rsquo;s Eye account.</p>
            </div>
            <p style={{ color: "#6A8A9A", fontSize: "0.875rem" }}>
              We will verify your identity before processing the deletion to protect against
              unauthorized removal of accounts.
            </p>
          </div>

          {/* What gets deleted */}
          <div>
            <h2
              className="text-xl font-bold text-white mb-4 pb-3"
              style={{ borderBottom: "1px solid rgba(34,214,220,0.2)" }}
            >
              What Will Be Deleted
            </h2>
            <p className="mb-4">
              Upon verified request, the following data will be permanently deleted
              within <strong className="text-white">30 days</strong>:
            </p>
            <ul className="space-y-2">
              {[
                "Your account credentials and profile information",
                "All scan history and WiFi Health Reports",
                "Uploaded scan files and associated data",
                "Talk to Corvus conversation history",
                "Subscription and payment records (excluding records required for tax and legal compliance)",
              ].map((item) => (
                <li key={item} className="flex gap-3 items-start">
                  <span style={{ color: "#22D6DC", marginTop: "2px", flexShrink: 0 }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What is retained */}
          <div>
            <h2
              className="text-xl font-bold text-white mb-4 pb-3"
              style={{ borderBottom: "1px solid rgba(34,214,220,0.2)" }}
            >
              Data Retained After Deletion
            </h2>
            <p>
              Transaction records (purchase amounts, dates, and subscription history) may be
              retained for up to <strong className="text-white">7 years</strong> as required by
              applicable tax and financial compliance law. No other data is kept after a
              confirmed deletion request.
            </p>
          </div>

          {/* Timeline */}
          <div>
            <h2
              className="text-xl font-bold text-white mb-4 pb-3"
              style={{ borderBottom: "1px solid rgba(34,214,220,0.2)" }}
            >
              Timeline
            </h2>
            <div className="space-y-3">
              {[
                ["Request received", "We confirm receipt within 1 business day."],
                ["Identity verified", "We verify the request matches the registered account owner."],
                ["Deletion processed", "All eligible data deleted within 30 days of verification."],
                ["Confirmation sent", "You receive an email confirming deletion is complete."],
              ].map(([step, desc]) => (
                <div
                  key={step}
                  className="flex gap-4 items-start rounded-lg px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span style={{ color: "#22D6DC", fontWeight: 700, flexShrink: 0, minWidth: "160px" }}>{step}</span>
                  <span style={{ color: "#8AAABB" }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div
            className="rounded-xl p-6"
            style={{ background: "#1A2332", border: "1px solid rgba(34,214,220,0.15)" }}
          >
            <p className="font-semibold text-white mb-1">Questions?</p>
            <p className="text-sm mb-3" style={{ color: "#7A9AAB" }}>
              Contact Joshua Turner, Managing Member — Old Crows Wireless Solutions LLC
            </p>
            <a
              href="mailto:joshua@oldcrowswireless.com"
              style={{ color: "#22D6DC" }}
            >
              joshua@oldcrowswireless.com
            </a>
          </div>

          {/* Back link */}
          <div>
            <Link href="/privacy" style={{ color: "#22D6DC", fontSize: "0.875rem" }}>
              ← View Privacy Policy
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}
