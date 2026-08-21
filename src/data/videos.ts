export type VideoReview = {
  youtubeId: string;
  title: string;
  channel: string;
  brandSlug: string;
  modelSlug: string;
};

// Реальные видеообзоры на русском языке, найдены на YouTube.
// При добавлении новых моделей можно дополнять этот список.
export const videoReviews: VideoReview[] = [
  {
    youtubeId: "9V4p2Tdryd0",
    title: "Xiaomi SU7 в России — полный обзор",
    channel: "YouTube",
    brandSlug: "xiaomi",
    modelSlug: "xiaomi-su7",
  },
  {
    youtubeId: "A20THM26_4c",
    title: "Toyota bZ5 2025 — японцы вернулись в игру",
    channel: "Sferacar",
    brandSlug: "toyota",
    modelSlug: "toyota-bz5",
  },
  {
    youtubeId: "3l8OeSreup8",
    title: "BYD Han — полный обзор, тест, история марки",
    channel: "YouTube",
    brandSlug: "byd",
    modelSlug: "byd-han",
  },
];
