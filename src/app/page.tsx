import Link from "next/link";
import { ArrowDown, ShieldCheck, Truck, Wrench } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrandCard } from "@/components/BrandCard";
import { brands } from "@/data/cars";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-[1400px] px-5 pb-20 pt-16 sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-widest text-charge">
            Электромобили из Китая · Россия
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Выбирайте модель
            <br />
            по запасу хода,
            <br />
            <span className="text-charge">а не по слухам.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Характеристики, реальные цены и прямая связь с продавцом — без
            посредников и без воды. Только электромобили, только Китай.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#brands"
              className="flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-surface transition-colors hover:bg-deep"
            >
              Смотреть марки
              <ArrowDown size={16} />
            </a>
            <Link
              href="#about"
              className="text-sm font-medium text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink"
            >
              Почему мы
            </Link>
          </div>
        </section>

        {/* Brands */}
        <section id="brands" className="mx-auto max-w-[1400px] px-5 py-16">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                Каталог
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                Выберите марку
              </h2>
            </div>
            <span className="hidden font-mono text-sm text-ink-soft sm:block">
              {brands.length} {brands.length === 1 ? "бренд" : "бренда"}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <BrandCard key={brand.slug} brand={brand} />
            ))}
          </div>
        </section>

        {/* Trust */}
        <section id="about" className="mx-auto max-w-[1400px] px-5 py-16">
          <div className="rounded-2xl border border-line bg-surface-card p-8 sm:p-12">
            <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              Почему мы
            </p>
            <h2 className="mt-2 max-w-lg font-display text-2xl font-semibold text-ink sm:text-3xl">
              Разбираемся в электромобилях так же, как вы — в своём деле
            </h2>

            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              <div>
                <ShieldCheck className="text-charge" size={22} />
                <h3 className="mt-3 font-display text-base font-semibold text-ink">
                  Проверенные данные
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Характеристики сверяются с официальными источниками
                  производителя.
                </p>
              </div>
              <div>
                <Truck className="text-charge" size={22} />
                <h3 className="mt-3 font-display text-base font-semibold text-ink">
                  Доставка под ключ
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Помогаем с логистикой и оформлением на всех этапах.
                </p>
              </div>
              <div>
                <Wrench className="text-charge" size={22} />
                <h3 className="mt-3 font-display text-base font-semibold text-ink">
                  Сервисная поддержка
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Консультируем по обслуживанию электромобилей в России.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
