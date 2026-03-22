// app/crows-eye/page.tsx
export const metadata = {
  title: "Crow's Eye — OCWS",
  description: "Crow's Eye wireless diagnostic tool by Corvus — coming soon.",
};

export default function CrowsEyePage() {
  return (
    <div className="ocws-container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest ocws-accent-cyan mb-4">
        Crow&rsquo;s Eye by Corvus
      </p>
      <h1 className="ocws-h1 mb-4">Crow&rsquo;s Eye</h1>
      <p className="ocws-muted text-base md:text-lg mb-8 max-w-md">
        Corvus sees what your ISP won&rsquo;t tell you. Upload your scanner screenshots and get his Verdict.
      </p>
      <span
        className="ocws-pill text-sm px-4 py-1.5"
        style={{ color: "#B8922A", borderColor: "#B8922A33" }}
      >
        Verdict Coming Soon
      </span>
    </div>
  );
}
