import { videoReviews, type VideoReview } from "@/data/videos";
import { query, withTransaction } from "@/lib/pg";

type VideoRow = {
  youtube_id: string;
  title: string;
  channel: string;
  brand_slug: string;
  model_slug: string;
};

async function readDynamicVideos(): Promise<VideoReview[]> {
  const result = await query<VideoRow>(
    `SELECT youtube_id, title, channel, brand_slug, model_slug
     FROM videos
     ORDER BY sort_order, id`,
  );
  return result.rows.map((row) => ({
    youtubeId: row.youtube_id,
    title: row.title,
    channel: row.channel,
    brandSlug: row.brand_slug,
    modelSlug: row.model_slug,
  }));
}

export async function getAllVideos(): Promise<VideoReview[]> {
  const dynamic = await readDynamicVideos();
  return [...videoReviews, ...dynamic];
}

export async function getVideosForModel(
  brandSlug: string,
  modelSlug: string,
): Promise<VideoReview[]> {
  const all = await getAllVideos();
  return all.filter(
    (video) => video.brandSlug === brandSlug && video.modelSlug === modelSlug,
  );
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  ];
  for (const re of patterns) {
    const match = url.match(re);
    if (match) return match[1];
  }
  return null;
}

export async function addVideo(entry: VideoReview) {
  await withTransaction(async (client) => {
    await client.query(
      `DELETE FROM videos
       WHERE brand_slug = $1 AND model_slug = $2 AND youtube_id = $3`,
      [entry.brandSlug, entry.modelSlug, entry.youtubeId],
    );
    const next = await client.query<{ n: number }>(
      "SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM videos",
    );
    await client.query(
      `INSERT INTO videos (youtube_id, title, channel, brand_slug, model_slug, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        entry.youtubeId,
        entry.title,
        entry.channel,
        entry.brandSlug,
        entry.modelSlug,
        next.rows[0].n,
      ],
    );
  });
}

export async function removeVideo(
  brandSlug: string,
  modelSlug: string,
  youtubeId: string,
) {
  await query(
    `DELETE FROM videos
     WHERE brand_slug = $1 AND model_slug = $2 AND youtube_id = $3`,
    [brandSlug, modelSlug, youtubeId],
  );
}
