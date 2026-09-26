import { NextRequest, NextResponse } from "next/server";
import { reorderPhotos } from "@/lib/photos";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const cookie = req.cookies.get("admin_auth")?.value;
  const password = process.env.ADMIN_PASSWORD?.trim();
  const authed = Boolean(password) && cookie === password;

  if (!authed) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { slug?: string; order?: number[] };
    const slug = String(body.slug ?? "");
    const order = body.order;

    if (!/^[a-z0-9-]+$/i.test(slug)) {
      return NextResponse.json({ error: "Некорректная модель" }, { status: 400 });
    }
    if (!Array.isArray(order) || order.some((n) => !Number.isInteger(n))) {
      return NextResponse.json({ error: "Неверный порядок" }, { status: 400 });
    }

    await reorderPhotos(slug, order);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка сортировки" },
      { status: 400 },
    );
  }
}
