import { query } from "@/lib/pg";

export type Contact = {
  phoneDisplay: string;
  phoneHref: string;
  whatsappHref: string;
  telegramHref: string;
  email: string;
};

const DEFAULT_CONTACT: Contact = {
  phoneDisplay: "+7 995 536-10-70",
  phoneHref: "tel:+79955361070",
  whatsappHref: "https://wa.me/79955361070",
  telegramHref: "https://t.me/+79955361070",
  email: "info@ev-garage.ru",
};

type ContactRow = {
  phone_display: string;
  phone_href: string;
  whatsapp_href: string;
  telegram_href: string;
  email: string;
};

export async function getContact(): Promise<Contact> {
  const result = await query<ContactRow>(
    `SELECT phone_display, phone_href, whatsapp_href, telegram_href, email
     FROM contact WHERE id = 1`,
  );
  const row = result.rows[0];
  if (!row) return DEFAULT_CONTACT;
  return {
    phoneDisplay: row.phone_display,
    phoneHref: row.phone_href,
    whatsappHref: row.whatsapp_href,
    telegramHref: row.telegram_href,
    email: row.email,
  };
}

export async function setContact(next: Contact) {
  await query(
    `INSERT INTO contact (
       id, phone_display, phone_href, whatsapp_href, telegram_href, email, updated_at
     ) VALUES (1, $1, $2, $3, $4, $5, now())
     ON CONFLICT (id) DO UPDATE SET
       phone_display = EXCLUDED.phone_display,
       phone_href = EXCLUDED.phone_href,
       whatsapp_href = EXCLUDED.whatsapp_href,
       telegram_href = EXCLUDED.telegram_href,
       email = EXCLUDED.email,
       updated_at = now()`,
    [
      next.phoneDisplay,
      next.phoneHref,
      next.whatsappHref,
      next.telegramHref,
      next.email,
    ],
  );
}
