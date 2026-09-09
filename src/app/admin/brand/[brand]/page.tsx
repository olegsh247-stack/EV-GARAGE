import { notFound } from "next/navigation";
import { getBrand } from "@/data/cars";
import { getPhotoMap, photoKey } from "@/lib/photos";
import { getArchivedModelKeys, modelKey } from "@/lib/archive";
import { AdminNav } from "../../AdminNav";
import { AdminModelCard } from "../../AdminModelCard";

export const dynamic = "force-dynamic";

export default async function AdminBrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandSlug } = await params;
  const brand = getBrand(brandSlug);
  if (!brand) notFound();

  const [photoMap, archived] = await Promise.all([
    getPhotoMap(),
    getArchivedModelKeys(),
  ]);

  return (
    <div className="min-h-screen bg-surface px-5 py-10">
      <div className="mx-auto max-w-[1400px]">
        <AdminNav title={brand.name} />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brand.models.map((model) => (
            <AdminModelCard
              key={model.slug}
              brand={brand}
              model={model}
              photoUrl={photoMap[photoKey(brand.slug, model.slug)]}
              isArchived={archived.has(modelKey(brand.slug, model.slug))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
