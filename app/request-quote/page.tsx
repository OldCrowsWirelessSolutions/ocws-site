// app/request-quote/page.tsx
import RequestQuoteClient from "./RequestQuoteClient";

export const metadata = {
  title: "Request a Quote | Old Crows Wireless Solutions",
  description:
    "Tell us about your environment and goals. We'll confirm scope, recommended next steps, and any applicable addendums before scheduling.",
};

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function RequestQuotePage({ searchParams }: PageProps) {
  const initialServiceHref =
    typeof searchParams?.service === "string" ? searchParams.service : "";

  const initialIndustrySlug =
    typeof searchParams?.industry === "string" ? searchParams.industry : "";

  return (
    <RequestQuoteClient
      initialServiceHref={initialServiceHref}
      initialIndustrySlug={initialIndustrySlug}
    />
  );
}
