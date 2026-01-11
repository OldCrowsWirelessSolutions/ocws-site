import Link from "next/link";
import BadgePill from "@/app/components/BadgePill";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-[#05070B] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="text-base font-semibold">
              Old Crows <span className="text-white/70">Wireless Solutions</span>
            </p>
            <p className="mt-2 text-sm text-white/70">
              Clarity where wireless fails.
            </p>

            <p className="mt-3 text-sm text-white/70">
              Based in <span className="font-semibold text-white/80">Pensacola, FL</span>
            </p>

            <p className="mt-4 text-xs text-white/55">
              RF diagnostics • Interference hunting • Validation • Public safety survey support
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <BadgePill text="Veteran-owned & operated" />
            </div>
          </div>

          {/* Nav */}
          <div>
            <p className="text-sm font-semibold text-white/80">Navigate</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/services" className="text-white/70 hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/industries" className="text-white/70 hover:text-white">
                  Industries
                </Link>
              </li>
              <li>
                <Link href="/intake" className="text-white/70 hover:text-white">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white">
                  Contact
                </Link>
              </li>
              {/* Testimonials hidden */}
              {/* <li>
                <Link href="/testimonials" className="text-white/70 hover:text-white">
                  Testimonials
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Quick actions */}
          <div>
            <p className="text-sm font-semibold text-white/80">Get Started</p>
            <p className="mt-3 text-sm text-white/70">
              Not sure which service you need? Use the intake form and we’ll recommend the right scope.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/intake"
                className="inline-flex items-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Start Intake →
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Old Crows Wireless Solutions. All rights reserved.</p>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <BadgePill text="Based in Pensacola, FL" />
            <BadgePill text="Veteran-owned" />
            <BadgePill text="RF engineering" />
          </div>
        </div>
      </div>
    </footer>
  );
}
