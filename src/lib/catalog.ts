import {
  brands as staticBrands,
  type Brand,
  type Model,
  type Trim,
  baseTrim as baseTrimSync,
  fullSpecRows,
  RANGE_SCALE_MAX,
  POWERTRAIN_LABELS,
} from "@/data/cars";
import { loadBrandsFromD1 } from "@/lib/catalogDb";

export type { Brand, Model, Trim };
export { fullSpecRows, RANGE_SCALE_MAX, POWERTRAIN_LABELS };

let cache: { at: number; brands: Brand[] } | null = null;
const CACHE_MS = 15_000;

/** Full catalog: D1 when available, otherwise static cars.ts */
export async function getBrands(): Promise<Brand[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return cache.brands;
  }
  try {
    const fromDb = await loadBrandsFromD1();
    if (fromDb && fromDb.length > 0) {
      cache = { at: Date.now(), brands: fromDb };
      return fromDb;
    }
  } catch {
    /* fallback */
  }
  cache = { at: Date.now(), brands: staticBrands };
  return staticBrands;
}

export async function getBrand(slug: string): Promise<Brand | undefined> {
  const brands = await getBrands();
  return brands.find((b) => b.slug === slug);
}

export async function getModel(
  brandSlug: string,
  modelSlug: string,
): Promise<{ brand: Brand; model: Model } | undefined> {
  const brand = await getBrand(brandSlug);
  const model = brand?.models.find((m) => m.slug === modelSlug);
  return brand && model ? { brand, model } : undefined;
}

export async function getTrim(
  brandSlug: string,
  modelSlug: string,
  trimSlug: string,
): Promise<{ brand: Brand; model: Model; trim: Trim } | undefined> {
  const found = await getModel(brandSlug, modelSlug);
  const trim = found?.model.trims.find((t) => t.slug === trimSlug);
  return found && trim ? { ...found, trim } : undefined;
}

export function baseTrim(model: Model): Trim {
  return baseTrimSync(model);
}

export async function topModelsBy(
  metric: "range" | "price" | "accel",
  count = 3,
) {
  const brands = await getBrands();
  const entries = brands.flatMap((b) =>
    b.models.map((m) => {
      let best: Trim;
      if (metric === "range") {
        best = [...m.trims].sort((a, b2) => b2.rangeKm - a.rangeKm)[0];
      } else if (metric === "accel") {
        best = [...m.trims].sort((a, b2) => a.accelSec - b2.accelSec)[0];
      } else {
        best = baseTrim(m);
      }
      return { brand: b, model: m, trim: best };
    }),
  );

  return [...entries]
    .sort((a, b) => {
      if (metric === "range") return b.trim.rangeKm - a.trim.rangeKm;
      if (metric === "accel") return a.trim.accelSec - b.trim.accelSec;
      return a.trim.priceFrom - b.trim.priceFrom;
    })
    .slice(0, count);
}

export async function similarTrims(
  excludeModelSlug: string,
  priceFrom: number,
  count = 3,
) {
  const brands = await getBrands();
  const all = brands.flatMap((b) =>
    b.models
      .filter((m) => m.slug !== excludeModelSlug)
      .flatMap((m) => m.trims.map((t) => ({ brand: b, model: m, trim: t }))),
  );
  return all
    .sort(
      (a, b) =>
        Math.abs(a.trim.priceFrom - priceFrom) -
        Math.abs(b.trim.priceFrom - priceFrom),
    )
    .slice(0, count);
}
