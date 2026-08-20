import { Phone, MessageCircle, Send } from "lucide-react";
import { contact } from "@/data/contact";

export function ContactCTA({ modelName }: { modelName: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-card p-6">
      <h3 className="font-display text-lg font-semibold text-ink">
        Узнать точную цену и наличие
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        Ответим в течение рабочего дня по {modelName}.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <a
          href={contact.whatsappHref}
          className="flex items-center justify-center gap-2 rounded-full bg-charge px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
        <a
          href={contact.telegramHref}
          className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          <Send size={16} />
          Telegram
        </a>
        <a
          href={contact.phoneHref}
          className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          <Phone size={16} />
          Позвонить
        </a>
      </div>

      <form className="mt-6 flex flex-col gap-3 border-t border-line pt-6">
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
          Или оставьте заявку
        </p>
        <input
          type="text"
          placeholder="Ваше имя"
          className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-charge"
        />
        <input
          type="tel"
          placeholder="Телефон"
          className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-charge"
        />
        <button
          type="submit"
          className="mt-1 rounded-full bg-ink px-4 py-3 text-sm font-medium text-surface transition-colors hover:bg-deep"
        >
          Отправить заявку
        </button>
        <p className="text-center text-xs text-ink-soft">
          Форма пока не подключена к обработке — понадобится отдельная
          настройка приёма заявок.
        </p>
      </form>
    </div>
  );
}
