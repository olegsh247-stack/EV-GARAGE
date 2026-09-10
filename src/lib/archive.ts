import { get, put } from "@vercel/blob";

const ARCHIVE_KEY = "meta/archived-models.json";

export type ArchivedEntry = {
  key: string; // "brandSlug/modelSlug"
  archivedAt: string;
  note?: string;
};

async function readArchiveBlob(): Promise<ArchivedEntry[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const result = await get(ARCHIVE_KEY, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return [];
    return (await new Response(result.stream).json()) as ArchivedEntry[];
  } catch {
    return [];
  }
}

async function writeArchiveBlob(entries: ArchivedEntry[]) {
  await put(ARCHIVE_KEY, JSON.stringify(entries), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getArchivedModelKeys(): Promise<Set<string>> {
  const entries = await readArchiveBlob();
  return new Set(entries.map((e) => e.key));
}

export async function getArchivedEntries(): Promise<ArchivedEntry[]> {
  return readArchiveBlob();
}

export async function setArchived(
  brandSlug: string,
  modelSlug: string,
  archived: boolean,
  note?: string
) {
  const key = `${brandSlug}/${modelSlug}`;
  const entries = await readArchiveBlob();
  const filtered = entries.filter((e) => e.key !== key);
  if (archived) {
    filtered.push({ key, archivedAt: new Date().toISOString(), note });
  }
  await writeArchiveBlob(filtered);
}

export function modelKey(brandSlug: string, modelSlug: string) {
  return `${brandSlug}/${modelSlug}`;
}
