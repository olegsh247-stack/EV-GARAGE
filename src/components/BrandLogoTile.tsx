import Link from "next/link";
import type { Brand } from "@/data/cars";

export function BrandLogoTile({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/brand/${brand.slug}`}
      className="group flex flex-col items-center gap-1.5 rounded-lg p-1.5 text-center transition-colors hover:bg-surface-card"
    >
      <svg
        viewBox="0 0 48 48"
        className="h-11 w-11 transition-transform group-hover:scale-105 sm:h-12 sm:w-12"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="22" fill={brand.accent} />
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="white"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <text
          x="24"
          y="25"
          dy="0.35em"
          textAnchor="middle"
          fill="white"
          fontFamily="Space Grotesk, sans-serif"
          fontWeight="700"
          fontSize={brand.logo.length > 2 ? 12 : 15}
        >
          {brand.logo}
        </text>
      </svg>
      <span className="text-xs font-medium text-ink sm:text-sm">
        {brand.name}
      </span>
    </Link>
  );
}
