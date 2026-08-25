import Link from "next/link";
import type { Brand, Model, Trim } from "@/data/cars";
import { fullSpecRows, similarTrims, RANGE_SCALE_MAX } from "@/data/cars";
import { CarPhoto } from "./CarPhoto";
import { ChargeBar } from "./ChargeBar";
import { AddToCompareButton } from "./AddToCompareButton";
import { ContactCTA } from "./ContactCTA";
import { ColorSwatches } from "./ColorSwatches";
import { Breadcrumbs } from "./Breadcrumbs";
import { formatPrice } from "@/lib/format";
import { fullPriceBreakdown } from "@/lib/pricing";
import { getCnyRubRate } from "@/lib/exchangeRate";
import { getPhotoMap, photoKey } from "@/lib/photos";

export async function TrimDetailView({
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
  const cnyRate = await getCnyRubRate();
  const price = fullPriceBreakdown(trim, cnyRate);
  const photoMap = await getPhotoMap();
  const photoUrl = photoMap[photoKey(brand.slug, model.slug)];

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
    <section className="mx-auto max-w-[1400px] px-5 pb-24 pt-10">
      <Breadcrumbs
        items={[
          { label: "Все марки", href: "/" },
          { label: brand.name, href: `/brand/${brand.slug}` },
          {
            label: model.name,
            href: hasMultipleTrims
              ? `/brand/${brand.slug}/${model.slug}`
              : undefined,
          },
          ...(hasMultipleTrims ? [{ label: trim.name }] : []),
        ]}
      />

      {/* Единая сетка на всю страницу: левая колонка — весь текст сверху
          вниз (включая характеристики), правая — фото сверху, CTA и
          похожие версии снизу. Так оба столбца всегда совпадают по ширине. */}
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

          {hasMultipleTrims && (
            <div className="mt-6">
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

          <div className="mt-6">
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              Цена итого
            </p>
            <p className="font-display text-3xl font-bold text-ink">
              {formatPrice(price.total)}
            </p>

            <div className="mt-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">1. В Китае</span>
                <span className="font-mono text-ink">
                  {formatPrice(price.chinaPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">2. Таможня</span>
                <span className="font-mono text-ink">
                  {formatPrice(price.customs)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">3. Логистика</span>
                <span className="font-mono text-ink">
                  {formatPrice(price.logistics)}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Логистика — 15% от цены в Китае, но не менее 300 000 ₽.
              Таможня включает таможенный сбор, единый таможенный платёж
              (15%) и утилизационный сбор — расчёт для нового авто (до 1
              года), личное пользование, по курсу юаня на сегодня.
              {price.customsDetails.isP30Estimated &&
                " 30-минутная мощность двигателя оценена по формуле (0,45 × пиковая), так как в документации не указана — точная сумма утильсбора может отличаться."}
            </p>
          </div>

          <div className="mt-6">
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              Запас хода
            </p>
            <div className="mt-2">
              <ChargeBar valueKm={trim.rangeKm} maxKm={RANGE_SCALE_MAX} />
            </div>
          </div>

          <div className="mt-6">
            <AddToCompareButton
              id={`${brand.slug}/${model.slug}/${trim.slug}`}
            />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-ink-soft">
            {model.description}
          </p>

          {/* Характеристики — в той же колонке, той же ширины */}
          <div className="mt-10">
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
          </div>
        </div>

        <div>
          <CarPhoto
            photoUrl={photoUrl}
            accent={brand.accent}
            className="h-72 w-full rounded-2xl sm:h-96"
            alt={model.name}
          />
          {!photoUrl && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <CarPhoto
                  key={i}
                  accent={brand.accent}
                  className="h-16 w-full rounded-lg sm:h-20"
                />
              ))}
            </div>
          )}

          {(model.exteriorColors || model.interiorColors) && (
            <div className="mt-6 grid grid-cols-2 gap-6">
              {model.exteriorColors && (
                <ColorSwatches title="Цвета" colors={model.exteriorColors} />
              )}
              {model.interiorColors && (
                <ColorSwatches
                  title="Интерьер"
                  colors={model.interiorColors}
                />
              )}
            </div>
          )}

          {/* CTA и похожие версии — в той же колонке, что и фото, прилипает при скролле */}
          <div className="mt-6 lg:sticky lg:top-24">
            <ContactCTA
              modelName={`${model.name}${hasMultipleTrims ? ` ${trim.name}` : ""}`}
            />

            <div className="mt-6">
              <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                Похожие версии
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {similarTrims(model.slug, trim.priceFrom).map((s) => (
                  <Link
                    key={`${s.brand.slug}/${s.model.slug}/${s.trim.slug}`}
                    href={`/brand/${s.brand.slug}/${s.model.slug}${
                      s.model.trims.length > 1 ? `/${s.trim.slug}` : ""
                    }`}
                    className="group flex items-center gap-3 rounded-xl border border-line bg-surface-card p-2.5 transition-colors hover:border-ink"
                  >
                    <CarPhoto
                      photoUrl={photoMap[photoKey(s.brand.slug, s.model.slug)]}
                      accent={s.brand.accent}
                      className="h-12 w-16 shrink-0 rounded-lg"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink group-hover:text-charge">
                        {s.brand.name} {s.model.name}
                      </p>
                      <p className="font-mono text-xs text-ink-soft">
                        {formatPrice(fullPriceBreakdown(s.trim, cnyRate).total)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
