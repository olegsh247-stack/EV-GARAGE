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

// Пока пусто — наполняется по мере того, как будем искать новинки.
export const suggestions: Suggestion[] = [];
