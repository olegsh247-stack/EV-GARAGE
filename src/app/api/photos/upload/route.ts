import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp"];

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;

  // Проверяем пароль вручную — этот роут исключён из общего middleware,
  // потому что Vercel сам вызывает его повторно (колбэк onUploadCompleted)
  // без нашей cookie, и middleware бы такой запрос заблокировал.
  const cookie = req.cookies.get("admin_auth")?.value;
  const password = process.env.ADMIN_PASSWORD?.trim();
  const authed = Boolean(password) && cookie === password;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!authed) {
          throw new Error("Не авторизован");
        }
        const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
        if (!ALLOWED_EXT.includes(ext)) {
          throw new Error("Разрешены только JPG, PNG или WEBP");
        }
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
          addRandomSuffix: false,
          allowOverwrite: true,
        };
      },
      onUploadCompleted: async () => {
        // Ничего дополнительно делать не нужно — файл уже лежит по
        // предсказуемому пути cars/{slug}.{ext}, getPhotoMap() найдёт его сам.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка загрузки" },
      { status: 400 }
    );
  }
}
