"use client";

import { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import type { SuggestionStatus } from "@/lib/suggestionStatus";

export function SuggestionActions({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus: SuggestionStatus;
}) {
  const [status, setStatus] = useState<SuggestionStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  async function setNew(next: SuggestionStatus) {
    setLoading(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (res.ok) setStatus(next);
    } finally {
      setLoading(false);
    }
  }

  if (status === "approved") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-charge/10 px-3 py-1.5 text-xs font-medium text-charge">
          <Check size={13} /> Одобрено
        </span>
        <button
          type="button"
          onClick={() => setNew("pending")}
          disabled={loading}
          className="text-ink-soft hover:text-ink"
          title="Вернуть в ожидание"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-line px-3 py-1.5 text-xs font-medium text-ink-soft">
          <X size={13} /> Отклонено
        </span>
        <button
          type="button"
          onClick={() => setNew("pending")}
          disabled={loading}
          className="text-ink-soft hover:text-ink"
          title="Вернуть в ожидание"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setNew("approved")}
        disabled={loading}
        className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-charge hover:text-charge disabled:opacity-50"
      >
        <Check size={13} /> Одобрить
      </button>
      <button
        type="button"
        onClick={() => setNew("rejected")}
        disabled={loading}
        className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
      >
        <X size={13} /> Отклонить
      </button>
    </div>
  );
}
