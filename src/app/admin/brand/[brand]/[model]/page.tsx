import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getModel, baseTrim } from "@/data/cars";
import { getPhotoMap, photoKey } from "@/lib/photos";
import { getArchivedModelKeys, modelKey } from "@/lib/archive";
import { getVideosForModel } from "@/lib/videosStore";
import { formatPrice } from "@/lib/format";
import { AdminNav } from "../../../AdminNav";
import { PhotoUploadRow } from "../../../PhotoUploadRow";
import { ArchiveToggle } from "../../../ArchiveToggle";
import { VideoLinkForm } from "../../../VideoLinkForm";

export const dynamic = "force-dynamic";

export default async function AdminModelPage({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}) {
  const { brand: brandSlug, model: modelSlug } = await params;
  const found = getModel(brandSlug, modelSlug);
  if (!found) notFound();
  const { brand, model } = found;
  const key = photoKey(brand.slug, model.slug);

  const [photoMap, archived, videos] = await Promise.all([
    getPhotoMap(),
    getArchivedModelKeys(),
    getVideosForModel(brand.slug, model.slug),
  ]);

  const isArchived = archived.has(modelKey(brand.slug, model.slug));
  const entryTrim = baseTrim(model);

  return (
    <div className="min-h-screen bg-surface px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <AdminNav title={model.name} />

        <Link
          href={`/admin/brand/${brand.slug}`}
          className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-ink-soft transition-colors hover:text-ink"
        >
          <ChevronLeft size={14} />
          {brand.name}
        </Link>

        {/* Фото слева, название + архивация справа — как на сайте */}
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <PhotoUploadRow
            slug={key}
            label="Фото модели"
            accent={brand.accent}
            initialUrl={photoMap[key]}
          />

          <div className="flex flex-col justify-center gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                {brand.name} · {model.bodyType}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-ink">
                {model.name}
              </h2>
              <p className="mt-1 font-mono text-sm text-ink-soft">
                от {formatPrice(entryTrim.priceFrom)}
              </p>
            </div>
            <ArchiveToggle
              brandSlug={brand.slug}
              modelSlug={model.slug}
              initialArchived={isArchived}
            />
          </div>
        </div>

        {/* Версии — только просмотр, не редактируются здесь */}
        <div className="mt-10">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Версии · {model.trims.length}
          </p>
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface-card">
            {model.trims.map((trim) => (
              <div
                key={trim.slug}
                className="flex items-center justify-between px-5 py-3"
              >
                <span className="text-sm text-ink">{trim.name}</span>
                <span className="font-mono text-xs text-ink-soft">
                  {formatPrice(trim.priceFrom)} · {trim.rangeKm} км
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            Версии и их характеристики редактируются только в коде — здесь
            только просмотр.
          </p>
        </div>

        {/* Видео модели */}
        <div className="mt-10">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Видео
          </p>
          <div className="mt-3">
            <VideoLinkForm
              brandSlug={brand.slug}
              modelSlug={model.slug}
              initialVideos={videos}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
