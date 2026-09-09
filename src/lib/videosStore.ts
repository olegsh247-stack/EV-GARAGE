import { put, head } from "@vercel/blob";
import { videoReviews, type VideoReview } from "@/data/videos";

const VIDEOS_KEY = "meta/videos.json";

async function readVideosBlob(): Promise<VideoReview[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const info = await head(VIDEOS_KEY);
    const res = await fetch(info.url, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return (await res.json()) as VideoReview[];
  } catch {
    return [];
  }
}

async function writeVideosBlob(entries: VideoReview[]) {
  await put(VIDEOS_KEY, JSON.stringify(entries), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

// Все видео сайта — статично добавленные мной (в коде) + добавленные
// через админку по ссылке (хранятся в Blob).
export async function getAllVideos(): Promise<VideoReview[]> {
  const dynamic = await readVideosBlob();
  return [...videoReviews, ...dynamic];
}

export async function getVideosForModel(
  brandSlug: string,
  modelSlug: string
): Promise<VideoReview[]> {
  const all = await getAllVideos();
  return all.filter(
    (v) => v.brandSlug === brandSlug && v.modelSlug === modelSlug
  );
}

// Достаём ID ролика из любой обычной ссылки на YouTube
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
  const dynamic = await readVideosBlob();
  // Не дублируем одно и то же видео для одной модели
  const filtered = dynamic.filter(
    (v) =>
      !(
        v.brandSlug === entry.brandSlug &&
        v.modelSlug === entry.modelSlug &&
        v.youtubeId === entry.youtubeId
      )
  );
  filtered.push(entry);
  await writeVideosBlob(filtered);
}

export async function removeVideo(
  brandSlug: string,
  modelSlug: string,
  youtubeId: string
) {
  const dynamic = await readVideosBlob();
  const filtered = dynamic.filter(
    (v) =>
      !(
        v.brandSlug === brandSlug &&
        v.modelSlug === modelSlug &&
        v.youtubeId === youtubeId
      )
  );
  await writeVideosBlob(filtered);
}
