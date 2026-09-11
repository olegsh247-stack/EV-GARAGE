import { del, put } from "@vercel/blob";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const MAX_UPLOAD_BYTES = 4_000_000;
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSION_BY_CONTENT_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
const PHOTO_MAP_TAG = "ev-garage-photo-map";

export async function POST(req: NextRequest): Promise<NextResponse> {
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

    const extension = EXTENSION_BY_CONTENT_TYPE[
      file.type as keyof typeof EXTENSION_BY_CONTENT_TYPE
    ];
    const pathname = `cars/${slug}.${extension}`;

    await put(pathname, file, {
      access: "private",
      allowOverwrite: true,
      contentType: file.type,
    });

    // Не делаем list() после upload: известны все допустимые имена для slug.
    // del() не тарифицируется как Advanced Operation.
    const stalePathnames = [
      `cars/${slug}.jpg`,
      `cars/${slug}.jpeg`,
      `cars/${slug}.png`,
      `cars/${slug}.webp`,
    ].filter((item) => item !== pathname);
    await del(stalePathnames);

    revalidateTag(PHOTO_MAP_TAG, "max");

    return NextResponse.json({
      url: `/api/photos/${slug}?ext=${extension}&v=${Date.now()}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка загрузки" },
      { status: 400 },
    );
  }
}
