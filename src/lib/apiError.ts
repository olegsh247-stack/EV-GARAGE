import { NextResponse } from "next/server";
import { HttpError } from "@/lib/httpError";

export function jsonError(error: unknown, logTag: string) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  const err = error as { code?: string; message?: string };
  console.error(`[${logTag}]`, err.code ?? "", err.message ?? String(error));
  return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
}
