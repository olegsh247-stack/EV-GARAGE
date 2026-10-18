import type { Brand, ColorOption, Model, PowertrainType, Trim } from "@/data/cars";
import { query } from "@/lib/pg";

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
  archived: boolean;
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

export async function loadBrandsFromPg(): Promise<Brand[]> {
  const [brandsRes, modelsRes, colorsRes, trimsRes] = await Promise.all([
    query<BrandRow>(
      "SELECT slug, name, country, description, accent, logo, sort_order FROM brands ORDER BY sort_order, name",
    ),
    query<ModelRow>(
      "SELECT brand_slug, slug, name, tagline, body_type, seats, description, archived, sort_order FROM models ORDER BY sort_order, name",
    ),
    query<ColorRow>(
      "SELECT brand_slug, model_slug, kind, name, hex, sort_order FROM model_colors ORDER BY sort_order, name",
    ),
    query<TrimRow>(
      `SELECT brand_slug, model_slug, slug, name, highlight, price_from, price_cny,
              powertrain_type, motor_model, range_km, total_range_km, power_hp, power_kw,
              power_p30_kw, ice_power_kw, ice_power_hp, lidar, torque_nm, accel_sec,
              top_speed_kmh, battery_kwh, battery_type, fast_charge, drive,
              length_mm, width_mm, height_mm, wheelbase_mm, front_track_mm,
              curb_weight_kg, gross_weight_kg, turning_radius_m, sort_order
       FROM trims ORDER BY sort_order, price_from`,
    ),
  ]);

  const brandRows = brandsRes.rows;
  if (brandRows.length === 0) return [];

  const modelsByBrand = new Map<string, ModelRow[]>();
  for (const model of modelsRes.rows) {
    const list = modelsByBrand.get(model.brand_slug) ?? [];
    list.push(model);
    modelsByBrand.set(model.brand_slug, list);
  }

  const colorsByModel = new Map<string, { exterior: ColorOption[]; interior: ColorOption[] }>();
  for (const color of colorsRes.rows) {
    const key = `${color.brand_slug}/${color.model_slug}`;
    const bucket = colorsByModel.get(key) ?? { exterior: [], interior: [] };
    const opt = { name: color.name, hex: color.hex };
    if (color.kind === "exterior") bucket.exterior.push(opt);
    else bucket.interior.push(opt);
    colorsByModel.set(key, bucket);
  }

  const trimsByModel = new Map<string, Trim[]>();
  for (const trim of trimsRes.rows) {
    const key = `${trim.brand_slug}/${trim.model_slug}`;
    const list = trimsByModel.get(key) ?? [];
    list.push(mapTrim(trim));
    trimsByModel.set(key, list);
  }

  return brandRows.map((brand) => {
    const modelRows = modelsByBrand.get(brand.slug) ?? [];
    const models: Model[] = modelRows.map((model) => {
      const key = `${model.brand_slug}/${model.slug}`;
      const colors = colorsByModel.get(key);
      const trims = trimsByModel.get(key) ?? [];
      const mapped: Model = {
        slug: model.slug,
        name: model.name,
        tagline: model.tagline,
        bodyType: model.body_type,
        seats: model.seats,
        description: model.description,
        trims,
      };
      if (colors?.exterior.length) mapped.exteriorColors = colors.exterior;
      if (colors?.interior.length) mapped.interiorColors = colors.interior;
      return mapped;
    });

    return {
      slug: brand.slug,
      name: brand.name,
      country: brand.country,
      description: brand.description,
      accent: brand.accent,
      logo: brand.logo,
      models,
    };
  });
}
