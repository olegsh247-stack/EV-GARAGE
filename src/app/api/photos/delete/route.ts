import { NextRequest, NextResponse } from "next/server";
import { MAX_PHOTOS_PER_MODEL, deletePhoto } from "@/lib/photos";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const cookie = req.cookies.get("admin_auth")?.value;
  const password = process.env.ADMIN_PASSWORD?.trim();
  const authed = Boolean(password) && cookie === password;

  if (!authed) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { slug?: string; index?: number };
    const slug = String(body.slug ?? "");
    const index = Number(body.index);

    if (!/^[a-z0-9-]+$/i.test(slug)) {
      return NextResponse.json({ error: "Некорректная модель" }, { status: 400 });
    }
    if (!Number.isInteger(index) || index < 0 || index >= MAX_PHOTOS_PER_MODEL) {
      return NextResponse.json({ error: "Некорректный номер фото" }, { status: 400 });
    }

    await deletePhoto(slug, index);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка удаления" },
      { status: 400 },
    );
  }
}
