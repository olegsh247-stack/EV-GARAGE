// ЭТО ДЕМО-ДАННЫЕ. Реальные фото, характеристики и цены нужно будет
// заменить на настоящие через этот файл (или через будущую админку).
// Формат гибкий — можно добавлять сколько угодно брендов, моделей и версий.
//
// Порядок полей в Trim соответствует порядку показа характеристик на
// странице версии — примерно как на китайских каталогах: сначала что за
// автомобиль и энергоустановка, потом запас хода и динамика, потом батарея
// и зарядка, потом привод и вместимость.

export type Trim = {
  slug: string; // для URL версии, напр. "550-pro"
  name: string; // отображаемое название версии/комплектации
  priceFrom: number; // цена в рублях (ориентировочно, нужно подтверждать)
  powertrainType: string; // "Электро" | "Гибрид (подключаемый)" | "Электро с бензиновым генератором" и т.д.
  rangeKm: number;
  powerHp: number;
  powerKw: number;
  torqueNm: number;
  accelSec: number; // 0-100 км/ч
  topSpeedKmh: number;
  batteryKwh: number;
  batteryType: string; // напр. "LFP", "NMC"
  fastCharge: string; // напр. "27 мин (30→80%)"
  drive: string; // "Передний" | "Задний" | "Полный"
  highlight?: string; // короткая фраза о ключевом отличии версии
};

export type Model = {
  slug: string;
  name: string;
  tagline: string;
  bodyType: string;
  seats: number;
  description: string;
  // версии отсортированы по цене от дешёвой к дорогой
  trims: Trim[];
};

export type Brand = {
  slug: string;
  name: string;
  country: string;
  description: string;
  accent: string; // hex, акцентный цвет бренда для мелких деталей
  models: Model[];
};

// Общий максимум для шкалы запаса хода на карточках (просто для наглядности)
export const RANGE_SCALE_MAX = 700;

// Поля сравнительной таблицы версий — label + функция чтения значения.
// Порядок здесь и определяет порядок колонок/строк характеристик.
export const TRIM_FIELDS: {
  key: string;
  label: string;
  read: (t: Trim) => string;
}[] = [
  { key: "powertrainType", label: "Тип двигателя", read: (t) => t.powertrainType },
  { key: "rangeKm", label: "Запас хода", read: (t) => `${t.rangeKm} км` },
  { key: "powerHp", label: "Мощность", read: (t) => `${t.powerHp} л.с. (${t.powerKw} кВт)` },
  { key: "torqueNm", label: "Крутящий момент", read: (t) => `${t.torqueNm} Н·м` },
  { key: "accelSec", label: "Разгон 0–100", read: (t) => `${t.accelSec} с` },
  { key: "topSpeedKmh", label: "Максимальная скорость", read: (t) => `${t.topSpeedKmh} км/ч` },
  { key: "drive", label: "Привод", read: (t) => t.drive },
  { key: "batteryKwh", label: "Батарея", read: (t) => `${t.batteryKwh} кВт·ч` },
  { key: "batteryType", label: "Тип батареи", read: (t) => t.batteryType },
  { key: "fastCharge", label: "Быстрая зарядка", read: (t) => t.fastCharge },
];

export const brands: Brand[] = [
  {
    slug: "zeekr",
    name: "Zeekr",
    country: "Китай",
    accent: "#0EA5A0",
    description:
      "Премиальный электрический бренд Geely. Собственная 800V-платформа, упор на запас хода и качество сборки.",
    models: [
      {
        slug: "zeekr-001",
        name: "Zeekr 001",
        tagline: "Лифтбек для дальних поездок",
        bodyType: "Лифтбек",
        seats: 5,
        description:
          "Флагманский лифтбек Zeekr с двумя электромоторами и запасом хода, которого хватает на дорогу между городами без дозарядки.",
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 4590000,
            powertrainType: "Электро",
            rangeKm: 620,
            powerHp: 544,
            powerKw: 400,
            torqueNm: 768,
            accelSec: 3.8,
            topSpeedKmh: 200,
            batteryKwh: 100,
            batteryType: "NMC",
            fastCharge: "~30 мин (10→80%)",
            drive: "Полный",
          },
        ],
      },
      {
        slug: "zeekr-x",
        name: "Zeekr X",
        tagline: "Компактный кроссовер",
        bodyType: "Кроссовер",
        seats: 5,
        description:
          "Городской кроссовер на платформе SEA от Volvo/Geely — компактные размеры при полноценном запасе хода.",
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 3190000,
            powertrainType: "Электро",
            rangeKm: 440,
            powerHp: 428,
            powerKw: 315,
            torqueNm: 543,
            accelSec: 3.7,
            topSpeedKmh: 190,
            batteryKwh: 66,
            batteryType: "NMC",
            fastCharge: "~27 мин (10→80%)",
            drive: "Полный",
          },
        ],
      },
    ],
  },
  {
    slug: "nio",
    name: "NIO",
    country: "Китай",
    accent: "#2F5DFF",
    description:
      "Технологичный бренд с акцентом на автопилот и сеть станций замены батарей.",
    models: [
      {
        slug: "nio-et5",
        name: "NIO ET5",
        tagline: "Электрический седан бизнес-класса",
        bodyType: "Седан",
        seats: 5,
        description:
          "Седан NIO ET5 сочетает спортивную динамику с продуманным салоном и системой автопилота NAD.",
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 4290000,
            powertrainType: "Электро",
            rangeKm: 560,
            powerHp: 408,
            powerKw: 300,
            torqueNm: 700,
            accelSec: 4.3,
            topSpeedKmh: 200,
            batteryKwh: 75,
            batteryType: "NMC",
            fastCharge: "~30 мин (10→80%)",
            drive: "Полный",
          },
        ],
      },
      {
        slug: "nio-es6",
        name: "NIO ES6",
        tagline: "Семейный электрокроссовер",
        bodyType: "Кроссовер",
        seats: 5,
        description:
          "Просторный кроссовер для семьи с большим багажником и мягкой пневмоподвеской.",
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 4890000,
            powertrainType: "Электро",
            rangeKm: 500,
            powerHp: 435,
            powerKw: 320,
            torqueNm: 610,
            accelSec: 4.5,
            topSpeedKmh: 200,
            batteryKwh: 75,
            batteryType: "NMC",
            fastCharge: "~32 мин (10→80%)",
            drive: "Полный",
          },
        ],
      },
    ],
  },
  {
    slug: "byd",
    name: "BYD",
    country: "Китай",
    accent: "#FF6B3D",
    description:
      "Крупнейший производитель электромобилей в мире. Собственные батареи Blade и широкая линейка моделей.",
    models: [
      {
        slug: "byd-han",
        name: "BYD Han EV",
        tagline: "Флагманский седан",
        bodyType: "Седан",
        seats: 5,
        description:
          "Флагман BYD с фирменной батареей Blade — повышенная безопасность при аварии и долгий ресурс.",
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 3690000,
            powertrainType: "Электро",
            rangeKm: 520,
            powerHp: 517,
            powerKw: 380,
            torqueNm: 700,
            accelSec: 3.9,
            topSpeedKmh: 185,
            batteryKwh: 85.4,
            batteryType: "LFP",
            fastCharge: "~28 мин (10→80%)",
            drive: "Полный",
          },
        ],
      },
      {
        slug: "byd-song-plus",
        name: "BYD Song Plus EV",
        tagline: "Кроссовер на каждый день",
        bodyType: "Кроссовер",
        seats: 5,
        description:
          "Один из самых популярных электрокроссоверов BYD — баланс цены, запаса хода и практичности.",
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 2790000,
            powertrainType: "Электро",
            rangeKm: 450,
            powerHp: 204,
            powerKw: 150,
            torqueNm: 310,
            accelSec: 8.5,
            topSpeedKmh: 175,
            batteryKwh: 71.8,
            batteryType: "LFP",
            fastCharge: "~35 мин (10→80%)",
            drive: "Передний",
          },
        ],
      },
    ],
  },
  {
    slug: "toyota",
    name: "Toyota",
    country: "Китай (СП FAW-Toyota)",
    accent: "#C81E3A",
    description:
      "Электрические модели линейки bZ, которые Toyota выпускает специально для китайского рынка совместно с FAW. В bZ5 используется батарея BYD Blade.",
    models: [
      {
        slug: "toyota-bz5",
        name: "Toyota bZ5",
        tagline: "Купе-кроссовер на платформе e-TNGA",
        bodyType: "Купе-кроссовер",
        seats: 5,
        description:
          "Электрический купе-кроссовер Toyota, выпускаемый совместным предприятием FAW-Toyota. Батарея LFP Blade поставляется BYD, что даёт большой ресурс и повышенную безопасность. Все версии используют один и тот же мотор 200 кВт (268 л.с.), различия — в батарее, оснащении и системах помощи водителю.",
        // Цены в юанях переведены в рубли ОРИЕНТИРОВОЧНО по грубому курсу,
        // это китайская розничная цена без учёта доставки/растаможки в РФ.
        // Обязательно подтвердить реальную цену у поставщика перед публикацией.
        trims: [
          {
            slug: "550-joy",
            name: "550 Joy",
            priceFrom: 1750000,
            powertrainType: "Электро",
            rangeKm: 550,
            powerHp: 268,
            powerKw: 200,
            torqueNm: 330,
            accelSec: 7.5,
            topSpeedKmh: 160,
            batteryKwh: 65.28,
            batteryType: "LFP (BYD Blade)",
            fastCharge: "27 мин (30→80%)",
            drive: "Передний",
            highlight: "Базовая версия: экран 15,6\", 5G, голосовой ассистент",
          },
          {
            slug: "550-pro",
            name: "550 Pro",
            priceFrom: 1890000,
            powertrainType: "Электро",
            rangeKm: 550,
            powerHp: 268,
            powerKw: 200,
            torqueNm: 330,
            accelSec: 7.5,
            topSpeedKmh: 160,
            batteryKwh: 65.28,
            batteryType: "LFP (BYD Blade)",
            fastCharge: "27 мин (30→80%)",
            drive: "Передний",
            highlight: "Диски 21\", LED-оптика на всю ширину, панорамная крыша",
          },
          {
            slug: "550-pro-smart",
            name: "550 Pro Smart Edition",
            priceFrom: 2160000,
            powertrainType: "Электро",
            rangeKm: 550,
            powerHp: 268,
            powerKw: 200,
            torqueNm: 330,
            accelSec: 7.5,
            topSpeedKmh: 160,
            batteryKwh: 65.28,
            batteryType: "LFP (BYD Blade)",
            fastCharge: "27 мин (30→80%)",
            drive: "Передний",
            highlight:
              "Продвинутый автопилот Toyota Pilot (Momenta 5.0) с лидаром",
          },
          {
            slug: "630-pro",
            name: "630 Pro",
            priceFrom: 2160000,
            powertrainType: "Электро",
            rangeKm: 630,
            powerHp: 268,
            powerKw: 200,
            torqueNm: 330,
            accelSec: 7.5,
            topSpeedKmh: 160,
            batteryKwh: 73.98,
            batteryType: "LFP (BYD Blade)",
            fastCharge: "27 мин (30→80%)",
            drive: "Передний",
            highlight: "Увеличенный запас хода 630 км, электропривод багажника",
          },
        ],
      },
    ],
  },
];

export function getBrand(slug: string) {
  return brands.find((b) => b.slug === slug);
}

export function getModel(brandSlug: string, modelSlug: string) {
  const brand = getBrand(brandSlug);
  const model = brand?.models.find((m) => m.slug === modelSlug);
  return brand && model ? { brand, model } : undefined;
}

export function getTrim(brandSlug: string, modelSlug: string, trimSlug: string) {
  const found = getModel(brandSlug, modelSlug);
  const trim = found?.model.trims.find((t) => t.slug === trimSlug);
  return found && trim ? { ...found, trim } : undefined;
}

// Самая доступная версия модели — используется как "цена от" на карточках
export function baseTrim(model: Model) {
  return [...model.trims].sort((a, b) => a.priceFrom - b.priceFrom)[0];
}

// Какие поля сравнительной таблицы реально отличаются между версиями —
// чтобы не показывать одинаковые строки/колонки по 4 раза подряд.
export function differingTrimFields(model: Model) {
  return TRIM_FIELDS.filter((field) => {
    const values = new Set(model.trims.map((t) => field.read(t)));
    return values.size > 1;
  });
}

export function allModelsFlat() {
  return brands.flatMap((b) => b.models.map((m) => ({ brand: b, model: m })));
}
