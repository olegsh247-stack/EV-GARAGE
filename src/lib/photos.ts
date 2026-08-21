import { list } from "@vercel/blob";

// slug модели -> прямая ссылка на фото. Один файл на модель, имя
// предсказуемое (cars/{brandSlug}-{modelSlug}.*), поэтому повторная
// загрузка просто заменяет старое фото — ничего в коде менять не нужно.
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
      map[slug] = blob.url;
    }
    return map;
  } catch {
    return {};
  }
}

export function photoKey(brandSlug: string, modelSlug: string) {
  return `${brandSlug}-${modelSlug}`;
}
