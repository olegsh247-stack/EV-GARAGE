import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.ADMIN_PASSWORD?.trim();
  const submitted = typeof password === "string" ? password.trim() : "";

  if (!correct || submitted !== correct) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  const forwarded = req.headers.get("x-forwarded-proto");
  const secure = forwarded
    ? forwarded.split(",")[0].trim() === "https"
    : req.nextUrl.protocol === "https:";
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", correct, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
