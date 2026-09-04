import { put, head } from "@vercel/blob";

const ARCHIVE_KEY = "meta/archived-models.json";

export type ArchivedEntry = {
  key: string; // "brandSlug/modelSlug"
  archivedAt: string;
  note?: string;
};

async function readArchiveBlob(): Promise<ArchivedEntry[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const info = await head(ARCHIVE_KEY);
    const res = await fetch(info.url, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return (await res.json()) as ArchivedEntry[];
  } catch {
    return [];
  }
}

async function writeArchiveBlob(entries: ArchivedEntry[]) {
  await put(ARCHIVE_KEY, JSON.stringify(entries), {
    access: "public",
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
