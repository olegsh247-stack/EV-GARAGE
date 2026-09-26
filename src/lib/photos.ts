import { getCloudflareContext } from "@opennextjs/cloudflare";

export type PhotoMeta = {
  contentType: string;
  ext: string;
  updatedAt: number;
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
};

function photoObjectKey(slug: string) {
  return `cars/${slug}`;
}

async function getPhotosKv(): Promise<PhotosKv | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return ((env as { PHOTOS_KV?: PhotosKv }).PHOTOS_KV) ?? null;
  } catch {
    return null;
  }
}

export async function getPhotoMap(): Promise<Record<string, string>> {
  const kv = await getPhotosKv();
  if (!kv) return {};

  try {
    const listed = await kv.list({ prefix: "cars/" });
    const map: Record<string, string> = {};

    for (const key of listed.keys) {
      const slug = key.name.replace(/^cars\//, "");
      if (!slug || slug.includes("/")) continue;

      const meta = (key.metadata ?? {}) as Partial<PhotoMeta>;
      const ext = meta.ext ?? "jpg";
      const version = meta.updatedAt ?? Date.now();
      map[slug] = `/api/photos/${encodeURIComponent(slug)}?ext=${ext}&v=${version}`;
    }

    return map;
  } catch {
    return {};
  }
}

export async function putPhoto(
  slug: string,
  data: ArrayBuffer,
  contentType: string,
  ext: string,
): Promise<PhotoMeta> {
  const kv = await getPhotosKv();
  if (!kv) {
    throw new Error("Хранилище фото не подключено");
  }

  const meta: PhotoMeta = {
    contentType,
    ext,
    updatedAt: Date.now(),
  };

  await kv.put(photoObjectKey(slug), data, { metadata: meta });
  return meta;
}

export async function getPhoto(
  slug: string,
): Promise<{ body: ArrayBuffer; meta: PhotoMeta } | null> {
  const kv = await getPhotosKv();
  if (!kv) return null;

  const result = await kv.getWithMetadata(photoObjectKey(slug), {
    type: "arrayBuffer",
  });

  if (!result.value) return null;

  const meta: PhotoMeta = {
    contentType: result.metadata?.contentType ?? "image/jpeg",
    ext: result.metadata?.ext ?? "jpg",
    updatedAt: result.metadata?.updatedAt ?? Date.now(),
  };

  return { body: result.value, meta };
}

export function photoKey(brandSlug: string, modelSlug: string) {
  return `${brandSlug}-${modelSlug}`;
}
