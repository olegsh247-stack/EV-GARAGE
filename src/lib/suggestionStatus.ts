import { get, put } from "@vercel/blob";

const STATUS_KEY = "meta/suggestion-status.json";

export type SuggestionStatus = "pending" | "approved" | "rejected";

async function readStatusBlob(): Promise<Record<string, SuggestionStatus>> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return {};
  try {
    const result = await get(STATUS_KEY, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return {};
    return (await new Response(result.stream).json()) as Record<string, SuggestionStatus>;
  } catch {
    return {};
  }
}

async function writeStatusBlob(map: Record<string, SuggestionStatus>) {
  await put(STATUS_KEY, JSON.stringify(map), {
    access: "private",
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

export async function getPendingSuggestionCount(): Promise<number> {
  const { suggestions } = await import("@/data/suggestions");
  const statuses = await readStatusBlob();
  return suggestions.filter((s) => (statuses[s.id] ?? "pending") === "pending")
    .length;
}

export async function setSuggestionStatus(
  id: string,
  status: SuggestionStatus
) {
  const map = await readStatusBlob();
  map[id] = status;
  await writeStatusBlob(map);
}
