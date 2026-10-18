import type { NextRequest } from "next/server";

/** Та же проверка, что в middleware: cookie admin_auth равна ADMIN_PASSWORD. */
export function isAdmin(req: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) return false;
  return req.cookies.get("admin_auth")?.value === password;
}
