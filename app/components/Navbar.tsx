// app/components/Navbar.tsx
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/learn", label: "Learn" },
  { href: "/testimonials", label: "Testimonials" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur">
      <div className="ocws-container py-4">
        <div className="ocws-tile ocws-tile-hover flex items-center justify-between px-4 py-3">
          {/* Left: logo + brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black/20">
              <Image
                src="/brand/ocws-logo.png"
                alt="Old Crows Wireless Solutions"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>

            <div className="leading-tight">
              <div className="text-sm md:text-base font-semibold text-white">
                Old Crows Wireless Solutions
              </div>
              <div className="text-xs ocws-muted2">
                Strategic RF Engineering &amp; Wireless Intelligence
              </div>
            </div>
          </Link>

          {/* Center: nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm text-white/75 hover:text-white hover:bg-white/[0.06] transition"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right: CTA */}
          <div className="flex items-center gap-2">
            <Link href="/request-quote" className="ocws-btn ocws-btn-ghost hidden sm:inline-flex">
              Request a Quote
            </Link>

            {/* Mobile menu (simple) */}
            <div className="md:hidden">
              <Link href="/services" className="ocws-btn ocws-btn-ghost">
                Menu
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile nav row */}
        <div className="md:hidden mt-3 ocws-tile px-3 py-2 flex flex-wrap gap-2">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-white/75 hover:text-white hover:bg-white/[0.06] transition"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/request-quote" className="ml-auto ocws-btn ocws-btn-primary">
            Quote
          </Link>
        </div>
      </div>
    </header>
  );
}
