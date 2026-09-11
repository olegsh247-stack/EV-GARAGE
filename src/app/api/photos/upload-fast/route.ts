import {
  DeleteObjectsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { B2_BUCKET_NAME, getB2Client } from "@/lib/b2";

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
    const body = Buffer.from(await file.arrayBuffer());

    const client = getB2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: pathname,
        Body: body,
        ContentType: file.type,
      }),
    );

    const stalePathnames = [
      `cars/${slug}.jpg`,
      `cars/${slug}.jpeg`,
      `cars/${slug}.png`,
      `cars/${slug}.webp`,
    ].filter((item) => item !== pathname);

    await client.send(
      new DeleteObjectsCommand({
        Bucket: B2_BUCKET_NAME,
        Delete: { Objects: stalePathnames.map((Key) => ({ Key })) },
      }),
    );

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
