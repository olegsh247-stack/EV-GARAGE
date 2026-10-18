export const MAX_PHOTOS_PER_MODEL = 25;
export const MAX_UPLOAD_BYTES = 4_000_000;

export const PHOTO_EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type PhotoContentType = keyof typeof PHOTO_EXT_BY_TYPE;

export function photoKey(brandSlug: string, modelSlug: string) {
  return `${brandSlug}-${modelSlug}`;
}
