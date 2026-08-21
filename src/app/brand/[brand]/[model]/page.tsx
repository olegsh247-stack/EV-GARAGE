import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CarPlaceholder } from "@/components/CarPlaceholder";
import { ChargeBar } from "@/components/ChargeBar";
import {
  brands,
  getModel,
  baseTrim,
  fullSpecRows,
  RANGE_SCALE_MAX,
} from "@/data/cars";
import { formatPrice } from "@/lib/format";

export function generateStaticParams() {
  return brands.flatMap((b) =>
    b.models.map((m) => ({ brand: b.slug, model: m.slug }))
  );
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}) {
  const { brand: brandSlug, model: modelSlug } = await params;
  const found = getModel(brandSlug, modelSlug);
  if (!found) notFound();
  const { brand, model } = found;
  const entryTrim = baseTrim(model);
  const hasMultipleTrims = model.trims.length > 1;

  // Строки характеристик по каждой версии — для матрицы ниже
  const rowsPerTrim = model.trims.map((trim) => ({
    trim,
    rows: fullSpecRows(model, trim),
  }));
  const rowLabels = rowsPerTrim[0]?.rows.map((r) => r.label) ?? [];

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pb-8 pt-10">
          <Link
            href={`/brand/${brand.slug}`}
            className="inline-flex items-center gap-1 font-mono text-xs text-ink-soft transition-colors hover:text-ink"
          >
            <ChevronLeft size={14} />
            {brand.name}
          </Link>

          {/* Текст слева, фото справа — блоки одного размера */}
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                {brand.name} · {model.bodyType}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {model.name}
              </h1>
              <p className="mt-2 text-base text-ink-soft">{model.tagline}</p>

              <p className="mt-6 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                {hasMultipleTrims ? "Цена от" : "Цена"}
              </p>
              <p className="font-display text-3xl font-bold text-ink">
                {formatPrice(entryTrim.priceFrom)}
              </p>

              <div className="mt-6">
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                  Запас хода {hasMultipleTrims ? "(мин. версия)" : ""}
                </p>
                <div className="mt-2">
                  <ChargeBar
                    valueKm={entryTrim.rangeKm}
                    maxKm={RANGE_SCALE_MAX}
                    accent={brand.accent}
                  />
                </div>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-ink-soft">
                {model.description}
              </p>
            </div>

            <div>
              <CarPlaceholder
                accent={brand.accent}
                className="h-72 w-full rounded-2xl sm:h-96"
              />
              <div className="mt-3 grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CarPlaceholder
                    key={i}
                    accent={brand.accent}
                    className="h-16 w-full rounded-lg sm:h-20"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Характеристики: слева названия, версии — колонками (как autohome) */}
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Характеристики{hasMultipleTrims ? ` · ${model.trims.length} версии` : ""}
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface-card">
            <table className="w-full border-collapse text-sm">
              {hasMultipleTrims && (
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="min-w-[160px] px-5 py-4 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                      Характеристика
                    </th>
                    {rowsPerTrim.map(({ trim }) => (
                      <th
                        key={trim.slug}
                        className="min-w-[180px] px-5 py-4 text-left"
                      >
                        {hasMultipleTrims ? (
                          <Link
                            href={`/brand/${brand.slug}/${model.slug}/${trim.slug}`}
                            className="font-display font-semibold text-ink hover:text-charge"
                          >
                            {trim.name}
                          </Link>
                        ) : (
                          <span className="font-display font-semibold text-ink">
                            {trim.name}
                          </span>
                        )}
                        <p className="mt-0.5 font-mono text-xs font-normal text-ink-soft">
                          {formatPrice(trim.priceFrom)}
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {rowLabels.map((label, i) => (
                  <tr
                    key={label}
                    className="border-b border-line last:border-0"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-ink-soft">
                      {label}
                    </td>
                    {rowsPerTrim.map(({ trim, rows }) => (
                      <td
                        key={trim.slug}
                        className="whitespace-nowrap px-5 py-4 font-mono text-ink"
                      >
                        {rows[i].value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
