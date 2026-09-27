import { getBrands } from "@/lib/catalog";
import { getArchivedModelKeys, modelKey } from "@/lib/archive";
import { ArchiveToggle } from "../ArchiveToggle";
import { AdminNav } from "../AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminModelsPage() {
  const brands = await getBrands();
  const archived = await getArchivedModelKeys();

  return (
    <div className="min-h-screen bg-surface px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <AdminNav title="Модели" />
        <p className="mt-4 text-sm text-ink-soft">
          Архивация моделей — скрывает с витрины, данные сохраняются.
        </p>
        <div className="mt-8 space-y-8">
          {brands.map((brand) => (
            <div key={brand.slug}>
              <h2 className="font-display text-lg font-semibold text-ink">
                {brand.name}
              </h2>
              <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface-card">
                {brand.models.map((model) => (
                  <div
                    key={model.slug}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <span className="text-sm text-ink">{model.name}</span>
                    <ArchiveToggle
                      brandSlug={brand.slug}
                      modelSlug={model.slug}
                      initialArchived={archived.has(
                        modelKey(brand.slug, model.slug),
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
