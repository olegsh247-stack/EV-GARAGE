import Link from "next/link";
import { ClipboardList, MessageCircle, Truck, KeyRound } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrandCard } from "@/components/BrandCard";
import { brands, topModelsBy } from "@/data/cars";
import { videoReviews } from "@/data/videos";
import { formatPrice } from "@/lib/format";
import { totalPrice } from "@/lib/pricing";
import { getCnyRubRate } from "@/lib/exchangeRate";
import { getArchivedModelKeys, modelKey } from "@/lib/archive";

const steps = [
  {
    icon: ClipboardList,
    title: "Выбираете модель",
    text: "Смотрите характеристики и цену прямо на сайте — без звонков и ожидания менеджера.",
  },
  {
    icon: MessageCircle,
    title: "Оставляете заявку",
    text: "Пишете в WhatsApp, Telegram или оставляете номер — уточняем наличие и точную цену.",
  },
  {
    icon: Truck,
    title: "Согласовываем доставку",
    text: "Обсуждаем сроки, логистику из Китая и оформление документов.",
  },
  {
    icon: KeyRound,
    title: "Получаете автомобиль",
    text: "Забираете машину — с гарантией и полным пакетом документов.",
  },
];

export default async function Home() {
  const cnyRate = await getCnyRubRate();
  const archived = await getArchivedModelKeys();

  const topLists = [
    { title: "Топ по запасу хода", metric: "range" as const, unit: "км", read: (t: { rangeKm: number }) => `${t.rangeKm} км` },
    { title: "Самые доступные", metric: "price" as const, unit: "₽", read: (t: Parameters<typeof totalPrice>[0]) => formatPrice(totalPrice(t, cnyRate)) },
    { title: "Быстрее всех разгоняются", metric: "accel" as const, unit: "с", read: (t: { accelSec: number }) => `${t.accelSec} с 0–100` },
  ];

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Brands — сразу с главной, без вступительного блока */}
        <section id="brands" className="mx-auto max-w-[1400px] px-5 pb-16 pt-10">
          <div className="mb-8 flex items-end justify-between">
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Выберите марку
            </h1>
            <span className="hidden font-mono text-sm text-ink-soft sm:block">
              {brands.length} брендов
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {[...brands]
              .sort((a, b) => a.name.localeCompare(b.name, "ru"))
              .map((brand) => (
                <BrandCard key={brand.slug} brand={brand} />
              ))}
          </div>
        </section>

        {/* Как это работает */}
        <section id="about" className="mx-auto max-w-[1400px] px-5 py-16">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Как это работает
          </p>
          <h2 className="mt-2 max-w-lg font-display text-2xl font-semibold text-ink sm:text-3xl">
            От выбора модели до ключей в руках — четыре простых шага
          </h2>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title}>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs font-bold text-surface">
                    {i + 1}
                  </span>
                  <step.icon className="text-charge" size={20} />
                </div>
                <h3 className="mt-3 font-display text-base font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Топ по параметрам */}
        <section className="mx-auto max-w-[1400px] px-5 py-16">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Топ по параметрам
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Быстрый ориентир по каталогу
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {topLists.map((list) => {
              const items = topModelsBy(list.metric, 8)
                .filter(
                  (item) =>
                    !archived.has(modelKey(item.brand.slug, item.model.slug))
                )
                .slice(0, 3);
              return (
                <div
                  key={list.title}
                  className="rounded-2xl border border-line bg-surface-card p-5"
                >
                  <h3 className="font-display text-base font-semibold text-ink">
                    {list.title}
                  </h3>
                  <div className="mt-4 flex flex-col gap-1">
                    {items.map((item, i) => (
                      <Link
                        key={`${item.brand.slug}/${item.model.slug}`}
                        href={`/brand/${item.brand.slug}/${item.model.slug}${
                          item.model.trims.length > 1
                            ? `/${item.trim.slug}`
                            : ""
                        }`}
                        className="group flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-surface"
                      >
                        <span className="flex items-center gap-2 text-sm text-ink">
                          <span className="font-mono text-xs text-ink-soft">
                            {i + 1}
                          </span>
                          <span className="group-hover:text-charge">
                            {item.brand.name} {item.model.name}
                          </span>
                        </span>
                        <span className="font-mono text-xs text-ink-soft">
                          {list.read(item.trim as never)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Видеообзоры */}
        <section className="mx-auto max-w-[1400px] px-5 py-16">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Видеообзоры
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Посмотрите модели вживую
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {videoReviews.map((v) => (
              <div key={v.youtubeId}>
                <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-surface-card">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                    title={v.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-ink">{v.title}</p>
                <Link
                  href={`/brand/${v.brandSlug}/${v.modelSlug}`}
                  className="mt-1 inline-block font-mono text-xs text-charge hover:underline"
                >
                  Смотреть в каталоге →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
