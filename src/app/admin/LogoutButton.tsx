"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="font-mono text-xs text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink"
    >
      Выйти
    </button>
  );
}
