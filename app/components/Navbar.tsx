// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/learn", label: "Learn" },
  { href: "/faq", label: "FAQ" },
  // Hidden until real testimonials exist
  // { href: "/testimonials", label: "Testimonials" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape key closes menu
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur">
      <div className="ocws-container py-4">
        <div className="ocws-tile ocws-tile-hover flex items-center justify-between px-4 py-3">
          {/* Left: logo + brand */}
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black/20 shrink-0">
              <Image
                src="/OCWS_Logo_Transparent.png"
                alt="Old Crows Wireless Solutions"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>

            <div className="leading-tight min-w-0">
              <div className="text-sm md:text-base font-semibold text-white truncate">
                Old Crows Wireless Solutions
              </div>
              <div className="text-xs ocws-muted2 truncate">
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

          {/* Right: CTA + Hamburger */}
          <div className="flex items-center gap-2">
            <Link
              href="/request-quote"
              className="ocws-btn ocws-btn-ghost hidden sm:inline-flex"
            >
              Request a Quote
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10 transition"
            >
              {/* Icon */}
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 top-0 h-[2px] w-5 bg-white/85 transition-transform duration-200 ${
                    open ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-[2px] w-5 bg-white/85 transition-opacity duration-200 ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 bottom-0 h-[2px] w-5 bg-white/85 transition-transform duration-200 ${
                    open ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay + drawer */}
      {open ? (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          {/* Drawer */}
          <div className="absolute left-0 right-0 top-[72px] mx-auto w-[min(96%,900px)]">
            <div className="rounded-2xl border border-white/10 bg-black/70 backdrop-blur p-3 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div className="px-2 pt-1 pb-2 text-xs text-white/60">
                Navigate
              </div>

              <div className="grid grid-cols-1 gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm text-white/85 hover:bg-white/10 transition"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="mt-3 border-t border-white/10 pt-3">
                <Link
                  href="/request-quote"
                  onClick={() => setOpen(false)}
                  className="w-full inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-white text-black hover:bg-white/90 transition"
                >
                  Request a Quote
                </Link>

                <div className="mt-2 text-[11px] text-white/55 px-1">
                  Tip: Start with the Baseline Survey if you’re unsure.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
