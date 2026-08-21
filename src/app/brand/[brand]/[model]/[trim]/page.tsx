import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CarPlaceholder } from "@/components/CarPlaceholder";
import { ChargeBar } from "@/components/ChargeBar";
import { brands, getTrim, fullSpecRows, RANGE_SCALE_MAX } from "@/data/cars";
import { formatPrice } from "@/lib/format";

export function generateStaticParams() {
  return brands.flatMap((b) =>
    b.models.flatMap((m) =>
      m.trims.length > 1
        ? m.trims.map((t) => ({ brand: b.slug, model: m.slug, trim: t.slug }))
        : []
    )
  );
}

export default async function TrimPage({
  params,
}: {
  params: Promise<{ brand: string; model: string; trim: string }>;
}) {
  const { brand: brandSlug, model: modelSlug, trim: trimSlug } = await params;
  const found = getTrim(brandSlug, modelSlug, trimSlug);
  if (!found) notFound();
  const { brand, model, trim } = found;
  const specRows = fullSpecRows(model, trim);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pb-8 pt-10">
          <div className="flex flex-wrap items-center gap-1 font-mono text-xs text-ink-soft">
            <Link
              href={`/brand/${brand.slug}`}
              className="transition-colors hover:text-ink"
            >
              {brand.name}
            </Link>
            <ChevronLeft size={12} className="rotate-180" />
            <Link
              href={`/brand/${brand.slug}/${model.slug}`}
              className="transition-colors hover:text-ink"
            >
              {model.name}
            </Link>
            <ChevronLeft size={12} className="rotate-180" />
            <span className="text-ink">{trim.name}</span>
          </div>

          {/* Текст слева, фото справа — блоки одного размера */}
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                {brand.name} · {model.name} · {model.bodyType}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {trim.name}
              </h1>
              {trim.highlight && (
                <p className="mt-2 text-base text-ink-soft">{trim.highlight}</p>
              )}

              <p className="mt-6 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                Цена
              </p>
              <p className="font-display text-3xl font-bold text-ink">
                {formatPrice(trim.priceFrom)}
              </p>

              <div className="mt-6">
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                  Запас хода
                </p>
                <div className="mt-2">
                  <ChargeBar
                    valueKm={trim.rangeKm}
                    maxKm={RANGE_SCALE_MAX}
                    accent={brand.accent}
                  />
                </div>
              </div>

              {model.trims.length > 1 && (
                <div className="mt-7">
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                    Другие версии {model.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {model.trims
                      .filter((t) => t.slug !== trim.slug)
                      .map((t) => (
                        <Link
                          key={t.slug}
                          href={`/brand/${brand.slug}/${model.slug}/${t.slug}`}
                          className="rounded-full border border-line bg-surface-card px-4 py-2 text-sm text-ink transition-colors hover:border-ink"
                        >
                          {t.name}
                        </Link>
                      ))}
                  </div>
                </div>
              )}
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

        {/* Полные характеристики — список в одну колонку */}
        <section className="mx-auto max-w-2xl px-5 pb-20">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Характеристики
          </p>
          <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface-card">
            {specRows.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between px-6 py-4"
              >
                <span className="text-sm text-ink-soft">{spec.label}</span>
                <span className="font-mono text-sm font-medium text-ink">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
