import Link from "next/link";
import type { Brand, Model } from "@/data/cars";
import { baseTrim, RANGE_SCALE_MAX } from "@/data/cars";
import { CarPhoto } from "./CarPhoto";
import { ChargeBar } from "./ChargeBar";
import { formatPrice } from "@/lib/format";
import { totalPrice } from "@/lib/pricing";

export function ModelCard({
  brand,
  model,
  photoUrl,
  cnyRate,
}: {
  brand: Brand;
  model: Model;
  photoUrl?: string;
  cnyRate: number;
}) {
  const trim = baseTrim(model);

  return (
    <Link
      href={`/brand/${brand.slug}/${model.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-card transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(19,26,36,0.08)]"
    >
      <CarPhoto photoUrl={photoUrl} accent={brand.accent} className="h-44 w-full" alt={model.name} />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">
            {model.name}
          </h3>
          <p className="text-sm text-ink-soft">{model.tagline}</p>
        </div>

        <ChargeBar valueKm={trim.rangeKm} maxKm={RANGE_SCALE_MAX} />

        <div className="mt-auto flex items-end justify-between border-t border-line pt-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
              Цена от
            </p>
            <p className="font-display text-lg font-semibold text-ink">
              {formatPrice(totalPrice(trim, cnyRate))}
            </p>
            {model.trims.length > 1 && (
              <p className="mt-0.5 font-mono text-[10px] text-ink-soft">
                {model.trims.length} версии
              </p>
            )}
          </div>
          <span className="font-mono text-xs text-charge transition-transform group-hover:translate-x-1">
            Подробнее →
          </span>
        </div>
      </div>
    </Link>
  );
}
