const SEGMENTS = 12;

export function ChargeBar({
  valueKm,
  maxKm,
}: {
  valueKm: number;
  maxKm: number;
}) {
  const filled = Math.max(
    1,
    Math.round((valueKm / maxKm) * SEGMENTS)
  );

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-[3px]" aria-hidden="true">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span
            key={i}
            className="h-4 w-1.5 rounded-[1px]"
            style={{
              background: i < filled ? "var(--charge)" : "var(--line)",
            }}
          />
        ))}
      </div>
      <span className="font-mono text-sm text-ink-soft">
        {valueKm} км
      </span>
    </div>
  );
}
