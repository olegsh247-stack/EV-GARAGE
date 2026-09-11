import { list } from "@vercel/blob";
import { unstable_cache } from "next/cache";

const PHOTO_MAP_TAG = "ev-garage-photo-map";

async function loadPhotoMap(): Promise<Record<string, string>> {
  const { blobs } = await list({ prefix: "cars/" });
  const map: Record<string, string> = {};

  for (const blob of blobs) {
    const filename = blob.pathname.split("/").pop() ?? "";
    const match = filename.match(/^(.+)\.(jpg|jpeg|png|webp)$/i);
    if (!match) continue;

    const slug = match[1];
    const extension = match[2].toLowerCase();
    map[slug] = `/api/photos/${encodeURIComponent(slug)}?ext=${extension}&v=${blob.uploadedAt.getTime()}`;
  }

  return map;
}

// Listing the photo store is an Advanced Operation, so keep the result in the
// Next.js Data Cache instead of listing Blob Storage for every model page.
const getCachedPhotoMap = unstable_cache(loadPhotoMap, [PHOTO_MAP_TAG], {
  tags: [PHOTO_MAP_TAG],
  revalidate: 3600,
});

// slug модели -> публичный URL приложения. Сами Blob объекты остаются
// приватными: их содержимое выдаёт серверный /api/photos/[slug] route.
export async function getPhotoMap(): Promise<Record<string, string>> {
  // Пока Blob Storage не подключён (нет токена) — просто нет фото,
  // сайт продолжает работать с плейсхолдерами, сборка не падает.
  if (!process.env.BLOB_READ_WRITE_TOKEN) return {};

  try {
    return await getCachedPhotoMap();
  } catch {
    return {};
  }
}

export function photoKey(brandSlug: string, modelSlug: string) {
  return `${brandSlug}-${modelSlug}`;
}
