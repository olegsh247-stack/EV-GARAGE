import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { B2_BUCKET_NAME, getB2Client } from "@/lib/b2";

const PHOTO_EXTENSION = /^(jpg|jpeg|png|webp)$/i;

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/photos/[slug]">,
): Promise<Response> {
  const { slug } = await params;
  const extension = request.nextUrl.searchParams.get("ext") ?? "jpg";

  if (!/^[a-z0-9-]+$/i.test(slug) || !PHOTO_EXTENSION.test(extension)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const pathname = `cars/${slug}.${extension.toLowerCase()}`;
    const result = await getB2Client().send(
      new GetObjectCommand({ Bucket: B2_BUCKET_NAME, Key: pathname }),
    );

    if (!result.Body) return new NextResponse(null, { status: 404 });

    const stream = result.Body.transformToWebStream();
    return new NextResponse(stream, {
      headers: {
        "Content-Type": result.ContentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
