"use client";

import { useMemo, useState } from "react";
import type { Industry, IndustryKey, Service, ServiceKey } from "@/app/data/catalog";
import { industries, services } from "@/app/data/catalog";

type Props = {
  defaultServiceKey?: ServiceKey;
  defaultIndustryKey?: IndustryKey;
};

export default function IntakeForm({ defaultServiceKey, defaultIndustryKey }: Props) {
  const [serviceKey, setServiceKey] = useState<ServiceKey | "">(
    defaultServiceKey ?? ""
  );
  const [industryKey, setIndustryKey] = useState<IndustryKey | "">(
    defaultIndustryKey ?? ""
  );

  const serviceOptions = useMemo(() => services, []);
  const industryOptions = useMemo(() => industries, []);

  const selectedService: Service | undefined = useMemo(() => {
    if (!serviceKey) return undefined;
    return serviceOptions.find((s) => s.key === serviceKey);
  }, [serviceKey, serviceOptions]);

  const selectedIndustry: Industry | undefined = useMemo(() => {
    if (!industryKey) return undefined;
    return industryOptions.find((i) => i.key === industryKey);
  }, [industryKey, industryOptions]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <h2 className="text-xl font-semibold">Request Intake</h2>
      <p className="mt-2 text-white/70">
        Select a service and industry to help route your request.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Service</span>
          <select
            value={serviceKey}
            onChange={(e) => setServiceKey(e.target.value as ServiceKey | "")}
            className="rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/40"
          >
            <option value="">Select a service…</option>
            {serviceOptions.map((s: Service) => (
              <option key={s.key} value={s.key}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-white/70">Industry</span>
          <select
            value={industryKey}
            onChange={(e) => setIndustryKey(e.target.value as IndustryKey | "")}
            className="rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/40"
          >
            <option value="">Select an industry…</option>
            {industryOptions.map((i: Industry) => (
              <option key={i.key} value={i.key}>
                {i.name}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/70">Selected</div>
          <div className="mt-1">
            <div className="font-semibold">
              {selectedService ? selectedService.name : "No service selected"}
            </div>
            <div className="text-white/70">
              {selectedIndustry ? selectedIndustry.name : "No industry selected"}
            </div>
          </div>
        </div>

        <a
          className="rounded-xl bg-white text-black font-semibold px-4 py-2 text-center"
          href="/request-quote"
        >
          Continue
        </a>
      </div>
    </div>
  );
}
