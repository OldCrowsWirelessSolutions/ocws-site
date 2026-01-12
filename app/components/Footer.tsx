// app/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="ocws-container py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <h3 className="text-base font-semibold text-white">
            Old Crows Wireless Solutions
          </h3>
          <p className="mt-2 text-sm ocws-muted">
            Clarity where wireless fails.
          </p>
          <p className="mt-2 text-sm ocws-muted">
            Based in Pensacola, FL
          </p>
          <p className="mt-3 text-xs ocws-muted2">
            RF diagnostics • Interference hunting • Validation • Public safety survey support
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-sm font-semibold text-white">Navigate</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/services" className="hover:text-white text-white/70">
                Services
              </Link>
            </li>
            <li>
              <Link href="/industries" className="hover:text-white text-white/70">
                Industries
              </Link>
            </li>
            <li>
              <Link href="/request-quote" className="hover:text-white text-white/70">
                Request a Quote
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white text-white/70">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div>
          <h4 className="text-sm font-semibold text-white">Get Started</h4>
          <p className="mt-3 text-sm ocws-muted">
            Not sure which service you need? Use the intake form and we’ll recommend the right scope.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/intake" className="ocws-btn ocws-btn-primary">
              Start Intake →
            </Link>
            <Link href="/services" className="ocws-btn ocws-btn-ghost">
              View Services
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs ocws-muted2">
        © {new Date().getFullYear()} Old Crows Wireless Solutions. All rights reserved.
      </div>
    </footer>
  );
}
