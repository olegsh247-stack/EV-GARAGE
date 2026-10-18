import pg from "pg";
import { loadEnv } from "./load-env.mjs";
import { brands } from "../src/data/cars.ts";
import { suggestions } from "../src/data/suggestions.ts";

loadEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const force = process.argv.includes("--force");
const pool = new pg.Pool({ connectionString: databaseUrl });
const client = await pool.connect();

try {
  const existing = await client.query("SELECT COUNT(*)::int AS n FROM brands");
  const brandCount = existing.rows[0].n;
  if (brandCount > 0 && !force) {
    console.log(
      `catalog already present (${brandCount} brands), skip. Pass --force to replace catalog rows.`,
    );
  } else {
    await client.query("BEGIN");
    if (force) {
      await client.query(`
        TRUNCATE TABLE model_colors, trims, models, brands, suggestions
        RESTART IDENTITY CASCADE
      `);
    }

    let models = 0;
    let trims = 0;
    let colors = 0;

    for (let bi = 0; bi < brands.length; bi += 1) {
      const brand = brands[bi];
      await client.query(
        `INSERT INTO brands (slug, name, country, description, accent, logo, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          brand.slug,
          brand.name,
          brand.country,
          brand.description,
          brand.accent,
          brand.logo,
          bi + 1,
        ],
      );

      for (let mi = 0; mi < brand.models.length; mi += 1) {
        const model = brand.models[mi];
        models += 1;
        await client.query(
          `INSERT INTO models (
             brand_slug, slug, name, tagline, body_type, seats, description, archived, sort_order
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8)`,
          [
            brand.slug,
            model.slug,
            model.name,
            model.tagline ?? "",
            model.bodyType ?? "",
            model.seats ?? 5,
            model.description ?? "",
            mi + 1,
          ],
        );

        const colorLists = [
          ["exterior", model.exteriorColors ?? []],
          ["interior", model.interiorColors ?? []],
        ];
        for (const [kind, list] of colorLists) {
          for (let ci = 0; ci < list.length; ci += 1) {
            colors += 1;
            await client.query(
              `INSERT INTO model_colors (brand_slug, model_slug, kind, name, hex, sort_order)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [brand.slug, model.slug, kind, list[ci].name, list[ci].hex, ci],
            );
          }
        }

        for (let ti = 0; ti < model.trims.length; ti += 1) {
          const trim = model.trims[ti];
          trims += 1;
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
              brand.slug,
              model.slug,
              trim.slug,
              trim.name,
              trim.highlight ?? null,
              trim.priceFrom,
              trim.priceCny ?? null,
              trim.powertrainType,
              trim.motorModel ?? null,
              trim.rangeKm,
              trim.totalRangeKm,
              trim.powerHp,
              trim.powerKw,
              trim.powerP30Kw ?? null,
              trim.icePowerKw ?? null,
              trim.icePowerHp ?? null,
              trim.lidar ?? null,
              trim.torqueNm,
              trim.accelSec,
              trim.topSpeedKmh,
              trim.batteryKwh,
              trim.batteryType ?? "",
              trim.fastCharge ?? "",
              trim.drive ?? "",
              trim.lengthMm ?? null,
              trim.widthMm ?? null,
              trim.heightMm ?? null,
              trim.wheelbaseMm ?? null,
              trim.frontTrackMm ?? null,
              trim.curbWeightKg ?? null,
              trim.grossWeightKg ?? null,
              trim.turningRadiusM ?? null,
              ti + 1,
            ],
          );
        }
      }
    }

    for (const suggestion of suggestions) {
      await client.query(
        `INSERT INTO suggestions (
           id, type, title, note, source_url, brand_slug, model_slug, status, added_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          suggestion.id,
          suggestion.type,
          suggestion.title,
          suggestion.note ?? "",
          suggestion.sourceUrl ?? null,
          suggestion.brandSlug ?? null,
          suggestion.modelSlug ?? null,
          suggestion.addedAt,
        ],
      );
    }

    await client.query("COMMIT");
    console.log(
      JSON.stringify({
        brands: brands.length,
        models,
        trims,
        colors,
        suggestions: suggestions.length,
      }),
    );
  }
} catch (error) {
  try {
    await client.query("ROLLBACK");
  } catch {
    /* transaction may not have started */
  }
  const err = error ?? {};
  console.error("[pg]", err.code ?? "", err.message ?? error);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}

if (process.exitCode) process.exit(process.exitCode);
