import fs from "node:fs";
import path from "node:path";

function esc(s) {
  if (s === null || s === undefined) return "NULL";
  return "'" + String(s).replace(/'/g, "''") + "'";
}
function num(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "NULL";
  return String(n);
}

const input = process.argv[2];
if (!input) {
  console.error("Usage: node export-cars-to-sql.mjs brands.json");
  process.exit(1);
}
const brands = JSON.parse(fs.readFileSync(input, "utf8"));

const lines = [
  "BEGIN;",
  "DELETE FROM model_colors;",
  "DELETE FROM trims;",
  "DELETE FROM models;",
  "DELETE FROM brands;",
];

brands.forEach((b, bi) => {
  lines.push(
    `INSERT INTO brands (slug, name, country, description, accent, logo, sort_order) VALUES (${esc(b.slug)}, ${esc(b.name)}, ${esc(b.country)}, ${esc(b.description)}, ${esc(b.accent)}, ${esc(b.logo)}, ${bi + 1});`,
  );
  (b.models || []).forEach((m, mi) => {
    lines.push(
      `INSERT INTO models (brand_slug, slug, name, tagline, body_type, seats, description, archived, sort_order) VALUES (${esc(b.slug)}, ${esc(m.slug)}, ${esc(m.name)}, ${esc(m.tagline)}, ${esc(m.bodyType)}, ${num(m.seats)}, ${esc(m.description)}, 0, ${mi + 1});`,
    );
    (m.exteriorColors || []).forEach((c, ci) => {
      lines.push(
        `INSERT INTO model_colors (brand_slug, model_slug, kind, name, hex, sort_order) VALUES (${esc(b.slug)}, ${esc(m.slug)}, 'exterior', ${esc(c.name)}, ${esc(c.hex)}, ${ci});`,
      );
    });
    (m.interiorColors || []).forEach((c, ci) => {
      lines.push(
        `INSERT INTO model_colors (brand_slug, model_slug, kind, name, hex, sort_order) VALUES (${esc(b.slug)}, ${esc(m.slug)}, 'interior', ${esc(c.name)}, ${esc(c.hex)}, ${ci});`,
      );
    });
    (m.trims || []).forEach((t, ti) => {
      lines.push(
        `INSERT INTO trims (
  brand_slug, model_slug, slug, name, highlight,
  price_from, price_cny, powertrain_type, motor_model,
  range_km, total_range_km, power_hp, power_kw, power_p30_kw,
  ice_power_kw, ice_power_hp, lidar, torque_nm, accel_sec, top_speed_kmh,
  battery_kwh, battery_type, fast_charge, drive,
  length_mm, width_mm, height_mm, wheelbase_mm, front_track_mm,
  curb_weight_kg, gross_weight_kg, turning_radius_m, sort_order
) VALUES (
  ${esc(b.slug)}, ${esc(m.slug)}, ${esc(t.slug)}, ${esc(t.name)}, ${esc(t.highlight ?? null)},
  ${num(t.priceFrom)}, ${num(t.priceCny)}, ${esc(t.powertrainType)}, ${esc(t.motorModel ?? null)},
  ${num(t.rangeKm)}, ${num(t.totalRangeKm)}, ${num(t.powerHp)}, ${num(t.powerKw)}, ${num(t.powerP30Kw)},
  ${num(t.icePowerKw)}, ${num(t.icePowerHp)}, ${esc(t.lidar ?? null)}, ${num(t.torqueNm)}, ${num(t.accelSec)}, ${num(t.topSpeedKmh)},
  ${num(t.batteryKwh)}, ${esc(t.batteryType)}, ${esc(t.fastCharge)}, ${esc(t.drive)},
  ${num(t.lengthMm)}, ${num(t.widthMm)}, ${num(t.heightMm)}, ${num(t.wheelbaseMm)}, ${num(t.frontTrackMm)},
  ${num(t.curbWeightKg)}, ${num(t.grossWeightKg)}, ${num(t.turningRadiusM)}, ${ti + 1}
);`,
      );
    });
  });
});

lines.push("COMMIT;");
const out = path.resolve("migrations/0002_seed_from_cars.sql");
fs.writeFileSync(out, lines.join("\n") + "\n");
console.log("Wrote", out, "brands:", brands.length);
