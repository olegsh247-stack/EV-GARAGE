import { getCloudflareContext } from "@opennextjs/cloudflare";

export const MAX_PHOTOS_PER_MODEL = 25;

export type PhotoMeta = {
  contentType: string;
  ext: string;
  updatedAt: number;
  index: number;
};

type PhotosKv = {
  list: (options: {
    prefix?: string;
  }) => Promise<{ keys: Array<{ name: string; metadata?: unknown }> }>;
  put: (
    key: string,
    value: ArrayBuffer,
    options?: { metadata?: PhotoMeta },
  ) => Promise<void>;
  getWithMetadata: (
    key: string,
    options: { type: "arrayBuffer" },
  ) => Promise<{ value: ArrayBuffer | null; metadata: PhotoMeta | null }>;
  delete: (key: string) => Promise<void>;
};

function photoObjectKey(slug: string, index: number) {
  return `cars/${slug}/${index}`;
}

/** Legacy single-photo key from the first KV version. */
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

function parseIndexFromKey(name: string, slug: string): number | null {
  const prefix = `cars/${slug}/`;
  if (name.startsWith(prefix)) {
    const rest = name.slice(prefix.length);
    if (/^\d+$/.test(rest)) return Number(rest);
    return null;
  }
  if (name === legacyPhotoKey(slug)) return 0;
  return null;
}

/** First photo URL per model — for cards and lists. */
export async function getPhotoMap(): Promise<Record<string, string>> {
  const galleries = await getAllGalleries();
  const map: Record<string, string> = {};
  for (const [slug, urls] of Object.entries(galleries)) {
    if (urls[0]) map[slug] = urls[0];
  }
  return map;
}

/** All photo URLs for one model, ordered by index. */
export async function getPhotoGallery(slug: string): Promise<string[]> {
  const kv = await getPhotosKv();
  if (!kv || !/^[a-z0-9-]+$/i.test(slug)) return [];

  try {
    const listed = await kv.list({ prefix: `cars/${slug}` });
    const entries: Array<{ index: number; url: string }> = [];

    for (const key of listed.keys) {
      const index = parseIndexFromKey(key.name, slug);
      if (index === null || index < 0 || index >= MAX_PHOTOS_PER_MODEL) continue;
      const meta = (key.metadata ?? {}) as Partial<PhotoMeta>;
      const ext = meta.ext ?? "jpg";
      const version = meta.updatedAt ?? Date.now();
      entries.push({ index, url: photoUrl(slug, index, version, ext) });
    }

    entries.sort((a, b) => a.index - b.index);
    return entries.map((e) => e.url);
  } catch {
    return [];
  }
}

async function getAllGalleries(): Promise<Record<string, string[]>> {
  const kv = await getPhotosKv();
  if (!kv) return {};

  try {
    const listed = await kv.list({ prefix: "cars/" });
    const bySlug = new Map<string, Array<{ index: number; url: string }>>();

    for (const key of listed.keys) {
      // cars/{slug}/{i} or legacy cars/{slug}
      const parts = key.name.split("/");
      if (parts[0] !== "cars" || parts.length < 2) continue;

      const slug = parts[1];
      let index: number;
      if (parts.length === 2) {
        index = 0;
      } else if (parts.length === 3 && /^\d+$/.test(parts[2])) {
        index = Number(parts[2]);
      } else {
        continue;
      }

      if (index < 0 || index >= MAX_PHOTOS_PER_MODEL) continue;

      const meta = (key.metadata ?? {}) as Partial<PhotoMeta>;
      const ext = meta.ext ?? "jpg";
      const version = meta.updatedAt ?? Date.now();
      const list = bySlug.get(slug) ?? [];
      list.push({ index, url: photoUrl(slug, index, version, ext) });
      bySlug.set(slug, list);
    }

    const result: Record<string, string[]> = {};
    for (const [slug, entries] of bySlug) {
      entries.sort((a, b) => a.index - b.index);
      result[slug] = entries.map((e) => e.url);
    }
    return result;
  } catch {
    return {};
  }
}

export async function listUsedIndices(slug: string): Promise<number[]> {
  const kv = await getPhotosKv();
  if (!kv) return [];

  const listed = await kv.list({ prefix: `cars/${slug}` });
  const indices: number[] = [];
  for (const key of listed.keys) {
    const index = parseIndexFromKey(key.name, slug);
    if (index !== null && index >= 0 && index < MAX_PHOTOS_PER_MODEL) {
      indices.push(index);
    }
  }
  return [...new Set(indices)].sort((a, b) => a - b);
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

  let target = index;
  if (target === undefined) {
    const used = await listUsedIndices(slug);
    target = 0;
    while (used.includes(target) && target < MAX_PHOTOS_PER_MODEL) target += 1;
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

  // Drop legacy single key if we now use indexed keys
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
