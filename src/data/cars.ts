// ЭТО ДЕМО-ДАННЫЕ. Реальные фото, характеристики и цены нужно будет
// заменить на настоящие через этот файл (или через будущую админку).
// Формат гибкий — можно добавлять сколько угодно брендов, моделей и версий.

export type Trim = {
  name: string; // название версии/комплектации
  priceFrom: number; // цена в рублях (ориентировочно, нужно подтверждать)
  rangeKm: number;
  batteryKwh: number;
  powerHp: number;
  accelSec: number; // 0-100 км/ч
  drive: string;
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
            name: "Стандарт",
            priceFrom: 4590000,
            rangeKm: 620,
            batteryKwh: 100,
            powerHp: 544,
            accelSec: 3.8,
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
            name: "Стандарт",
            priceFrom: 3190000,
            rangeKm: 440,
            batteryKwh: 66,
            powerHp: 428,
            accelSec: 3.7,
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
            name: "Стандарт",
            priceFrom: 4290000,
            rangeKm: 560,
            batteryKwh: 75,
            powerHp: 408,
            accelSec: 4.3,
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
            name: "Стандарт",
            priceFrom: 4890000,
            rangeKm: 500,
            batteryKwh: 75,
            powerHp: 435,
            accelSec: 4.5,
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
            name: "Стандарт",
            priceFrom: 3690000,
            rangeKm: 520,
            batteryKwh: 85.4,
            powerHp: 517,
            accelSec: 3.9,
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
            name: "Стандарт",
            priceFrom: 2790000,
            rangeKm: 450,
            batteryKwh: 71.8,
            powerHp: 204,
            accelSec: 8.5,
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
            name: "550 Joy",
            priceFrom: 1750000,
            rangeKm: 550,
            batteryKwh: 65.28,
            powerHp: 268,
            accelSec: 7.5,
            drive: "Передний",
            highlight: "Базовая версия: экран 15,6\", 5G, голосовой ассистент",
          },
          {
            name: "550 Pro",
            priceFrom: 1890000,
            rangeKm: 550,
            batteryKwh: 65.28,
            powerHp: 268,
            accelSec: 7.5,
            drive: "Передний",
            highlight: "Диски 21\", LED-оптика на всю ширину, панорамная крыша",
          },
          {
            name: "550 Pro Smart Edition",
            priceFrom: 2160000,
            rangeKm: 550,
            batteryKwh: 65.28,
            powerHp: 268,
            accelSec: 7.5,
            drive: "Передний",
            highlight:
              "Продвинутый автопилот Toyota Pilot (Momenta 5.0) с лидаром",
          },
          {
            name: "630 Pro",
            priceFrom: 2160000,
            rangeKm: 630,
            batteryKwh: 73.98,
            powerHp: 268,
            accelSec: 7.5,
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

// Самая доступная версия модели — используется как "цена от" на карточках
export function baseTrim(model: Model) {
  return [...model.trims].sort((a, b) => a.priceFrom - b.priceFrom)[0];
}

export function allModelsFlat() {
  return brands.flatMap((b) => b.models.map((m) => ({ brand: b, model: m })));
}
