import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Brand } from "@/data/cars";

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/brand/${brand.slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-surface-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(19,26,36,0.08)]"
    >
      <div
        className="absolute -right-4 -top-4 h-12 w-12 rounded-full opacity-[0.08] transition-opacity group-hover:opacity-[0.16]"
        style={{ background: brand.accent }}
        aria-hidden="true"
      />
      <div>
        <p className="font-mono text-[9px] uppercase tracking-wide text-ink-soft">
          {brand.country}
        </p>
        <h3 className="mt-1 font-display text-base font-semibold text-ink">
          {brand.name}
        </h3>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[10px] text-ink-soft">
          {brand.models.length}{" "}
          {brand.models.length === 1 ? "модель" : "модели"}
        </span>
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ background: brand.accent }}
        >
          <ArrowUpRight size={11} className="text-white" />
        </span>
      </div>
    </Link>
  );
}
