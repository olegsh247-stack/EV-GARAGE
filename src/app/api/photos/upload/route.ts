import { del, list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const MAX_UPLOAD_BYTES = 4_000_000;
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Проверяем пароль вручную — этот роут исключён из общего middleware.
  const cookie = req.cookies.get("admin_auth")?.value;
  const password = process.env.ADMIN_PASSWORD?.trim();
  const authed = Boolean(password) && cookie === password;

  if (!authed) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const slug = String(form.get("slug") ?? "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/i.test(slug)) {
      return NextResponse.json({ error: "Некорректная модель" }, { status: 400 });
    }

    if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Разрешены только JPG, PNG или WEBP" },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Фото слишком большое. Попробуйте выбрать другое фото." },
        { status: 413 },
      );
    }

    // Все фотографии из админки после обработки в браузере приходят как JPG.
    // Файл хранится по предсказуемому имени, поэтому повторная загрузка
    // заменяет старую фотографию этой модели.
    const pathname = `cars/${slug}.jpg`;
    const blob = await put(pathname, file, {
      access: "public",
      allowOverwrite: true,
      contentType: "image/jpeg",
    });

    // Удаляем старые варианты расширения для этой модели, если они остались
    // от предыдущей версии загрузчика.
    const { blobs } = await list({ prefix: `cars/${slug}.` });
    const staleUrls = blobs
      .filter((item) => item.pathname !== pathname)
      .map((item) => item.url);

    if (staleUrls.length > 0) {
      await del(staleUrls);
    }

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка загрузки" },
      { status: 400 },
    );
  }
}
