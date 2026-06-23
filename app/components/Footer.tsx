// app/components/Footer.tsx
import Link from "next/link";
import Image from "next/image";

// TODO: Update with your actual Play Store listing URL when published
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.oldcrowswireless.crowseye";

// Social profiles. Keep in sync with the `sameAs` array in LocalBusinessSchema.tsx.
const SOCIALS: { label: string; href: string; path: string }[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/joshua-turner-5a3b8638b/",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  },
  {
    label: "X",
    href: "https://x.com/OCWS_Wifi",
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.49-6.933zm-1.291 19.494h2.039L6.486 3.24H4.298l13.312 17.407z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61582231723401",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/oldcrowswirelesssolutions/",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
];

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

            {/* Social */}
            <div className="mt-6 flex items-center gap-4">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-white/40 hover:text-white transition"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
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
