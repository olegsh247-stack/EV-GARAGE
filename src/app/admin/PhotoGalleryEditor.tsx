"use client";

import { useRef, useState } from "react";
import { CarPhoto } from "@/components/CarPhoto";
import { MAX_PHOTOS_PER_MODEL } from "@/lib/photoConstants";

const MAX_UPLOAD_BYTES = 4_000_000;
const MAX_IMAGE_SIZE = 1800;

function indexFromUrl(url: string): number {
  try {
    const u = new URL(url, "https://local");
    const i = u.searchParams.get("i");
    if (i !== null && /^\d+$/.test(i)) return Number(i);
  } catch {
    /* ignore */
  }
  return 0;
}

async function prepareImage(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD_BYTES && file.type === "image/jpeg") {
    return file;
  }

  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Не удалось обработать изображение");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.78);
  });

  if (!blob) {
    throw new Error("Не удалось подготовить изображение");
  }

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error("Фото слишком большое даже после сжатия. Выберите другое фото.");
  }

  return new File([blob], "model.jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export function PhotoGalleryEditor({
  slug,
  accent,
  initialPhotos,
}: {
  slug: string;
  accent: string;
  initialPhotos: string[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  async function upload(file: File, index?: number) {
    setBusy(true);
    setError("");
    try {
      const prepared = await prepareImage(file);
      const formData = new FormData();
      formData.append("file", prepared);
      formData.append("slug", slug);
      if (index !== undefined) formData.append("index", String(index));

      const response = await fetch("/api/photos/upload-fast", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      const data = (await response.json()) as {
        url?: string;
        index?: number;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Ошибка загрузки");
      }

      const url = `${data.url}&t=${Date.now()}`;
      setPhotos((prev) => {
        if (index !== undefined) {
          const next = [...prev];
          const pos = next.findIndex((p) => indexFromUrl(p) === index);
          if (pos >= 0) next[pos] = url;
          else next.push(url);
          return next.sort((a, b) => indexFromUrl(a) - indexFromUrl(b));
        }
        return [...prev, url].sort((a, b) => indexFromUrl(a) - indexFromUrl(b));
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setBusy(false);
      replaceIndexRef.current = null;
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(index: number) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/photos/delete", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, index }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Ошибка удаления");
      }
      setPhotos((prev) => prev.filter((p) => indexFromUrl(p) !== index));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления");
    } finally {
      setBusy(false);
    }
  }

  const canAdd = photos.length < MAX_PHOTOS_PER_MODEL;

  return (
    <div className="rounded-2xl border border-line bg-surface-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Фото модели
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {photos.length} / {MAX_PHOTOS_PER_MODEL}
          </p>
        </div>
        <button
          type="button"
          disabled={busy || !canAdd}
          onClick={() => {
            replaceIndexRef.current = null;
            inputRef.current?.click();
          }}
          className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-charge hover:text-charge disabled:opacity-50"
        >
          {busy ? "…" : canAdd ? "Добавить фото" : "Лимит 25"}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const idx = replaceIndexRef.current;
          void upload(file, idx === null ? undefined : idx);
        }}
      />

      {photos.length === 0 ? (
        <div className="mt-4">
          <CarPhoto accent={accent} className="h-40 w-full rounded-xl" />
          <p className="mt-2 text-xs text-ink-soft">Пока нет фото</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((url) => {
            const index = indexFromUrl(url);
            return (
              <div key={url} className="relative overflow-hidden rounded-xl border border-line">
                <CarPhoto photoUrl={url} accent={accent} className="h-24 w-full" />
                <div className="flex border-t border-line">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      replaceIndexRef.current = index;
                      inputRef.current?.click();
                    }}
                    className="flex-1 py-1.5 text-[10px] font-medium text-ink hover:text-charge disabled:opacity-50"
                  >
                    Заменить
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void remove(index)}
                    className="flex-1 border-l border-line py-1.5 text-[10px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
