import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.ADMIN_PASSWORD?.trim();
  const submitted = typeof password === "string" ? password.trim() : "";

  if (!correct || submitted !== correct) {
    // ВРЕМЕННАЯ ДИАГНОСТИКА — не раскрывает пароль, только помогает понять,
    // видит ли сервер переменную окружения вообще. Уберём после починки.
    return NextResponse.json(
      {
        error: "Неверный пароль",
        debug: {
          envVarIsSet: Boolean(process.env.ADMIN_PASSWORD),
          envVarLength: process.env.ADMIN_PASSWORD?.length ?? 0,
          submittedLength: submitted.length,
        },
      },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", correct, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 дней
  });
  return res;
}
