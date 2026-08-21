import Link from "next/link";
import type { Brand } from "@/data/cars";

export function BrandLogoTile({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/brand/${brand.slug}`}
      className="group flex flex-col items-center gap-1.5 rounded-lg p-1.5 text-center transition-colors hover:bg-surface-card"
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full font-display text-xs font-bold text-white ring-2 ring-white shadow-sm transition-transform group-hover:scale-105 sm:h-12 sm:w-12"
        style={{ background: brand.accent }}
      >
        {brand.logo}
      </span>
      <span className="text-xs font-medium text-ink sm:text-sm">
        {brand.name}
      </span>
    </Link>
  );
}
