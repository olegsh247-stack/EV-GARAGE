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
        {/* сегментированное кольцо — фирменный приём сайта (та же логика,
            что у шкалы запаса хода на карточках моделей) */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="white"
          strokeOpacity="0.85"
          strokeWidth="2"
          strokeDasharray="4.2 3.4"
        />
        <text
          x="24"
          y="24"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontFamily="var(--font-display)"
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
