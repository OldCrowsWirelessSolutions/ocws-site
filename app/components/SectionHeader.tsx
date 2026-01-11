import React from "react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export default function SectionHeader({ title, subtitle, right }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-3xl text-sm text-white/75 md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>

      {right ? <div className="mt-2 md:mt-0">{right}</div> : null}
    </div>
  );
}
