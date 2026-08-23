// ЭТО ДЕМО-ДАННЫЕ. Реальные фото, характеристики и цены нужно будет
// заменить на настоящие через этот файл (или через будущую админку).
// Формат гибкий — можно добавлять сколько угодно брендов, моделей и версий.
//
// Порядок полей в Trim соответствует порядку показа характеристик на
// странице версии — примерно как на китайских каталогах: сначала что за
// автомобиль и энергоустановка, потом запас хода и динамика, потом батарея
// и зарядка, потом привод и вместимость.

export type PowertrainType = "BEV" | "EREV" | "HEV" | "PHEV";

export const POWERTRAIN_LABELS: Record<PowertrainType, string> = {
  BEV: "чистый электромобиль",
  EREV: "последовательный гибрид",
  HEV: "гибрид",
  PHEV: "подключаемый гибрид",
};

export type Trim = {
  slug: string; // для URL версии, напр. "550-pro"
  name: string; // отображаемое название версии/комплектации
  priceFrom: number; // цена в рублях (ориентировочно, нужно подтверждать)
  powertrainType: PowertrainType;
  rangeKm: number;
  powerHp: number;
  powerKw: number;
  powerP30Kw?: number; // P30 — максимальная 30-минутная мощность (кВт), указываем только если есть в документации/омологации
  torqueNm: number;
  accelSec: number; // 0-100 км/ч
  topSpeedKmh: number;
  batteryKwh: number;
  batteryType: string; // напр. "LFP", "NMC"
  fastCharge: string; // напр. "27 мин (30→80%)"
  drive: string; // "Передний" | "Задний" | "Полный"
  highlight?: string; // короткая фраза о ключевом отличии версии
};

export type ColorOption = {
  name: string;
  hex: string;
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
  // Цвета кузова и интерьера — опционально, заполняется по мере
  // появления данных с официальных источников/китайских порталов
  exteriorColors?: ColorOption[];
  interiorColors?: ColorOption[];
};

export type Brand = {
  slug: string;
  name: string;
  country: string;
  description: string;
  accent: string; // hex, акцентный цвет бренда для мелких деталей
  logo: string; // короткая текстовая метка для плитки-логотипа (2-3 символа)
  models: Model[];
};

// Общий максимум для шкалы запаса хода на карточках (просто для наглядности)
export const RANGE_SCALE_MAX = 700;

// Единый порядок из 11 базовых характеристик — как в договорённости и на
// китайских каталогах (autohome.com.cn/config/spec/...). "Тип кузова" и
// "Мест" берутся с уровня модели, остальное — с уровня конкретной версии.
export function fullSpecRows(model: Model, trim: Trim) {
  const rows = [
    { label: "Тип кузова", value: model.bodyType },
    {
      label: "Тип двигателя",
      value: `${trim.powertrainType} — ${POWERTRAIN_LABELS[trim.powertrainType]}`,
    },
    { label: "Запас хода (CLTC)", value: `${trim.rangeKm} км` },
    {
      label: "Мощность",
      value: `${trim.powerHp} л.с. (${trim.powerKw} кВт)`,
    },
  ];
  if (trim.powerP30Kw !== undefined) {
    rows.push({
      label: "P30 (30-мин. мощность)",
      value: `${trim.powerP30Kw} кВт`,
    });
  }
  rows.push(
    { label: "Крутящий момент", value: `${trim.torqueNm} Н·м` },
    { label: "Разгон 0–100", value: `${trim.accelSec} с` },
    { label: "Привод", value: trim.drive },
    {
      label: "Батарея",
      value: `${trim.batteryKwh} кВт·ч (${trim.batteryType})`,
    },
    { label: "Быстрая зарядка", value: trim.fastCharge },
    { label: "Максимальная скорость", value: `${trim.topSpeedKmh} км/ч` },
    { label: "Мест", value: String(model.seats) }
  );
  return rows;
}

export const brands: Brand[] = [
  {
    slug: "zeekr",
    name: "Zeekr",
    country: "Китай",
    accent: "#0EA5A0",
    logo: "Z",
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
        exteriorColors: [
          { name: "Полярный белый", hex: "#F2F2F0" },
          { name: "Лазерный серый", hex: "#8C9096" },
          { name: "Угольно-чёрный", hex: "#16171A" },
          { name: "Электрический синий", hex: "#1E5FBF" },
        ],
        interiorColors: [
          { name: "Чёрно-серый", hex: "#3A3A3C" },
          { name: "Чёрно-зелёный", hex: "#2E3B32" },
          { name: "Сине-белый", hex: "#D8DEE6" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 4590000,
            powertrainType: "BEV",
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
        exteriorColors: [
          { name: "Хрустально-белый", hex: "#F1F1EC" },
          { name: "Сосново-зелёный", hex: "#3E4A3D" },
          { name: "Дворцовый бежевый", hex: "#D8CBB8" },
          { name: "Туманно-серый", hex: "#9B9C9E" },
        ],
        interiorColors: [
          { name: "Чёрный с красной прострочкой", hex: "#1A1A1C" },
          { name: "Чёрно-белый двухцветный", hex: "#E7E7E3" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 3190000,
            powertrainType: "BEV",
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
    logo: "NIO",
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
        exteriorColors: [
          { name: "Облачно-белый", hex: "#F0F1EE" },
          { name: "Звёздно-серый", hex: "#8A8D91" },
          { name: "Глубокий чёрный", hex: "#17181B" },
          { name: "Марсианский красный", hex: "#A6362E" },
          { name: "Небесно-синий", hex: "#3E6FA8" },
        ],
        interiorColors: [
          { name: "Ониксовый чёрный", hex: "#232323" },
          { name: "Терракотовый", hex: "#B4562F" },
          { name: "Каменно-серый", hex: "#8D8A82" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 4290000,
            powertrainType: "BEV",
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
        exteriorColors: [
          { name: "Облачно-белый", hex: "#F0F1EE" },
          { name: "Глубокий чёрный", hex: "#17181B" },
          { name: "Звёздно-серый", hex: "#8A8D91" },
          { name: "Марсианский красный", hex: "#A6362E" },
          { name: "Арктический зелёный", hex: "#5A7A6A" },
        ],
        interiorColors: [
          { name: "Ониксовый чёрный", hex: "#232323" },
          { name: "Речной синий", hex: "#3D5A73" },
          { name: "Красная глина", hex: "#8C4A38" },
          { name: "Звёздный фиолетовый", hex: "#5C4A63" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 4890000,
            powertrainType: "BEV",
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
    logo: "BYD",
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
        exteriorColors: [
          { name: "Чёрный", hex: "#171717" },
          { name: "Серый", hex: "#7C7E82" },
          { name: "Снежно-белый", hex: "#EFEFEC" },
          { name: "Красный", hex: "#A32A2E" },
          { name: "Синий (Аврора)", hex: "#2B4FA0" },
        ],
        interiorColors: [
          { name: "Коричневый (Кирин)", hex: "#5A3A2A" },
          { name: "Красный (Феникс)", hex: "#7A2027" },
          { name: "Серый (Небесный свод)", hex: "#8A8C8F" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 3690000,
            powertrainType: "BEV",
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
        exteriorColors: [
          { name: "Снежно-белый", hex: "#EFEFEC" },
          { name: "Каменно-серый", hex: "#8A8C8F" },
          { name: "Чёрный", hex: "#1A1A1A" },
          { name: "Красный", hex: "#A32A2E" },
        ],
        interiorColors: [
          { name: "Чёрный", hex: "#1E1E1E" },
          { name: "Светло-бежевый", hex: "#DCD3C4" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 2790000,
            powertrainType: "BEV",
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
    logo: "T",
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
        exteriorColors: [
          { name: "Чёрный оникс", hex: "#0B0B0D" },
          { name: "Ртутный серебристый", hex: "#B7BCC0" },
          { name: "Ослепительно-жёлтый", hex: "#F2C22E" },
          { name: "Платиново-белый", hex: "#F1F0EA" },
          { name: "Огненно-красный", hex: "#C31E2A" },
        ],
        interiorColors: [
          { name: "Чёрный с золотистым акцентом", hex: "#2B2621" },
          { name: "Огненно-красный", hex: "#7A2020" },
          { name: "Лунно-белый", hex: "#E8E4DC" },
        ],
        // Цены в юанях переведены в рубли ОРИЕНТИРОВОЧНО по грубому курсу,
        // это китайская розничная цена без учёта доставки/растаможки в РФ.
        // Обязательно подтвердить реальную цену у поставщика перед публикацией.
        trims: [
          {
            slug: "550-joy",
            name: "550 Joy",
            priceFrom: 1750000,
            powertrainType: "BEV",
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
            powertrainType: "BEV",
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
            powertrainType: "BEV",
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
            powertrainType: "BEV",
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
      {
        slug: "toyota-bz3",
        name: "Toyota bZ3",
        tagline: "Компактный седан на платформе e-TNGA",
        bodyType: "Седан",
        seats: 5,
        description:
          "Электрический седан Toyota, разработанный совместно с BYD в рамках СП BYD Toyota EV Technology и выпускаемый FAW-Toyota. Батарея LFP Blade и электромотор поставляются BYD, кузов и платформа — от Toyota.",
        exteriorColors: [
          { name: "Платиново-белый", hex: "#F1F0EA" },
          { name: "Кристальный серый", hex: "#8B8D8F" },
          { name: "Янтарно-коричневый", hex: "#6B4A38" },
          { name: "Слюдяно-красный", hex: "#9E2B31" },
          { name: "Чёрный", hex: "#161616" },
        ],
        interiorColors: [
          { name: "Лунно-белый", hex: "#E8E4DC" },
          { name: "Туманно-серый", hex: "#8D8D8D" },
          { name: "Золотисто-серый", hex: "#6E6660" },
          { name: "Золотисто-коричневый", hex: "#8A6A45" },
        ],
        // Цены переведены из юаней ОРИЕНТИРОВОЧНО, это китайская розничная
        // цена без учёта доставки/растаможки в РФ — подтвердить у поставщика.
        trims: [
          {
            slug: "517-joy",
            name: "517 Joy",
            priceFrom: 2290000,
            powertrainType: "BEV",
            rangeKm: 517,
            powerHp: 181,
            powerKw: 135,
            torqueNm: 303,
            accelSec: 8.5,
            topSpeedKmh: 160,
            batteryKwh: 49.9,
            batteryType: "LFP (BYD Blade)",
            fastCharge: "27 мин (30→80%)",
            drive: "Передний",
            highlight: "Базовая версия с компактной батареей",
          },
          {
            slug: "616-pro",
            name: "616 Pro",
            priceFrom: 2560000,
            powertrainType: "BEV",
            rangeKm: 616,
            powerHp: 241,
            powerKw: 180,
            torqueNm: 303,
            accelSec: 7.5,
            topSpeedKmh: 160,
            batteryKwh: 65.3,
            batteryType: "LFP (BYD Blade)",
            fastCharge: "27 мин (30→80%)",
            drive: "Передний",
            highlight: "Увеличенная батарея и более мощный мотор",
          },
          {
            slug: "616-premium",
            name: "616 Premium",
            priceFrom: 2690000,
            powertrainType: "BEV",
            rangeKm: 616,
            powerHp: 241,
            powerKw: 180,
            torqueNm: 303,
            accelSec: 7.5,
            topSpeedKmh: 160,
            batteryKwh: 65.3,
            batteryType: "LFP (BYD Blade)",
            fastCharge: "27 мин (30→80%)",
            drive: "Передний",
            highlight: "Топовая комплектация с расширенным оснащением",
          },
        ],
      },
    ],
  },
  {
    slug: "xpeng",
    name: "Xpeng",
    country: "Китай",
    accent: "#00A9E0",
    logo: "X",
    description:
      "Один из лидеров по автопилоту среди китайских EV-брендов, известен собственной системой помощи водителю XNGP.",
    models: [
      {
        slug: "xpeng-g6",
        name: "Xpeng G6",
        tagline: "Купе-кроссовер с фирменным автопилотом",
        bodyType: "Купе-кроссовер",
        seats: 5,
        description:
          "Электрический купе-кроссовер на 800V-платформе SEPA 2.0 с одной из лучших в классе систем автопилота XNGP.",
        exteriorColors: [
          { name: "Арктический белый", hex: "#F1F1EE" },
          { name: "Полночный чёрный", hex: "#141416" },
          { name: "Серебристый иней", hex: "#B9BDC0" },
          { name: "Графитовый серый", hex: "#54565A" },
          { name: "Огненный оранжевый", hex: "#E0562A" },
        ],
        interiorColors: [
          { name: "Тёмно-серый", hex: "#3B3B3D" },
          { name: "Светло-серый", hex: "#C7C6C2" },
        ],
        trims: [
          {
            slug: "long-range",
            name: "Long Range",
            priceFrom: 2390000,
            powertrainType: "BEV",
            rangeKm: 580,
            powerHp: 218,
            powerKw: 160,
            torqueNm: 440,
            accelSec: 6.9,
            topSpeedKmh: 200,
            batteryKwh: 80.9,
            batteryType: "NMC",
            fastCharge: "20 мин (10→80%)",
            drive: "Задний",
          },
        ],
      },
    ],
  },
  {
    slug: "li-auto",
    name: "Li Auto",
    country: "Китай",
    accent: "#2D6A4F",
    logo: "LI",
    description:
      "Специализируется на больших семейных SUV с увеличенным запасом хода за счёт бензинового генератора (EREV).",
    models: [
      {
        slug: "li-l9",
        name: "Li Auto L9",
        tagline: "Полноразмерный SUV на 6 мест",
        bodyType: "Полноразмерный SUV",
        seats: 6,
        description:
          "Флагманский SUV Li Auto с электрическим приводом и бензиновым генератором для увеличения запаса хода — можно ездить только на электричестве в городе и не бояться дальних поездок.",
        exteriorColors: [
          { name: "Золотистый металлик", hex: "#A98A5C" },
          { name: "Серебристый металлик", hex: "#B9BABC" },
          { name: "Серый металлик", hex: "#6E7073" },
          { name: "Чёрный металлик", hex: "#161616" },
        ],
        interiorColors: [
          { name: "Чёрно-коричневый", hex: "#4A362A" },
          { name: "Чёрно-оранжевый", hex: "#B5501F" },
          { name: "Чёрно-белый", hex: "#E7E5E0" },
        ],
        trims: [
          {
            slug: "max",
            name: "Max",
            priceFrom: 4850000,
            powertrainType: "EREV",
            rangeKm: 215,
            powerHp: 449,
            powerKw: 330,
            torqueNm: 620,
            accelSec: 5.3,
            topSpeedKmh: 180,
            batteryKwh: 44.5,
            batteryType: "LFP",
            fastCharge: "~20 мин (10→80%)",
            drive: "Полный",
            highlight: "215 км на электротяге + генератор — общий запас свыше 1300 км",
          },
        ],
      },
    ],
  },
  {
    slug: "leapmotor",
    name: "Leapmotor",
    country: "Китай",
    accent: "#5B7FDE",
    logo: "LM",
    description:
      "Бренд с упором на доступную цену без потери в оснащении, поддержан инвестициями Stellantis.",
    models: [
      {
        slug: "leapmotor-c10",
        name: "Leapmotor C10",
        tagline: "Просторный семейный кроссовер",
        bodyType: "Кроссовер",
        seats: 5,
        description:
          "Среднеразмерный кроссовер с большим салоном и хорошим соотношением цены и оснащения.",
        exteriorColors: [
          { name: "Жемчужно-белый", hex: "#EFEFEA" },
          { name: "Полуночно-серый", hex: "#54565A" },
          { name: "Нефритово-зелёный", hex: "#3E5A4E" },
          { name: "Терракотовый серый", hex: "#8A7C70" },
          { name: "Металлик чёрный", hex: "#161616" },
        ],
        interiorColors: [
          { name: "Закатный оранжевый", hex: "#C05A2A" },
          { name: "Звёздный фиолетовый", hex: "#5C4D63" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 1690000,
            powertrainType: "BEV",
            rangeKm: 480,
            powerHp: 218,
            powerKw: 160,
            torqueNm: 320,
            accelSec: 7.5,
            topSpeedKmh: 170,
            batteryKwh: 69.9,
            batteryType: "LFP",
            fastCharge: "~30 мин (10→80%)",
            drive: "Задний",
          },
        ],
      },
    ],
  },
  {
    slug: "aion",
    name: "GAC Aion",
    country: "Китай",
    accent: "#7C3AED",
    logo: "AI",
    description:
      "Электрический суббренд GAC, один из крупнейших производителей EV в Китае по объёму продаж.",
    models: [
      {
        slug: "aion-y-plus",
        name: "Aion Y Plus",
        tagline: "Компактный городской кроссовер",
        bodyType: "Кроссовер",
        seats: 5,
        description:
          "Доступный компактный кроссовер с хорошим запасом хода для города и пригорода.",
        exteriorColors: [
          { name: "Жемчужно-белый", hex: "#EFEFEA" },
          { name: "Элегантный серый", hex: "#8A8C8E" },
          { name: "Скоростной серебристый", hex: "#C3C5C7" },
          { name: "Полуночно-чёрный", hex: "#151515" },
          { name: "Сосново-жёлтый", hex: "#D9B24C" },
        ],
        interiorColors: [
          { name: "Чёрный", hex: "#1E1E1E" },
          { name: "Чёрный с абрикосовым", hex: "#B98A5A" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 1390000,
            powertrainType: "BEV",
            rangeKm: 510,
            powerHp: 184,
            powerKw: 136,
            torqueNm: 225,
            accelSec: 8.0,
            topSpeedKmh: 165,
            batteryKwh: 63.2,
            batteryType: "LFP",
            fastCharge: "~30 мин (10→80%)",
            drive: "Передний",
          },
        ],
      },
    ],
  },
  {
    slug: "voyah",
    name: "Voyah",
    country: "Китай",
    accent: "#B08D57",
    logo: "VO",
    description:
      "Премиальный бренд Dongfeng, специализируется на больших комфортных кроссоверах и минивэнах.",
    models: [
      {
        slug: "voyah-free",
        name: "Voyah Free",
        tagline: "Премиальный кроссовер-купе",
        bodyType: "Кроссовер-купе",
        seats: 5,
        description:
          "Полноприводный премиальный кроссовер с акцентом на комфорт салона и плавность хода.",
        exteriorColors: [
          { name: "Чистый белый", hex: "#EFEEE9" },
          { name: "Звёздный серебристый", hex: "#B9BABC" },
          { name: "Глубокий чёрный", hex: "#131313" },
          { name: "Рассветный красный", hex: "#A6362E" },
          { name: "Сумеречный фиолетовый", hex: "#5A4D63" },
        ],
        interiorColors: [
          { name: "Рассветный оранжевый", hex: "#C0602E" },
          { name: "Лунная тень (чёрный)", hex: "#1D1D1D" },
          { name: "Светлое молочно-белое", hex: "#E9E4D8" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 3290000,
            powertrainType: "BEV",
            rangeKm: 505,
            powerHp: 435,
            powerKw: 320,
            torqueNm: 620,
            accelSec: 4.7,
            topSpeedKmh: 200,
            batteryKwh: 84,
            batteryType: "NMC",
            fastCharge: "~28 мин (10→80%)",
            drive: "Полный",
          },
        ],
      },
    ],
  },
  {
    slug: "hongqi",
    name: "Hongqi",
    country: "Китай",
    accent: "#A6172A",
    logo: "HQ",
    description:
      "Исторический китайский бренд (FAW), сейчас активно развивает электрическую линейку.",
    models: [
      {
        slug: "hongqi-eqm5",
        name: "Hongqi E-QM5",
        tagline: "Доступный электроседан",
        bodyType: "Седан",
        seats: 5,
        description:
          "Практичный электроседан от одного из старейших автомобильных брендов Китая.",
        exteriorColors: [
          { name: "Арктический белый", hex: "#EEEDE8" },
          { name: "Квантовый серебристо-серый", hex: "#AEB0B2" },
          { name: "Платиново-золотой", hex: "#B9A06A" },
          { name: "Красный флага", hex: "#A32A2E" },
          { name: "Полночный чёрный", hex: "#131313" },
        ],
        interiorColors: [
          { name: "Чёрный", hex: "#1E1E1E" },
          { name: "Какао-коричневый", hex: "#5C4534" },
          { name: "Слоновая кость", hex: "#EDE6D8" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 1590000,
            powertrainType: "BEV",
            rangeKm: 510,
            powerHp: 190,
            powerKw: 140,
            torqueNm: 280,
            accelSec: 8.8,
            topSpeedKmh: 150,
            batteryKwh: 58.1,
            batteryType: "LFP",
            fastCharge: "~35 мин (10→80%)",
            drive: "Передний",
          },
        ],
      },
    ],
  },
  {
    slug: "xiaomi",
    name: "Xiaomi",
    country: "Китай",
    accent: "#FF6900",
    logo: "MI",
    description:
      "Технологический гигант Xiaomi вышел на авторынок в 2024 году — дебютный седан SU7 сразу стал хитом продаж.",
    models: [
      {
        slug: "xiaomi-su7",
        name: "Xiaomi SU7",
        tagline: "Спортивный электроседан",
        bodyType: "Седан",
        seats: 5,
        description:
          "Дебютный электромобиль Xiaomi — спортивный седан с большим запасом хода и продуманной экосистемой умных функций.",
        exteriorColors: [
          { name: "Бухтовый синий", hex: "#1E4E7A" },
          { name: "Оливково-зелёный", hex: "#5A5F45" },
          { name: "Жемчужно-белый", hex: "#EDEDE8" },
          { name: "Бриллиантово-чёрный", hex: "#131313" },
          { name: "Лавовый оранжевый", hex: "#C2551F" },
        ],
        interiorColors: [
          { name: "Галактический серый", hex: "#5C5E62" },
          { name: "Сумеречный красный", hex: "#7A2F2A" },
          { name: "Туманный фиолетовый", hex: "#5A4E63" },
          { name: "Обсидиановый чёрный", hex: "#1B1B1D" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 2290000,
            powertrainType: "BEV",
            rangeKm: 700,
            powerHp: 299,
            powerKw: 220,
            torqueNm: 400,
            accelSec: 5.3,
            topSpeedKmh: 210,
            batteryKwh: 73.6,
            batteryType: "LFP",
            fastCharge: "~25 мин (10→80%)",
            drive: "Задний",
          },
        ],
      },
    ],
  },
  {
    slug: "deepal",
    name: "Deepal",
    country: "Китай",
    accent: "#1D4ED8",
    logo: "DP",
    description:
      "Электрический суббренд Changan, ориентирован на технологичные кроссоверы среднего сегмента.",
    models: [
      {
        slug: "deepal-s07",
        name: "Deepal S07",
        tagline: "Технологичный купе-кроссовер",
        bodyType: "Купе-кроссовер",
        seats: 5,
        description:
          "Кроссовер Changan с современным салоном и хорошим соотношением цены и технологичности.",
        exteriorColors: [
          { name: "Звёздный чёрный", hex: "#141414" },
          { name: "Холодный звёздно-белый", hex: "#ECECE7" },
          { name: "Лунно-каменный серый", hex: "#8B8D8F" },
          { name: "Пылающий оранжевый", hex: "#C2551F" },
          { name: "Космический жёлтый", hex: "#D9B23C" },
          { name: "Туманно-синий", hex: "#2E5A8A" },
        ],
        interiorColors: [
          { name: "Дикая зелень", hex: "#3E5A45" },
          { name: "Теневой чёрный", hex: "#1E1E1E" },
          { name: "Волна тепла (оранжевый)", hex: "#B95A2C" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 1890000,
            powertrainType: "BEV",
            rangeKm: 552,
            powerHp: 231,
            powerKw: 170,
            torqueNm: 320,
            accelSec: 7.5,
            topSpeedKmh: 175,
            batteryKwh: 79.97,
            batteryType: "NMC",
            fastCharge: "~30 мин (10→80%)",
            drive: "Задний",
          },
        ],
      },
    ],
  },
  {
    slug: "avatr",
    name: "Avatr",
    country: "Китай",
    accent: "#111827",
    logo: "AV",
    description:
      "Совместный премиальный бренд Changan, Huawei и CATL — упор на автопилот Huawei и премиальные технологии.",
    models: [
      {
        slug: "avatr-07",
        name: "Avatr 07",
        tagline: "Премиальный электроседан-кроссовер",
        bodyType: "Кроссовер",
        seats: 5,
        description:
          "Премиальная модель с автопилотом Huawei ADS и батареей CATL.",
        exteriorColors: [
          { name: "Скальный серый", hex: "#7C7E80" },
          { name: "Галечный чёрный", hex: "#161616" },
          { name: "Рассветный белый", hex: "#ECEBE6" },
          { name: "Звёздный фиолетовый", hex: "#5A4A63" },
          { name: "Изумрудно-зелёный", hex: "#3E5A4C" },
        ],
        interiorColors: [
          { name: "Звёздная река (фиолетовый)", hex: "#4A3A52" },
          { name: "Облачные горы (коричневый)", hex: "#6E5238" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 2990000,
            powertrainType: "BEV",
            rangeKm: 550,
            powerHp: 313,
            powerKw: 230,
            torqueNm: 420,
            accelSec: 6.9,
            topSpeedKmh: 200,
            batteryKwh: 80,
            batteryType: "NMC",
            fastCharge: "~28 мин (10→80%)",
            drive: "Задний",
          },
        ],
      },
    ],
  },
  {
    slug: "im-motors",
    name: "IM Motors",
    country: "Китай",
    accent: "#0891B2",
    logo: "IM",
    description:
      "Премиальный бренд при поддержке SAIC и Alibaba, известен как «Zhiji» на домашнем рынке.",
    models: [
      {
        slug: "im-ls6",
        name: "IM LS6",
        tagline: "Премиальный кроссовер",
        bodyType: "Кроссовер",
        seats: 5,
        description:
          "Премиальный кроссовер с батареей высокой плотности и продвинутой системой помощи водителю.",
        exteriorColors: [
          { name: "Белый «Афина»", hex: "#EEEDE7" },
          { name: "Чёрный «Сезанн»", hex: "#151515" },
          { name: "Серый «Рембрандт»", hex: "#8B8C8E" },
          { name: "Бирюзовый «Моне»", hex: "#3E7A78" },
          { name: "Розовый «Фердинанд»", hex: "#C88A96" },
        ],
        interiorColors: [
          { name: "Бежевый «Дувр»", hex: "#D8CCB8" },
          { name: "Бирюзовый «Эльба»", hex: "#3E6E70" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 2690000,
            powertrainType: "BEV",
            rangeKm: 580,
            powerHp: 292,
            powerKw: 215,
            torqueNm: 350,
            accelSec: 6.5,
            topSpeedKmh: 190,
            batteryKwh: 90,
            batteryType: "NMC",
            fastCharge: "~26 мин (10→80%)",
            drive: "Задний",
          },
        ],
      },
    ],
  },
  {
    slug: "wuling",
    name: "Wuling",
    country: "Китай",
    accent: "#DC2626",
    logo: "WL",
    description:
      "Совместное предприятие SAIC-GM-Wuling, производит одни из самых доступных электромобилей в мире.",
    models: [
      {
        slug: "wuling-bingo",
        name: "Wuling Bingo",
        tagline: "Компактный городской электромобиль",
        bodyType: "Хэтчбек",
        seats: 4,
        description:
          "Один из самых доступных электромобилей на рынке — идеален для города, отличная альтернатива скутеру или второй машине в семью.",
        exteriorColors: [
          { name: "Молочно-белый", hex: "#F1EFE8" },
          { name: "Свежий синий", hex: "#5A87A8" },
          { name: "Мятно-зелёный", hex: "#7CA88C" },
          { name: "Млечный путь синий", hex: "#3E5F8A" },
          { name: "Мусс зелёный", hex: "#8CA870" },
        ],
        interiorColors: [
          { name: "Мягкий белый", hex: "#EFEBE0" },
          { name: "Тёплый коричневый", hex: "#8A6B4E" },
        ],
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 590000,
            powertrainType: "BEV",
            rangeKm: 333,
            powerHp: 84,
            powerKw: 62,
            torqueNm: 150,
            accelSec: 13.0,
            topSpeedKmh: 105,
            batteryKwh: 31.7,
            batteryType: "LFP",
            fastCharge: "~35 мин (10→80%)",
            drive: "Передний",
          },
        ],
      },
    ],
  },
  {
    slug: "audi",
    name: "Audi",
    country: "Китай (СП SAIC-VW)",
    accent: "#BB0A30",
    logo: "A",
    description:
      "Электромобиль Q5 e-tron создан специально для китайского рынка на платформе MEB группы Volkswagen и выпускается совместным предприятием SAIC-VW.",
    models: [
      {
        slug: "audi-q5-e-tron",
        name: "Audi Q5 e-tron",
        tagline: "Премиальный кроссовер для китайского рынка",
        bodyType: "Кроссовер",
        seats: 5,
        description:
          "Удлинённая версия Q4 e-tron, разработанная специально для Китая. Построена на платформе MEB, разделяет технику с Volkswagen ID.6 и ID.4.",
        trims: [
          {
            slug: "40-e-tron",
            name: "40 e-tron",
            priceFrom: 4720000,
            powertrainType: "BEV",
            rangeKm: 550,
            powerHp: 201,
            powerKw: 150,
            torqueNm: 310,
            accelSec: 8.4,
            topSpeedKmh: 160,
            batteryKwh: 83.4,
            batteryType: "NMC",
            fastCharge: "~30 мин (10→80%)",
            drive: "Задний",
            highlight: "Базовая версия, один электромотор",
          },
          {
            slug: "50-e-tron-quattro",
            name: "50 e-tron quattro",
            priceFrom: 5800000,
            powertrainType: "BEV",
            rangeKm: 520,
            powerHp: 305,
            powerKw: 224,
            torqueNm: 460,
            accelSec: 6.4,
            topSpeedKmh: 180,
            batteryKwh: 83.4,
            batteryType: "NMC",
            fastCharge: "~30 мин (10→80%)",
            drive: "Полный",
            highlight: "Полный привод quattro, два электромотора",
          },
        ],
      },
      {
        slug: "audi-q4-e-tron",
        name: "Audi Q4 e-tron",
        tagline: "Компактный электрический кроссовер",
        bodyType: "Кроссовер",
        seats: 5,
        description:
          "Начальная модель в электрической линейке Audi, доступна и в стандартном кузове, и в варианте Sportback. Собирается в Китае на заводе FAW-Audi в Фошане.",
        trims: [
          {
            slug: "45-e-tron",
            name: "45 e-tron",
            priceFrom: 4200000,
            powertrainType: "BEV",
            rangeKm: 605,
            powerHp: 282,
            powerKw: 210,
            torqueNm: 545,
            accelSec: 6.7,
            topSpeedKmh: 180,
            batteryKwh: 82,
            batteryType: "NMC",
            fastCharge: "~28 мин (10→80%)",
            drive: "Задний",
            highlight: "Базовая версия, задний привод",
          },
          {
            slug: "55-e-tron-quattro",
            name: "55 e-tron quattro",
            priceFrom: 5000000,
            powertrainType: "BEV",
            rangeKm: 550,
            powerHp: 340,
            powerKw: 250,
            torqueNm: 545,
            accelSec: 5.7,
            topSpeedKmh: 180,
            batteryKwh: 82,
            batteryType: "NMC",
            fastCharge: "~28 мин (10→80%)",
            drive: "Полный",
            highlight: "Полный привод quattro",
          },
        ],
      },
    ],
  },
  {
    slug: "volkswagen",
    name: "Volkswagen",
    country: "Китай (СП SAIC-VW / FAW-VW)",
    accent: "#00437A",
    logo: "VW",
    description:
      "Линейка ID. — электромобили Volkswagen на платформе MEB, которые выпускают сразу два совместных предприятия в Китае: SAIC-VW и FAW-VW.",
    models: [
      {
        slug: "id3",
        name: "Volkswagen ID.3",
        tagline: "Компактный электрохэтчбек",
        bodyType: "Хэтчбек",
        seats: 5,
        description:
          "Самый доступный электромобиль Volkswagen в Китае и самая продаваемая модель линейки ID. Выпускается SAIC-VW.",
        trims: [
          {
            slug: "smart",
            name: "Smart",
            priceFrom: 1750000,
            powertrainType: "BEV",
            rangeKm: 450,
            powerHp: 170,
            powerKw: 125,
            torqueNm: 310,
            accelSec: 7.6,
            topSpeedKmh: 160,
            batteryKwh: 53.6,
            batteryType: "LFP",
            fastCharge: "~48 мин (30→80%)",
            drive: "Задний",
          },
          {
            slug: "pro",
            name: "Pro",
            priceFrom: 1950000,
            powertrainType: "BEV",
            rangeKm: 450,
            powerHp: 170,
            powerKw: 125,
            torqueNm: 310,
            accelSec: 7.6,
            topSpeedKmh: 160,
            batteryKwh: 53.6,
            batteryType: "LFP",
            fastCharge: "~48 мин (30→80%)",
            drive: "Задний",
            highlight: "Расширенное оснащение, больший экран",
          },
        ],
      },
      {
        slug: "id4",
        name: "Volkswagen ID.4",
        tagline: "Электрокроссовер бизнес-класса",
        bodyType: "Кроссовер",
        seats: 5,
        description:
          "Второй по популярности электромобиль Volkswagen в Китае. Выпускается в двух версиях от разных СП: ID.4 X (SAIC-VW) и ID.4 CROZZ (FAW-VW) — технически идентичны.",
        trims: [
          {
            slug: "pro",
            name: "Pro",
            priceFrom: 2150000,
            powertrainType: "BEV",
            rangeKm: 442,
            powerHp: 228,
            powerKw: 170,
            torqueNm: 310,
            accelSec: 8.5,
            topSpeedKmh: 160,
            batteryKwh: 55.7,
            batteryType: "LFP",
            fastCharge: "~32 мин (10→80%)",
            drive: "Задний",
          },
          {
            slug: "pro-plus",
            name: "Pro+",
            priceFrom: 2450000,
            powertrainType: "BEV",
            rangeKm: 560,
            powerHp: 228,
            powerKw: 170,
            torqueNm: 310,
            accelSec: 8.5,
            topSpeedKmh: 160,
            batteryKwh: 80.4,
            batteryType: "LFP",
            fastCharge: "~32 мин (10→80%)",
            drive: "Задний",
            highlight: "Увеличенная батарея, больший запас хода",
          },
          {
            slug: "gtx",
            name: "GTX",
            priceFrom: 2650000,
            powertrainType: "BEV",
            rangeKm: 601,
            powerHp: 313,
            powerKw: 230,
            torqueNm: 460,
            accelSec: 6.4,
            topSpeedKmh: 180,
            batteryKwh: 80.4,
            batteryType: "LFP",
            fastCharge: "~32 мин (10→80%)",
            drive: "Полный",
            highlight: "Полный привод, спортивная версия",
          },
        ],
      },
      {
        slug: "id6",
        name: "Volkswagen ID.6",
        tagline: "Семиместный семейный электрокроссовер",
        bodyType: "Кроссовер (7 мест)",
        seats: 7,
        description:
          "Самый большой электромобиль Volkswagen в Китае — три ряда сидений. Выпускается в версиях ID.6 X (SAIC-VW) и ID.6 CROZZ (FAW-VW), продаётся только в Китае.",
        trims: [
          {
            slug: "pro",
            name: "Pro",
            priceFrom: 3550000,
            powertrainType: "BEV",
            rangeKm: 460,
            powerHp: 177,
            powerKw: 132,
            torqueNm: 310,
            accelSec: 9.6,
            topSpeedKmh: 160,
            batteryKwh: 62,
            batteryType: "NMC",
            fastCharge: "~35 мин (10→80%)",
            drive: "Задний",
          },
          {
            slug: "pro-plus",
            name: "Pro+",
            priceFrom: 4050000,
            powertrainType: "BEV",
            rangeKm: 555,
            powerHp: 201,
            powerKw: 150,
            torqueNm: 310,
            accelSec: 8.9,
            topSpeedKmh: 160,
            batteryKwh: 77,
            batteryType: "NMC",
            fastCharge: "~35 мин (10→80%)",
            drive: "Задний",
          },
          {
            slug: "max-4wd",
            name: "Max 4WD",
            priceFrom: 4450000,
            powertrainType: "BEV",
            rangeKm: 617,
            powerHp: 308,
            powerKw: 230,
            torqueNm: 470,
            accelSec: 7.3,
            topSpeedKmh: 160,
            batteryKwh: 83,
            batteryType: "NMC",
            fastCharge: "~35 мин (10→80%)",
            drive: "Полный",
            highlight: "Полный привод, максимальный запас хода",
          },
        ],
      },
      {
        slug: "id7",
        name: "Volkswagen ID.7 Vizzion",
        tagline: "Флагманский электроседан",
        bodyType: "Седан",
        seats: 5,
        description:
          "Флагманский седан линейки ID., выпускается FAW-VW. Панорамная крыша SkyView блокирует до 99% УФ-излучения.",
        trims: [
          {
            slug: "pro",
            name: "Pro",
            priceFrom: 3100000,
            powertrainType: "BEV",
            rangeKm: 642,
            powerHp: 204,
            powerKw: 150,
            torqueNm: 310,
            accelSec: 8.5,
            topSpeedKmh: 175,
            batteryKwh: 84.8,
            batteryType: "NMC",
            fastCharge: "~30 мин (10→80%)",
            drive: "Задний",
            highlight: "Базовая версия, максимальный запас хода",
          },
          {
            slug: "4wd",
            name: "4WD",
            priceFrom: 3650000,
            powertrainType: "BEV",
            rangeKm: 570,
            powerHp: 340,
            powerKw: 250,
            torqueNm: 679,
            accelSec: 5.4,
            topSpeedKmh: 180,
            batteryKwh: 84.8,
            batteryType: "NMC",
            fastCharge: "~30 мин (10→80%)",
            drive: "Полный",
            highlight: "Полный привод, вдвое мощнее",
          },
        ],
      },
    ],
  },
  {
    slug: "geely",
    name: "Geely",
    country: "Китай",
    accent: "#004C97",
    logo: "GE",
    description:
      "Материнская компания Zeekr, Volvo и Lynk & Co. Под собственным именем Geely развивает суббренд Galaxy — электромобили и подключаемые гибриды среднего сегмента.",
    models: [
      {
        slug: "galaxy-e5",
        name: "Geely Galaxy E5",
        tagline: "Компактный электрокроссовер",
        bodyType: "Кроссовер",
        seats: 5,
        description:
          "Первая полностью электрическая модель суббренда Galaxy, конкурент BYD Atto 3 и GAC Aion Y. Использует фирменную батарею Aegis Short Blade.",
        trims: [
          {
            slug: "440",
            name: "440",
            priceFrom: 1450000,
            powertrainType: "BEV",
            rangeKm: 440,
            powerHp: 218,
            powerKw: 160,
            torqueNm: 320,
            accelSec: 6.9,
            topSpeedKmh: 180,
            batteryKwh: 49.52,
            batteryType: "LFP",
            fastCharge: "~30 мин (10→80%)",
            drive: "Передний",
            highlight: "Базовая версия",
          },
          {
            slug: "530",
            name: "530",
            priceFrom: 1650000,
            powertrainType: "BEV",
            rangeKm: 530,
            powerHp: 218,
            powerKw: 160,
            torqueNm: 320,
            accelSec: 6.9,
            topSpeedKmh: 180,
            batteryKwh: 60.22,
            batteryType: "LFP",
            fastCharge: "~35 мин (10→80%)",
            drive: "Передний",
          },
          {
            slug: "610",
            name: "610",
            priceFrom: 1850000,
            powertrainType: "BEV",
            rangeKm: 610,
            powerHp: 218,
            powerKw: 160,
            torqueNm: 320,
            accelSec: 6.9,
            topSpeedKmh: 180,
            batteryKwh: 68.4,
            batteryType: "LFP",
            fastCharge: "~40 мин (10→80%)",
            drive: "Передний",
            highlight: "Максимальный запас хода в линейке",
          },
        ],
      },
      {
        slug: "galaxy-e8",
        name: "Geely Galaxy E8",
        tagline: "Флагманский электроседан",
        bodyType: "Седан",
        seats: 5,
        description:
          "Флагманский седан суббренда Galaxy на 800-вольтовой платформе GEA — сверхбыстрая зарядка и мощная полноприводная версия.",
        trims: [
          {
            slug: "575",
            name: "575 Enlightened",
            priceFrom: 1980000,
            powertrainType: "BEV",
            rangeKm: 575,
            powerHp: 313,
            powerKw: 230,
            torqueNm: 380,
            accelSec: 5.5,
            topSpeedKmh: 200,
            batteryKwh: 60,
            batteryType: "LFP",
            fastCharge: "~15 мин (10→80%)",
            drive: "Задний",
            highlight: "Задний привод, базовая версия",
          },
          {
            slug: "620-4wd",
            name: "620 4WD Starfleet",
            priceFrom: 2650000,
            powertrainType: "BEV",
            rangeKm: 620,
            powerHp: 637,
            powerKw: 475,
            torqueNm: 710,
            accelSec: 3.5,
            topSpeedKmh: 210,
            batteryKwh: 75,
            batteryType: "LFP",
            fastCharge: "8 мин (30→80%)",
            drive: "Полный",
            highlight: "Полный привод, лидар, 800В платформа",
          },
        ],
      },
      {
        slug: "galaxy-a7-ev",
        name: "Geely Galaxy A7 EV",
        tagline: "Электрический среднеразмерный седан",
        bodyType: "Седан",
        seats: 5,
        description:
          "Полностью электрическая версия седана Galaxy A7 (у модели есть и гибридная PHEV-версия — в каталоге показана только электрическая). Построен на архитектуре GEA с фирменной батареей Golden Battery.",
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 1690000,
            powertrainType: "BEV",
            rangeKm: 550,
            powerHp: 218,
            powerKw: 160,
            torqueNm: 320,
            accelSec: 7.4,
            topSpeedKmh: 180,
            batteryKwh: 58.05,
            batteryType: "LFP",
            fastCharge: "~30 мин (10→80%)",
            drive: "Передний",
          },
        ],
      },
      {
        slug: "panda-mini-ev",
        name: "Geely Panda Mini EV",
        tagline: "Компактный городской электромобиль",
        bodyType: "Мини-хэтчбек",
        seats: 4,
        description:
          "Один из самых доступных электромобилей Geely — компактный городской автомобиль класса A00. Известен также как Geometry Panda Mini EV. Идеален как вторая машина или для узких городских улиц.",
        trims: [
          {
            slug: "120",
            name: "120",
            priceFrom: 540000,
            powertrainType: "BEV",
            rangeKm: 120,
            powerHp: 27,
            powerKw: 20,
            torqueNm: 100,
            accelSec: 15.0,
            topSpeedKmh: 100,
            batteryKwh: 9.61,
            batteryType: "LFP",
            fastCharge: "~25 мин (30→80%)",
            drive: "Задний",
            highlight: "Базовая версия с меньшей батареей",
          },
          {
            slug: "210",
            name: "210",
            priceFrom: 770000,
            powertrainType: "BEV",
            rangeKm: 210,
            powerHp: 41,
            powerKw: 30,
            torqueNm: 135,
            accelSec: 13.0,
            topSpeedKmh: 100,
            batteryKwh: 17,
            batteryType: "LFP",
            fastCharge: "~30 мин (30→80%)",
            drive: "Задний",
            highlight: "Увеличенная батарея (Gotion), больший запас хода",
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

export function allModelsFlat() {
  return brands.flatMap((b) => b.models.map((m) => ({ brand: b, model: m })));
}

// Топ-N моделей по параметру — для блока "Топ по параметрам" на главной.
// Для каждой модели берём её лучшую версию по этому параметру.
export function topModelsBy(
  metric: "range" | "price" | "accel",
  count = 3
) {
  const entries = brands.flatMap((b) =>
    b.models.map((m) => {
      let best: Trim;
      if (metric === "range") {
        best = [...m.trims].sort((a, b2) => b2.rangeKm - a.rangeKm)[0];
      } else if (metric === "accel") {
        best = [...m.trims].sort((a, b2) => a.accelSec - b2.accelSec)[0];
      } else {
        best = baseTrim(m);
      }
      return { brand: b, model: m, trim: best };
    })
  );

  const sorted = [...entries].sort((a, b) => {
    if (metric === "range") return b.trim.rangeKm - a.trim.rangeKm;
    if (metric === "accel") return a.trim.accelSec - b.trim.accelSec;
    return a.trim.priceFrom - b.trim.priceFrom;
  });

  return sorted.slice(0, count);
}

// Похожие версии из ДРУГИХ моделей, ближайшие по цене — для блока
// "Похожие версии" на странице конкретной версии
export function similarTrims(
  excludeModelSlug: string,
  priceFrom: number,
  count = 3
) {
  const all = brands.flatMap((b) =>
    b.models
      .filter((m) => m.slug !== excludeModelSlug)
      .flatMap((m) => m.trims.map((t) => ({ brand: b, model: m, trim: t })))
  );
  return all
    .sort(
      (a, b) =>
        Math.abs(a.trim.priceFrom - priceFrom) -
        Math.abs(b.trim.priceFrom - priceFrom)
    )
    .slice(0, count);
}
