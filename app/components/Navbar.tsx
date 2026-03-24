// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/crows-eye", label: "Crow's Eye" },
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/learn", label: "Learn" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen]           = useState(false);
  const [hasSub, setHasSub]       = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Show Dashboard link only when a subscriber code is stored
  useEffect(() => {
    try {
      setHasSub(!!localStorage.getItem("corvus_sub_code"));
    } catch { /* */ }
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur" style={{ background: "rgba(13,21,32,0.92)" }}>
      <div className="ocws-container py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: logo + brand */}
          <Link href="/" className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="relative shrink-0" style={{ height: "40px", width: "40px" }}>
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
              <div className="text-sm font-semibold text-white truncate">
                Old Crows Wireless Solutions LLC
              </div>
              <div className="text-xs truncate" style={{ color: "#00C2C7" }}>
                Clarity Where Wireless Fails
              </div>
            </div>
          </Link>

          {/* Center: desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm text-white/75 hover:text-white hover:bg-white/[0.06] transition"
              >
                {l.label}
              </Link>
            ))}
            {hasSub && (
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-semibold transition"
                style={{ color: "#00C2C7" }}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right: CTA + Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/crows-eye"
              className="hidden sm:inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ocws-glow-hover"
              style={{ background: "#00C2C7", color: "#0D1520" }}
            >
              Get Corvus&rsquo; Verdict
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10 transition"
            >
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
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          {/* Drawer */}
          <div className="absolute left-0 right-0 top-[60px] mx-auto w-[min(96%,900px)]">
            <div
              className="rounded-2xl border border-white/10 backdrop-blur p-3 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              style={{ background: "rgba(13,21,32,0.97)" }}
            >
              <div className="px-2 pt-1 pb-2 text-xs text-white/60">Navigate</div>

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
                {hasSub && (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-white/10 transition"
                    style={{ color: "#00C2C7" }}
                  >
                    Dashboard
                  </Link>
                )}
              </div>

              <div className="mt-3 border-t border-white/10 pt-3">
                <Link
                  href="/crows-eye"
                  onClick={() => setOpen(false)}
                  className="w-full inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold ocws-glow-hover"
                  style={{ background: "#00C2C7", color: "#0D1520" }}
                >
                  Get Corvus&rsquo; Verdict
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
