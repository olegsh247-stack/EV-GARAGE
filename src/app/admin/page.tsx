import { brands } from "@/data/cars";
import { getPhotoMap, photoKey } from "@/lib/photos";
import { PhotoUploadRow } from "./PhotoUploadRow";
import { AdminNav } from "./AdminNav";

// Всегда свежие данные — фото могут появляться в любой момент
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const photoMap = await getPhotoMap();
  const noBlobConfigured = !process.env.BLOB_READ_WRITE_TOKEN;

  return (
    <div className="min-h-screen bg-surface px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <AdminNav title="Фото моделей" />

        {noBlobConfigured && (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Хранилище фото (Vercel Blob) ещё не подключено — загрузка не
            будет работать, пока в настройках проекта на Vercel не создать
            Blob Storage.
          </div>
        )}

        <p className="mt-4 text-sm text-ink-soft">
          Одно фото на модель — используется на карточках, в каталоге и на
          странице модели. Просто выберите файл (JPG, PNG или WEBP) — сайт
          обновится автоматически в течение примерно 30 секунд.
        </p>

        <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-surface-card">
          {[...brands]
            .sort((a, b) => a.name.localeCompare(b.name, "ru"))
            .flatMap((brand) =>
              brand.models.map((model) => {
                const key = photoKey(brand.slug, model.slug);
                return (
                  <PhotoUploadRow
                    key={key}
                    slug={key}
                    label={`${brand.name} · ${model.name}`}
                    accent={brand.accent}
                    initialUrl={photoMap[key]}
                  />
                );
              })
            )}
        </div>
      </div>
    </div>
  );
}
