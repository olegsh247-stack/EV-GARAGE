// ЭТО ДЕМО-ДАННЫЕ. Реальные фото, характеристики и цены нужно будет
// заменить на настоящие через этот файл (или через будущую админку).
// Формат гибкий — можно добавлять сколько угодно брендов и моделей.

export type Spec = {
  label: string;
  value: string;
  unit?: string;
};

export type Model = {
  slug: string;
  name: string;
  tagline: string;
  priceFrom: number; // в рублях
  rangeKm: number; // запас хода, для наглядной шкалы
  maxRangeKm: number; // для расчёта шкалы (максимум по линейке)
  batteryKwh: number;
  powerHp: number;
  accelSec: number; // 0-100 км/ч
  drive: string;
  seats: number;
  bodyType: string;
  description: string;
  specs: Spec[];
};

export type Brand = {
  slug: string;
  name: string;
  country: string;
  description: string;
  accent: string; // hex, акцентный цвет бренда для мелких деталей
  models: Model[];
};

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
        priceFrom: 4590000,
        rangeKm: 620,
        maxRangeKm: 700,
        batteryKwh: 100,
        powerHp: 544,
        accelSec: 3.8,
        drive: "Полный",
        seats: 5,
        bodyType: "Лифтбек",
        description:
          "Флагманский лифтбек Zeekr с двумя электромоторами и запасом хода, которого хватает на дорогу между городами без дозарядки.",
        specs: [
          { label: "Запас хода", value: "620", unit: "км" },
          { label: "Батарея", value: "100", unit: "кВт·ч" },
          { label: "Мощность", value: "544", unit: "л.с." },
          { label: "Разгон 0–100", value: "3.8", unit: "с" },
          { label: "Привод", value: "Полный" },
          { label: "Мест", value: "5" },
        ],
      },
      {
        slug: "zeekr-x",
        name: "Zeekr X",
        tagline: "Компактный кроссовер",
        priceFrom: 3190000,
        rangeKm: 440,
        maxRangeKm: 700,
        batteryKwh: 66,
        powerHp: 428,
        accelSec: 3.7,
        drive: "Полный",
        seats: 5,
        bodyType: "Кроссовер",
        description:
          "Городской кроссовер на платформе SEA от Volvo/Geely — компактные размеры при полноценном запасе хода.",
        specs: [
          { label: "Запас хода", value: "440", unit: "км" },
          { label: "Батарея", value: "66", unit: "кВт·ч" },
          { label: "Мощность", value: "428", unit: "л.с." },
          { label: "Разгон 0–100", value: "3.7", unit: "с" },
          { label: "Привод", value: "Полный" },
          { label: "Мест", value: "5" },
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
        priceFrom: 4290000,
        rangeKm: 560,
        maxRangeKm: 700,
        batteryKwh: 75,
        powerHp: 408,
        accelSec: 4.3,
        drive: "Полный",
        seats: 5,
        bodyType: "Седан",
        description:
          "Седан NIO ET5 сочетает спортивную динамику с продуманным салоном и системой автопилота NAD.",
        specs: [
          { label: "Запас хода", value: "560", unit: "км" },
          { label: "Батарея", value: "75", unit: "кВт·ч" },
          { label: "Мощность", value: "408", unit: "л.с." },
          { label: "Разгон 0–100", value: "4.3", unit: "с" },
          { label: "Привод", value: "Полный" },
          { label: "Мест", value: "5" },
        ],
      },
      {
        slug: "nio-es6",
        name: "NIO ES6",
        tagline: "Семейный электрокроссовер",
        priceFrom: 4890000,
        rangeKm: 500,
        maxRangeKm: 700,
        batteryKwh: 75,
        powerHp: 435,
        accelSec: 4.5,
        drive: "Полный",
        seats: 5,
        bodyType: "Кроссовер",
        description:
          "Просторный кроссовер для семьи с большим багажником и мягкой пневмоподвеской.",
        specs: [
          { label: "Запас хода", value: "500", unit: "км" },
          { label: "Батарея", value: "75", unit: "кВт·ч" },
          { label: "Мощность", value: "435", unit: "л.с." },
          { label: "Разгон 0–100", value: "4.5", unit: "с" },
          { label: "Привод", value: "Полный" },
          { label: "Мест", value: "5" },
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
        priceFrom: 3690000,
        rangeKm: 520,
        maxRangeKm: 700,
        batteryKwh: 85.4,
        powerHp: 517,
        accelSec: 3.9,
        drive: "Полный",
        seats: 5,
        bodyType: "Седан",
        description:
          "Флагман BYD с фирменной батареей Blade — повышенная безопасность при аварии и долгий ресурс.",
        specs: [
          { label: "Запас хода", value: "520", unit: "км" },
          { label: "Батарея", value: "85.4", unit: "кВт·ч" },
          { label: "Мощность", value: "517", unit: "л.с." },
          { label: "Разгон 0–100", value: "3.9", unit: "с" },
          { label: "Привод", value: "Полный" },
          { label: "Мест", value: "5" },
        ],
      },
      {
        slug: "byd-song-plus",
        name: "BYD Song Plus EV",
        tagline: "Кроссовер на каждый день",
        priceFrom: 2790000,
        rangeKm: 450,
        maxRangeKm: 700,
        batteryKwh: 71.8,
        powerHp: 204,
        accelSec: 8.5,
        drive: "Передний",
        seats: 5,
        bodyType: "Кроссовер",
        description:
          "Один из самых популярных электрокроссоверов BYD — баланс цены, запаса хода и практичности.",
        specs: [
          { label: "Запас хода", value: "450", unit: "км" },
          { label: "Батарея", value: "71.8", unit: "кВт·ч" },
          { label: "Мощность", value: "204", unit: "л.с." },
          { label: "Разгон 0–100", value: "8.5", unit: "с" },
          { label: "Привод", value: "Передний" },
          { label: "Мест", value: "5" },
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

export function allModelsFlat() {
  return brands.flatMap((b) => b.models.map((m) => ({ brand: b, model: m })));
}
