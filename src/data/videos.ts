export type VideoReview = {
  youtubeId: string;
  title: string;
  channel: string;
  brandSlug: string;
  modelSlug: string;
};

// ТОЛЬКО короткие официальные презентационные ролики (30 сек – 5 мин)
// с официальных YouTube-каналов производителей.
// Обзоры сторонних блогеров/дилеров сюда не добавляем.
export const videoReviews: VideoReview[] = [
  // Zeekr
  {
    youtubeId: "iZ2poVbynw4",
    title: "Zeekr 7X Launch Highlights",
    channel: "Zeekr International",
    brandSlug: "zeekr",
    modelSlug: "zeekr-7x",
  },
  {
    youtubeId: "UYGitG86-Vs",
    title: "Zeekr 7X — The 3.8-Second Temptation",
    channel: "Zeekr International",
    brandSlug: "zeekr",
    modelSlug: "zeekr-7x",
  },
  {
    youtubeId: "ZMqeskCcA3w",
    title: "Zeekr 007 GT — официальное видео",
    channel: "Zeekr (официальный канал)",
    brandSlug: "zeekr",
    modelSlug: "zeekr-007",
  },

  // Xiaomi
  {
    youtubeId: "ueEtzLhdePg",
    title: "Meet Xiaomi SU7",
    channel: "Xiaomi",
    brandSlug: "xiaomi",
    modelSlug: "xiaomi-su7",
  },
  {
    youtubeId: "JPfqNL-kXIk",
    title: "Xiaomi SU7 Ultra Official Advert",
    channel: "Xiaomi",
    brandSlug: "xiaomi",
    modelSlug: "xiaomi-su7",
  },

  // BYD
  {
    youtubeId: "4tuEdSJJa6w",
    title: "BYD SEALION 7 — Official UK TV Advert",
    channel: "BYD UK",
    brandSlug: "byd",
    modelSlug: "byd-seal",
  },

  // Ранее добавленные
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
