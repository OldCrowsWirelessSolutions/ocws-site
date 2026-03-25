// app/endorsements/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getApprovedEndorsements } from "@/lib/endorsements";

export const metadata = {
  title: "Endorsements — Old Crows Wireless Solutions",
  description: "Professional endorsements from IT leaders, CISOs, and enterprise professionals who have seen Corvus in action.",
};

export default function EndorsementsPage() {
  const endorsements = getApprovedEndorsements();

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 16px 80px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <p style={{ color: "#B8922A", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>
          Professional Endorsements
        </p>
        <h1 style={{ color: "#ffffff", fontSize: "36px", fontWeight: 800, marginBottom: "16px" }}>
          Trusted by Professionals
        </h1>
        <p style={{ color: "#888888", fontSize: "16px", maxWidth: "560px", margin: "0 auto" }}>
          The people who have seen what Corvus can do — and choose to put their name behind it.
        </p>
      </div>

      {/* Endorsements grid */}
      {endorsements.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
          {endorsements.map((e) => {
            const initials = e.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
            return (
              <div
                key={e.id}
                style={{
                  background: "#1A2332",
                  border: "1px solid rgba(184,146,42,0.3)",
                  borderRadius: "20px",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Person */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {e.photoUrl ? (
                    <Image
                      src={e.photoUrl}
                      alt={e.name}
                      width={64}
                      height={64}
                      style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: "64px", height: "64px", borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, #B8922A, #D4AF37)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#0D1520", fontSize: "18px", fontWeight: 800,
                    }}>
                      {initials}
                    </div>
                  )}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <p style={{ color: "#ffffff", fontSize: "17px", fontWeight: 700, margin: 0 }}>{e.name}</p>
                      {e.linkedinUrl && (
                        <a
                          href={e.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${e.name} on LinkedIn`}
                          style={{ color: "#0077B5" }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                    <p style={{ color: "#00C2C7", fontSize: "14px", margin: "2px 0 0", fontWeight: 600 }}>{e.title}</p>
                    <p style={{ color: "#666666", fontSize: "13px", margin: "2px 0 0" }}>{e.company}</p>
                  </div>
                </div>

                {/* Quote */}
                <blockquote style={{
                  borderLeft: "3px solid #B8922A",
                  paddingLeft: "16px",
                  margin: 0,
                  color: "#cccccc",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}>
                  &ldquo;{e.quote}&rdquo;
                </blockquote>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          background: "#1A2332",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "48px",
          textAlign: "center",
        }}>
          <p style={{ color: "#888888", fontSize: "16px" }}>
            Endorsements are coming soon. Check back shortly.
          </p>
        </div>
      )}

      {/* Back link */}
      <div style={{ textAlign: "center", marginTop: "48px" }}>
        <Link href="/" style={{ color: "#00C2C7", fontSize: "14px", fontWeight: 600 }}>
          ← Back to Home
        </Link>
      </div>

    </div>
  );
}
