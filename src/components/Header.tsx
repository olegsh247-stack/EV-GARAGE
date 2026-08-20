import Link from "next/link";
import { contact } from "@/data/contact";
import { Phone } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            EV-GARAGE
          </span>
          <span className="font-mono text-[11px] text-charge">.RU</span>
        </Link>

        <nav className="hidden items-center gap-8 font-body text-sm text-ink-soft sm:flex">
          <Link href="/#brands" className="transition-colors hover:text-ink">
            Марки
          </Link>
          <Link href="/#about" className="transition-colors hover:text-ink">
            О нас
          </Link>
          <Link href="/#contacts" className="transition-colors hover:text-ink">
            Контакты
          </Link>
        </nav>

        <a
          href={contact.phoneHref}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-mono text-xs text-surface transition-colors hover:bg-deep"
        >
          <Phone size={14} />
          {contact.phoneDisplay}
        </a>
      </div>
    </header>
  );
}
