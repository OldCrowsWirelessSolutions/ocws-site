// app/investor/competitive/page.tsx
// Admin-only competitive landscape slide for investor deck.

export const metadata = {
  title: "Competitive Landscape — Old Crows Wireless Solutions",
  robots: "noindex, nofollow",
};

export default function CompetitiveLandscapePage() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 80px", fontFamily: "system-ui, sans-serif" }}>

      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: "#00C2C7", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "8px" }}>
          Old Crows Wireless Solutions · Investor Deck
        </p>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#F4F6F8", margin: "0 0 8px" }}>
          The Market Has Tools.
        </h1>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#00C2C7", margin: 0 }}>
          Nobody Has Corvus.
        </h1>
      </div>

      {/* Category 1 */}
      <div style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.65rem", color: "#888888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>Category 1</p>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F4F6F8", marginBottom: "16px" }}>Show You Data, Leave You Alone</h2>
        <p style={{ fontSize: "0.9rem", color: "#B8922A", fontWeight: 600, marginBottom: "12px" }}>NetSpot · MetaGeek · inSSIDer · WiFiman</p>
        {[
          "Display channel graphs and signal strength",
          "Require technical literacy to interpret",
          "No fix instructions — no AI interpretation",
          "Free to $149/yr",
          "Serve maybe 20% of the potential market",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", fontSize: "0.85rem", color: "rgba(244,246,248,0.7)" }}>
            <span style={{ color: "#E05555", flexShrink: 0 }}>✗</span>
            {item}
          </div>
        ))}
      </div>

      {/* Category 2 */}
      <div style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.65rem", color: "#888888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>Category 2</p>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F4F6F8", marginBottom: "16px" }}>Expert Tools for Expert Users</h2>
        <p style={{ fontSize: "0.9rem", color: "#B8922A", fontWeight: 600, marginBottom: "12px" }}>Ekahau · TamoGraph · SolarWinds · Acrylic</p>
        {[
          "Require trained RF engineers to operate",
          "$2,400–$50,000+/year",
          "Hardware required for full function",
          "Zero consumer or SMB market",
          "Serve maybe 1% of the potential market",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", fontSize: "0.85rem", color: "rgba(244,246,248,0.7)" }}>
            <span style={{ color: "#E05555", flexShrink: 0 }}>✗</span>
            {item}
          </div>
        ))}
      </div>

      {/* The Gap */}
      <div style={{ background: "rgba(0,194,199,0.06)", border: "2px solid #00C2C7", borderRadius: "12px", padding: "28px", marginBottom: "32px", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#00C2C7", marginBottom: "12px" }}>
          The Gap Between These Two Categories Is the Entire Market.
        </h2>
        <p style={{ fontSize: "1rem", color: "#F4F6F8", lineHeight: 1.7, marginBottom: "8px" }}>
          79% of Wi-Fi users are served by nobody.
        </p>
        <p style={{ fontSize: "0.9rem", color: "#aaaaaa", lineHeight: 1.7 }}>
          The grandmother. The hotel manager. The church administrator. The barbershop owner.<br />
          The hospital IT director who needs a field-deployable tool any staff member can use.
        </p>
      </div>

      {/* Corvus Owns the Gap */}
      <div style={{ background: "linear-gradient(135deg, rgba(184,146,42,0.12) 0%, rgba(0,194,199,0.08) 100%)", border: "1px solid rgba(184,146,42,0.4)", borderRadius: "12px", padding: "28px", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#F4F6F8", marginBottom: "20px" }}>
          🐦‍⬛ Corvus Owns That Gap.
        </h2>
        {[
          "AI interprets the data — no technical knowledge required",
          "Adapts to 5 comfort levels — grandmother to white hat",
          "Fix instructions specific to your exact router",
          "Certified reports Joshua Turner signs personally",
          "Enterprise team dashboard — competitors don't offer",
          "Voice personality nobody can replicate",
          "$50 vs $2,400+ — same quality diagnosis",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", fontSize: "0.9rem", color: "#F4F6F8" }}>
            <span style={{ color: "#00C2C7", flexShrink: 0 }}>✓</span>
            {item}
          </div>
        ))}
      </div>

      {/* Final statement */}
      <div style={{ textAlign: "center", padding: "24px", background: "#0D1520", borderRadius: "12px", border: "1px solid rgba(0,194,199,0.2)" }}>
        <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "#F4F6F8", marginBottom: "8px" }}>
          This Is Not a Better Wi-Fi Tool.
        </p>
        <p style={{ fontSize: "1.4rem", fontWeight: 900, color: "#00C2C7" }}>
          This Is a New Category.
        </p>
        <p style={{ marginTop: "20px", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: "#555", letterSpacing: "0.15em" }}>
          oldcrowswireless.com · Joshua Turner · 17 Years U.S. Navy Electronic Warfare
        </p>
      </div>

    </div>
  );
}
