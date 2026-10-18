// Разбор и проверка данных новой модели. Без серверных импортов —
// используется и в API, и в админ-форме (проверка вставленного JSON).

import type { ColorOption, PowertrainType, Trim } from "@/data/cars";

export type NewBrandInput = {
  slug: string;
  name: string;
  country: string;
  description: string;
  accent: string;
  logo: string;
};

export type ModelInput = {
  slug: string;
  name: string;
  tagline: string;
  bodyType: string;
  seats: number;
  description: string;
  exteriorColors: ColorOption[];
  interiorColors: ColorOption[];
};

/** priceFrom можно не указывать, если есть priceCny — сервер посчитает по курсу. */
export type ParsedTrim = Omit<Trim, "priceFrom"> & { priceFrom?: number };

export type CatalogInput = {
  brandSlug: string;
  newBrand?: NewBrandInput;
  model: ModelInput;
  trims: ParsedTrim[];
  suggestionId?: string;
};

export type ParseResult =
  | { ok: true; value: CatalogInput }
  | { ok: false; errors: string[] };

const POWERTRAINS: PowertrainType[] = ["BEV", "EREV", "HEV", "PHEV"];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const HP_PER_KW = 1.35962;

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/** "Li Auto i9" → "li-auto-i9" */
export function slugify(text: string): string {
  const lower = text.toLowerCase();
  let out = "";
  for (const ch of lower) out += TRANSLIT[ch] ?? ch;
  return out
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Число из числа или строки ("1,5" → 1.5). Пусто → undefined, мусор → NaN. */
function num(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = v.trim().replace(",", ".");
    if (t === "") return undefined;
    return Number(t);
  }
  return Number.NaN;
}

function parseColors(raw: unknown, label: string, errors: string[]): ColorOption[] {
  if (raw === undefined || raw === null || raw === "") return [];
  if (!Array.isArray(raw)) {
    errors.push(`${label}: ожидается список`);
    return [];
  }
  if (raw.length > 30) errors.push(`${label}: не больше 30 цветов`);
  const out: ColorOption[] = [];
  raw.forEach((item, i) => {
    if (!isObject(item)) {
      errors.push(`${label} #${i + 1}: ожидается объект {name, hex}`);
      return;
    }
    const name = str(item.name);
    const hex = str(item.hex);
    if (!name || name.length > 60) errors.push(`${label} #${i + 1}: название обязательно (до 60 символов)`);
    else if (!HEX_RE.test(hex)) errors.push(`${label} «${name}»: цвет должен быть вида #aabbcc`);
    else out.push({ name, hex: hex.toLowerCase() });
  });
  return out;
}

type Bound = { min: number; max: number; int?: boolean };

function parseTrim(rawIn: unknown, idx: number, errors: string[]): ParsedTrim | null {
  const where = `Версия #${idx + 1}`;
  if (!isObject(rawIn)) {
    errors.push(`${where}: ожидается объект`);
    return null;
  }
  const raw: Record<string, unknown> = rawIn;
  const before = errors.length;
  const name = str(raw.name);
  const label = name ? `Версия «${name}»` : where;
  const err = (m: string) => errors.push(`${label}: ${m}`);

  if (!name || name.length > 120) err("название обязательно (до 120 символов)");
  const slug = str(raw.slug) || slugify(name);
  if (!SLUG_RE.test(slug) || slug.length > 60) err("slug — только a-z, 0-9 и дефисы");

  const powertrainType = str(raw.powertrainType).toUpperCase() as PowertrainType;
  if (!POWERTRAINS.includes(powertrainType)) err("тип двигателя: BEV, EREV, PHEV или HEV");

  function field(key: string, title: string, b: Bound, required: boolean): number | undefined {
    const v = num(raw[key]);
    if (v === undefined) {
      if (required) err(`«${title}» обязательно`);
      return undefined;
    }
    if (!Number.isFinite(v) || v < b.min || v > b.max || (b.int && !Number.isInteger(v))) {
      err(`«${title}»: допустимо ${b.int ? "целое " : ""}от ${b.min} до ${b.max}`);
      return undefined;
    }
    return v;
  }

  const priceCny = field("priceCny", "Цена, юани", { min: 1000, max: 20_000_000, int: true }, false);
  const priceFrom = field("priceFrom", "Цена, ₽", { min: 100_000, max: 500_000_000, int: true }, false);
  if (priceCny === undefined && priceFrom === undefined) err("укажите цену в юанях или в рублях");

  const rangeKm = field("rangeKm", "Запас хода CLTC, км", { min: 1, max: 3000, int: true }, true);
  let totalRangeKm = field("totalRangeKm", "Общий запас хода, км", { min: 1, max: 4000, int: true }, false);
  if (powertrainType === "BEV") {
    if (totalRangeKm === undefined) totalRangeKm = rangeKm;
  } else if (totalRangeKm === undefined) {
    err("«Общий запас хода» обязателен для EREV/PHEV/HEV");
  }
  if (rangeKm !== undefined && totalRangeKm !== undefined && totalRangeKm < rangeKm) {
    err("общий запас хода не может быть меньше запаса на электротяге");
  }

  let powerHp = field("powerHp", "Мощность, л.с.", { min: 1, max: 5000, int: true }, false);
  let powerKw = field("powerKw", "Мощность, кВт", { min: 1, max: 4000, int: true }, false);
  if (powerHp === undefined && powerKw === undefined) err("укажите мощность в л.с. или в кВт");
  else if (powerHp === undefined && powerKw !== undefined) powerHp = Math.round(powerKw * HP_PER_KW);
  else if (powerKw === undefined && powerHp !== undefined) powerKw = Math.round(powerHp / HP_PER_KW);

  const powerP30Kw = field("powerP30Kw", "P30, кВт", { min: 1, max: 4000 }, false);
  const icePowerKw = field("icePowerKw", "Мощность ДВС, кВт", { min: 1, max: 1000 }, false);
  let icePowerHp = field("icePowerHp", "Мощность ДВС, л.с.", { min: 1, max: 1400, int: true }, false);
  if (powertrainType === "BEV" && (icePowerKw !== undefined || icePowerHp !== undefined)) {
    err("у BEV нет ДВС — поля мощности ДВС должны быть пустыми");
  }
  if (icePowerKw !== undefined && icePowerHp === undefined) icePowerHp = Math.round(icePowerKw * HP_PER_KW);

  const torqueNm = field("torqueNm", "Крутящий момент, Н·м", { min: 1, max: 6000, int: true }, true);
  const accelSec = field("accelSec", "Разгон 0–100, с", { min: 0.5, max: 60 }, true);
  const topSpeedKmh = field("topSpeedKmh", "Макс. скорость, км/ч", { min: 30, max: 500, int: true }, true);
  const batteryKwh = field("batteryKwh", "Батарея, кВт·ч", { min: 0.1, max: 400 }, true);

  const drive = str(raw.drive);
  if (!drive) err("«Привод» обязателен (Передний / Задний / Полный)");

  const t: ParsedTrim = {
    slug,
    name,
    priceFrom,
    powertrainType,
    rangeKm: rangeKm ?? 0,
    totalRangeKm: totalRangeKm ?? 0,
    powerHp: powerHp ?? 0,
    powerKw: powerKw ?? 0,
    torqueNm: torqueNm ?? 0,
    accelSec: accelSec ?? 0,
    topSpeedKmh: topSpeedKmh ?? 0,
    batteryKwh: batteryKwh ?? 0,
    batteryType: str(raw.batteryType).slice(0, 60),
    fastCharge: str(raw.fastCharge).slice(0, 120),
    drive: drive.slice(0, 40),
  };
  if (priceCny !== undefined) t.priceCny = priceCny;
  if (str(raw.motorModel)) t.motorModel = str(raw.motorModel).slice(0, 120);
  if (powerP30Kw !== undefined) t.powerP30Kw = powerP30Kw;
  if (icePowerKw !== undefined) t.icePowerKw = icePowerKw;
  if (icePowerHp !== undefined) t.icePowerHp = icePowerHp;
  if (str(raw.lidar)) t.lidar = str(raw.lidar).slice(0, 120);
  if (str(raw.highlight)) t.highlight = str(raw.highlight).slice(0, 300);

  const dims: [keyof Trim, string, Bound][] = [
    ["lengthMm", "Длина, мм", { min: 1500, max: 9000, int: true }],
    ["widthMm", "Ширина, мм", { min: 1000, max: 3000, int: true }],
    ["heightMm", "Высота, мм", { min: 1000, max: 3500, int: true }],
    ["wheelbaseMm", "Колёсная база, мм", { min: 1500, max: 5000, int: true }],
    ["frontTrackMm", "Передняя колея, мм", { min: 1000, max: 2500, int: true }],
    ["curbWeightKg", "Снаряжённая масса, кг", { min: 300, max: 9000, int: true }],
    ["grossWeightKg", "Полная масса, кг", { min: 300, max: 12000, int: true }],
    ["turningRadiusM", "Радиус разворота, м", { min: 2, max: 20 }],
  ];
  for (const [key, title, b] of dims) {
    const v = field(key, title, b, false);
    if (v !== undefined) (t as Record<string, unknown>)[key] = v;
  }

  return errors.length > before ? null : t;
}

export function parseCatalogInput(raw: unknown): ParseResult {
  const errors: string[] = [];
  if (!isObject(raw)) return { ok: false, errors: ["Ожидается JSON-объект"] };

  // Бренд: существующий (brandSlug) или новый (newBrand)
  let brandSlug = str(raw.brandSlug);
  let newBrand: NewBrandInput | undefined;
  if (isObject(raw.newBrand)) {
    const b = raw.newBrand;
    const name = str(b.name);
    const slug = str(b.slug) || slugify(name);
    const accent = str(b.accent) || "#2b6cb0";
    const logo = (str(b.logo) || name.slice(0, 2)).toUpperCase().slice(0, 3);
    if (!name || name.length > 80) errors.push("Бренд: название обязательно");
    if (!SLUG_RE.test(slug) || slug.length > 60) errors.push("Бренд: slug — только a-z, 0-9 и дефисы");
    if (!HEX_RE.test(accent)) errors.push("Бренд: акцентный цвет вида #aabbcc");
    if (!str(b.country)) errors.push("Бренд: страна обязательна");
    newBrand = {
      slug,
      name,
      country: str(b.country).slice(0, 120),
      description: str(b.description).slice(0, 1000),
      accent,
      logo,
    };
    brandSlug = slug;
  } else if (!SLUG_RE.test(brandSlug)) {
    errors.push("Выберите бренд или создайте новый");
  }

  // Модель
  const m = isObject(raw.model) ? raw.model : null;
  let model: ModelInput | null = null;
  if (!m) {
    errors.push("Нет данных модели");
  } else {
    const name = str(m.name);
    const slug = str(m.slug) || slugify(name);
    const seats = num(m.seats);
    if (!name || name.length > 120) errors.push("Модель: название обязательно (до 120 символов)");
    if (!SLUG_RE.test(slug) || slug.length > 60) errors.push("Модель: slug — только a-z, 0-9 и дефисы");
    if (!str(m.bodyType)) errors.push("Модель: тип кузова обязателен");
    if (seats === undefined || !Number.isInteger(seats) || seats < 1 || seats > 9) {
      errors.push("Модель: число мест — целое от 1 до 9");
    }
    model = {
      slug,
      name,
      tagline: str(m.tagline).slice(0, 200),
      bodyType: str(m.bodyType).slice(0, 60),
      seats: seats ?? 5,
      description: str(m.description).slice(0, 3000),
      exteriorColors: parseColors(m.exteriorColors, "Цвета кузова", errors),
      interiorColors: parseColors(m.interiorColors, "Цвета салона", errors),
    };
  }

  // Версии
  const rawTrims = raw.trims;
  const trims: ParsedTrim[] = [];
  if (!Array.isArray(rawTrims) || rawTrims.length === 0) {
    errors.push("Добавьте хотя бы одну версию");
  } else if (rawTrims.length > 30) {
    errors.push("Не больше 30 версий за раз");
  } else {
    rawTrims.forEach((r, i) => {
      const t = parseTrim(r, i, errors);
      if (t) trims.push(t);
    });
    const seen = new Set<string>();
    for (const t of trims) {
      if (seen.has(t.slug)) errors.push(`Версия «${t.name}»: slug «${t.slug}» повторяется`);
      seen.add(t.slug);
    }
  }

  const suggestionId = str(raw.suggestionId) || undefined;

  if (errors.length > 0 || !model) return { ok: false, errors };
  return { ok: true, value: { brandSlug, newBrand, model, trims, suggestionId } };
}
