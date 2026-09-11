import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const PHOTO_EXTENSION = /^(jpg|jpeg|png|webp)$/i;

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/photos/[slug]">,
): Promise<Response> {
  const { slug } = await params;
  const extension = request.nextUrl.searchParams.get("ext") ?? "jpg";

  if (
    !/^[a-z0-9-]+$/i.test(slug) ||
    !PHOTO_EXTENSION.test(extension) ||
    !process.env.BLOB_READ_WRITE_TOKEN
  ) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    // Uploads use a deterministic pathname, so there is no need to list the
    // store just to discover the file. This saves one Advanced Operation per
    // image request while keeping the Blob store private.
    const pathname = `cars/${slug}.${extension.toLowerCase()}`;
    const result = await get(pathname, {
      access: "private",
      useCache: false,
    });

    if (!result || result.statusCode !== 200) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
