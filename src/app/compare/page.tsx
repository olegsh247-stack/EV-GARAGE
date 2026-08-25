"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Scale } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CarPhoto } from "@/components/CarPhoto";
import { useCompare, COMPARE_MAX } from "@/lib/compareContext";
import { getTrim, fullSpecRows } from "@/data/cars";
import { photoKey } from "@/lib/photos";
import { formatPrice } from "@/lib/format";
import { totalPrice } from "@/lib/pricing";

export default function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});
  const [cnyRate, setCnyRate] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then(setPhotoMap)
      .catch(() => {});
    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((d) => setCnyRate(d.rate))
      .catch(() => {});
  }, []);

  const items = ids
    .map((id) => {
      const [brandSlug, modelSlug, trimSlug] = id.split("/");
      const found = getTrim(brandSlug, modelSlug, trimSlug);
      return found ? { id, ...found } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const rowLabels =
    items[0]?.model && items[0]?.trim
      ? fullSpecRows(items[0].model, items[0].trim).map((r) => r.label)
      : [];

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-5 pb-8 pt-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                Сравнение
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
                {items.length > 0
                  ? `${items.length} из ${COMPARE_MAX} версий`
                  : "Пока нечего сравнивать"}
              </h1>
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="font-mono text-xs text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink"
              >
                Очистить всё
              </button>
            )}
          </div>
        </section>

        {items.length === 0 ? (
          <section className="mx-auto max-w-[1400px] px-5 pb-24">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line bg-surface-card py-20 text-center">
              <Scale size={28} className="text-ink-soft" />
              <p className="max-w-sm text-sm text-ink-soft">
                Откройте любую версию модели и нажмите «Добавить к
                сравнению» — здесь появится сравнение по всем
                характеристикам, до {COMPARE_MAX} версий одновременно.
              </p>
              <Link
                href="/"
                className="mt-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-surface hover:bg-deep"
              >
                Смотреть марки
              </Link>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-[1400px] px-5 pb-24">
            <div className="overflow-x-auto rounded-2xl border border-line bg-surface-card">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="min-w-[160px] px-5 py-4 align-bottom font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                      Характеристика
                    </th>
                    {items.map(({ id, brand, model, trim }) => (
                      <th
                        key={id}
                        className="min-w-[220px] px-5 py-4 align-bottom"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                              {brand.name}
                            </p>
                            <Link
                              href={`/brand/${brand.slug}/${model.slug}${
                                model.trims.length > 1 ? `/${trim.slug}` : ""
                              }`}
                              className="font-display font-semibold text-ink hover:text-charge"
                            >
                              {model.name}
                              {model.trims.length > 1 ? ` ${trim.name}` : ""}
                            </Link>
                            <p className="mt-0.5 font-mono text-xs text-ink-soft">
                              {cnyRate
                                ? formatPrice(totalPrice(trim, cnyRate))
                                : "…"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(id)}
                            aria-label="Убрать из сравнения"
                            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <CarPhoto
                          photoUrl={photoMap[photoKey(brand.slug, model.slug)]}
                          accent={brand.accent}
                          className="mt-3 h-24 w-full rounded-lg"
                          alt={model.name}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowLabels.map((label, i) => (
                    <tr
                      key={label}
                      className="border-b border-line last:border-0"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-ink-soft">
                        {label}
                      </td>
                      {items.map(({ id, model, trim }) => (
                        <td
                          key={id}
                          className="whitespace-nowrap px-5 py-4 font-mono text-ink"
                        >
                          {fullSpecRows(model, trim)[i].value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {items.length < COMPARE_MAX && (
              <p className="mt-4 text-center text-sm text-ink-soft">
                Можно добавить ещё{" "}
                {COMPARE_MAX - items.length === 1
                  ? "одну версию"
                  : `${COMPARE_MAX - items.length} версии`}{" "}
                — откройте страницу любой модели.
              </p>
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
