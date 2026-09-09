import { NextRequest, NextResponse } from "next/server";
import { addVideo, removeVideo, extractYoutubeId } from "@/lib/videosStore";

export async function POST(req: NextRequest) {
  const { url, title, brandSlug, modelSlug } = await req.json();

  if (
    typeof url !== "string" ||
    typeof brandSlug !== "string" ||
    typeof modelSlug !== "string"
  ) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const youtubeId = extractYoutubeId(url);
  if (!youtubeId) {
    return NextResponse.json(
      { error: "Не удалось распознать ссылку на YouTube" },
      { status: 400 }
    );
  }

  await addVideo({
    youtubeId,
    title: typeof title === "string" && title ? title : "Видеообзор",
    channel: "Добавлено вручную",
    brandSlug,
    modelSlug,
  });

  return NextResponse.json({ ok: true, youtubeId });
}

export async function DELETE(req: NextRequest) {
  const { brandSlug, modelSlug, youtubeId } = await req.json();

  if (
    typeof brandSlug !== "string" ||
    typeof modelSlug !== "string" ||
    typeof youtubeId !== "string"
  ) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  await removeVideo(brandSlug, modelSlug, youtubeId);
  return NextResponse.json({ ok: true });
}
