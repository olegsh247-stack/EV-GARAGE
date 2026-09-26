import { NextRequest, NextResponse } from "next/server";
import { getPhoto } from "@/lib/photos";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const indexParam = request.nextUrl.searchParams.get("i");
  const index = indexParam ? Number(indexParam) : 0;

  if (!/^[a-z0-9-]+$/i.test(slug) || !Number.isInteger(index) || index < 0) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const photo = await getPhoto(slug, index);
    if (!photo) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(photo.body, {
      headers: {
        "Content-Type": photo.meta.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
