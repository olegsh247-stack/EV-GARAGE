import type { Trim } from "@/data/cars";

// Постановление Правительства РФ № 342 — таможенный сбор за операции
export function customsFee(cRub: number): number {
  if (cRub <= 200_000) return 1067;
  if (cRub <= 450_000) return 2134;
  if (cRub <= 1_200_000) return 4269;
  if (cRub <= 2_700_000) return 11_746;
  if (cRub <= 4_200_000) return 16_524;
  if (cRub <= 5_500_000) return 21_344;
  if (cRub <= 7_000_000) return 27_540;
  return 30_000;
}

// Утильсбор для BEV/EREV по 30-минутной мощности (л.с.), ставки на
// 01.01.2026 — 01.01.2027 (Постановление Правительства РФ № 1291).
// Действует только сценарий "физлицо, новый автомобиль до 1 года,
// личное пользование" — по договорённости остальные сценарии не считаем.
export function utilizationFeeByP30Hp(p30Hp: number): number {
  if (p30Hp <= 80) return 3400; // льготная ставка
  if (p30Hp <= 100) return 991_200;
  if (p30Hp <= 130) return 1_317_600;
  if (p30Hp <= 160) return 1_560_000;
  if (p30Hp <= 190) return 1_848_000;
  if (p30Hp <= 220) return 2_193_600;
  if (p30Hp <= 250) return 2_599_200;
  if (p30Hp <= 280) return 3_079_200;
  return 3_648_000;
}

const KW_TO_HP = 1.35962;

// P30 (30-минутная мощность) — используем реальное значение из документации,
// если оно есть, иначе оцениваем по формуле 0,45 × пиковая мощность.
export function estimateP30Kw(trim: Trim): number {
  return trim.powerP30Kw ?? trim.powerKw * 0.45;
}

export type CustomsBreakdown = {
  cRub: number; // таможенная стоимость в рублях
  sFee: number; // таможенный сбор за операции
  stp: number; // единый таможенный платёж (15% от C)
  util: number; // утилизационный сбор
  p30Hp: number; // 30-минутная мощность в л.с., по которой считали утильсбор
  isP30Estimated: boolean; // true, если P30 оценка, а не задокументированное значение
  total: number; // сумма всех трёх платежей — то, что показываем как "Таможня"
};

// Расчёт таможенных платежей по версии автомобиля. Формула справедлива для
// BEV и EREV (у нас в каталоге пока нет HEV/PHEV, для них формула другая).
export function calculateCustoms(
  trim: Trim,
  cnyRubRate: number
): CustomsBreakdown {
  // Таможенная стоимость: если известна реальная цена в юанях — считаем по
  // актуальному курсу, иначе используем уже сохранённую оценку в рублях.
  const cRub = trim.priceCny ? trim.priceCny * cnyRubRate : trim.priceFrom;

  const sFee = customsFee(cRub);
  const stp = 0.15 * cRub;

  const p30Kw = estimateP30Kw(trim);
  const p30Hp = p30Kw * KW_TO_HP;
  const util = utilizationFeeByP30Hp(p30Hp);

  return {
    cRub,
    sFee,
    stp,
    util,
    p30Hp,
    isP30Estimated: trim.powerP30Kw === undefined,
    total: sFee + stp + util,
  };
}
