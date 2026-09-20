export type Suggestion = {
  id: string; // уникальный, напр. "add-chery-icar-03"
  type: "new" | "archive";
  title: string; // напр. "Chery iCar 03"
  note: string; // краткое описание/почему предложено
  sourceUrl?: string; // ссылка на источник (CarNewsChina, CnEVPost и т.п.)
  brandSlug?: string; // для type: "archive" — какую модель предлагаем убрать
  modelSlug?: string;
  addedAt: string; // дата, когда кандидат найден
};

// Наполняется по мере того, как ищем новинки (см. промпт мониторинга).
export const suggestions: Suggestion[] = [
  {
    id: "add-li-auto-i9",
    type: "new",
    title: "Li Auto i9 · BEV · 705 км · 6 мест",
    note: "Флагманский полностью электрический SUV, первая модель Li Auto на новой BEV-платформе. Home версия, 369 800 юаней, батарея 101 кВт·ч, 400 кВт суммарно, 0,215 Cd (рекорд для серийных SUV).",
    sourceUrl: "https://cnevpost.com",
    addedAt: "2026-09-18",
  },
  {
    id: "add-xpeng-g9l-bev",
    type: "new",
    title: "Xpeng G9L · BEV · 755 км AWD",
    note: "Обновлённая версия G9 с удлинённой платформой. От 231 800 юаней (ограниченная по времени цена), батарея 110 кВт·ч NMC, разгон 4,45 с.",
    sourceUrl: "https://cnevpost.com",
    addedAt: "2026-09-18",
  },
  {
    id: "add-xpeng-g9l-erev",
    type: "new",
    title: "Xpeng G9L · EREV · 435 км на электротяге / 1602 км общий",
    note: "Версия той же модели с бензиновым генератором — подтверждённая честная последовательная схема (генератор механически не соединён с колёсами). Батарея 63,3 кВт·ч LFP, генератор 1,5T на 110 кВт.",
    sourceUrl: "https://cnevpost.com",
    addedAt: "2026-09-18",
  },
  {
    id: "add-byd-formula-s",
    type: "new",
    title: "BYD Formula S · BEV · до 900 км AWD",
    note: "Спортивный электролифтбек суббренда Fangchengbao, конкурент Xiaomi SU7. 189 900–229 900 юаней, до 490 кВт (666 л.с.) суммарно, разгон 3,6 с, лидар на крыше, батарея Blade 2-го поколения.",
    sourceUrl: "https://cnevpost.com",
    addedAt: "2026-09-18",
  },
  {
    id: "add-byd-formula-s-gt",
    type: "new",
    title: "BYD Formula S GT · BEV · до 900 км AWD",
    note: "Версия-универсал (shooting brake) той же модели Formula S. 219 900–239 900 юаней, те же силовые характеристики, отличаются длина/аэродинамика.",
    sourceUrl: "https://cnevpost.com",
    addedAt: "2026-09-18",
  },
];
