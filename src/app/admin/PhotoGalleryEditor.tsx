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

function orderKey(urls: string[]) {
  return urls.map(indexFromUrl).join(",");
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

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
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
  const [savedKey, setSavedKey] = useState(() => orderKey(initialPhotos));
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  const dirty = orderKey(photos) !== savedKey;

  async function uploadOne(file: File, index?: number): Promise<string> {
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

    return `${data.url}&t=${Date.now()}`;
  }

  async function uploadMany(files: FileList | File[], replaceIndex?: number) {
    setBusy(true);
    setError("");
    setOk("");
    setProgress("");

    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      setBusy(false);
      setError("Выберите изображения");
      return;
    }

    try {
      if (replaceIndex !== undefined) {
        const url = await uploadOne(list[0], replaceIndex);
        setPhotos((prev) => {
          const next = [...prev];
          const pos = next.findIndex((p) => indexFromUrl(p) === replaceIndex);
          if (pos >= 0) next[pos] = url;
          else next.push(url);
          setSavedKey(orderKey(next));
          return next;
        });
      } else {
        const freeSlots = MAX_PHOTOS_PER_MODEL - photos.length;
        const batch = list.slice(0, freeSlots);
        if (batch.length === 0) {
          throw new Error(`Лимит ${MAX_PHOTOS_PER_MODEL} фото`);
        }
        if (list.length > batch.length) {
          setError(`Загружено ${batch.length} из ${list.length} (лимит ${MAX_PHOTOS_PER_MODEL})`);
        }

        let next = photos;
        for (let i = 0; i < batch.length; i++) {
          setProgress(`${i + 1} / ${batch.length}`);
          const url = await uploadOne(batch[i]);
          next = [...next, url];
          setPhotos(next);
        }
        setSavedKey(orderKey(next));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setBusy(false);
      setProgress("");
      replaceIndexRef.current = null;
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(index: number) {
    setBusy(true);
    setError("");
    setOk("");
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
      setPhotos((prev) => {
        const next = prev.filter((p) => indexFromUrl(p) !== index);
        setSavedKey(orderKey(next));
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления");
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    setBusy(true);
    setError("");
    setOk("");
    try {
      const order = photos.map(indexFromUrl);
      const response = await fetch("/api/photos/reorder", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, order }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Не удалось сохранить");
      }
      setSavedKey(orderKey(photos));
      setOk("Сохранено");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setBusy(false);
    }
  }

  function finishDrag(from: number, to: number) {
    if (from === to || from < 0 || to < 0) {
      setDragFrom(null);
      setDragOver(null);
      return;
    }
    setPhotos((prev) => moveItem(prev, from, to));
    setOk("");
    setDragFrom(null);
    setDragOver(null);
  }

  function onPointerDown(e: React.PointerEvent, index: number) {
    if (busy) return;
    if ((e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragFrom(index);
    setDragOver(index);
  }

  function onPointerEnter(index: number) {
    if (dragFrom === null) return;
    setDragOver(index);
  }

  function onPointerUp() {
    if (dragFrom === null) return;
    const from = dragFrom;
    const to = dragOver ?? dragFrom;
    finishDrag(from, to);
  }

  const canAdd = photos.length < MAX_PHOTOS_PER_MODEL;

  return (
    <div className="rounded-2xl border border-line bg-surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Фото модели
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {photos.length} / {MAX_PHOTOS_PER_MODEL}
            {progress ? ` · ${progress}` : ""}
          </p>
          {photos.length > 1 && (
            <p className="mt-1 text-[11px] text-ink-soft">
              Перетащите фото, затем нажмите «Сохранить»
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !canAdd}
            onClick={() => {
              replaceIndexRef.current = null;
              inputRef.current?.click();
            }}
            className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-charge hover:text-charge disabled:opacity-50"
          >
            {canAdd ? "Добавить фото" : "Лимит 25"}
          </button>
          <button
            type="button"
            disabled={busy || !dirty}
            onClick={() => void handleSave()}
            className="rounded-full border border-ink bg-ink px-4 py-2 text-xs font-medium text-surface transition-opacity disabled:opacity-40"
          >
            {busy ? "…" : "Сохранить"}
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      {ok && !error && <p className="mt-3 text-xs text-green-700">{ok}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (!files?.length) return;
          const idx = replaceIndexRef.current;
          void uploadMany(files, idx === null ? undefined : idx);
        }}
      />

      {photos.length === 0 ? (
        <div className="mt-4">
          <CarPhoto accent={accent} className="h-40 w-full rounded-xl" />
          <p className="mt-2 text-xs text-ink-soft">
            Пока нет фото. Можно выбрать сразу несколько файлов.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((url, pos) => {
            const index = indexFromUrl(url);
            const isDragging = dragFrom === pos;
            const isOver = dragOver === pos && dragFrom !== null && dragFrom !== pos;
            return (
              <div
                key={url}
                onPointerDown={(e) => onPointerDown(e, pos)}
                onPointerEnter={() => onPointerEnter(pos)}
                onPointerUp={onPointerUp}
                onPointerCancel={() => {
                  setDragFrom(null);
                  setDragOver(null);
                }}
                className={`relative touch-none overflow-hidden rounded-xl border bg-surface select-none ${
                  isDragging
                    ? "border-charge opacity-60"
                    : isOver
                      ? "border-charge"
                      : "border-line"
                } ${busy ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}
              >
                <CarPhoto photoUrl={url} accent={accent} className="h-24 w-full pointer-events-none" />
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
