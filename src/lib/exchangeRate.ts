// Курс ЦБ РФ. Кэшируем на 12 часов (обновление дважды в сутки) — курс ЦБ
// в любом случае обновляется раз в день, чаще запрашивать смысла нет.
const CACHE_SECONDS = 60 * 60 * 12;

// Запасное значение, если источник курса недоступен — чтобы сайт не падал
// и не показывал пустоту при сбое стороннего сервиса.
const FALLBACK_CNY_RUB = 12.3;

export async function getCnyRubRate(): Promise<number> {
  try {
    const res = await fetch("https://www.cbr-xml-daily.ru/daily_json.js", {
      next: { revalidate: CACHE_SECONDS },
    });
    if (!res.ok) return FALLBACK_CNY_RUB;
    const data = await res.json();
    const cny = data?.Valute?.CNY;
    if (!cny?.Value || !cny?.Nominal) return FALLBACK_CNY_RUB;
    const rate = cny.Value / cny.Nominal;
    return rate > 0 ? rate : FALLBACK_CNY_RUB;
  } catch {
    return FALLBACK_CNY_RUB;
  }
}
