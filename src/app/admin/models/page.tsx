import { brands } from "@/data/cars";
import { getArchivedModelKeys, modelKey } from "@/lib/archive";
import { ArchiveToggle } from "../ArchiveToggle";
import { AdminNav } from "../AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminModelsPage() {
  const archived = await getArchivedModelKeys();

  return (
    <div className="min-h-screen bg-surface px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <AdminNav title="Архив" />

        <p className="mt-4 text-sm text-ink-soft">
          Модели в архиве не показываются в каталоге, топах и сравнении, но их
          страницы остаются доступны по прямой ссылке с пометкой «больше не
          поставляется».
        </p>

        <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-surface-card">
          {[...brands]
            .sort((a, b) => a.name.localeCompare(b.name, "ru"))
            .flatMap((brand) =>
              brand.models.map((model) => {
                const key = modelKey(brand.slug, model.slug);
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <p className="text-sm text-ink">
                      {brand.name} · {model.name}
                    </p>
                    <ArchiveToggle
                      brandSlug={brand.slug}
                      modelSlug={model.slug}
                      initialArchived={archived.has(key)}
                    />
                  </div>
                );
              })
            )}
        </div>
      </div>
    </div>
  );
}
