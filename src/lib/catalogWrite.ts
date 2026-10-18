import { HttpError } from "@/lib/httpError";
import { withTransaction } from "@/lib/pg";
import type { CatalogInput, ParsedTrim } from "@/lib/catalogInput";

export type AddResult = {
  brandSlug: string;
  modelSlug: string;
  createdBrand: boolean;
  createdModel: boolean;
  trimsAdded: number;
};

export type ResolvedTrim = ParsedTrim & { priceFrom: number };

/**
 * Добавляет бренд (если новый), модель (если новой ещё нет) и версии.
 * Ничего не удаляет и не перезаписывает: повтор существующего slug — ошибка 409.
 * Если модель уже есть — добавляются только версии.
 */
export async function addToCatalog(
  input: CatalogInput,
  trims: ResolvedTrim[],
): Promise<AddResult> {
  return withTransaction(async (client) => {
    const { brandSlug, newBrand, model } = input;

    const brandRow = await client.query<{ slug: string }>(
      "SELECT slug FROM brands WHERE slug = $1",
      [brandSlug],
    );
    let createdBrand = false;
    if (brandRow.rowCount === 0) {
      if (!newBrand) throw new HttpError("Такого бренда нет в каталоге", 404);
      const order = await client.query<{ next: number }>(
        "SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM brands",
      );
      await client.query(
        `INSERT INTO brands (slug, name, country, description, accent, logo, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newBrand.slug,
          newBrand.name,
          newBrand.country,
          newBrand.description,
          newBrand.accent,
          newBrand.logo,
          order.rows[0].next,
        ],
      );
      createdBrand = true;
    } else if (newBrand) {
      throw new HttpError(`Бренд «${brandSlug}» уже существует — выберите его из списка`, 409);
    }

    const modelRow = await client.query<{ slug: string }>(
      "SELECT slug FROM models WHERE brand_slug = $1 AND slug = $2",
      [brandSlug, model.slug],
    );
    const createdModel = modelRow.rowCount === 0;
    if (createdModel) {
      const order = await client.query<{ next: number }>(
        "SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM models WHERE brand_slug = $1",
        [brandSlug],
      );
      await client.query(
        `INSERT INTO models (
           brand_slug, slug, name, tagline, body_type, seats, description, archived, sort_order
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8)`,
        [
          brandSlug,
          model.slug,
          model.name,
          model.tagline,
          model.bodyType,
          model.seats,
          model.description,
          order.rows[0].next,
        ],
      );
      for (const [kind, list] of [
        ["exterior", model.exteriorColors],
        ["interior", model.interiorColors],
      ] as const) {
        for (let i = 0; i < list.length; i += 1) {
          await client.query(
            `INSERT INTO model_colors (brand_slug, model_slug, kind, name, hex, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [brandSlug, model.slug, kind, list[i].name, list[i].hex, i],
          );
        }
      }
    }

    const existing = await client.query<{ slug: string }>(
      "SELECT slug FROM trims WHERE brand_slug = $1 AND model_slug = $2",
      [brandSlug, model.slug],
    );
    const taken = new Set(existing.rows.map((r) => r.slug));
    const clash = trims.filter((t) => taken.has(t.slug)).map((t) => t.slug);
    if (clash.length > 0) {
      throw new HttpError(`Версии уже есть у этой модели: ${clash.join(", ")}`, 409);
    }

    const base = await client.query<{ next: number }>(
      "SELECT COALESCE(MAX(sort_order), 0) AS next FROM trims WHERE brand_slug = $1 AND model_slug = $2",
      [brandSlug, model.slug],
    );
    const sorted = [...trims].sort((a, b) => a.priceFrom - b.priceFrom);
    for (let i = 0; i < sorted.length; i += 1) {
      const t = sorted[i];
      await client.query(
        `INSERT INTO trims (
           brand_slug, model_slug, slug, name, highlight,
           price_from, price_cny, powertrain_type, motor_model,
           range_km, total_range_km, power_hp, power_kw, power_p30_kw,
           ice_power_kw, ice_power_hp, lidar, torque_nm, accel_sec, top_speed_kmh,
           battery_kwh, battery_type, fast_charge, drive,
           length_mm, width_mm, height_mm, wheelbase_mm, front_track_mm,
           curb_weight_kg, gross_weight_kg, turning_radius_m, sort_order
         ) VALUES (
           $1,$2,$3,$4,$5,
           $6,$7,$8,$9,
           $10,$11,$12,$13,$14,
           $15,$16,$17,$18,$19,$20,
           $21,$22,$23,$24,
           $25,$26,$27,$28,$29,
           $30,$31,$32,$33
         )`,
        [
          brandSlug,
          model.slug,
          t.slug,
          t.name,
          t.highlight ?? null,
          t.priceFrom,
          t.priceCny ?? null,
          t.powertrainType,
          t.motorModel ?? null,
          t.rangeKm,
          t.totalRangeKm,
          t.powerHp,
          t.powerKw,
          t.powerP30Kw ?? null,
          t.icePowerKw ?? null,
          t.icePowerHp ?? null,
          t.lidar ?? null,
          t.torqueNm,
          t.accelSec,
          t.topSpeedKmh,
          t.batteryKwh,
          t.batteryType,
          t.fastCharge,
          t.drive,
          t.lengthMm ?? null,
          t.widthMm ?? null,
          t.heightMm ?? null,
          t.wheelbaseMm ?? null,
          t.frontTrackMm ?? null,
          t.curbWeightKg ?? null,
          t.grossWeightKg ?? null,
          t.turningRadiusM ?? null,
          base.rows[0].next + i + 1,
        ],
      );
    }

    return {
      brandSlug,
      modelSlug: model.slug,
      createdBrand,
      createdModel,
      trimsAdded: sorted.length,
    };
  });
}
