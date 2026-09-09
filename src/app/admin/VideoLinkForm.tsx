"use client";

import { useState } from "react";
import { Link2, Trash2 } from "lucide-react";
import type { VideoReview } from "@/data/videos";

export function VideoLinkForm({
  brandSlug,
  modelSlug,
  initialVideos,
}: {
  brandSlug: string;
  modelSlug: string;
  initialVideos: VideoReview[];
}) {
  const [videos, setVideos] = useState(initialVideos);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title, brandSlug, modelSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");

      setVideos((prev) => [
        ...prev,
        {
          youtubeId: data.youtubeId,
          title: title || "Видеообзор",
          channel: "Добавлено вручную",
          brandSlug,
          modelSlug,
        },
      ]);
      setUrl("");
      setTitle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(youtubeId: string) {
    setVideos((prev) => prev.filter((v) => v.youtubeId !== youtubeId));
    await fetch("/api/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandSlug, modelSlug, youtubeId }),
    }).catch(() => {});
  }

  return (
    <div>
      {videos.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {videos.map((v) => (
            <div
              key={v.youtubeId}
              className="flex items-center justify-between gap-3 rounded-lg border border-line px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">{v.title}</p>
                <p className="font-mono text-[11px] text-ink-soft">
                  {v.channel} · {v.youtubeId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(v.youtubeId)}
                className="shrink-0 text-ink-soft hover:text-red-600"
                aria-label="Удалить видео"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Ссылка на YouTube-видео"
          className="flex-1 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-charge"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название (необязательно)"
          className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-charge sm:w-56"
        />
        <button
          type="submit"
          disabled={loading || !url}
          className="flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-deep disabled:opacity-50"
        >
          <Link2 size={14} />
          {loading ? "Добавляю…" : "Загрузить по ссылке"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
