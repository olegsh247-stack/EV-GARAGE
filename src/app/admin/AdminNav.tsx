import Link from "next/link";
import { ExternalLink, Lightbulb, Archive, Pencil } from "lucide-react";
import { getPendingSuggestionCount } from "@/lib/suggestionStatus";
import { LogoutButton } from "./LogoutButton";

export async function AdminNav({ title }: { title: string }) {
  const pendingCount = await getPendingSuggestionCount();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            <Link href="/admin" className="hover:text-ink">
              Админка
            </Link>
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">
            {title}
          </h1>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-charge hover:text-charge"
        >
          <ExternalLink size={13} />
          На сайте
        </Link>
        <Link
          href="/admin/suggestions"
          className="relative flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-charge hover:text-charge"
        >
          <Lightbulb size={13} />
          Предложения
          {pendingCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-volt px-1 text-[10px] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </Link>
        <Link
          href="/admin/models"
          className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-charge hover:text-charge"
        >
          <Archive size={13} />
          Архив
        </Link>
        <Link
          href="/admin/contacts"
          className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-charge hover:text-charge"
        >
          <Pencil size={13} />
          Контакты
        </Link>
      </div>
    </div>
  );
}
