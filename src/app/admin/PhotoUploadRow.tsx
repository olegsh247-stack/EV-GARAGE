"use client";

import { useRef, useState } from "react";
import { CarPhoto } from "@/components/CarPhoto";

const MAX_UPLOAD_BYTES = 4_000_000;
const MAX_IMAGE_SIZE = 1800;

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

export function PhotoUploadRow({
  slug,
  label,
  accent,
  initialUrl,
}: {
  slug: string;
  label: string;
  accent: string;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");

    try {
      const preparedFile = await prepareImage(file);
      const formData = new FormData();
      formData.append("file", preparedFile);
      formData.append("slug", slug);

      const response = await fetch("/api/photos/upload-fast", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Ошибка загрузки");
      }

      // Добавляем метку времени, чтобы браузер не показывал старую версию из кэша.
      setUrl(`${data.url}&t=${Date.now()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
      <CarPhoto
        photoUrl={url}
        accent={accent}
        className="h-16 w-24 shrink-0 rounded-lg"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{label}</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="shrink-0 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-charge hover:text-charge disabled:opacity-50"
      >
        {uploading ? "Загрузка…" : url ? "Заменить" : "Загрузить"}
      </button>
    </div>
  );
}
