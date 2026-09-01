import { Phone, MessageCircle, Send } from "lucide-react";
import { contact } from "@/data/contact";

export function ContactCTA({ modelName }: { modelName: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-card p-6">
      <h3 className="font-display text-lg font-semibold text-ink">
        Контакты
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
    </div>
  );
}
