import { query } from "@/lib/pg";

export type SuggestionStatus = "pending" | "approved" | "rejected";

type StatusRow = {
  suggestion_id: string;
  status: SuggestionStatus;
};

export async function getSuggestionStatuses(): Promise<
  Record<string, SuggestionStatus>
> {
  const result = await query<StatusRow>(
    "SELECT suggestion_id, status FROM suggestion_statuses",
  );
  const map: Record<string, SuggestionStatus> = {};
  for (const row of result.rows) map[row.suggestion_id] = row.status;
  return map;
}

export async function getPendingSuggestionCount(): Promise<number> {
  const { suggestions } = await import("@/data/suggestions");
  const statuses = await getSuggestionStatuses();
  return suggestions.filter((item) => (statuses[item.id] ?? "pending") === "pending")
    .length;
}

export async function setSuggestionStatus(id: string, status: SuggestionStatus) {
  await query(
    `INSERT INTO suggestion_statuses (suggestion_id, status, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (suggestion_id) DO UPDATE SET
       status = EXCLUDED.status,
       updated_at = now()`,
    [id, status],
  );
}
