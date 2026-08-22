"use client";

import { useState } from "react";
import type { ColorOption } from "@/data/cars";

export function ColorSwatches({
  title,
  colors,
}: {
  title: string;
  colors: ColorOption[];
}) {
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {colors.map((color, i) => (
          <button
            key={color.name}
            type="button"
            onClick={() => setSelected(i)}
            title={color.name}
            aria-label={color.name}
            aria-pressed={selected === i}
            className={`h-8 w-10 rounded-md border transition-all ${
              selected === i
                ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-surface-card"
                : "border-line hover:border-ink-soft"
            }`}
            style={{ background: color.hex }}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-ink-soft">{colors[selected]?.name}</p>
    </div>
  );
}
