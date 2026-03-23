// app/components/Footer.tsx
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{ background: "#0D1520" }}>
      <div className="ocws-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative shrink-0" style={{ height: "40px", width: "40px" }}>
                <Image
                  src="/OCWS_Logo_Transparent.png"
                  alt="OCWS"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <span className="text-base font-bold text-white">Old Crows Wireless Solutions LLC</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: "#00C2C7" }}>
              Clarity Where Wireless Fails
            </p>
            <p className="mt-1 text-sm text-white/50">Pensacola, FL</p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                style={{ border: "1px solid #B8922A", color: "#B8922A" }}
              >
                Florida LLC
              </span>
            </div>
            <p className="mt-2 text-xs text-white/30">American made &middot; Faith driven</p>
          </div>

          {/* Col 2: Navigate */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "#00C2C7" }}>Navigate</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/crows-eye" className="text-white/50 hover:text-white transition">Crow&rsquo;s Eye</Link></li>
              <li><Link href="/services" className="text-white/50 hover:text-white transition">Services</Link></li>
              <li><Link href="/case-studies" className="text-white/50 hover:text-white transition">Case Studies</Link></li>
              <li><Link href="/learn" className="text-white/50 hover:text-white transition">Learn</Link></li>
              <li><Link href="/faq" className="text-white/50 hover:text-white transition">FAQ</Link></li>
              <li><Link href="/about" className="text-white/50 hover:text-white transition">About</Link></li>
              <li><Link href="/contact" className="text-white/50 hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Col 3: Get Started */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "#00C2C7" }}>Get Started</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/crows-eye" className="text-white/50 hover:text-white transition">Free Analysis</Link></li>
              <li><Link href="/crows-eye" className="text-white/50 hover:text-white transition">Corvus&rsquo; Verdict &mdash; $50</Link></li>
              <li><Link href="/crows-eye" className="text-white/50 hover:text-white transition">Full Reckoning &mdash; $150+</Link></li>
              <li><Link href="/contact" className="text-white/50 hover:text-white transition">OCWS Pro &mdash; $750</Link></li>
              <li><Link href="/waitlist" className="text-white/50 hover:text-white transition">Join Waitlist</Link></li>
            </ul>
          </div>
        </div>

        {/* Teal divider */}
        <div className="mt-10 mb-6" style={{ height: "1px", background: "#0D6E7A" }} />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <span>&copy; 2026 Old Crows Wireless Solutions LLC &middot; oldcrowswireless.com</span>
          <span>Built in Pensacola FL &middot; Faith driven</span>
        </div>
      </div>
    </footer>
  );
}
