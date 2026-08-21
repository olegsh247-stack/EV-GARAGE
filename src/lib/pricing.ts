// Логистика — 15% от цены в Китае, но не менее 300 000 ₽.
// Таможня пока не рассчитывается (0) — формула появится позже.
const LOGISTICS_RATE = 0.15;
const LOGISTICS_MIN = 300000;
const CUSTOMS_PLACEHOLDER = 0;

export function priceBreakdown(chinaPrice: number) {
  const logistics = Math.max(chinaPrice * LOGISTICS_RATE, LOGISTICS_MIN);
  const customs = CUSTOMS_PLACEHOLDER;
  const total = chinaPrice + customs + logistics;
  return { chinaPrice, customs, logistics, total };
}

// Итоговая цена — то, что показываем как "цену" везде на сайте
// (карточки, сравнение, топы), кроме страницы версии, где виден разбор.
export function totalPrice(chinaPrice: number) {
  return priceBreakdown(chinaPrice).total;
}
