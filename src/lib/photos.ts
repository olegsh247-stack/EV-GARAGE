import fs from "node:fs/promises";
import path from "node:path";
import { HttpError } from "@/lib/httpError";
import {
  MAX_PHOTOS_PER_MODEL,
  MAX_UPLOAD_BYTES,
  PHOTO_EXT_BY_TYPE,
  photoKey,
  type PhotoContentType,
} from "@/lib/photoConstants";
import { query, withTransaction } from "@/lib/pg";

export { MAX_PHOTOS_PER_MODEL, photoKey };

export type PhotoMeta = {
  contentType: string;
  ext: string;
  updatedAt: number;
  index: number;
};

type PhotoRow = {
  photo_key: string;
  photo_index: number;
  sort_position: number;
  object_key: string;
  content_type: string;
  ext: string;
  byte_size: number;
  updated_at: Date;
};

function isSlug(slug: string) {
  return /^[a-z0-9-]+$/i.test(slug);
}

function photosRoot() {
  const dir = process.env.PHOTOS_DIR?.trim();
  if (!dir) throw new Error("PHOTOS_DIR is not set");
  return path.resolve(dir);
}

function objectKeyFor(slug: string, index: number, ext: string) {
  return `photos/${slug}/${index}.${ext}`;
}

function resolveSafe(objectKey: string) {
  const root = photosRoot();
  const parts = objectKey.split("/").filter((part) => part && part !== "." && part !== "..");
  const full = path.resolve(root, ...parts);
  const relative = path.relative(root, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Некорректный путь фото");
  }
  return full;
}

function photoUrl(slug: string, index: number, version: number, ext: string) {
  return `/api/photos/${encodeURIComponent(slug)}?i=${index}&ext=${ext}&v=${version}`;
}

function toMillis(value: Date | string) {
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? Date.now() : ms;
}

/** Проверка по первым байтам: заявленный тип должен совпадать с настоящим файлом. */
function looksLike(contentType: string, data: Uint8Array) {
  const at = (i: number, ...bytes: number[]) => bytes.every((b, k) => data[i + k] === b);
  if (contentType === "image/jpeg") return at(0, 0xff, 0xd8, 0xff);
  if (contentType === "image/png") return at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  if (contentType === "image/webp") {
    return at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50);
  }
  return false;
}

function extensionFor(contentType: string, ext: string) {
  const expected = PHOTO_EXT_BY_TYPE[contentType as PhotoContentType];
  if (!expected || expected !== ext) {
    throw new HttpError("Разрешены только JPG, PNG или WEBP", 400);
  }
  return expected;
}

async function placeFile(objectKey: string, data: Buffer) {
  const finalPath = resolveSafe(objectKey);
  const partialPath = `${finalPath}.partial`;
  const backupPath = `${finalPath}.bak`;
  await fs.mkdir(path.dirname(finalPath), { recursive: true });
  await fs.writeFile(partialPath, data);

  let replaced = false;
  try {
    try {
      await fs.rename(finalPath, backupPath);
      replaced = true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    await fs.rename(partialPath, finalPath);
  } catch (error) {
    if (replaced) {
      await fs.rename(backupPath, finalPath).catch((restoreError) => {
        console.error(
          "[photos] failed to restore previous object",
          objectKey,
          (restoreError as Error).message,
        );
      });
    }
    await fs.rm(partialPath, { force: true }).catch((cleanupError) => {
      console.error(
        "[photos] failed to remove partial upload",
        objectKey,
        (cleanupError as Error).message,
      );
    });
    throw error;
  }

  return {
    async commit() {
      if (replaced) {
        await fs.rm(backupPath, { force: true }).catch((error) => {
          console.error(
            "[photos] failed to remove backup",
            objectKey,
            (error as Error).message,
          );
        });
      }
    },
    async rollback() {
      await fs.rm(finalPath, { force: true }).catch((error) => {
        console.error(
          "[photos] failed to remove new object",
          objectKey,
          (error as Error).message,
        );
      });
      if (replaced) {
        await fs.rename(backupPath, finalPath).catch((error) => {
          console.error(
            "[photos] failed to restore previous object",
            objectKey,
            (error as Error).message,
          );
        });
      }
    },
  };
}

export async function getPhotoMap(): Promise<Record<string, string>> {
  const result = await query<PhotoRow>(
    `SELECT DISTINCT ON (photo_key) photo_key, photo_index, ext, updated_at
     FROM photos
     ORDER BY photo_key, sort_position, photo_index`,
  );
  const map: Record<string, string> = {};
  for (const row of result.rows) {
    map[row.photo_key] = photoUrl(
      row.photo_key,
      row.photo_index,
      toMillis(row.updated_at),
      row.ext,
    );
  }
  return map;
}

export async function getPhotoGallery(slug: string): Promise<string[]> {
  if (!isSlug(slug)) return [];
  const result = await query<PhotoRow>(
    `SELECT photo_index, ext, updated_at
     FROM photos
     WHERE photo_key = $1
     ORDER BY sort_position, photo_index`,
    [slug],
  );
  return result.rows.map((row) =>
    photoUrl(slug, row.photo_index, toMillis(row.updated_at), row.ext),
  );
}

export async function listUsedIndices(slug: string): Promise<number[]> {
  if (!isSlug(slug)) return [];
  const result = await query<{ photo_index: number }>(
    "SELECT photo_index FROM photos WHERE photo_key = $1 ORDER BY sort_position, photo_index",
    [slug],
  );
  return result.rows.map((row) => row.photo_index);
}

export async function reorderPhotos(slug: string, order: number[]): Promise<void> {
  if (!isSlug(slug)) throw new HttpError("Некорректная модель", 400);

  await withTransaction(async (client) => {
    const existing = await client.query<{ photo_index: number }>(
      "SELECT photo_index FROM photos WHERE photo_key = $1 ORDER BY sort_position, photo_index",
      [slug],
    );
    const current = existing.rows.map((row) => row.photo_index);
    if (order.length !== current.length) {
      throw new HttpError("Неверный порядок фото", 400);
    }
    const known = new Set(current);
    const seen = new Set<number>();
    for (const index of order) {
      if (!Number.isInteger(index) || seen.has(index) || !known.has(index)) {
        throw new HttpError("Неверный порядок фото", 400);
      }
      seen.add(index);
    }

    await client.query(
      "UPDATE photos SET sort_position = -sort_position - 1 WHERE photo_key = $1",
      [slug],
    );
    for (let position = 0; position < order.length; position += 1) {
      await client.query(
        "UPDATE photos SET sort_position = $3 WHERE photo_key = $1 AND photo_index = $2",
        [slug, order[position], position],
      );
    }
  });
}

export async function putPhoto(
  slug: string,
  data: ArrayBuffer,
  contentType: string,
  ext: string,
  index?: number,
): Promise<PhotoMeta> {
  if (!isSlug(slug)) throw new HttpError("Некорректная модель", 400);
  extensionFor(contentType, ext);
  if (!looksLike(contentType, new Uint8Array(data, 0, Math.min(12, data.byteLength)))) {
    throw new HttpError("Файл не является изображением заявленного формата", 400);
  }
  if (data.byteLength > MAX_UPLOAD_BYTES) {
    throw new HttpError("Фото слишком большое. Попробуйте выбрать другое фото.", 413);
  }
  if (
    index !== undefined &&
    (!Number.isInteger(index) || index < 0 || index >= MAX_PHOTOS_PER_MODEL)
  ) {
    throw new HttpError("Некорректный номер фото", 400);
  }

  const existing = await query<PhotoRow>(
    "SELECT photo_index, sort_position, object_key FROM photos WHERE photo_key = $1",
    [slug],
  );
  const used = new Set(existing.rows.map((row) => row.photo_index));
  let target = index;
  if (target === undefined) {
    target = 0;
    while (used.has(target) && target < MAX_PHOTOS_PER_MODEL) target += 1;
    if (target >= MAX_PHOTOS_PER_MODEL) {
      throw new HttpError(`Можно загрузить не больше ${MAX_PHOTOS_PER_MODEL} фото`, 400);
    }
  }

  const previous = existing.rows.find((row) => row.photo_index === target);
  const nextPosition = previous
    ? previous.sort_position
    : existing.rows.reduce((max, row) => Math.max(max, row.sort_position), -1) + 1;
  const objectKey = objectKeyFor(slug, target, ext);
  const updatedAt = new Date();
  const placed = await placeFile(objectKey, Buffer.from(data));

  try {
    if (previous) {
      await query(
        `UPDATE photos SET
           object_key = $3,
           content_type = $4,
           ext = $5,
           byte_size = $6,
           updated_at = $7
         WHERE photo_key = $1 AND photo_index = $2`,
        [slug, target, objectKey, contentType, ext, data.byteLength, updatedAt],
      );
    } else {
      await query(
        `INSERT INTO photos (
           photo_key, photo_index, sort_position, object_key, content_type, ext, byte_size, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [slug, target, nextPosition, objectKey, contentType, ext, data.byteLength, updatedAt],
      );
    }
  } catch (error) {
    await placed.rollback();
    throw error;
  }

  await placed.commit();
  if (previous && previous.object_key !== objectKey) {
    await fs.rm(resolveSafe(previous.object_key), { force: true }).catch((error) => {
      console.error(
        "[photos] failed to delete replaced object",
        previous.object_key,
        (error as Error).message,
      );
    });
  }

  return {
    contentType,
    ext,
    updatedAt: updatedAt.getTime(),
    index: target,
  };
}

export async function deletePhoto(slug: string, index: number): Promise<void> {
  if (!isSlug(slug)) throw new HttpError("Некорректная модель", 400);
  if (!Number.isInteger(index) || index < 0 || index >= MAX_PHOTOS_PER_MODEL) {
    throw new HttpError("Некорректный номер фото", 400);
  }

  const existing = await query<PhotoRow>(
    "SELECT object_key FROM photos WHERE photo_key = $1 AND photo_index = $2",
    [slug, index],
  );
  const row = existing.rows[0];
  if (!row) return;

  await query("DELETE FROM photos WHERE photo_key = $1 AND photo_index = $2", [
    slug,
    index,
  ]);
  try {
    await fs.rm(resolveSafe(row.object_key), { force: true });
  } catch (error) {
    console.error(
      "[photos] failed to delete object",
      row.object_key,
      (error as Error).message,
    );
    throw error;
  }
}

export async function getPhoto(
  slug: string,
  index = 0,
): Promise<{ body: ArrayBuffer; meta: PhotoMeta } | null> {
  if (!isSlug(slug) || !Number.isInteger(index) || index < 0) return null;
  const result = await query<PhotoRow>(
    `SELECT photo_index, content_type, ext, updated_at, object_key
     FROM photos
     WHERE photo_key = $1 AND photo_index = $2`,
    [slug, index],
  );
  const row = result.rows[0];
  if (!row) return null;

  let bytes: Buffer;
  try {
    bytes = await fs.readFile(resolveSafe(row.object_key));
  } catch (error) {
    console.error(
      "[photos] object missing or unreadable",
      row.object_key,
      (error as NodeJS.ErrnoException).code ?? (error as Error).message,
    );
    throw new Error("Файл фотографии не найден в хранилище");
  }

  const body = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  return {
    body,
    meta: {
      contentType: row.content_type,
      ext: row.ext,
      updatedAt: toMillis(row.updated_at),
      index: row.photo_index,
    },
  };
}
