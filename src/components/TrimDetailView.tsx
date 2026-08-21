import Link from "next/link";
import type { Brand, Model, Trim } from "@/data/cars";
import { fullSpecRows, RANGE_SCALE_MAX } from "@/data/cars";
import { CarPlaceholder } from "./CarPlaceholder";
import { ChargeBar } from "./ChargeBar";
import { formatPrice } from "@/lib/format";

export function TrimDetailView({
  brand,
  model,
  trim,
}: {
  brand: Brand;
  model: Model;
  trim: Trim;
}) {
  const hasMultipleTrims = model.trims.length > 1;
  const specRows = fullSpecRows(model, trim);

  // Ссылка на конкретную версию: самая дешёвая версия живёт на
  // /brand/x/y (без /trim-slug), остальные — на /brand/x/y/trim-slug
  const baseSlug = [...model.trims].sort(
    (a, b) => a.priceFrom - b.priceFrom
  )[0].slug;
  const trimHref = (t: Trim) =>
    t.slug === baseSlug
      ? `/brand/${brand.slug}/${model.slug}`
      : `/brand/${brand.slug}/${model.slug}/${t.slug}`;

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-5 pb-8 pt-10">
        <Link
          href={`/brand/${brand.slug}`}
          className="inline-flex items-center gap-1 font-mono text-xs text-ink-soft transition-colors hover:text-ink"
        >
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
              {hasMultipleTrims && (
                <span className="text-ink-soft"> · {trim.name}</span>
              )}
            </h1>
            <p className="mt-2 text-base text-ink-soft">
              {trim.highlight ?? model.tagline}
            </p>

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

            {hasMultipleTrims && (
              <div className="mt-7">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                  Версия
                </p>
                <div className="flex flex-wrap gap-2">
                  {model.trims.map((t) => {
                    const active = t.slug === trim.slug;
                    return (
                      <Link
                        key={t.slug}
                        href={trimHref(t)}
                        aria-current={active ? "page" : undefined}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "border-ink bg-ink text-surface"
                            : "border-line bg-surface-card text-ink hover:border-ink"
                        }`}
                      >
                        {t.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

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
    </>
  );
}
