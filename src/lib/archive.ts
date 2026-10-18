import { query } from "@/lib/pg";

export type ArchivedEntry = {
  key: string;
  archivedAt: string;
  note?: string;
};

type ArchiveRow = {
  brand_slug: string;
  model_slug: string;
  archived_at: Date;
  note: string | null;
};

export async function getArchivedEntries(): Promise<ArchivedEntry[]> {
  const result = await query<ArchiveRow>(
    `SELECT brand_slug, model_slug, archived_at, note
     FROM archived_models
     ORDER BY archived_at, brand_slug, model_slug`,
  );
  return result.rows.map((row) => ({
    key: `${row.brand_slug}/${row.model_slug}`,
    archivedAt: new Date(row.archived_at).toISOString(),
    note: row.note ?? undefined,
  }));
}

export async function getArchivedModelKeys(): Promise<Set<string>> {
  const entries = await getArchivedEntries();
  return new Set(entries.map((entry) => entry.key));
}

export async function setArchived(
  brandSlug: string,
  modelSlug: string,
  archived: boolean,
  note?: string,
) {
  if (archived) {
    await query(
      `INSERT INTO archived_models (brand_slug, model_slug, archived_at, note)
       VALUES ($1, $2, now(), $3)
       ON CONFLICT (brand_slug, model_slug) DO UPDATE SET
         archived_at = now(),
         note = EXCLUDED.note`,
      [brandSlug, modelSlug, note ?? null],
    );
    return;
  }
  await query(
    "DELETE FROM archived_models WHERE brand_slug = $1 AND model_slug = $2",
    [brandSlug, modelSlug],
  );
}

export function modelKey(brandSlug: string, modelSlug: string) {
  return `${brandSlug}/${modelSlug}`;
}
