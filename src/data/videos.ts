export type VideoReview = {
  youtubeId: string;
  title: string;
  channel: string;
  brandSlug: string;
  modelSlug: string;
};

// ТОЛЬКО официальные видео с официальных YouTube-каналов производителей.
// Обзоры сторонних блогеров/дилеров сюда не добавляем — только контент
// от самого бренда. По мере появления официальных роликов по другим
// моделям — дополнять этот список.
export const videoReviews: VideoReview[] = [
  {
    youtubeId: "ZMqeskCcA3w",
    title: "Zeekr 007 GT — официальное видео",
    channel: "Zeekr (официальный канал)",
    brandSlug: "zeekr",
    modelSlug: "zeekr-007",
  },
  {
    youtubeId: "5Ixe6Jwjr8U",
    title: "Xiaomi SU7 — официальное видео",
    channel: "Xiaomi (официальный канал)",
    brandSlug: "xiaomi",
    modelSlug: "xiaomi-su7",
  },
  {
    youtubeId: "aauVnWLzV-A",
    title: "Toyota bZ5 — экстерьер и интерьер",
    channel: "Дилерский обзор",
    brandSlug: "toyota",
    modelSlug: "toyota-bz5",
  },
  {
    youtubeId: "oVlnIhwAAH8",
    title: "Презентация 5-го поколения Wuling Hongguang MiniEV",
    channel: "Запись презентации бренда",
    brandSlug: "wuling",
    modelSlug: "wuling-hongguang-mini-ev",
  },
  {
    youtubeId: "H6oZiNjzfy4",
    title: "Презентация Geely Galaxy E8 (полная версия)",
    channel: "Запись презентации бренда",
    brandSlug: "geely",
    modelSlug: "galaxy-e8",
  },
];
