import Link from "next/link";
import { ArrowUpRight, Archive } from "lucide-react";
import type { Brand, Model } from "@/data/cars";
import { CarPhoto } from "@/components/CarPhoto";

export function AdminModelCard({
  brand,
  model,
  photoUrl,
  isArchived,
}: {
  brand: Brand;
  model: Model;
  photoUrl?: string;
  isArchived: boolean;
}) {
  return (
    <Link
      href={`/admin/brand/${brand.slug}/${model.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-card transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(19,26,36,0.08)]"
    >
      <CarPhoto
        photoUrl={photoUrl}
        accent={brand.accent}
        className="h-36 w-full"
        alt={model.name}
      />
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold text-ink">
            {model.name}
          </h3>
          <p className="font-mono text-[11px] text-ink-soft">
            {model.trims.length}{" "}
            {model.trims.length === 1 ? "версия" : "версии"}
          </p>
        </div>
        {isArchived ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-mono text-[10px] text-amber-800">
            <Archive size={11} />
            архив
          </span>
        ) : (
          <ArrowUpRight
            size={16}
            className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-charge"
          />
        )}
      </div>
    </Link>
  );
}
