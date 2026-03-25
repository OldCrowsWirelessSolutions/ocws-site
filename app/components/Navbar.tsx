// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getApprovedEndorsements } from "@/lib/endorsements";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/crows-eye", label: "Crow's Eye" },
  { href: "/#pricing", label: "Subscriptions" },
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/learn", label: "Learn" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?q=old+crows+wireless+solutions#mpd=~4427280477076900275/customers/reviews";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const hasEndorsements = getApprovedEndorsements().length > 0;

  // Check login state from localStorage
  useEffect(() => {
    try {
      const code = localStorage.getItem("corvus_sub_code");
      const adminAuth = localStorage.getItem("corvus_admin_auth");
      setIsLoggedIn(!!code);
      setIsAdmin(!!adminAuth);
    } catch { /* */ }
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
    setSocialOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setSocialOpen(false); setAccountOpen(false); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close social dropdown when clicking outside
  useEffect(() => {
    if (!socialOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("[data-social-dropdown]")) setSocialOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [socialOpen]);

  // Close account dropdown when clicking outside
  useEffect(() => {
    if (!accountOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("[data-account-dropdown]")) setAccountOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [accountOpen]);

  function handleLogout() {
    try {
      localStorage.removeItem("corvus_sub_code");
      localStorage.removeItem("corvus_session_ts");
      localStorage.removeItem("corvus_sub_tier");
      localStorage.removeItem("corvus_admin_auth");
      localStorage.removeItem("corvus_admin_impersonating");
      sessionStorage.clear();
    } catch { /* */ }
    window.location.href = "/";
  }

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

            {/* Social Proof dropdown */}
            <div className="relative" data-social-dropdown>
              <button
                type="button"
                onClick={() => setSocialOpen(v => !v)}
                className="rounded-lg px-3 py-2 text-sm text-white/75 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-1"
              >
                Reviews
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
                  className={`transition-transform duration-150 ${socialOpen ? "rotate-180" : ""}`}
                >
                  <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {socialOpen && (
                <div
                  className="absolute top-full left-0 mt-2 rounded-xl border border-white/10 shadow-2xl py-2"
                  style={{ background: "#1A2332", minWidth: "200px", zIndex: 100 }}
                >
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#00C2C7", letterSpacing: "0.15em" }}>
                    Reviews &amp; Endorsements
                  </div>
                  <div className="mx-3 mb-1 border-t border-white/10" />

                  <a
                    href={GOOGLE_REVIEWS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setSocialOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/[0.06] transition mx-1 rounded-lg"
                  >
                    <span>⭐</span>
                    <span>Google Reviews</span>
                    <span className="ml-auto text-white/30 text-xs">↗</span>
                  </a>

                  <Link
                    href="/testimonials"
                    onClick={() => setSocialOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/[0.06] transition mx-1 rounded-lg"
                  >
                    <span>💬</span>
                    <span>Testimonials</span>
                  </Link>

                  {hasEndorsements && (
                    <Link
                      href="/endorsements"
                      onClick={() => setSocialOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/[0.06] transition mx-1 rounded-lg"
                    >
                      <span>🏅</span>
                      <span>Endorsements</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Account dropdown when logged in, otherwise My Dashboard link */}
            {isLoggedIn ? (
              <div className="relative" data-account-dropdown>
                <button
                  type="button"
                  onClick={() => setAccountOpen(v => !v)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold transition flex items-center gap-1"
                  style={{ color: "#00C2C7", background: "rgba(0,194,199,0.07)", border: "1px solid rgba(0,194,199,0.18)" }}
                >
                  My Account
                  <svg
                    width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
                    className={`transition-transform duration-150 ${accountOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {accountOpen && (
                  <div
                    className="absolute top-full right-0 mt-2 rounded-xl border border-white/10 shadow-2xl py-2"
                    style={{ background: "#1A2332", minWidth: "180px", zIndex: 100 }}
                  >
                    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#00C2C7", letterSpacing: "0.15em" }}>
                      My Account
                    </div>
                    <div className="mx-3 mb-1 border-t border-white/10" />
                    <Link
                      href="/dashboard"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/[0.06] transition mx-1 rounded-lg"
                    >
                      <span>📊</span>
                      <span>Dashboard</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/[0.06] transition mx-1 rounded-lg"
                      >
                        <span>⚙️</span>
                        <span>Admin</span>
                      </Link>
                    )}
                    <div className="mx-3 my-1 border-t border-white/10" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/[0.06] transition mx-1 rounded-lg w-full text-left"
                      style={{ color: "#F87171" }}
                    >
                      <span>↩</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold transition"
                style={{ color: "#00C2C7", background: "rgba(0,194,199,0.07)", border: "1px solid rgba(0,194,199,0.18)" }}
              >
                My Dashboard
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

                {/* Social Proof section in mobile */}
                <div className="mx-3 mt-1 mb-1 border-t border-white/10" />
                <div className="px-3 py-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "#00C2C7" }}>
                  Reviews &amp; Endorsements
                </div>
                <a
                  href={GOOGLE_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm text-white/85 hover:bg-white/10 transition flex items-center gap-2"
                >
                  <span>⭐</span> Google Reviews <span className="ml-auto text-white/30 text-xs">↗</span>
                </a>
                <Link
                  href="/testimonials"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm text-white/85 hover:bg-white/10 transition flex items-center gap-2"
                >
                  <span>💬</span> Testimonials
                </Link>
                {hasEndorsements && (
                  <Link
                    href="/endorsements"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm text-white/85 hover:bg-white/10 transition flex items-center gap-2"
                  >
                    <span>🏅</span> Endorsements
                  </Link>
                )}
                <div className="mx-3 mt-1 mb-1 border-t border-white/10" />

                {isLoggedIn ? (
                  <>
                    <div className="px-3 py-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "#00C2C7" }}>
                      My Account
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-white/10 transition flex items-center gap-2"
                      style={{ color: "#00C2C7" }}
                    >
                      <span>📊</span> Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-3 py-3 text-sm text-white/85 hover:bg-white/10 transition flex items-center gap-2"
                      >
                        <span>⚙️</span> Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { setOpen(false); handleLogout(); }}
                      className="rounded-xl px-3 py-3 text-sm hover:bg-white/10 transition flex items-center gap-2 w-full text-left"
                      style={{ color: "#F87171", background: "transparent", border: "none", cursor: "pointer" }}
                    >
                      <span>↩</span> Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-white/10 transition"
                    style={{ color: "#00C2C7" }}
                  >
                    My Dashboard
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
