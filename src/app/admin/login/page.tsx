"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

        <div className="relative mt-6">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoFocus
            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 pr-11 text-sm text-ink outline-none focus:border-charge"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

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
