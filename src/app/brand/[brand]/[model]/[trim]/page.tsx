import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrimDetailView } from "@/components/TrimDetailView";
import { getTrim, baseTrim } from "@/lib/catalog";

export const dynamic = "force-dynamic";

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
