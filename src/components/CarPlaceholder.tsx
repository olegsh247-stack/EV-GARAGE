export function CarPlaceholder({
  accent = "#0EA5A0",
  className = "",
}: {
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background:
          "repeating-linear-gradient(135deg, #eef1f3 0px, #eef1f3 10px, #e6eaed 10px, #e6eaed 20px)",
      }}
    >
      <svg
        viewBox="0 0 240 120"
        className="w-2/3"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M20 88 C20 70 34 66 50 62 L72 40 C78 33 88 29 98 29 L150 29 C160 29 169 33 175 41 L190 62 C204 65 220 70 220 88"
          stroke={accent}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <line x1="12" y1="88" x2="228" y2="88" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <circle cx="62" cy="90" r="12" fill="#131A24" />
        <circle cx="178" cy="90" r="12" fill="#131A24" />
        <path
          d="M128 46 L118 62 L130 62 L120 78"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute bottom-2 right-2 rounded-full bg-white/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
        Фото скоро
      </span>
    </div>
  );
}
