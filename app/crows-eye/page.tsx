// app/crows-eye/page.tsx
import CrowsEyeClient from "./CrowsEyeClient";

export const metadata = {
  title: "Crow's Eye — Wireless Diagnostic by Corvus | OCWS",
  description:
    "Upload your Wi-Fi scanner screenshots and get Corvus' Verdict — a full branded PDF report with findings and fixes specific to your environment.",
};

export default function CrowsEyePage() {
  return <CrowsEyeClient />;
}
