import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ModelCard } from "@/components/ModelCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { brands } from "@/data/cars";
import { getBrand } from "@/lib/catalog";
import { getPhotoMap, photoKey } from "@/lib/photos";
import { getCnyRubRate } from "@/lib/exchangeRate";
import { getArchivedModelKeys, modelKey } from "@/lib/archive";

export const revalidate = 30;

export function generateStaticParams() {
  return brands.map((b) => ({ brand: b.slug }));
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandSlug } = await params;
  const brand = await getBrand(brandSlug);
  if (!brand) notFound();
  const [photoMap, cnyRate, archived] = await Promise.all([
    getPhotoMap(),
    getCnyRubRate(),
    getArchivedModelKeys(),
  ]);

  const activeModels = brand.models.filter(
    (m) => !archived.has(modelKey(brand.slug, m.slug)),
  );
  const archivedModels = brand.models.filter((m) =>
    archived.has(modelKey(brand.slug, m.slug)),
  );

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-5 pb-24 pt-10">
          <Breadcrumbs
            items={[
              { label: "Все марки", href: "/" },
              { label: brand.name },
            ]}
          />

          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                {brand.country}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {brand.name}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-ink-soft">
                {brand.description}
              </p>
            </div>
            <Link
              href="/"
              className="hidden shrink-0 font-mono text-xs text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink sm:block"
            >
              ← Все марки
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeModels.map((model) => (
              <ModelCard
                key={model.slug}
                brand={brand}
                model={model}
                photoUrl={photoMap[photoKey(brand.slug, model.slug)]}
                cnyRate={cnyRate}
              />
            ))}
          </div>

          {archivedModels.length > 0 && (
            <div className="mt-16">
              <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                Архив
              </p>
              <div className="mt-4 grid gap-5 opacity-70 sm:grid-cols-2 lg:grid-cols-3">
                {archivedModels.map((model) => (
                  <ModelCard
                    key={model.slug}
                    brand={brand}
                    model={model}
                    photoUrl={photoMap[photoKey(brand.slug, model.slug)]}
                    cnyRate={cnyRate}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
