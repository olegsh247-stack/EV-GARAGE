import Link from "next/link";
import { brands } from "@/data/cars";
import { getArchivedModelKeys, modelKey } from "@/lib/archive";
import { ArchiveToggle } from "../ArchiveToggle";
import { LogoutButton } from "../LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminModelsPage() {
  const archived = await getArchivedModelKeys();

  return (
    <div className="min-h-screen bg-surface px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              Админка
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink">
              Архив моделей
            </h1>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-4 flex gap-4 font-mono text-xs">
          <Link href="/admin" className="text-ink-soft hover:text-ink">
            ← Фото
          </Link>
          <Link href="/admin/suggestions" className="text-ink-soft hover:text-ink">
            Предложения →
          </Link>
        </div>

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
