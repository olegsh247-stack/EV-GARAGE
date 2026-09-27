import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrimDetailView } from "@/components/TrimDetailView";
import { brands } from "@/data/cars";
import { getModel, baseTrim } from "@/lib/catalog";

export const revalidate = 30;

export function generateStaticParams() {
  return brands.flatMap((b) =>
    b.models.map((m) => ({ brand: b.slug, model: m.slug }))
  );
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}) {
  const { brand: brandSlug, model: modelSlug } = await params;
  const found = await getModel(brandSlug, modelSlug);
  if (!found) notFound();
  const { brand, model } = found;
  const trim = baseTrim(model);

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
