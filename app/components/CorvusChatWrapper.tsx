"use client";

// CorvusChatWrapper — client component that reads localStorage and renders
// CorvusChat for authenticated subscribers. Mounted once in the root layout
// so the chat bubble persists across all pages.

import { useEffect, useState } from "react";
import CorvusChat from "@/app/components/CorvusChat";

export default function CorvusChatWrapper() {
  const [subCode, setSubCode] = useState<string | null>(null);

  useEffect(() => {
    try {
      const code = localStorage.getItem("corvus_sub_code");
      if (code) setSubCode(code);
    } catch { /* localStorage unavailable */ }

    // Re-check when storage changes (login/logout in another tab)
    function onStorage(e: StorageEvent) {
      if (e.key === "corvus_sub_code") {
        setSubCode(e.newValue ?? null);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!subCode) return null;
  return <CorvusChat code={subCode} />;
}
