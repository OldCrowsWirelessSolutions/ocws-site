// app/components/Footer.tsx
import Link from "next/link";
import Image from "next/image";

// TODO: Update with your actual Play Store listing URL when published
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.oldcrowswireless.corvus";

export default function Footer() {
  return (
    <footer style={{ background: "#0D1520", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="ocws-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative shrink-0" style={{ height: "40px", width: "40px" }}>
                <Image
                  src="/Crows_Eye_Logo.png"
                  alt="Crow's Eye"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold text-white">Crow&rsquo;s Eye</div>
                <div className="text-xs" style={{ color: "#22D6DC" }}>by Old Crows Wireless Solutions</div>
              </div>
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#22D6DC" }}>
              Powered by Corvus AI
            </p>
            <p className="text-xs text-white/40 mb-1">Pensacola, FL</p>
            <p className="text-xs text-white/25">American made &middot; Faith driven</p>

            {/* Download badges */}
            <div className="mt-5 flex flex-col gap-3">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition"
                style={{
                  background: "#000",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.15)",
                  textDecoration: "none",
                  width: "fit-content",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M2 3.27L12.73 12L2 20.73V3.27Z" fill="#4285F4" />
                  <path d="M2 3.27L16.5 7.5L12.73 12L2 3.27Z" fill="#EA4335" />
                  <path d="M2 20.73L12.73 12L16.5 16.5L2 20.73Z" fill="#FBBC04" />
                  <path d="M16.5 7.5L22 12L16.5 16.5L12.73 12L16.5 7.5Z" fill="#34A853" />
                </svg>
                Download on Google Play
              </a>
              <span
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
                style={{
                  color: "rgba(255,255,255,0.25)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  width: "fit-content",
                  cursor: "not-allowed",
                }}
              >
                iOS Coming Soon
              </span>
            </div>
          </div>

          {/* Col 2: Navigate */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "#22D6DC" }}>Navigate</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/how-it-works" className="text-white/50 hover:text-white transition">How It Works</Link></li>
              <li><Link href="/pricing" className="text-white/50 hover:text-white transition">Pricing</Link></li>
              <li><Link href="/case-studies" className="text-white/50 hover:text-white transition">Case Studies</Link></li>
              <li><Link href="/about" className="text-white/50 hover:text-white transition">About</Link></li>
              <li><Link href="/faq" className="text-white/50 hover:text-white transition">FAQ</Link></li>
              <li><Link href="/contact" className="text-white/50 hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Col 3: Account */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "#22D6DC" }}>Your Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-white/50 hover:text-white transition">Log In</Link></li>
              <li><Link href="/dashboard" className="text-white/50 hover:text-white transition">Dashboard</Link></li>
              <li><Link href="/recover-code" className="text-white/50 hover:text-white transition">Recover Your Code</Link></li>
              <li>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white transition"
                >
                  Download the App
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "#22D6DC" }}>Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-white/50 hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/account-deletion" className="text-white/50 hover:text-white transition">Account Deletion</Link></li>
              <li><Link href="/legal/terms" className="text-white/50 hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/legal/guarantee" className="text-white/50 hover:text-white transition">Guarantee Policy</Link></li>
              <li><Link href="/legal/refunds" className="text-white/50 hover:text-white transition">Refund Policy</Link></li>
              <li><Link href="/legal/report-ownership" className="text-white/50 hover:text-white transition">Report Ownership &amp; Usage</Link></li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="mt-10 mb-6" style={{ height: "1px", background: "rgba(13,110,122,0.5)" }} />

        {/* Bottom bar */}
        <div className="text-center text-xs text-white/30 space-y-1">
          <p>
            &copy; 2026 Old Crows Wireless Solutions LLC. Corvus, Crow&rsquo;s Eye, The Full Reckoning,
            and Corvus&rsquo; Verdict are unregistered trademarks of Old Crows Wireless Solutions LLC.
            All rights reserved.
          </p>
          <p style={{ color: "rgba(255,255,255,0.15)" }}>Powered by Corvus AI</p>
          <p>
            <Link href="/admin" style={{ color: "#1e2a38", fontSize: "10px" }}>Admin</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
