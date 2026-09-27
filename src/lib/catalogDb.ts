import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Brand, ColorOption, Model, PowertrainType, Trim } from "@/data/cars";

type D1Database = {
  prepare: (sql: string) => {
    bind: (...values: unknown[]) => {
      all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
      first: <T = Record<string, unknown>>() => Promise<T | null>;
    };
    all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
  };
};

async function getDb(): Promise<D1Database | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return ((env as { DB?: D1Database }).DB ?? null) as D1Database | null;
  } catch {
    return null;
  }
}

type BrandRow = {
  slug: string;
  name: string;
  country: string;
  description: string;
  accent: string;
  logo: string;
  sort_order: number;
};

type ModelRow = {
  brand_slug: string;
  slug: string;
  name: string;
  tagline: string;
  body_type: string;
  seats: number;
  description: string;
  archived: number;
  sort_order: number;
};

type ColorRow = {
  brand_slug: string;
  model_slug: string;
  kind: "exterior" | "interior";
  name: string;
  hex: string;
  sort_order: number;
};

type TrimRow = {
  brand_slug: string;
  model_slug: string;
  slug: string;
  name: string;
  highlight: string | null;
  price_from: number;
  price_cny: number | null;
  powertrain_type: string;
  motor_model: string | null;
  range_km: number;
  total_range_km: number;
  power_hp: number;
  power_kw: number;
  power_p30_kw: number | null;
  ice_power_kw: number | null;
  ice_power_hp: number | null;
  lidar: string | null;
  torque_nm: number;
  accel_sec: number;
  top_speed_kmh: number;
  battery_kwh: number;
  battery_type: string;
  fast_charge: string;
  drive: string;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  wheelbase_mm: number | null;
  front_track_mm: number | null;
  curb_weight_kg: number | null;
  gross_weight_kg: number | null;
  turning_radius_m: number | null;
  sort_order: number;
};

function mapTrim(row: TrimRow): Trim {
  const trim: Trim = {
    slug: row.slug,
    name: row.name,
    priceFrom: row.price_from,
    powertrainType: row.powertrain_type as PowertrainType,
    rangeKm: row.range_km,
    totalRangeKm: row.total_range_km,
    powerHp: row.power_hp,
    powerKw: row.power_kw,
    torqueNm: row.torque_nm,
    accelSec: row.accel_sec,
    topSpeedKmh: row.top_speed_kmh,
    batteryKwh: row.battery_kwh,
    batteryType: row.battery_type,
    fastCharge: row.fast_charge,
    drive: row.drive,
  };
  if (row.price_cny != null) trim.priceCny = row.price_cny;
  if (row.motor_model) trim.motorModel = row.motor_model;
  if (row.power_p30_kw != null) trim.powerP30Kw = row.power_p30_kw;
  if (row.ice_power_kw != null) trim.icePowerKw = row.ice_power_kw;
  if (row.ice_power_hp != null) trim.icePowerHp = row.ice_power_hp;
  if (row.lidar) trim.lidar = row.lidar;
  if (row.highlight) trim.highlight = row.highlight;
  if (row.length_mm != null) trim.lengthMm = row.length_mm;
  if (row.width_mm != null) trim.widthMm = row.width_mm;
  if (row.height_mm != null) trim.heightMm = row.height_mm;
  if (row.wheelbase_mm != null) trim.wheelbaseMm = row.wheelbase_mm;
  if (row.front_track_mm != null) trim.frontTrackMm = row.front_track_mm;
  if (row.curb_weight_kg != null) trim.curbWeightKg = row.curb_weight_kg;
  if (row.gross_weight_kg != null) trim.grossWeightKg = row.gross_weight_kg;
  if (row.turning_radius_m != null) trim.turningRadiusM = row.turning_radius_m;
  return trim;
}

/** Load full catalog tree from D1. Returns null if DB unavailable. */
export async function loadBrandsFromD1(): Promise<Brand[] | null> {
  const db = await getDb();
  if (!db) return null;

  const [brandsRes, modelsRes, colorsRes, trimsRes] = await Promise.all([
    db.prepare("SELECT * FROM brands ORDER BY sort_order, name").all<BrandRow>(),
    db
      .prepare("SELECT * FROM models ORDER BY sort_order, name")
      .all<ModelRow>(),
    db
      .prepare("SELECT * FROM model_colors ORDER BY sort_order, name")
      .all<ColorRow>(),
    db
      .prepare("SELECT * FROM trims ORDER BY sort_order, price_from")
      .all<TrimRow>(),
  ]);

  const brandRows = brandsRes.results ?? [];
  if (brandRows.length === 0) return null;

  const modelsByBrand = new Map<string, ModelRow[]>();
  for (const m of modelsRes.results ?? []) {
    const list = modelsByBrand.get(m.brand_slug) ?? [];
    list.push(m);
    modelsByBrand.set(m.brand_slug, list);
  }

  const colorsByModel = new Map<string, { exterior: ColorOption[]; interior: ColorOption[] }>();
  for (const c of colorsRes.results ?? []) {
    const key = `${c.brand_slug}/${c.model_slug}`;
    const bucket = colorsByModel.get(key) ?? { exterior: [], interior: [] };
    const opt = { name: c.name, hex: c.hex };
    if (c.kind === "exterior") bucket.exterior.push(opt);
    else bucket.interior.push(opt);
    colorsByModel.set(key, bucket);
  }

  const trimsByModel = new Map<string, Trim[]>();
  for (const t of trimsRes.results ?? []) {
    const key = `${t.brand_slug}/${t.model_slug}`;
    const list = trimsByModel.get(key) ?? [];
    list.push(mapTrim(t));
    trimsByModel.set(key, list);
  }

  return brandRows.map((b) => {
    const modelRows = modelsByBrand.get(b.slug) ?? [];
    const models: Model[] = modelRows.map((m) => {
      const key = `${m.brand_slug}/${m.slug}`;
      const colors = colorsByModel.get(key);
      const trims = trimsByModel.get(key) ?? [];
      const model: Model = {
        slug: m.slug,
        name: m.name,
        tagline: m.tagline,
        bodyType: m.body_type,
        seats: m.seats,
        description: m.description,
        trims,
      };
      if (colors?.exterior.length) model.exteriorColors = colors.exterior;
      if (colors?.interior.length) model.interiorColors = colors.interior;
      return model;
    });

    return {
      slug: b.slug,
      name: b.name,
      country: b.country,
      description: b.description,
      accent: b.accent,
      logo: b.logo,
      models,
    };
  });
}
