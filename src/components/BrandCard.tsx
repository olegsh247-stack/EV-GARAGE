import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Brand } from "@/data/cars";

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/brand/${brand.slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(19,26,36,0.08)]"
    >
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.08] transition-opacity group-hover:opacity-[0.16]"
        style={{ background: brand.accent }}
        aria-hidden="true"
      />
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
          {brand.country}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
          {brand.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {brand.description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="font-mono text-xs text-ink-soft">
          {brand.models.length}{" "}
          {brand.models.length === 1 ? "модель" : "модели"}
        </span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ background: brand.accent }}
        >
          <ArrowUpRight size={16} className="text-white" />
        </span>
      </div>
    </Link>
  );
}
