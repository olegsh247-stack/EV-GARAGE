-- EV-Garage catalog schema (stage A)
CREATE TABLE brands (
  slug        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'China',
  description TEXT NOT NULL DEFAULT '',
  accent      TEXT NOT NULL DEFAULT '#0EA5A0',
  logo        TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE models (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  brand_slug  TEXT NOT NULL REFERENCES brands(slug) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  tagline     TEXT NOT NULL DEFAULT '',
  body_type   TEXT NOT NULL DEFAULT '',
  seats       INTEGER NOT NULL DEFAULT 5,
  description TEXT NOT NULL DEFAULT '',
  archived    INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (brand_slug, slug)
);

CREATE INDEX idx_models_brand ON models(brand_slug);
CREATE INDEX idx_models_archived ON models(archived);

CREATE TABLE model_colors (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  brand_slug  TEXT NOT NULL,
  model_slug  TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('exterior', 'interior')),
  name        TEXT NOT NULL,
  hex         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (brand_slug, model_slug)
    REFERENCES models(brand_slug, slug) ON DELETE CASCADE
);

CREATE TABLE trims (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  brand_slug      TEXT NOT NULL,
  model_slug      TEXT NOT NULL,
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  highlight       TEXT,
  price_from      INTEGER NOT NULL,
  price_cny       INTEGER,
  powertrain_type TEXT NOT NULL CHECK (powertrain_type IN ('BEV', 'EREV', 'PHEV', 'HEV')),
  motor_model     TEXT,
  range_km        INTEGER NOT NULL,
  total_range_km  INTEGER NOT NULL,
  power_hp        INTEGER NOT NULL,
  power_kw        INTEGER NOT NULL,
  power_p30_kw    REAL,
  ice_power_kw    REAL,
  ice_power_hp    INTEGER,
  lidar           TEXT,
  torque_nm       INTEGER NOT NULL,
  accel_sec       REAL NOT NULL,
  top_speed_kmh   INTEGER NOT NULL,
  battery_kwh     REAL NOT NULL,
  battery_type    TEXT NOT NULL DEFAULT '',
  fast_charge     TEXT NOT NULL DEFAULT '',
  drive           TEXT NOT NULL DEFAULT '',
  length_mm       INTEGER,
  width_mm        INTEGER,
  height_mm       INTEGER,
  wheelbase_mm    INTEGER,
  front_track_mm  INTEGER,
  curb_weight_kg  INTEGER,
  gross_weight_kg INTEGER,
  turning_radius_m REAL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (brand_slug, model_slug, slug),
  FOREIGN KEY (brand_slug, model_slug)
    REFERENCES models(brand_slug, slug) ON DELETE CASCADE
);

CREATE INDEX idx_trims_model ON trims(brand_slug, model_slug);

CREATE TABLE suggestions (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN ('new', 'archive')),
  title       TEXT NOT NULL,
  note        TEXT NOT NULL DEFAULT '',
  source_url  TEXT,
  brand_slug  TEXT,
  model_slug  TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  added_at    TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_suggestions_status ON suggestions(status);
