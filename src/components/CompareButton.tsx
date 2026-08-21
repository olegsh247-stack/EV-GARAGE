"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { useCompare } from "@/lib/compareContext";

export function CompareButton() {
  const { ids } = useCompare();
  const count = ids.length;

  return (
    <Link
      href="/compare"
      className="relative flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-xs text-ink transition-colors hover:border-charge hover:text-charge"
    >
      <Scale size={14} />
      <span className="hidden sm:inline">Сравнить</span>
      {count > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-charge px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
