"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Ошибка входа");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-line bg-surface-card p-8"
      >
        <p className="font-display text-lg font-bold text-ink">
          EV-GARAGE · Админка
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Введите пароль для доступа к загрузке фото
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          autoFocus
          className="mt-6 w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-charge"
        />

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-4 w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-surface transition-colors hover:bg-deep disabled:opacity-50"
        >
          {loading ? "Проверяю…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
