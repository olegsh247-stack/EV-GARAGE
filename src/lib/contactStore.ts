import { put, head } from "@vercel/blob";

const CONTACT_KEY = "meta/contact.json";

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

export async function getContact(): Promise<Contact> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return DEFAULT_CONTACT;
  try {
    const info = await head(CONTACT_KEY);
    const res = await fetch(info.url, { next: { revalidate: 30 } });
    if (!res.ok) return DEFAULT_CONTACT;
    const stored = (await res.json()) as Partial<Contact>;
    return { ...DEFAULT_CONTACT, ...stored };
  } catch {
    return DEFAULT_CONTACT;
  }
}

export async function setContact(next: Contact) {
  await put(CONTACT_KEY, JSON.stringify(next), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}
