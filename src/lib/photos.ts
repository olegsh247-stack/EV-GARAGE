import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { B2_BUCKET_NAME, getB2Client } from "./b2";

async function loadPhotoMap(): Promise<Record<string, string>> {
  const client = getB2Client();
  const result = await client.send(
    new ListObjectsV2Command({ Bucket: B2_BUCKET_NAME, Prefix: "cars/" }),
  );
  const map: Record<string, string> = {};

  for (const object of result.Contents ?? []) {
    const filename = object.Key?.split("/").pop() ?? "";
    const match = filename.match(/^(.+)\.(jpg|jpeg|png|webp)$/i);
    if (!match) continue;

    const slug = match[1];
    const extension = match[2].toLowerCase();
    map[slug] = `/api/photos/${encodeURIComponent(slug)}?ext=${extension}&v=${
      object.LastModified?.getTime() ?? 0
    }`;
  }

  return map;
}

export async function getPhotoMap(): Promise<Record<string, string>> {
  if (!process.env.B2_KEY_ID || !process.env.B2_APPLICATION_KEY) return {};

  try {
    return await loadPhotoMap();
  } catch {
    return {};
  }
}

export function photoKey(brandSlug: string, modelSlug: string) {
  return `${brandSlug}-${modelSlug}`;
}
