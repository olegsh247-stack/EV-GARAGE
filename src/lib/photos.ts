import { list } from "@vercel/blob";

// slug модели -> публичный URL приложения. Сами Blob объекты остаются
// приватными: их содержимое выдаёт серверный /api/photos/[slug] route.
export async function getPhotoMap(): Promise<Record<string, string>> {
  // Пока Blob Storage не подключён (нет токена) — просто нет фото,
  // сайт продолжает работать с плейсхолдерами, сборка не падает.
  if (!process.env.BLOB_READ_WRITE_TOKEN) return {};

  try {
    const { blobs } = await list({ prefix: "cars/" });
    const map: Record<string, string> = {};
    for (const blob of blobs) {
      const filename = blob.pathname.split("/").pop() ?? "";
      const slug = filename.replace(/\.[^.]+$/, "");
      map[slug] = `/api/photos/${encodeURIComponent(slug)}?v=${blob.uploadedAt.getTime()}`;
    }
    return map;
  } catch {
    return {};
  }
}

export function photoKey(brandSlug: string, modelSlug: string) {
  return `${brandSlug}-${modelSlug}`;
}
