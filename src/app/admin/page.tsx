import { brands } from "@/data/cars";
import { suggestions } from "@/data/suggestions";
import { getSuggestionStatuses } from "@/lib/suggestionStatus";
import { AdminNav } from "./AdminNav";
import { AdminBrandCard } from "./AdminBrandCard";
import { SuggestionActions } from "./SuggestionActions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const statuses = await getSuggestionStatuses();
  const pending = suggestions.filter(
    (s) => (statuses[s.id] ?? "pending") === "pending"
  );

  return (
    <div className="min-h-screen bg-surface px-5 py-10">
      <div className="mx-auto max-w-[1400px]">
        <AdminNav title="Марки" />

        <p className="mt-4 text-sm text-ink-soft">
          Выберите марку, чтобы управлять фото и статусом моделей.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[...brands]
            .sort((a, b) => a.name.localeCompare(b.name, "ru"))
            .map((brand) => (
              <AdminBrandCard key={brand.slug} brand={brand} />
            ))}
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <h2 className="font-display text-lg font-semibold text-ink">
            Новинки на рассмотрении
          </h2>
          {pending.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">
              Пока пусто — здесь появятся кандидаты после следующей проверки
              новых моделей.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface-card">
              {pending.map((s) => (
                <div key={s.id} className="flex flex-col gap-3 px-5 py-4">
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
    </div>
  );
}
