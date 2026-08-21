import { ShieldCheck, Truck, Wrench } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrandLogoTile } from "@/components/BrandLogoTile";
import { brands } from "@/data/cars";

export default function Home() {
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

          <div className="grid grid-cols-3 gap-1 sm:grid-cols-5 lg:grid-cols-6">
            {brands.map((brand) => (
              <BrandLogoTile key={brand.slug} brand={brand} />
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
