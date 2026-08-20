import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ArrowUpRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CarPlaceholder } from "@/components/CarPlaceholder";
import { ChargeBar } from "@/components/ChargeBar";
import { ContactCTA } from "@/components/ContactCTA";
import {
  brands,
  getModel,
  baseTrim,
  differingTrimFields,
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
  const compareFields = hasMultipleTrims ? differingTrimFields(model) : [];

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

              <div className="mt-8">
                <ContactCTA modelName={model.name} />
              </div>
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

        {/* Версии как на китайских каталогах: 1 колонка, версии рядами */}
        {hasMultipleTrims ? (
          <section className="mx-auto max-w-6xl px-5 pb-20">
            <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              Версии · {model.trims.length}
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface-card">
              {/* Заголовок характеристик */}
              <div
                className="hidden gap-4 border-b border-line bg-surface px-6 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-soft sm:grid"
                style={{
                  gridTemplateColumns: `1.4fr repeat(${compareFields.length}, 1fr)`,
                }}
              >
                <span>Версия</span>
                {compareFields.map((field) => (
                  <span key={field.key}>{field.label}</span>
                ))}
              </div>

              {model.trims.map((trim) => (
                <Link
                  key={trim.slug}
                  href={`/brand/${brand.slug}/${model.slug}/${trim.slug}`}
                  className="group grid items-center gap-2 border-b border-line px-6 py-5 transition-colors last:border-0 hover:bg-surface sm:gap-4"
                  style={{
                    gridTemplateColumns: `1.4fr repeat(${compareFields.length}, 1fr)`,
                  }}
                >
                  <div>
                    <p className="flex items-center gap-1.5 font-display font-semibold text-ink group-hover:text-charge">
                      {trim.name}
                      <ArrowUpRight
                        size={14}
                        className="text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-charge"
                      />
                    </p>
                    <p className="mt-0.5 font-mono text-sm text-ink">
                      {formatPrice(trim.priceFrom)}
                    </p>
                    {trim.highlight && (
                      <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink-soft">
                        {trim.highlight}
                      </p>
                    )}
                  </div>
                  {compareFields.map((field) => (
                    <span
                      key={field.key}
                      className="hidden font-mono text-sm text-ink sm:inline"
                    >
                      {field.read(trim)}
                    </span>
                  ))}
                </Link>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-soft">
              Показаны характеристики, которые отличаются между версиями.
              Нажмите на версию, чтобы увидеть полные характеристики.
            </p>
          </section>
        ) : (
          <section className="mx-auto max-w-2xl px-5 pb-20">
            <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              Характеристики
            </p>
            <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface-card">
              {[
                { label: "Тип двигателя", value: entryTrim.powertrainType },
                { label: "Запас хода", value: `${entryTrim.rangeKm} км` },
                {
                  label: "Мощность",
                  value: `${entryTrim.powerHp} л.с. (${entryTrim.powerKw} кВт)`,
                },
                { label: "Крутящий момент", value: `${entryTrim.torqueNm} Н·м` },
                { label: "Разгон 0–100", value: `${entryTrim.accelSec} с` },
                { label: "Макс. скорость", value: `${entryTrim.topSpeedKmh} км/ч` },
                { label: "Привод", value: entryTrim.drive },
                { label: "Батарея", value: `${entryTrim.batteryKwh} кВт·ч` },
                { label: "Тип батареи", value: entryTrim.batteryType },
                { label: "Быстрая зарядка", value: entryTrim.fastCharge },
                { label: "Мест", value: String(model.seats) },
              ].map((spec) => (
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
        )}
      </main>
      <Footer />
    </>
  );
}
