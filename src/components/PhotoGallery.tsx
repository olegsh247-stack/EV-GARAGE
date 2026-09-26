"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarPhoto } from "./CarPhoto";

export function PhotoGallery({
  photos,
  accent,
  alt = "",
}: {
  photos: string[];
  accent?: string;
  alt?: string;
}) {
  const [active, setActive] = useState(0);
  const count = photos.length;

  useEffect(() => {
    setActive((i) => (count === 0 ? 0 : Math.min(i, count - 1)));
  }, [photos, count]);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (count <= 1) return;
      setActive((i) => (i + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, go]);

  if (count === 0) {
    return (
      <CarPhoto
        accent={accent}
        className="h-72 w-full rounded-2xl sm:h-96"
        alt={alt}
      />
    );
  }

  const main = photos[Math.min(active, count - 1)];

  return (
    <div>
      <div className="relative">
        <CarPhoto
          photoUrl={main}
          accent={accent}
          className="h-72 w-full rounded-2xl sm:h-96"
          alt={alt}
          fit="cover"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Предыдущее фото"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-sm backdrop-blur transition-colors hover:border-charge hover:text-charge"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Следующее фото"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-sm backdrop-blur transition-colors hover:border-charge hover:text-charge"
            >
              <ChevronRight size={18} />
            </button>
            <p className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[10px] text-surface">
              {active + 1} / {count}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
          {photos.map((url, i) => {
            const selected = i === active;
            return (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Фото ${i + 1}`}
                aria-current={selected ? "true" : undefined}
                className={`aspect-[4/3] overflow-hidden rounded-lg border-2 transition-colors ${
                  selected
                    ? "border-charge"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <CarPhoto
                  photoUrl={url}
                  accent={accent}
                  className="h-full w-full"
                  alt=""
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
