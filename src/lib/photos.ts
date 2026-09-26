import { getCloudflareContext } from "@opennextjs/cloudflare";
import { MAX_PHOTOS_PER_MODEL } from "@/lib/photoConstants";

export { MAX_PHOTOS_PER_MODEL };

export type PhotoMeta = {
  contentType: string;
  ext: string;
  updatedAt: number;
  index: number;
};

type GalleryIndex = {
  items: Array<{ index: number; ext: string; updatedAt: number }>;
};

type PhotosKv = {
  list: (options: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }) => Promise<{
    keys: Array<{ name: string; metadata?: unknown }>;
    list_complete: boolean;
    cursor?: string;
  }>;
  put: (
    key: string,
    value: ArrayBuffer | string,
    options?: { metadata?: PhotoMeta },
  ) => Promise<void>;
  get: (key: string, options?: { type: "text" | "json" }) => Promise<string | null>;
  getWithMetadata: (
    key: string,
    options: { type: "arrayBuffer" },
  ) => Promise<{ value: ArrayBuffer | null; metadata: PhotoMeta | null }>;
  delete: (key: string) => Promise<void>;
};

function photoObjectKey(slug: string, index: number) {
  return `cars/${slug}/${index}`;
}

function galleryIndexKey(slug: string) {
  return `cars/${slug}/_index`;
}

function legacyPhotoKey(slug: string) {
  return `cars/${slug}`;
}

function photoUrl(slug: string, index: number, version: number, ext: string) {
  return `/api/photos/${encodeURIComponent(slug)}?i=${index}&ext=${ext}&v=${version}`;
}

async function getPhotosKv(): Promise<PhotosKv | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as { PHOTOS_KV?: PhotosKv }).PHOTOS_KV ?? null;
  } catch {
    return null;
  }
}

async function readGalleryIndex(kv: PhotosKv, slug: string): Promise<GalleryIndex> {
  try {
    const raw = await kv.get(galleryIndexKey(slug), { type: "text" });
    if (raw) {
      const parsed = JSON.parse(raw) as GalleryIndex;
      if (Array.isArray(parsed.items)) {
        return {
          items: parsed.items
            .filter(
              (item) =>
                Number.isInteger(item.index) &&
                item.index >= 0 &&
                item.index < MAX_PHOTOS_PER_MODEL,
            )
            .sort((a, b) => a.index - b.index),
        };
      }
    }
  } catch {
    /* rebuild below */
  }

  // Rebuild from keys (legacy + indexed)
  const items: GalleryIndex["items"] = [];
  let cursor: string | undefined;
  do {
    const listed = await kv.list({
      prefix: `cars/${slug}/`,
      limit: 100,
      cursor,
    });
    for (const key of listed.keys) {
      if (key.name.endsWith("/_index")) continue;
      const rest = key.name.slice(`cars/${slug}/`.length);
      if (!/^\d+$/.test(rest)) continue;
      const index = Number(rest);
      const meta = (key.metadata ?? {}) as Partial<PhotoMeta>;
      items.push({
        index,
        ext: meta.ext ?? "jpg",
        updatedAt: meta.updatedAt ?? Date.now(),
      });
    }
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);

  // Legacy single key
  try {
    const legacy = await kv.getWithMetadata(legacyPhotoKey(slug), {
      type: "arrayBuffer",
    });
    if (legacy.value && !items.some((i) => i.index === 0)) {
      items.push({
        index: 0,
        ext: legacy.metadata?.ext ?? "jpg",
        updatedAt: legacy.metadata?.updatedAt ?? Date.now(),
      });
    }
  } catch {
    /* ignore */
  }

  items.sort((a, b) => a.index - b.index);
  const indexDoc: GalleryIndex = { items };
  try {
    await kv.put(galleryIndexKey(slug), JSON.stringify(indexDoc));
  } catch {
    /* ignore */
  }
  return indexDoc;
}

async function writeGalleryIndex(kv: PhotosKv, slug: string, index: GalleryIndex) {
  index.items.sort((a, b) => a.index - b.index);
  await kv.put(galleryIndexKey(slug), JSON.stringify(index));
}

export async function getPhotoMap(): Promise<Record<string, string>> {
  const kv = await getPhotosKv();
  if (!kv) return {};

  try {
    const map: Record<string, string> = {};
    let cursor: string | undefined;
    do {
      const listed = await kv.list({ prefix: "cars/", limit: 1000, cursor });
      for (const key of listed.keys) {
        if (!key.name.endsWith("/_index")) continue;
        const slug = key.name.slice("cars/".length, -"/_index".length);
        if (!slug) continue;
        const gallery = await getPhotoGallery(slug);
        if (gallery[0]) map[slug] = gallery[0];
      }
      cursor = listed.list_complete ? undefined : listed.cursor;
    } while (cursor);

    // Also scan legacy keys without index
    cursor = undefined;
    do {
      const listed = await kv.list({ prefix: "cars/", limit: 1000, cursor });
      for (const key of listed.keys) {
        const parts = key.name.split("/");
        if (parts.length === 2 && parts[0] === "cars") {
          const slug = parts[1];
          if (!map[slug]) {
            const gallery = await getPhotoGallery(slug);
            if (gallery[0]) map[slug] = gallery[0];
          }
        }
      }
      cursor = listed.list_complete ? undefined : listed.cursor;
    } while (cursor);

    return map;
  } catch {
    return {};
  }
}

export async function getPhotoGallery(slug: string): Promise<string[]> {
  const kv = await getPhotosKv();
  if (!kv || !/^[a-z0-9-]+$/i.test(slug)) return [];

  try {
    const index = await readGalleryIndex(kv, slug);
    return index.items.map((item) =>
      photoUrl(slug, item.index, item.updatedAt, item.ext),
    );
  } catch {
    return [];
  }
}

export async function listUsedIndices(slug: string): Promise<number[]> {
  const kv = await getPhotosKv();
  if (!kv) return [];
  const index = await readGalleryIndex(kv, slug);
  return index.items.map((i) => i.index);
}

export async function putPhoto(
  slug: string,
  data: ArrayBuffer,
  contentType: string,
  ext: string,
  index?: number,
): Promise<PhotoMeta> {
  const kv = await getPhotosKv();
  if (!kv) {
    throw new Error("Хранилище фото не подключено");
  }

  const gallery = await readGalleryIndex(kv, slug);
  const used = new Set(gallery.items.map((i) => i.index));

  let target = index;
  if (target === undefined) {
    target = 0;
    while (used.has(target) && target < MAX_PHOTOS_PER_MODEL) target += 1;
    if (target >= MAX_PHOTOS_PER_MODEL) {
      throw new Error(`Можно загрузить не больше ${MAX_PHOTOS_PER_MODEL} фото`);
    }
  }

  if (target < 0 || target >= MAX_PHOTOS_PER_MODEL) {
    throw new Error("Некорректный номер фото");
  }

  const meta: PhotoMeta = {
    contentType,
    ext,
    updatedAt: Date.now(),
    index: target,
  };

  await kv.put(photoObjectKey(slug, target), data, { metadata: meta });

  const nextItems = gallery.items.filter((i) => i.index !== target);
  nextItems.push({ index: target, ext, updatedAt: meta.updatedAt });
  await writeGalleryIndex(kv, slug, { items: nextItems });

  if (target === 0) {
    try {
      await kv.delete(legacyPhotoKey(slug));
    } catch {
      /* ignore */
    }
  }

  return meta;
}

export async function deletePhoto(slug: string, index: number): Promise<void> {
  const kv = await getPhotosKv();
  if (!kv) {
    throw new Error("Хранилище фото не подключено");
  }
  if (index < 0 || index >= MAX_PHOTOS_PER_MODEL) {
    throw new Error("Некорректный номер фото");
  }
  await kv.delete(photoObjectKey(slug, index));
  if (index === 0) {
    try {
      await kv.delete(legacyPhotoKey(slug));
    } catch {
      /* ignore */
    }
  }

  const gallery = await readGalleryIndex(kv, slug);
  await writeGalleryIndex(kv, slug, {
    items: gallery.items.filter((i) => i.index !== index),
  });
}

export async function getPhoto(
  slug: string,
  index = 0,
): Promise<{ body: ArrayBuffer; meta: PhotoMeta } | null> {
  const kv = await getPhotosKv();
  if (!kv) return null;

  const tryKeys =
    index === 0
      ? [photoObjectKey(slug, 0), legacyPhotoKey(slug)]
      : [photoObjectKey(slug, index)];

  for (const key of tryKeys) {
    const result = await kv.getWithMetadata(key, { type: "arrayBuffer" });
    if (!result.value) continue;

    const meta: PhotoMeta = {
      contentType: result.metadata?.contentType ?? "image/jpeg",
      ext: result.metadata?.ext ?? "jpg",
      updatedAt: result.metadata?.updatedAt ?? Date.now(),
      index: result.metadata?.index ?? index,
    };
    return { body: result.value, meta };
  }

  return null;
}

export function photoKey(brandSlug: string, modelSlug: string) {
  return `${brandSlug}-${modelSlug}`;
}
