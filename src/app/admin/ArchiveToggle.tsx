"use client";

import { useState } from "react";
import { Archive, ArchiveRestore } from "lucide-react";

export function ArchiveToggle({
  brandSlug,
  modelSlug,
  initialArchived,
}: {
  brandSlug: string;
  modelSlug: string;
  initialArchived: boolean;
}) {
  const [archived, setArchived] = useState(initialArchived);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !archived;
    try {
      const res = await fetch("/api/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandSlug, modelSlug, archived: next }),
      });
      if (res.ok) setArchived(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        archived
          ? "border-amber-300 bg-amber-50 text-amber-800"
          : "border-line text-ink hover:border-charge hover:text-charge"
      }`}
    >
      {archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
      {archived ? "В архиве — вернуть" : "В архив"}
    </button>
  );
}
