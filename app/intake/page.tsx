import IntakeForm from "@/app/components/IntakeForm";
import type { ServiceKey, IndustryKey } from "@/app/data/catalog";

type PageProps = {
  searchParams?: {
    service?: string;
    industry?: string;
  };
};

export default function IntakePage({ searchParams }: PageProps) {
  const defaultServiceKey = (searchParams?.service ?? "") as ServiceKey;
  const defaultIndustryKey = (searchParams?.industry ?? "") as IndustryKey;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-semibold">Intake</h1>
        <p className="mt-2 text-white/70">
          Tell us what you’re trying to solve and we’ll route your request.
        </p>

        <div className="mt-6">
          <IntakeForm
            defaultServiceKey={defaultServiceKey || undefined}
            defaultIndustryKey={defaultIndustryKey || undefined}
          />
        </div>
      </div>
    </section>
  );
}
