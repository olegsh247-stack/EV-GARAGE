import { contact } from "@/data/contact";
import { brands } from "@/data/cars";
import Link from "next/link";

export function Footer() {
  return (
    <footer id="contacts" className="mt-24 border-t border-line bg-deep text-surface">
      <div className="mx-auto max-w-[1400px] px-5 py-16">
        <div className="grid gap-12 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg font-bold">EV-GARAGE.RU</p>
            <p className="mt-3 max-w-xs text-sm text-surface/60">
              Каталог электромобилей из Китая для российского рынка.
              Характеристики, цены, подбор модели.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-surface/40">
              Марки
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {brands.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/brand/${b.slug}`}
                    className="text-surface/80 transition-colors hover:text-charge"
                  >
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-surface/40">
              Связаться
            </p>
            <ul className="mt-4 space-y-2 text-sm text-surface/80">
              <li>
                <a href={contact.phoneHref} className="hover:text-charge">
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={contact.whatsappHref} className="hover:text-charge">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={contact.telegramHref} className="hover:text-charge">
                  Telegram
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="hover:text-charge">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-surface/10 pt-6 text-xs text-surface/40 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} EV-GARAGE.RU</span>
          <span>Демонстрационная версия каталога</span>
        </div>
      </div>
    </footer>
  );
}
