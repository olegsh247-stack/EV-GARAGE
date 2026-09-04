import Link from "next/link";
import { suggestions } from "@/data/suggestions";
import { getSuggestionStatuses } from "@/lib/suggestionStatus";
import { SuggestionActions } from "../SuggestionActions";
import { LogoutButton } from "../LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminSuggestionsPage() {
  const statuses = await getSuggestionStatuses();

  return (
    <div className="min-h-screen bg-surface px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              Админка
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink">
              Предложения
            </h1>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-4 flex gap-4 font-mono text-xs">
          <Link href="/admin" className="text-ink-soft hover:text-ink">
            ← Фото
          </Link>
          <Link href="/admin/models" className="text-ink-soft hover:text-ink">
            ← Архив моделей
          </Link>
        </div>

        <p className="mt-4 text-sm text-ink-soft">
          Кандидаты на добавление или архивацию, найденные при проверке
          новинок. Одобрение здесь не добавляет модель в каталог автоматически
          — это просто отметка «стоит внести», финальное наполнение
          характеристиками остаётся ручным шагом.
        </p>

        {suggestions.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface-card py-16 text-center text-sm text-ink-soft">
            Пока пусто — предложения появятся здесь после следующей проверки
            новинок.
          </div>
        ) : (
          <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-surface-card">
            {suggestions.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`mr-2 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${
                        s.type === "new"
                          ? "bg-charge/10 text-charge"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {s.type === "new" ? "Новинка" : "На архив"}
                    </span>
                    <span className="font-display font-semibold text-ink">
                      {s.title}
                    </span>
                    <p className="mt-1 text-sm text-ink-soft">{s.note}</p>
                    {s.sourceUrl && (
                      <a
                        href={s.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block font-mono text-xs text-charge hover:underline"
                      >
                        Источник →
                      </a>
                    )}
                  </div>
                </div>
                <SuggestionActions
                  id={s.id}
                  initialStatus={statuses[s.id] ?? "pending"}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
