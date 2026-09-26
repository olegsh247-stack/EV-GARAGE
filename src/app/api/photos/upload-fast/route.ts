import { NextRequest, NextResponse } from "next/server";
import { MAX_PHOTOS_PER_MODEL, putPhoto } from "@/lib/photos";

const MAX_UPLOAD_BYTES = 4_000_000;
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSION_BY_CONTENT_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

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
    const indexRaw = form.get("index");
    const index =
      indexRaw !== null && String(indexRaw) !== ""
        ? Number(indexRaw)
        : undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
    }
    if (!/^[a-z0-9-]+$/i.test(slug)) {
      return NextResponse.json({ error: "Некорректная модель" }, { status: 400 });
    }
    if (
      index !== undefined &&
      (!Number.isInteger(index) || index < 0 || index >= MAX_PHOTOS_PER_MODEL)
    ) {
      return NextResponse.json({ error: "Некорректный номер фото" }, { status: 400 });
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

    const extension =
      EXTENSION_BY_CONTENT_TYPE[file.type as keyof typeof EXTENSION_BY_CONTENT_TYPE];
    const buffer = await file.arrayBuffer();
    const meta = await putPhoto(slug, buffer, file.type, extension, index);

    return NextResponse.json({
      url: `/api/photos/${slug}?i=${meta.index}&ext=${extension}&v=${meta.updatedAt}`,
      index: meta.index,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка загрузки" },
      { status: 400 },
    );
  }
}
