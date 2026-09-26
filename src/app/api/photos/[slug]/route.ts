import { NextRequest, NextResponse } from "next/server";
import { getPhoto } from "@/lib/photos";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;

  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const photo = await getPhoto(slug);
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
