import Link from "next/link";
import type { Brand } from "@/data/cars";

export function BrandLogoTile({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/brand/${brand.slug}`}
      className="group flex flex-col items-center gap-2.5 rounded-xl p-3 text-center transition-colors hover:bg-surface-card"
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl font-display text-sm font-bold text-white shadow-sm transition-transform group-hover:scale-105 sm:h-16 sm:w-16"
        style={{ background: brand.accent }}
      >
        {brand.logo}
      </span>
      <span className="text-sm font-medium text-ink">{brand.name}</span>
    </Link>
  );
}
