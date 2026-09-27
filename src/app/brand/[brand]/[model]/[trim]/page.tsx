import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrimDetailView } from "@/components/TrimDetailView";
import { brands } from "@/data/cars";
import { getTrim, baseTrim } from "@/lib/catalog";

export const revalidate = 30;

export function generateStaticParams() {
  return brands.flatMap((b) =>
    b.models.flatMap((m) => {
      if (m.trims.length <= 1) return [];
      const base = baseTrim(m);
      return m.trims
        .filter((t) => t.slug !== base.slug)
        .map((t) => ({ brand: b.slug, model: m.slug, trim: t.slug }));
    })
  );
}

export default async function TrimPage({
  params,
}: {
  params: Promise<{ brand: string; model: string; trim: string }>;
}) {
  const { brand: brandSlug, model: modelSlug, trim: trimSlug } = await params;
  const found = await getTrim(brandSlug, modelSlug, trimSlug);
  if (!found) notFound();
  const { brand, model, trim } = found;

  const base = baseTrim(model);
  if (trim.slug === base.slug) {
    redirect(`/brand/${brand.slug}/${model.slug}`);
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <TrimDetailView brand={brand} model={model} trim={trim} />
      </main>
      <Footer />
    </>
  );
}
