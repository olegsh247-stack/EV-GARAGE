import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CarPlaceholder } from "@/components/CarPlaceholder";
import { ChargeBar } from "@/components/ChargeBar";
import { ContactCTA } from "@/components/ContactCTA";
import { brands, getModel } from "@/data/cars";
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

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-10">
          <Link
            href={`/brand/${brand.slug}`}
            className="inline-flex items-center gap-1 font-mono text-xs text-ink-soft transition-colors hover:text-ink"
          >
            <ChevronLeft size={14} />
            {brand.name}
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
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

            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                {brand.name} · {model.bodyType}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {model.name}
              </h1>
              <p className="mt-2 text-base text-ink-soft">{model.tagline}</p>

              <p className="mt-6 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                Цена от
              </p>
              <p className="font-display text-3xl font-bold text-ink">
                {formatPrice(model.priceFrom)}
              </p>

              <div className="mt-6">
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                  Запас хода
                </p>
                <div className="mt-2">
                  <ChargeBar
                    valueKm={model.rangeKm}
                    maxKm={model.maxRangeKm}
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
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Характеристики
          </p>
          <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {model.specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between bg-surface-card px-6 py-5"
              >
                <span className="text-sm text-ink-soft">{spec.label}</span>
                <span className="font-mono text-sm font-medium text-ink">
                  {spec.value}
                  {spec.unit ? ` ${spec.unit}` : ""}
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
