"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import type { Contact } from "@/lib/contactStore";

export function ContactEditForm({ initial }: { initial: Contact }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(key: keyof Contact, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Не удалось сохранить");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  const fields: { key: keyof Contact; label: string; placeholder: string }[] = [
    {
      key: "phoneDisplay",
      label: "Телефон (как показывать)",
      placeholder: "+7 995 536-10-70",
    },
    {
      key: "phoneHref",
      label: "Телефон (ссылка для звонка)",
      placeholder: "tel:+79955361070",
    },
    {
      key: "whatsappHref",
      label: "Ссылка на WhatsApp",
      placeholder: "https://wa.me/79955361070",
    },
    {
      key: "telegramHref",
      label: "Ссылка на Telegram",
      placeholder: "https://t.me/+79955361070",
    },
    { key: "email", label: "Email", placeholder: "info@ev-garage.ru" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface-card p-6"
    >
      {fields.map((f) => (
        <div key={f.key}>
          <label className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
            {f.label}
          </label>
          <input
            type="text"
            value={form[f.key]}
            onChange={(e) => update(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="mt-1.5 w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-charge"
          />
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-1.5 self-start rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-deep disabled:opacity-50"
      >
        <Save size={14} />
        {saving ? "Сохраняю…" : saved ? "Сохранено ✓" : "Сохранить"}
      </button>
    </form>
  );
}
