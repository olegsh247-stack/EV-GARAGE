import type { Trim } from "@/data/cars";
import { calculateCustoms, type CustomsBreakdown } from "./customs";

// Логистика — 15% от цены в Китае, но не менее 300 000 ₽.
const LOGISTICS_RATE = 0.15;
const LOGISTICS_MIN = 300_000;

export type FullPriceBreakdown = {
  chinaPrice: number;
  customs: number; // сумма таможенного сбора + СТП + утильсбора
  customsDetails: CustomsBreakdown;
  logistics: number;
  total: number;
};

// Полный расчёт цены с реальной таможней — требует курс юаня, поэтому
// асинхронная функция. Используется на страницах, где нужен точный разбор.
export function fullPriceBreakdown(
  trim: Trim,
  cnyRubRate: number
): FullPriceBreakdown {
  const chinaPrice = trim.priceFrom;
  const logistics = Math.max(chinaPrice * LOGISTICS_RATE, LOGISTICS_MIN);
  const customsDetails = calculateCustoms(trim, cnyRubRate);
  const customs = customsDetails.total;
  const total = chinaPrice + customs + logistics;
  return { chinaPrice, customs, customsDetails, logistics, total };
}

// Быстрая итоговая цена — для карточек/списков, где не нужен полный разбор,
// но нужен настоящий курс юаня (передаётся извне, чтобы не дёргать fetch
// на каждую карточку по отдельности).
export function totalPrice(trim: Trim, cnyRubRate: number): number {
  return fullPriceBreakdown(trim, cnyRubRate).total;
}
