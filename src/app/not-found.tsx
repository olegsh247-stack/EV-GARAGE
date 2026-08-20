import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-32 text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
          404
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">
          Страница не найдена
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          Такой модели или марки в каталоге пока нет.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-medium text-surface hover:bg-deep"
        >
          На главную
        </Link>
      </main>
      <Footer />
    </>
  );
}
