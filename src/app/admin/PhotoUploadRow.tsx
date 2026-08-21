"use client";

import { useRef, useState } from "react";
import { CarPhoto } from "@/components/CarPhoto";

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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", slug);

    try {
      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка загрузки");
      // добавляем метку времени, чтобы браузер не показывал старую версию из кэша
      setUrl(`${data.url}?t=${Date.now()}`);
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
