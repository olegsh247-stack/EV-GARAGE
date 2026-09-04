import { put, head } from "@vercel/blob";

const STATUS_KEY = "meta/suggestion-status.json";

export type SuggestionStatus = "pending" | "approved" | "rejected";

async function readStatusBlob(): Promise<Record<string, SuggestionStatus>> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return {};
  try {
    const info = await head(STATUS_KEY);
    const res = await fetch(info.url, { next: { revalidate: 30 } });
    if (!res.ok) return {};
    return (await res.json()) as Record<string, SuggestionStatus>;
  } catch {
    return {};
  }
}

async function writeStatusBlob(map: Record<string, SuggestionStatus>) {
  await put(STATUS_KEY, JSON.stringify(map), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getSuggestionStatuses(): Promise<
  Record<string, SuggestionStatus>
> {
  return readStatusBlob();
}

export async function setSuggestionStatus(
  id: string,
  status: SuggestionStatus
) {
  const map = await readStatusBlob();
  map[id] = status;
  await writeStatusBlob(map);
}
