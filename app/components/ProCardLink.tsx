import Link from "next/link";
import React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
};

export default function ProCardLink({
  href,
  children,
  className = "",
  selected = false,
}: Props) {
  return (
    <Link
      href={href}
      className={[
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5",
        "transition duration-250 ease-smooth",
        "hover:-translate-y-0.5 hover:bg-white/7 hover:border-white/20",
        "hover:shadow-cyanGlow",
        "focus:outline-none focus:ring-2 focus:ring-ocws-cyan/60",
        selected ? "ring-2 ring-ocws-cyan/60" : "",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 ease-smooth group-hover:opacity-100 group-focus-visible:opacity-100">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xs" />
      </div>
      <div className="relative">{children}</div>
    </Link>
  );
}
