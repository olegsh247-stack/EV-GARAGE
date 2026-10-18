import { getBrands } from "@/lib/catalog";
import { suggestions } from "@/data/suggestions";
import { AdminNav } from "../AdminNav";
import { AddModelForm, type AddFormInitial } from "./AddModelForm";

export const dynamic = "force-dynamic";

export default async function AdminAddModelPage({
  searchParams,
}: {
  searchParams: Promise<{ suggestion?: string }>;
}) {
  const { suggestion: suggestionId } = await searchParams;
  const brands = await getBrands();
  const sorted = [...brands].sort((a, b) => a.name.localeCompare(b.name, "ru"));

  // Предзаполнение из предложения: «Li Auto i9 · BEV · 705 км» → бренд Li Auto, модель «i9»
  const initial: AddFormInitial = {};
  const s = suggestions.find((x) => x.id === suggestionId && x.type === "new");
  if (s) {
    initial.suggestionId = s.id;
    initial.suggestionNote = s.note;
    const fullName = s.title.split(" · ")[0].trim();
    const brand = [...brands]
      .sort((a, b) => b.name.length - a.name.length)
      .find((b) => fullName.toLowerCase().startsWith(b.name.toLowerCase()));
    if (brand) {
      initial.brandSlug = brand.slug;
      initial.modelName = fullName.slice(brand.name.length).trim() || fullName;
    } else {
      initial.modelName = fullName;
    }
  }

  return (
    <div className="min-h-screen bg-surface px-5 py-10">
      <div className="mx-auto max-w-4xl">
        <AdminNav title="Добавить модель" />
        <p className="mt-4 text-sm text-ink-soft">
          Новая модель с версиями или новые версии существующей. Ничего из каталога
          не удаляется и не перезаписывается. Фото загружаются на следующем шаге.
        </p>
        <AddModelForm
          brands={sorted.map((b) => ({ slug: b.slug, name: b.name }))}
          initial={initial}
        />
      </div>
    </div>
  );
}
