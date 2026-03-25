"use client";

// CorvusChatWrapper — client component that reads localStorage and renders
// CorvusChat for authenticated subscribers. Mounted once in the root layout
// so the chat bubble persists across all pages.
//
// On /dashboard the floating panel is replaced by the inline Chat tab, so
// instead of opening a panel we render a minimal FAB that links to #chat.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CorvusChat from "@/app/components/CorvusChat";

export default function CorvusChatWrapper() {
  const [subCode, setSubCode] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const code = localStorage.getItem("corvus_sub_code");
      if (code) setSubCode(code);
    } catch { /* localStorage unavailable */ }

    function onStorage(e: StorageEvent) {
      if (e.key === "corvus_sub_code") {
        setSubCode(e.newValue ?? null);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Chat is admin/founder-only until full launch
  const CHAT_ADMIN_CODES = new Set(["OCWS-CORVUS-FOUNDER-JOSHUA", "CORVUS-NEST", "CORVUS-ADMIN"]);
  if (!subCode || !CHAT_ADMIN_CODES.has(subCode.toUpperCase())) return null;

  // On dashboard/admin the Chat tab handles everything — show a tab-switching FAB
  if (pathname === "/dashboard" || pathname === "/admin") {
    const fabStyle: React.CSSProperties = {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: 9999,
      width: "52px",
      height: "52px",
      borderRadius: "50%",
      background: "linear-gradient(135deg,#00C2C7,#007A7E)",
      boxShadow: "0 4px 20px rgba(0,194,199,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      cursor: "pointer",
      transition: "transform 0.15s, box-shadow 0.15s",
    };
    return (
      <button
        aria-label="Open Corvus Chat"
        style={fabStyle}
        onClick={() => { window.location.hash = "chat"; }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(0,194,199,0.5)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,194,199,0.35)";
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D1520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    );
  }

  return <CorvusChat code={subCode} />;
}
