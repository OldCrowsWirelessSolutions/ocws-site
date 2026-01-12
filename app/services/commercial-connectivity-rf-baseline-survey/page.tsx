// app/services/commercial-connectivity-rf-baseline-survey/page.tsx
import { redirect } from "next/navigation";

export const metadata = {
  title: "Commercial Connectivity & RF Baseline Survey | OCWS",
  description:
    "Establish a defensible baseline across cellular, Wi-Fi, and RF conditions—then receive prioritized recommendations and next steps.",
};

export default function CommercialBaselineSurveyServicePage() {
  redirect("/learn/commercial-connectivity-rf-baseline-survey");
}
