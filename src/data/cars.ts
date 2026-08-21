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
  logo: string; // короткая текстовая метка для плитки-логотипа (2-3 символа)
  models: Model[];
};

// Общий максимум для шкалы запаса хода на карточках (просто для наглядности)
export const RANGE_SCALE_MAX = 700;

// Единый порядок из 11 базовых характеристик — как в договорённости и на
// китайских каталогах (autohome.com.cn/config/spec/...). "Тип кузова" и
// "Мест" берутся с уровня модели, остальное — с уровня конкретной версии.
export function fullSpecRows(model: Model, trim: Trim) {
  return [
    { label: "Тип кузова", value: model.bodyType },
    { label: "Тип двигателя", value: trim.powertrainType },
    { label: "Запас хода (CLTC)", value: `${trim.rangeKm} км` },
    {
      label: "Мощность",
      value: `${trim.powerHp} л.с. (${trim.powerKw} кВт)`,
    },
    { label: "Крутящий момент", value: `${trim.torqueNm} Н·м` },
    { label: "Разгон 0–100", value: `${trim.accelSec} с` },
    { label: "Привод", value: trim.drive },
    {
      label: "Батарея",
      value: `${trim.batteryKwh} кВт·ч (${trim.batteryType})`,
    },
    { label: "Быстрая зарядка", value: trim.fastCharge },
    { label: "Максимальная скорость", value: `${trim.topSpeedKmh} км/ч` },
    { label: "Мест", value: String(model.seats) },
  ];
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
        trims: [
          {
            slug: "long-range",
            name: "Long Range",
            priceFrom: 2390000,
            powertrainType: "Электро",
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
        trims: [
          {
            slug: "max",
            name: "Max",
            priceFrom: 4850000,
            powertrainType: "Электро с бензиновым генератором (EREV)",
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
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 1690000,
            powertrainType: "Электро",
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
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 1390000,
            powertrainType: "Электро",
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
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 3290000,
            powertrainType: "Электро",
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
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 1590000,
            powertrainType: "Электро",
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
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 2290000,
            powertrainType: "Электро",
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
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 1890000,
            powertrainType: "Электро",
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
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 2990000,
            powertrainType: "Электро",
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
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 2690000,
            powertrainType: "Электро",
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
        trims: [
          {
            slug: "standart",
            name: "Стандарт",
            priceFrom: 590000,
            powertrainType: "Электро",
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
