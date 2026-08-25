import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ModelCard } from "@/components/ModelCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { brands, getBrand } from "@/data/cars";
import { getPhotoMap, photoKey } from "@/lib/photos";
import { getCnyRubRate } from "@/lib/exchangeRate";

// Обновляем раз в 30 секунд, чтобы новые фото из админки появлялись
// без пересборки и ручного деплоя
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
  const brand = getBrand(brandSlug);
  if (!brand) notFound();
  const [photoMap, cnyRate] = await Promise.all([
    getPhotoMap(),
    getCnyRubRate(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-5 pb-8 pt-10">
          <Breadcrumbs
            items={[
              { label: "Все марки", href: "/" },
              { label: brand.name },
            ]}
          />

          <div className="mt-6 flex items-center gap-4">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: brand.accent }}
            />
            <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              {brand.country}
            </p>
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {brand.name}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            {brand.description}
          </p>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 py-10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brand.models.map((model) => (
              <ModelCard
                key={model.slug}
                brand={brand}
                model={model}
                photoUrl={photoMap[photoKey(brand.slug, model.slug)]}
                cnyRate={cnyRate}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
