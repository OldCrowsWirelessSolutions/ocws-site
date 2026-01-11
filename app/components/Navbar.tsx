"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/intake", label: "Request a Quote" },
  // { href: "/testimonials", label: "Testimonials" }, // hidden
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const highIntent = useMemo(() => {
    return (
      pathname.startsWith("/learn/") ||
      pathname.startsWith("/services/") ||
      pathname.startsWith("/industries/")
    );
  }, [pathname]);

  const activeHref = useMemo(() => {
    const hit = navLinks.find((l) => isActive(pathname, l.href));
    return hit?.href ?? "";
  }, [pathname]);

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-white/10 backdrop-blur transition-colors",
        scrolled ? "bg-[#05070B]/90" : "bg-[#05070B]/70",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link
          href="/"
          className="inline-flex flex-col leading-tight text-white"
          onClick={() => setOpen(false)}
        >
          <span className="text-lg font-semibold tracking-tight">
            Old Crows <span className="text-white/70">Wireless Solutions</span>
          </span>
          <span className="mt-0.5 text-xs font-semibold text-white/55">
            Based in Pensacola, FL
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((l) => {
            const active = l.href === activeHref;
            const isCTA = l.href === "/intake";
            const ctaEmphasis = isCTA && (scrolled || highIntent);

            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "rounded-xl px-3 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/75 hover:bg-white/5 hover:text-white",
                  isCTA ? "ml-2 border border-white/10 bg-white/5" : "",
                  ctaEmphasis ? "bg-white/15 border-white/20" : "",
                ].join(" ")}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile Nav */}
      {open ? (
        <div className="border-t border-white/10 bg-[#05070B] md:hidden">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((l) => {
                const active = isActive(pathname, l.href);
                const isCTA = l.href === "/intake";
                const ctaEmphasis = isCTA && (scrolled || highIntent);

                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={[
                      "rounded-xl px-3 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/5 hover:text-white",
                      isCTA ? "border border-white/10 bg-white/5" : "",
                      ctaEmphasis ? "bg-white/15 border-white/20" : "",
                    ].join(" ")}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
