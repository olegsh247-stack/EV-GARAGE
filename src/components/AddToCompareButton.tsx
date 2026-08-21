"use client";

import { Check, Scale } from "lucide-react";
import { useCompare, COMPARE_MAX } from "@/lib/compareContext";

export function AddToCompareButton({ id }: { id: string }) {
  const { isSelected, toggle, isFull } = useCompare();
  const selected = isSelected(id);
  const disabled = !selected && isFull;

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors sm:w-auto ${
        selected
          ? "border-charge bg-charge/10 text-charge"
          : disabled
            ? "cursor-not-allowed border-line text-ink-soft/50"
            : "border-line text-ink hover:border-charge hover:text-charge"
      }`}
      title={disabled ? `Максимум ${COMPARE_MAX} версии — уберите одну` : undefined}
    >
      {selected ? <Check size={15} /> : <Scale size={15} />}
      {selected ? "В сравнении" : "Добавить к сравнению"}
    </button>
  );
}
